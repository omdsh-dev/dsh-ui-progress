/**
 * Unit tests for the stop-kind derivation (`latestTurnStop`): the DSH 0.1.x
 * turn/end reason from the Chat view timeline is the authoritative signal
 * (a stop leaves no per-node trace for every case), lastAgentError comes
 * from the Session lifecycle snapshot, and the windowed node traces remain
 * the fallback for older hosts. 'interrupted' (manual stop / repair) and
 * 'error' (terminal failure) are distinct kinds; a transient error whose
 * successor turn already began reads null.
 */
import { describe, expect, it } from 'vitest'
import type { ChatSnapshot, ConversationNode } from '@deepseek-ai/dsh-client-ui-chat/client'
import { latestTurnStop, subagentRunningCount, tokenUsageTotals, type ChatLegacy, type TurnStopKind } from '../src/client/session-state.ts'

/** One minimal turn/end event carrying the reason the derivation reads. */
function turnEnd(turn: number, seq: number, kind: string): unknown {
  return { type: 'turn/end', seq, time: seq * 1000, data: { turn, reason: { kind } } }
}

/** One minimal turn/start event. */
function turnStart(turn: number, seq: number): unknown {
  return { type: 'turn/start', seq, time: seq * 1000, data: { turn } }
}

/** The derivation's data slice: Chat snapshot (timeline), legacy projection, session error. */
interface StopSlice {
  chat: ChatSnapshot | undefined
  legacy: ChatLegacy
  lastAgentError: string | null
}

/** A slice with an optional timeline reason and optional windowed traces. */
function makeSlice(overrides: {
  reason?: string
  successorStarted?: boolean
  lastAgentError?: string | null
  nodes?: readonly ConversationNode[]
  turnEnds?: ReadonlyMap<number, number>
} = {}): StopSlice {
  const timeline = overrides.reason === undefined
    ? { turnOrder: [] as number[], turns: new Map<number, unknown>() }
    : (() => {
      const entries: Array<[number, unknown]> = [[1, { turn: 1, start: undefined, end: turnEnd(1, 10, overrides.reason), status: 'closed', steps: [], data: {} }]]
      if (overrides.successorStarted === true) {
        entries.push([2, { turn: 2, start: turnStart(2, 11), end: undefined, status: 'running', steps: [], data: {} }])
      }
      return { turnOrder: entries.map(([k]) => k), turns: new Map<number, unknown>(entries) }
    })()
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
function stop(overrides: Parameters<typeof makeSlice>[0] = {}): TurnStopKind | null {
  const { chat, legacy, lastAgentError } = makeSlice(overrides)
  return latestTurnStop(chat, legacy, lastAgentError)
}

/** A tool-result node with the given error shape, inside the latest turn's window. */
function erroredToolResult(seq: number, error: unknown): unknown {
  return { kind: 'tool-result', seq, time: seq * 1000, callId: 'c1', call: { name: 'bash', argsRaw: '{}' }, callTime: null, content: [], isError: true, error, callView: null, resultView: null, subCalls: [] }
}

describe('latestTurnStop', () => {
  it('classifies a turn ended with reason aborted as interrupted (manual stop)', () => {
    expect(stop({ reason: 'aborted' })).toBe('interrupted')
  })

  it('classifies a turn ended with reason interrupted as interrupted (crash repair)', () => {
    expect(stop({ reason: 'interrupted' })).toBe('interrupted')
  })

  it('classifies a turn ended with reason error as error (terminal failure)', () => {
    expect(stop({ reason: 'error' })).toBe('error')
  })

  it('downgrades an error whose successor turn already began to null (transient 429 recovery)', () => {
    expect(stop({ reason: 'error', successorStarted: true })).toBeNull()
  })

  it('downgrades any stopped turn whose successor began (the session moved past it)', () => {
    expect(stop({ reason: 'aborted', successorStarted: true })).toBeNull()
  })

  it('does not flag a completed turn even when an older turn was aborted', () => {
    const chat = {
      timeline: {
        turnOrder: [1, 2],
        turns: new Map([
          [1, { turn: 1, start: undefined, end: turnEnd(1, 10, 'aborted'), status: 'closed', steps: [], data: {} }],
          [2, { turn: 2, start: undefined, end: turnEnd(2, 20, 'completed'), status: 'closed', steps: [], data: {} }],
        ]),
      },
    } as unknown as ChatSnapshot
    const slice = makeSlice()
    expect(latestTurnStop(chat, slice.legacy, slice.lastAgentError)).toBeNull()
  })

  it('classifies via lastAgentError as error for live failures with no turn position', () => {
    expect(stop({ lastAgentError: 'boom' })).toBe('error')
  })

  it('fallback: classifies a flat ABORTED_BEFORE_DISPATCH tool-result code as interrupted', () => {
    const nodes = [erroredToolResult(9, { name: 'AbortError', code: 'ABORTED_BEFORE_DISPATCH' })] as ConversationNode[]
    expect(stop({ nodes })).toBe('interrupted')
  })

  it('fallback: classifies the nested scheduler error shape (info.code) as interrupted', () => {
    const nodes = [erroredToolResult(9, { message: 'tool call aborted before dispatch', info: { name: 'AbortError', code: 'ABORTED_BEFORE_DISPATCH' } })] as ConversationNode[]
    expect(stop({ nodes })).toBe('interrupted')
  })

  it('fallback: classifies the repair codes TOOL_OUTCOME_UNKNOWN / TOOL_NOT_STARTED as interrupted', () => {
    for (const code of ['TOOL_OUTCOME_UNKNOWN', 'TOOL_NOT_STARTED']) {
      const nodes = [erroredToolResult(9, { name: 'X', code })] as ConversationNode[]
      expect(stop({ nodes })).toBe('interrupted')
    }
  })

  it('fallback: keeps the legacy interrupted code working', () => {
    const nodes = [erroredToolResult(9, { name: 'X', code: 'interrupted' })] as ConversationNode[]
    expect(stop({ nodes })).toBe('interrupted')
  })

  it('classifies an interrupted assistant node (frozen partial) as interrupted', () => {
    const nodes = [{ kind: 'assistant', seq: 9, time: 9000, turn: 1, step: 1, blocks: [{ kind: 'text', text: '一半' }], interrupted: true }] as unknown as ConversationNode[]
    expect(stop({ nodes })).toBe('interrupted')
  })

  it('classifies a turn-error node (terminal failure) as error', () => {
    const nodes = [{ kind: 'turn-error', seq: 10, time: 10000, turn: 1, step: 0, message: 'boom', code: 'UNKNOWN' }] as unknown as ConversationNode[]
    expect(stop({ nodes })).toBe('error')
  })

  it('returns null for a clean snapshot', () => {
    expect(stop({ reason: 'completed' })).toBeNull()
  })

  it('ignores tool-result errors outside the latest turn window', () => {
    const nodes = [erroredToolResult(3, { name: 'X', code: 'TOOL_OUTCOME_UNKNOWN' })] as ConversationNode[]
    // Latest turn end seq 10; node seq 3 sits in the previous turn's window.
    expect(stop({ nodes, turnEnds: new Map([[0, 5], [1, 10]]) })).toBeNull()
  })
})

describe("tokenUsageTotals", () => {
  function turnWith(turn: number, usage: unknown): unknown {
    return { turn, start: undefined, end: undefined, status: 'closed', steps: [], data: { get: (key: string) => key === 'turn-tail' ? { turn, tokenUsage: usage } : undefined } }
  }
  function chatWith(turns: unknown[]): ChatSnapshot {
    return { timeline: { turnOrder: turns.map((_, i) => i + 1), turns: new Map(turns.map((tn, i) => [i + 1, tn])) } } as unknown as ChatSnapshot
  }
  it("sums uncached/output/total across turns", () => {
    const chat = chatWith([turnWith(1, { uncachedInputTokens: 100, outputTokens: 50, totalTokens: 1000 }), turnWith(2, { uncachedInputTokens: 200, outputTokens: 80, totalTokens: 1500 })])
    const totals = tokenUsageTotals(chat)
    expect(totals?.uncachedInputTokens).toBe(300)
    expect(totals?.outputTokens).toBe(130)
    expect(totals?.totalTokens).toBe(2500)
  })
  it("reports cache-read incomplete when a turn omits the bucket", () => {
    const chat = chatWith([turnWith(1, { uncachedInputTokens: 100, outputTokens: 50, totalTokens: 1000, cacheReadTokens: 900 }), turnWith(2, { uncachedInputTokens: 200, outputTokens: 80, totalTokens: 1500 })])
    const totals = tokenUsageTotals(chat)
    expect(totals?.cacheReadTokens).toBe(900)
    expect(totals?.cacheReadComplete).toBe(false)
  })
  it("returns null when no turn carries usage", () => {
    const chat = chatWith([turnWith(1, undefined)])
    expect(tokenUsageTotals(chat)).toBeNull()
  })
  it("returns null for an undefined snapshot", () => {
    expect(tokenUsageTotals(undefined)).toBeNull()
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
