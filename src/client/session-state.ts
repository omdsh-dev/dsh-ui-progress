/**
 * Pure session-state derivations for the session progress strip. Everything
 * here is a function of the live {@link ConversationSnapshot} (plus the
 * `todos` projection) — no React, no rendering. The component consumes these
 * through narrow accessors.
 */
import type { ConversationSnapshot, TodoItem } from '@deepseek-ai/dsh-client-runtime/client'
import { etaOf, parseArgs } from './args.ts'

/**
 * Count settled tool results in the current snapshot window. The node stream
 * is the presentation-truth source: a result node exists exactly when a tool
 * call completed (and re-renders live as the window advances).
 */
export function settledToolCount(snapshot: ConversationSnapshot): number {
  let count = 0
  for (const node of snapshot.nodes) {
    if (node.kind === 'tool-result') count += 1
  }
  return count
}

/**
 * True while the model is emitting reasoning: the in-flight partial carries a
 * reasoning block and no tool call is in flight (a running tool is the more
 * specific state and wins the label).
 */
export function isReasoning(snapshot: ConversationSnapshot): boolean {
  return snapshot.partial?.blocks.some(block => block.kind === 'reasoning') ?? false
}

/** The in-flight tool name when running; undefined when nothing is executing. */
export function runningTool(snapshot: ConversationSnapshot): string | undefined {
  return snapshot.runningCalls[0]?.name
}

/**
 * Start time of the running turn — the in-window turn entry with no end yet.
 * Null when running but no in-window turn start exists.
 */
export function runningTurnStart(snapshot: ConversationSnapshot): number | null {
  let start: number | null = null
  for (const timing of snapshot.turnTimings.values()) {
    if (timing.endTime === undefined) start = timing.startTime
  }
  return start
}

/**
 * Wall duration of the last settled in-window turn; null when no turn has
 * finished yet. Only read while idle (the running turn has no end entry).
 */
export function lastTurnDuration(snapshot: ConversationSnapshot): number | null {
  let duration: number | null = null
  for (const timing of snapshot.turnTimings.values()) {
    if (timing.endTime !== undefined) duration = Math.max(0, timing.endTime - timing.startTime)
  }
  return duration
}

/**
 * The model-reported ETA display string from the LATEST in-window
 * `report_progress` call (running or settled, by report time). The latest
 * report is the model's last word: if it carries no eta, the strip shows no
 * ETA even when an older report did.
 */
export function latestReportEta(snapshot: ConversationSnapshot): string | null {
  let latestTime = -1
  let latestEta: string | null = null
  for (const node of snapshot.nodes) {
    if (node.kind !== 'tool-result' || node.call?.name !== 'report_progress') continue
    const time = node.callTime ?? node.time
    if (time >= latestTime) {
      latestTime = time
      latestEta = etaOf(parseArgs(node.call.argsRaw))
    }
  }
  for (const call of snapshot.runningCalls) {
    if (call.name !== 'report_progress') continue
    if (call.time >= latestTime) {
      latestTime = call.time
      latestEta = etaOf(parseArgs(call.argsRaw))
    }
  }
  return latestEta
}

/** Completed/active/total from a live todos projection; null when unavailable or empty. */
export function todoCounts(todos: readonly TodoItem[] | null | undefined): { done: number; active: number; total: number } | null {
  if (todos === undefined || todos === null || todos.length === 0) return null
  let done = 0
  let active = 0
  for (const item of todos) {
    if (item.status === 'completed') done += 1
    else if (item.status === 'in_progress') active += 1
  }
  return { done, active, total: todos.length }
}

/**
 * The bar's progress value in 0..100. A live `todos` projection wins: the
 * (completed + in-progress)/total ratio is the real task completion — the
 * in-flight task counts toward progress, so five tasks with two done and one
 * in progress reads 60%. Without one the fill rests at its 100% default:
 * session-overall progress has no dedicated projection, and a fake percentage
 * (the removed per-tool-result window segments) is worse than none.
 */
export function progressPercent(snapshot: ConversationSnapshot, todos: readonly TodoItem[] | null | undefined): number {
  const counts = todoCounts(todos)
  if (counts !== null) return Math.round(((counts.done + counts.active) / counts.total) * 100)
  return 100
}

/**
 * Turn/end reasons that mean the latest turn was stopped mid-flight. DSH
 * 0.1.x ends an aborted turn with kind 'aborted' (manual stop/cancel) and a
 * crash repair closes a cut-short turn with 'interrupted'; both must tint the
 * bar. 'error' stays out of this set — the turn-error node below covers it.
 */
const INTERRUPTED_TURN_REASONS = new Set(['aborted', 'interrupted'])

/**
 * Tool-result error codes that mark a call cut short by a stop or a crash
 * repair. 'interrupted' is the pre-0.1.x marker; 0.1.x uses
 * 'ABORTED_BEFORE_DISPATCH' (call cancelled before dispatch) and the repair
 * codes 'TOOL_OUTCOME_UNKNOWN' / 'TOOL_NOT_STARTED' (started/never-started
 * call whose outcome the backend cannot know).
 */
const INTERRUPTED_ERROR_CODES = new Set([
  'interrupted',
  'ABORTED_BEFORE_DISPATCH',
  'TOOL_OUTCOME_UNKNOWN',
  'TOOL_NOT_STARTED',
])

/**
 * Whether the session's LATEST completed turn was stopped mid-flight — a
 * manual stop, an API failure, or another unexpected break.
 *
 * Primary signal (DSH 0.1.x): the latest completed turn's `turn/end` reason,
 * read off the timeline — a stop leaves no per-node trace for every case
 * (no partial content to freeze, no in-flight call to error), but the turn
 * always ends with reason 'aborted' (cancel) or 'interrupted' (repair).
 *
 * Fallback (windowed node traces, covers older hosts and error-ended turns):
 * an interrupted assistant node (frozen partial), tool-result nodes whose
 * error code marks a cut-off call, and turn-error nodes (terminal failure);
 * live agent failures with no turn position arrive through lastAgentError.
 * Only the latest completed turn is judged (its turn/end seq is the
 * boundary — derived interruption nodes ride fractional seqs just below
 * it), so an interruption followed by a clean turn does not keep the bar
 * orange. Window-scoped by design — paging or compaction drops old markers.
 */
export function latestTurnInterrupted(snapshot: ConversationSnapshot): boolean {
  if (snapshot.lastAgentError !== null) return true
  // Authoritative turn/end reason when the timeline is available.
  const turns = snapshot.chat?.timeline?.turns
  if (turns !== undefined) {
    const latest = [...turns.entries()].sort((a, b) => a[0] - b[0]).at(-1)?.[1]
    const reason = latest?.end?.data?.reason?.kind
    if (reason !== undefined && INTERRUPTED_TURN_REASONS.has(reason)) return true
  }
  // The latest completed in-window turn and the end seq of the turn before
  // it: the previous end seq is the exact lower boundary for the latest
  // turn's own nodes (every later turn's events sit above it).
  const ends = [...snapshot.turnEnds.entries()].sort((a, b) => a[0] - b[0])
  const latestEnd = ends.at(-1)
  if (latestEnd === undefined) return false
  const latestEndSeq = latestEnd[1]
  const prevEndSeq = ends.at(-2)?.[1] ?? 0
  for (const node of snapshot.nodes) {
    if (node.seq <= prevEndSeq || node.seq > latestEndSeq) continue
    if (node.kind === 'assistant' && node.interrupted === true) return true
    if (node.kind === 'turn-error') return true
    if (node.kind === 'tool-result') {
      // The scheduler-abort shape nests the code under `info`; the repair
      // shape carries it flat. The runtime may carry fields the declared
      // type omits, so read both defensively.
      const err = node.error as { code?: string; info?: { code?: string } } | undefined
      const code = err?.code ?? err?.info?.code
      if (code !== undefined && INTERRUPTED_ERROR_CODES.has(code)) return true
    }
  }
  return false
}
