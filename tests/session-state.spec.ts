/**
 * Unit tests for the interruption derivation (`latestTurnInterrupted`): the
 * DSH 0.1.x turn/end reason is the authoritative signal (a stop leaves no
 * per-node trace for every case), and the windowed node traces remain the
 * fallback for older hosts and error-ended turns.
 */
import { describe, expect, it } from 'vitest'
import type { ConversationSnapshot, SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import { latestTurnInterrupted } from '../src/client/session-state.ts'

/** One minimal turn/end event carrying the reason the derivation reads. */
function turnEnd(turn: number, seq: number, kind: string): unknown {
  return { type: 'turn/end', seq, time: seq * 1000, data: { turn, reason: { kind } } }
}

/** A snapshot with an optional timeline and optional windowed traces. */
function makeSnapshot(overrides: {
  reason?: string
  lastAgentError?: string | null
  nodes?: ConversationSnapshot['nodes']
  turnEnds?: ReadonlyMap<number, number>
} = {}): ConversationSnapshot {
  const timeline = overrides.reason === undefined
    ? { turnOrder: [], turns: new Map() }
    : {
        turnOrder: [1],
        turns: new Map([[1, { turn: 1, start: undefined, end: turnEnd(1, 10, overrides.reason), status: 'closed', steps: [], data: {} }]]),
      }
  return {
    sessionId: 'session-1' as SessionId,
    views: { get: () => undefined },
    chat: { timeline } as unknown as ConversationSnapshot['chat'],
    nodes: overrides.nodes ?? [],
    turnTimings: new Map(),
    turnEnds: overrides.turnEnds ?? new Map([[1, 10]]),
    partial: null,
    runningCalls: [],
    pending: [],
    queue: [],
    running: false,
    subagent: null,
    composerPhase: 'active',
    removed: false,
    openState: 'open',
    openError: null,
    hasMore: false,
    loadingOlder: false,
    promptError: null,
    blank: false,
    lastAgentError: overrides.lastAgentError === undefined ? null : overrides.lastAgentError,
  } as unknown as ConversationSnapshot
}

/** A tool-result node with the given error shape, inside the latest turn's window. */
function erroredToolResult(seq: number, error: unknown): unknown {
  return { kind: 'tool-result', seq, time: seq * 1000, callId: 'c1', call: { name: 'bash', argsRaw: '{}' }, callTime: null, content: [], isError: true, error, callView: null, resultView: null, subCalls: [] }
}

describe('latestTurnInterrupted', () => {
  it('flags a turn ended with reason aborted (manual stop)', () => {
    expect(latestTurnInterrupted(makeSnapshot({ reason: 'aborted' }))).toBe(true)
  })

  it('flags a turn ended with reason interrupted (crash repair)', () => {
    expect(latestTurnInterrupted(makeSnapshot({ reason: 'interrupted' }))).toBe(true)
  })

  it('does not flag a completed turn even when an older turn was aborted', () => {
    const timeline = {
      turnOrder: [1, 2],
      turns: new Map([
        [1, { turn: 1, start: undefined, end: turnEnd(1, 10, 'aborted'), status: 'closed', steps: [], data: {} }],
        [2, { turn: 2, start: undefined, end: turnEnd(2, 20, 'completed'), status: 'closed', steps: [], data: {} }],
      ]),
    }
    const snapshot = makeSnapshot() as ConversationSnapshot
    snapshot.chat = { timeline } as unknown as ConversationSnapshot['chat']
    expect(latestTurnInterrupted(snapshot)).toBe(false)
  })

  it('flags via lastAgentError for live failures with no turn position', () => {
    expect(latestTurnInterrupted(makeSnapshot({ lastAgentError: 'boom' }))).toBe(true)
  })

  it('fallback: flags a flat ABORTED_BEFORE_DISPATCH tool-result code', () => {
    const nodes = [erroredToolResult(9, { name: 'AbortError', code: 'ABORTED_BEFORE_DISPATCH' })] as ConversationSnapshot['nodes']
    expect(latestTurnInterrupted(makeSnapshot({ nodes }))).toBe(true)
  })

  it('fallback: flags the nested scheduler error shape (info.code)', () => {
    const nodes = [erroredToolResult(9, { message: 'tool call aborted before dispatch', info: { name: 'AbortError', code: 'ABORTED_BEFORE_DISPATCH' } })] as ConversationSnapshot['nodes']
    expect(latestTurnInterrupted(makeSnapshot({ nodes }))).toBe(true)
  })

  it('fallback: flags the repair codes TOOL_OUTCOME_UNKNOWN / TOOL_NOT_STARTED', () => {
    for (const code of ['TOOL_OUTCOME_UNKNOWN', 'TOOL_NOT_STARTED']) {
      const nodes = [erroredToolResult(9, { name: 'X', code })] as ConversationSnapshot['nodes']
      expect(latestTurnInterrupted(makeSnapshot({ nodes }))).toBe(true)
    }
  })

  it('fallback: keeps the legacy interrupted code working', () => {
    const nodes = [erroredToolResult(9, { name: 'X', code: 'interrupted' })] as ConversationSnapshot['nodes']
    expect(latestTurnInterrupted(makeSnapshot({ nodes }))).toBe(true)
  })

  it('flags an interrupted assistant node (frozen partial)', () => {
    const nodes = [{ kind: 'assistant', seq: 9, time: 9000, turn: 1, step: 1, blocks: [{ kind: 'text', text: '一半' }], interrupted: true }] as unknown as ConversationSnapshot['nodes']
    expect(latestTurnInterrupted(makeSnapshot({ nodes }))).toBe(true)
  })

  it('flags a turn-error node (terminal failure)', () => {
    const nodes = [{ kind: 'turn-error', seq: 10, time: 10000, turn: 1, step: 0, message: 'boom', code: 'UNKNOWN' }] as unknown as ConversationSnapshot['nodes']
    expect(latestTurnInterrupted(makeSnapshot({ nodes }))).toBe(true)
  })

  it('returns false for a clean snapshot', () => {
    expect(latestTurnInterrupted(makeSnapshot({ reason: 'completed' }))).toBe(false)
  })

  it('ignores tool-result errors outside the latest turn window', () => {
    const nodes = [erroredToolResult(3, { name: 'X', code: 'TOOL_OUTCOME_UNKNOWN' })] as ConversationSnapshot['nodes']
    // Latest turn end seq 10; node seq 3 sits in the previous turn's window.
    expect(latestTurnInterrupted(makeSnapshot({ nodes, turnEnds: new Map([[0, 5], [1, 10]]) }))).toBe(false)
  })
})
