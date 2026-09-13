/**
 * SessionProgressBar: a resident session-progress strip in the composer
 * input dock, derived entirely from the live Chat view snapshot (via the
 * standard `useConversation` seat) plus the dock owner's Session lifecycle
 * snapshot and the `todos` session projection.
 *
 * The bar needs no model-facing tool: it reads the framework's standard
 * seats and renders the real execution state — whether the turn is running,
 * which tool call is in flight, whether the model is emitting reasoning, and
 * the task completion ratio. Node, timing, and streaming data come from the
 * Chat view's legacy compatibility projection (`.legacy`); the turn/end
 * interruption signal comes from the Chat view's timeline; running state and
 * lastAgentError come from the Session snapshot. Progress follows the truth
 * order: a live todos list wins (completed/total is the real task
 * completion — five tasks with two done reads 40%); without one the fill
 * rests at its 100% default, because session-overall progress has no
 * dedicated projection and a fake percentage is worse than none. Animation
 * follows the state: a spinning glyph and shimmer glide while running, a
 * static filled bar when idle.
 *
 * While running, the strip also shows a live elapsed readout (since the
 * current turn started). The ETA is never extrapolated: it rides the model's
 * own knowledge — the latest in-window `report_progress` call's `eta`
 * argument (a rough remaining-time estimate). When the model has not
 * reported one, no ETA shows (unknown stays unknown).
 *
 * Attention state: when this session or any descendant subagent session
 * waits on a human interaction (approval / question / plan review), the bar
 * switches to the amber warning palette and the label names the wait — the
 * session's own wait reads through the global `useSessionPendingInteraction`
 * seat; subagent waits surface through the same map plus the global session
 * list (`origin: 'subagent'` rows carry `parentId`; the sidebar hides
 * them, so this strip is where the main agent surfaces them).
 *
 * Interrupted state: when the session's latest completed turn was stopped —
 * a manual stop, an API failure, or another unexpected break — the bar
 * switches to the orange-red palette with a slow pulse and the label reads
 * 已中断. Only the latest completed turn is judged (by its turn/end seq), so
 * an interruption followed by a clean turn does not keep the bar orange.
 *
 * Live token rate (v0.9.0): while the model is emitting (running with a
 * non-empty partial and no pending human interaction), the strip shows a
 * live generation-rate readout — estimated tokens over the decode window
 * since the first visible token. Streaming chunks carry no token counts, so
 * the figure is an estimate that self-calibrates to the model's real
 * tokenizer density from the latest settled step's provider usage (CJK-aware
 * char heuristic before the first calibrated step; see token-rate.ts), and
 * is smoothed through a sliding window so the readout changes at most once
 * per second instead of on every chunk. Measured from the same first-token
 * anchor the core uses for its settled tokens/s, the live number is directly
 * comparable to the post-turn value on the conversation StatsLine.
 */
import { IconLoadingOutline16, IconSparkle16, IconWarningOutline16 } from '@deepseek-ai/dsh-client-ui-primitives'
import type { SessionSummary } from '@deepseek-ai/dsh-api-session-controller/client'
import type { SessionPendingInteraction } from '@deepseek-ai/dsh-client-ui-session/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import clsx from 'clsx'
import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import css from './SessionProgressBar.module.css'
import {
  isReasoning, lastTurnDuration, latestReportEta, latestTurnInterrupted, progressPercent, subagentRunningCount, tokenUsageTotals,
  runningTool, runningTurnStart, settledToolCount, todoCounts, type ChatLegacy,
} from './session-state.ts'
import { formatElapsed, TOKEN_RATE_WINDOW_MS, useFirstTokenAt, useNow, useWindowedTokenRate } from './timing.ts'
import { formatTokenRate, latestTokenDensity, streamedTokenEstimate } from './token-rate.ts'

/** Dock entry props: InputZone owner share + session/global standard kit + locale seat. */
export type SessionProgressBarProps = import('@deepseek-ai/dsh-client-ui-slots').PropsRuntime<'conversation.input.dock'> & PropsLocale<'progress'>

/**
 * Stable empty legacy slice for sessions whose Chat view target has not
 * registered yet (module-level so the fallback reference never moves).
 */
const EMPTY_LEGACY: ChatLegacy = {
  nodes: [],
  turnTimings: new Map(),
  turnEnds: new Map(),
  partial: null,
  runningCalls: [],
}

/** Pending human interactions of this session's subagent subtree, by kind. */
export interface SubagentPending {
  approvals: number
  questions: number
  plans: number
}

/** The three pending-interaction kinds the strip labels; null for unknown kinds. */
type PendingKind = 'approval' | 'question' | 'plan-review'

/** Narrow a pending-interaction discriminator to the labeled kinds. */
function pendingKindOf(kind: string | null | undefined): PendingKind | null {
  if (kind === 'approval' || kind === 'question' || kind === 'plan-review') return kind
  return null
}

/**
 * Walk the session list from the given root down its `parentId` chain and
 * count pending human interactions on subagent sessions. The sidebar hides
 * subagent rows; the pending-interaction map still carries them, so the
 * main strip can surface their waits.
 * @param byId - the global session-list index.
 * @param pending - pending interactions by session id.
 * @param rootId - the strip's owning session id.
 * @returns pending counts per kind across the whole subtree.
 */
function subagentPendingState(
  byId: Record<SessionId, SessionSummary>,
  pending: ReadonlyMap<SessionId, SessionPendingInteraction>,
  rootId: SessionId,
): SubagentPending {
  const children = new Map<SessionId, SessionId[]>()
  for (const [sid, row] of Object.entries(byId)) {
    if (row.parentId === undefined || row.origin !== 'subagent') continue
    const list = children.get(row.parentId) ?? []
    list.push(sid as SessionId)
    children.set(row.parentId, list)
  }
  const seen = new Set<SessionId>([rootId])
  const queue: SessionId[] = [rootId]
  let approvals = 0
  let questions = 0
  let plans = 0
  while (queue.length > 0) {
    const id = queue.shift() as SessionId
    for (const childId of children.get(id) ?? []) {
      if (seen.has(childId)) continue
      seen.add(childId)
      queue.push(childId)
      const kind = pendingKindOf(pending.get(childId)?.kind)
      if (kind === 'approval') approvals += 1
      else if (kind === 'question') questions += 1
      else if (kind === 'plan-review') plans += 1
    }
  }
  return { approvals, questions, plans }
}

/**
 * The attention label: this session's own wait (approval/question/plan
 * review) plus the subagent subtree's waits, combined with a separator when
 * both exist.
 */
function pendingLabel(
  ownKind: PendingKind | null,
  sub: SubagentPending,
  t: SessionProgressBarProps['t'],
): string {
  const ownText = ownKind === 'approval' ? t('bar.pendingApproval')
    : ownKind === 'question' ? t('bar.pendingQuestion')
    : ownKind === 'plan-review' ? t('bar.pendingPlan')
    : null
  const total = sub.approvals + sub.questions + sub.plans
  let subText: string | null = null
  if (total > 0) {
    if (total === 1 && sub.approvals === 1) subText = t('bar.pendingSubagentApproval')
    else if (total === 1 && sub.questions === 1) subText = t('bar.pendingSubagentQuestion')
    else if (total === 1 && sub.plans === 1) subText = t('bar.pendingSubagentPlan')
    else subText = t('bar.pendingSubagentCount', { count: total })
  }
  if (ownText !== null && subText !== null) return `${ownText} · ${subText}`
  return ownText ?? subText ?? ''
}

/** Human label for the current state; null means the dock row renders no text. */
function stateLabel(
  running: boolean,
  runningToolName: string | undefined,
  thinking: boolean,
  counts: { done: number; active: number; total: number } | null,
  t: SessionProgressBarProps['t'],
): ReactNode {
  if (running) {
    if (runningToolName !== undefined) return t('bar.tool', { name: runningToolName })
    if (thinking) return t('bar.thinking')
    return t('bar.running')
  }
  if (counts !== null) return t('bar.todos', { done: counts.done, active: counts.active, total: counts.total })
  return t('bar.idle')
}

/** Compact token count: 271904215 -> '271.9M', 355950 -> '356.0K'. */
function formatTokenCount(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

/**
 * Resident progress strip. Renders nothing until a session snapshot exists
 * (the no-session hero has no dock content), then shows the state text, the
 * animated fill bar with a live percent readout, the turn/tool counters, and
 * — while running — the live elapsed plus the model-reported ETA (or the
 * last settled turn's duration when idle). Pending human interactions (this
 * session or its subagent subtree) and interrupted stops (manual or
 * unexpected) each override the plain states with their attention palette.
 */
export function SessionProgressBar({
  session, sessionId, t, useConversation, useProjection, useSessions, useSessionPendingInteraction,
}: SessionProgressBarProps) {
  // Defensive guard: the InputZone owner share types session non-null, but a
  // host passing no session must degrade to an empty dock instead of crashing.
  // oxlint-disable-next-line typescript/no-unnecessary-condition
  if (session === undefined || session === null) return null
  const chat = useConversation(conversation => conversation.views.get('chat'))
  const legacy = chat?.legacy ?? EMPTY_LEGACY
  const todos = useProjection('todos')
  const toolName = runningTool(legacy)
  const running = session.running
  const thinking = running && toolName === undefined && isReasoning(legacy)
  const counts = todoCounts(todos)
  const percent = progressPercent(legacy, todos)
  const turn = legacy.turnTimings.size
  const settled = settledToolCount(legacy)
  const turnStart = runningTurnStart(legacy)
  const now = useNow(running, turnStart)
  const elapsed = turnStart !== null ? Math.max(0, now - turnStart) : null
  // Live token rate window: the streaming partial plus its first-visible-token
  // anchor; the rate value itself is derived below, once `pending` is known
  // (a paused stream would only decay, so the chip hides while attention waits).
  const partial = legacy.partial
  const firstTokenAt = useFirstTokenAt(running, partial)
  // ETA rides the model's own knowledge — never extrapolated from the fill.
  const modelEta = running ? latestReportEta(legacy) : null
  const lastTurn = running ? null : lastTurnDuration(legacy)
  // A session that has finished at least one turn rests in the success
  // palette (light green); a never-run session keeps the neutral look.
  const completed = !running && turn > 0
  // Attention state: this session's own pending waits plus the subagent
  // subtree's (the sidebar hides subagent rows — this strip surfaces them).
  const pendingBySession = useSessionPendingInteraction(interactions => interactions)
  const ownPending = pendingKindOf(pendingBySession.get(sessionId)?.kind)
  const subPending = subagentPendingState(useSessions(s => s.byId), pendingBySession, sessionId)
  const pending = ownPending !== null || subPending.approvals + subPending.questions + subPending.plans > 0
  // Interrupted state: the latest completed turn was stopped (manual stop,
  // API failure, or another unexpected break) — orange-red, outranks the
  // running/done rests so the stop cannot be missed.
  const interrupted = !running && latestTurnInterrupted(chat, legacy, session.lastAgentError)
  // Background state: this main conversation is idle while descendant
  // subagent sessions keep executing — the strip must not read 会话就绪
  // (the green done rest) while background work is still running.
  const subRunning = subagentRunningCount(useSessions(s => s.byId) as unknown as Record<string, { running?: boolean; parentId?: string; origin?: string }>, sessionId)
  const background = !running && subRunning > 0
  // Session-wide token usage (per-turn provider accounting from the turn
  // tails) behind a hover/click panel: the chip shows the running total,
  // the panel breaks it down uncached/cache-read/output with the cache-hit
  // percentage. Pin via click; hover previews and auto-hides.
  const tokenTotals = tokenUsageTotals(legacy)
  const [tokenPinned, setTokenPinned] = useState(false)
  const [tokenHover, setTokenHover] = useState(false)
  const tokenHoverTimer = useRef<number | undefined>(undefined)
  /** Schedule the hover preview to close; the panel or chip re-enter cancels. */
  const scheduleTokenHide = (): void => {
    tokenHoverTimer.current = window.setTimeout(() => { setTokenHover(false) }, 120)
  }
  /** Cancel a scheduled hover close (pointer moved onto the panel/chip). */
  const cancelTokenHide = (): void => {
    if (tokenHoverTimer.current !== undefined) { window.clearTimeout(tokenHoverTimer.current); tokenHoverTimer.current = undefined }
  }
  const tokenPanelOpen = tokenPinned || tokenHover
  // Live tokens/sec since the first visible token, self-calibrated to the
  // model's real tokenizer density (latest settled step's provider usage
  // over its weighted chars scales the partial; CJK-aware heuristic before
  // the first calibrated step). Smoothed through a sliding window so the
  // readout changes at most once per window instead of on every chunk.
  const density = latestTokenDensity(legacy.nodes)
  const tokenRate = useWindowedTokenRate(
    running && !pending && firstTokenAt !== null,
    firstTokenAt,
    streamedTokenEstimate(partial, density),
    TOKEN_RATE_WINDOW_MS,
  )

  return (
    <div className={css.dock} data-progress-bar>
      <div
        className={css.bar}
        data-state={pending ? 'pending' : running ? 'running' : interrupted ? 'interrupted' : background ? 'background' : completed ? 'done' : 'idle'}
      >
        <span className={clsx(css.glyph, (running || background) && css.glyphRunning)}>
          {running || background ? <IconLoadingOutline16 size={14} /> : interrupted ? <IconWarningOutline16 size={14} /> : <IconSparkle16 size={14} />}
        </span>
        <span className={css.label}>
          {pending ? pendingLabel(ownPending, subPending, t) : interrupted ? t('bar.interrupted') : background ? t('bar.background', { count: subRunning }) : stateLabel(running, toolName, thinking, counts, t)}
        </span>
        <div className={css.track} role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
          <div
            className={clsx(css.fill, running && css.fillRunning)}
            style={{ width: `${percent}%` }}
          />
          {running && !pending && <div className={css.shimmer} />}
        </div>
        <span className={css.percent}>{percent}%</span>
        {running && modelEta !== null && <span className={css.eta}>{t('bar.eta', { duration: modelEta })}</span>}
        {running && elapsed !== null && <span className={css.counter}>{t('bar.elapsed', { duration: formatElapsed(elapsed) })}</span>}
        {running && tokenRate !== null && <span className={css.rate}>{t('bar.tokenRate', { rate: formatTokenRate(tokenRate) })}</span>}
        {!running && lastTurn !== null && <span className={css.counter}>{t('bar.lastTurn', { duration: formatElapsed(lastTurn) })}</span>}
        <span className={css.counter}>{t('bar.turn', { turn })}</span>
        <span className={css.counter}>{t('bar.tools', { count: settled })}</span>
        {tokenTotals !== null && tokenTotals.totalTokens > 0 && (
          <button
            type="button"
            className={css.tokenChip}
            data-pin={tokenPinned ? 'true' : undefined}
            aria-expanded={tokenPanelOpen}
            title={t('token.total')}
            onClick={() => { setTokenPinned(v => !v) }}
            onMouseEnter={() => { setTokenHover(true) }}
            onMouseLeave={() => { scheduleTokenHide() }}
          >
            Σ {formatTokenCount(tokenTotals.totalTokens)}
          </button>
        )}
      </div>
      {tokenTotals !== null && tokenTotals.totalTokens > 0 && tokenPanelOpen && (
        <div className={css.tokenPanel} role="dialog" aria-label={t('token.total')}
          onMouseEnter={() => { cancelTokenHide() }} onMouseLeave={() => { scheduleTokenHide() }}>
          <div className={css.tokenRow}><span className={css.tokenHead}>{t('token.total')}</span><span className={css.tokenValue}>{tokenTotals.totalTokens.toLocaleString('en-US')} tok</span></div>
          <div className={css.tokenRow}><span>{t('token.uncached')}</span><span className={css.tokenValue}>{tokenTotals.uncachedInputTokens.toLocaleString('en-US')} tok</span></div>
          <div className={css.tokenRow}><span>{t('token.cacheRead')}</span><span className={css.tokenValue}>{tokenTotals.cacheReadTokens.toLocaleString('en-US')} tok</span></div>
          <div className={css.tokenRow}><span>{t('token.output')}</span><span className={css.tokenValue}>{tokenTotals.outputTokens.toLocaleString('en-US')} tok</span></div>
          <div className={css.tokenRow}><span>{t('token.cacheHit')}</span><span className={css.tokenValue}>{tokenTotals.cacheReadComplete && tokenTotals.totalTokens > 0 ? Math.round(tokenTotals.cacheReadTokens / tokenTotals.totalTokens * 100) + '%' : '—'}</span></div>
        </div>
      )}
    </div>
  )
}
