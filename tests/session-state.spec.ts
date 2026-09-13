/**
 * Unit tests for the interruption derivation (`latestTurnInterrupted`): the
 * DSH 0.1.x turn/end reason from the Chat view timeline is the authoritative
 * signal (a stop leaves no per-node trace for every case), lastAgentError
 * comes from the Session lifecycle snapshot, and the windowed node traces
 * remain the fallback for older hosts and error-ended turns.
 */
import { describe, expect, it } from 'vitest'
import type { ChatSnapshot, ConversationNode } from '@deepseek-ai/dsh-client-ui-chat/client'
import { latestTurnInterrupted, subagentRunningCount, tokenUsageTotals, type ChatLegacy } from '../src/client/session-state.ts'

/** One minimal turn/end event carrying the reason the derivation reads. */
function turnEnd(turn: number, seq: number, kind: string): unknown {
  return { type: 'turn/end', seq, time: seq * 1000, data: { turn, reason: { kind } } }
}

/** The derivation's data slice: Chat snapshot (timeline), legacy projection, session error. */
interface InterruptSlice {
  chat: ChatSnapshot | undefined
  legacy: ChatLegacy
  lastAgentError: string | null
}

/** A slice with an optional timeline reason and optional windowed traces. */
function makeSlice(overrides: {
  reason?: string
  lastAgentError?: string | null
  nodes?: readonly ConversationNode[]
  turnEnds?: ReadonlyMap<number, number>
} = {}): InterruptSlice {
  const timeline = overrides.reason === undefined
    ? { turnOrder: [], turns: new Map() }
    : {
        turnOrder: [1],
        turns: new Map([[1, { turn: 1, start: undefined, end: turnEnd(1, 10, overrides.reason), status: 'closed', steps: [], data: {} }]]),
      }
  return {
    chat: { timeline } as unknown as ChatSnapshot,
    legacy: {
      nodes: overrides.nodes ?? [],
      turnTimings: new Map(),
      turnEnds: overrides.turnEnds ?? new Map([[1, 10]]),
      partial: null,
      runningCalls: [],
    },
    lastAgentError: overrides.lastAgentError === undefined ? null : overrides.lastAgentError,
  }
}

/** Run the derivation over one slice. */
function interrupted(overrides: Parameters<typeof makeSlice>[0] = {}): boolean {
  const { chat, legacy, lastAgentError } = makeSlice(overrides)
  return latestTurnInterrupted(chat, legacy, lastAgentError)
}

/** A tool-result node with the given error shape, inside the latest turn's window. */
function erroredToolResult(seq: number, error: unknown): unknown {
  return { kind: 'tool-result', seq, time: seq * 1000, callId: 'c1', call: { name: 'bash', argsRaw: '{}' }, callTime: null, content: [], isError: true, error, callView: null, resultView: null, subCalls: [] }
}

describe('latestTurnInterrupted', () => {
  it('flags a turn ended with reason aborted (manual stop)', () => {
    expect(interrupted({ reason: 'aborted' })).toBe(true)
  })

  it('flags a turn ended with reason interrupted (crash repair)', () => {
    expect(interrupted({ reason: 'interrupted' })).toBe(true)
  })

  it('does not flag a completed turn even when an older turn was aborted', () => {
    const slice = makeSlice()
    slice.chat = {
      timeline: {
        turnOrder: [1, 2],
        turns: new Map([
          [1, { turn: 1, start: undefined, end: turnEnd(1, 10, 'aborted'), status: 'closed', steps: [], data: {} }],
          [2, { turn: 2, start: undefined, end: turnEnd(2, 20, 'completed'), status: 'closed', steps: [], data: {} }],
        ]),
      },
    } as unknown as ChatSnapshot
    expect(latestTurnInterrupted(slice.chat, slice.legacy, slice.lastAgentError)).toBe(false)
  })

  it('flags via lastAgentError for live failures with no turn position', () => {
    expect(interrupted({ lastAgentError: 'boom' })).toBe(true)
  })

  it('fallback: flags a flat ABORTED_BEFORE_DISPATCH tool-result code', () => {
    const nodes = [erroredToolResult(9, { name: 'AbortError', code: 'ABORTED_BEFORE_DISPATCH' })] as ConversationNode[]
    expect(interrupted({ nodes })).toBe(true)
  })

  it('fallback: flags the nested scheduler error shape (info.code)', () => {
    const nodes = [erroredToolResult(9, { message: 'tool call aborted before dispatch', info: { name: 'AbortError', code: 'ABORTED_BEFORE_DISPATCH' } })] as ConversationNode[]
    expect(interrupted({ nodes })).toBe(true)
  })

  it('fallback: flags the repair codes TOOL_OUTCOME_UNKNOWN / TOOL_NOT_STARTED', () => {
    for (const code of ['TOOL_OUTCOME_UNKNOWN', 'TOOL_NOT_STARTED']) {
      const nodes = [erroredToolResult(9, { name: 'X', code })] as ConversationNode[]
      expect(interrupted({ nodes })).toBe(true)
    }
  })

  it('fallback: keeps the legacy interrupted code working', () => {
    const nodes = [erroredToolResult(9, { name: 'X', code: 'interrupted' })] as ConversationNode[]
    expect(interrupted({ nodes })).toBe(true)
  })

  it('flags an interrupted assistant node (frozen partial)', () => {
    const nodes = [{ kind: 'assistant', seq: 9, time: 9000, turn: 1, step: 1, blocks: [{ kind: 'text', text: '一半' }], interrupted: true }] as unknown as ConversationNode[]
    expect(interrupted({ nodes })).toBe(true)
  })

  it('flags a turn-error node (terminal failure)', () => {
    const nodes = [{ kind: 'turn-error', seq: 10, time: 10000, turn: 1, step: 0, message: 'boom', code: 'UNKNOWN' }] as unknown as ConversationNode[]
    expect(interrupted({ nodes })).toBe(true)
  })

  it('returns false for a clean snapshot', () => {
    expect(interrupted({ reason: 'completed' })).toBe(false)
  })

  it('ignores tool-result errors outside the latest turn window', () => {
    const nodes = [erroredToolResult(3, { name: 'X', code: 'TOOL_OUTCOME_UNKNOWN' })] as ConversationNode[]
    // Latest turn end seq 10; node seq 3 sits in the previous turn's window.
    expect(interrupted({ nodes, turnEnds: new Map([[0, 5], [1, 10]]) })).toBe(false)
  })
})

describe("tokenUsageTotals", () => {
  function turnTail(turn: number, seq: number, usage: unknown): unknown {
    return { kind: 'turn-tail', seq, time: seq * 1000, data: { turn, tokenUsage: usage } }
  }
  function legacyWith(nodes: unknown[]): ChatLegacy {
    return { nodes: nodes as ChatLegacy["nodes"], turnTimings: new Map(), turnEnds: new Map(), partial: null, runningCalls: [] }
  }
  it("sums uncached/output/total across turns", () => {
    const legacy = legacyWith([turnTail(1, 10, { uncachedInputTokens: 100, outputTokens: 50, totalTokens: 1000 }), turnTail(2, 20, { uncachedInputTokens: 200, outputTokens: 80, totalTokens: 1500 })])
    const totals = tokenUsageTotals(legacy)
    expect(totals?.uncachedInputTokens).toBe(300)
    expect(totals?.outputTokens).toBe(130)
    expect(totals?.totalTokens).toBe(2500)
  })
  it("reports cache-read incomplete when a turn omits the bucket", () => {
    const legacy = legacyWith([turnTail(1, 10, { uncachedInputTokens: 100, outputTokens: 50, totalTokens: 1000, cacheReadTokens: 900 }), turnTail(2, 20, { uncachedInputTokens: 200, outputTokens: 80, totalTokens: 1500 })])
    const totals = tokenUsageTotals(legacy)
    expect(totals?.cacheReadTokens).toBe(900)
    expect(totals?.cacheReadComplete).toBe(false)
  })
  it("returns null when no turn tail carries usage", () => {
    const legacy = legacyWith([])
    expect(tokenUsageTotals(legacy)).toBeNull()
  })
})

describe("subagentRunningCount", () => {
  const byId: Record<string, { running?: boolean; parentId?: string; origin?: string }> = {
    root: { running: false },
    sub1: { running: true, parentId: 'root', origin: 'subagent' },
    sub2: { running: false, parentId: 'root', origin: 'subagent' },
    grand: { running: true, parentId: 'sub2', origin: 'subagent' },
    other: { running: true, parentId: 'other-root', origin: 'subagent' },
  }
  it("counts only running descendants of the root", () => {
    expect(subagentRunningCount(byId, 'root')).toBe(2)
  })
  it("returns 0 for an unknown root", () => {
    expect(subagentRunningCount(byId, 'nope')).toBe(0)
  })
})
