/**
 * Pure live token-rate derivations for the session progress strip. Streaming
 * chunks carry no token counts — the provider only reports usage at step end —
 * so the live rate estimates tokens from the in-flight partial's characters
 * and divides by the decode wall time since the first visible token.
 *
 * The estimate is self-calibrating: once any settled assistant step reports
 * real output tokens (provider usage), the observed tokens-per-weighted-char
 * density of the latest such step is applied to the streaming partial, so the
 * live figure tracks the actual tokenizer density of the model in use instead
 * of a fixed char heuristic. Before the first calibrated step the CJK-aware
 * char density is the fallback. All pure functions: no React, no framework
 * state; the component supplies the partial, the settled nodes, and the
 * first-token observation time.
 */

import type { AssistantBlock, ConversationNode, PartialAssistant } from '@deepseek-ai/dsh-client-ui-chat/client'

/**
 * Wide CJK characters priced at one token each: CJK punctuation/forms,
 * kana, CJK ideographs (incl. extension A and compatibility), and hangul.
 * A single regex alternation so a per-character test is stateless.
 */
const CJK_CHAR = /[\u3000-\u303F\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF\uFF00-\uFFEF]/

/**
 * Non-CJK density: every 4 chars ≈ 1 token (the core token-meter's fixed
 * CHARS_PER_TOKEN). The CJK half diverges on purpose — the meter's flat
 * density is a conservative context-budget heuristic, while a live
 * throughput readout should track real generation, where one CJK char is
 * typically one token. Calibration replaces this static weighting once real
 * provider usage is available.
 */
const NARROW_TOKEN_WEIGHT = 0.25

/** Read the provider-reported completion-token count from an assistant node. */
function usageOutputTokens(usage: unknown): number | null {
  if (typeof usage !== 'object' || usage === null) return null
  const value = (usage as { outputTokens?: unknown }).outputTokens
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null
}

/**
 * Weighted char measure of assistant content: wide CJK chars count 1.0,
 * remaining chars 0.25 (the fixed non-CJK density). Fractional on purpose —
 * a live estimate must not jump on per-block ceilings, and calibration
 * multiplies this measure by a real tokens-per-weighted-char density.
 * @param blocks - assistant content blocks (text/reasoning bodies, tool-call name + arguments).
 * @returns weighted chars; 0 when nothing is readable.
 */
export function weightedChars(blocks: readonly AssistantBlock[]): number {
  const split = splitWeightedChars(blocks)
  return split.reasoning + split.text
}

/** 按内容类型拆分的加权字符量：思考（reasoning）与正文/工具调用分别计量——
 * 两类内容的分词密度往往不同（思考多为英文链式推理、正文随语言变化），
 * 分别校准能让流式速率在思考阶段与正文阶段都更贴近真实。 */
export interface SplitWeighted { reasoning: number, text: number }

/** 逐块分类加权：reasoning 块计入 reasoning，text 与 tool-call 计入 text。 */
export function splitWeightedChars(blocks: readonly AssistantBlock[]): SplitWeighted {
  let rWide = 0
  let rNarrow = 0
  let tWide = 0
  let tNarrow = 0
  for (const block of blocks) {
    const isReasoning = block.kind === 'reasoning'
    const text = block.kind === 'tool-call' ? block.name + block.argsRaw
      : block.kind === 'text' || isReasoning ? block.text
      : ''
    for (const char of text) {
      if (CJK_CHAR.test(char)) {
        if (isReasoning) rWide += 1
        else tWide += 1
      } else {
        if (isReasoning) rNarrow += 1
        else tNarrow += 1
      }
    }
  }
  return { reasoning: rWide + rNarrow * NARROW_TOKEN_WEIGHT, text: tWide + tNarrow * NARROW_TOKEN_WEIGHT }
}

/**
 * Weighted chars of the in-flight partial, or 0 when the model is not
 * emitting.
 * @param partial - the live streaming partial.
 * @returns the weighted-char measure {@link weightedChars} applies.
 */
export function weightedPartialChars(partial: PartialAssistant | null): number {
  return partial === null ? 0 : weightedChars(partial.blocks)
}

/**
 * Real tokens-per-weighted-char density of the latest settled assistant step
 * that carries both provider usage and readable content. The density is a
 * property of the model's tokenizer, so any recent completed step in the
 * window calibrates the live estimate (skipping steps without usage or with
 * no measurable content). Nodes are window-scoped and seq-ordered; scanning
 * backwards picks the newest usable sample.
 * @param nodes - settled nodes of the loaded window.
 * @returns tokens per weighted char, or null before any usable step settled.
 */
export interface TokenDensity {
  /** 思考内容的 tokens/加权字符密度；无样本时与 blended 相同。 */
  reasoning: number
  /** 正文/工具调用的密度；无样本时与 blended 相同。 */
  text: number
  /** 混合密度（原行为）：整步 output / 整步加权字符。 */
  blended: number
}

/**
 * 分别校准思考与正文的 tokens-per-weighted-char 密度：扫描已结算步骤，
 * reasoning 加权占比 > 70% 的步骤提供 reasoning 样本，< 30% 提供 text 样本，
 * 其余只贡献 blended。任何一类无独立样本时回退 blended（原行为）。
 * @param nodes - 已结算节点窗口。
 * @returns 三档密度。
 */
export function latestTokenDensity(nodes: readonly ConversationNode[]): TokenDensity | null {
  let blended: number | null = null
  let reasoningSample: number | null = null
  let textSample: number | null = null
  for (let i = nodes.length - 1; i >= 0; i -= 1) {
    const node = nodes[i]
    if (node === undefined || node.kind !== 'assistant') continue
    const output = usageOutputTokens(node.usage)
    if (output === null || output <= 0) continue
    const split = splitWeightedChars(node.blocks)
    const total = split.reasoning + split.text
    if (total <= 0) continue
    const density = output / total
    if (blended === null) blended = density
    if (reasoningSample === null && split.reasoning > total * 0.7) reasoningSample = output / split.reasoning
    if (textSample === null && total - split.reasoning > total * 0.7) textSample = output / (total - split.reasoning)
    if (reasoningSample !== null && textSample !== null && blended !== null) break
  }
  if (blended === null) return null
  return {
    blended,
    reasoning: reasoningSample ?? blended,
    text: textSample ?? blended,
  }
}

export function streamedTokenEstimate(partial: PartialAssistant | null, density: number | null | TokenDensity): number {
  const weighted = weightedPartialChars(partial)
  if (weighted <= 0) return 0
  if (density === null) return weighted
  if (typeof density === 'number') return weighted * density
  // 分密度估算：思考段与正文段各用各的校准系数（无独立样本时回退 blended）。
  const split = splitWeightedChars(partial!.blocks)
  return split.reasoning * density.reasoning + split.text * density.text
}

/**
 * Live tokens per second over the decode window (first visible token → now).
 * Mirrors the core's settled reading — output tokens over decode wall time —
 * so the running figure is directly comparable to the post-turn value shown
 * by the conversation StatsLine.
 * @param tokens - estimated streamed tokens ({@link streamedTokenEstimate}).
 * @param firstTokenAt - epoch ms when the first visible token was observed.
 * @param now - epoch ms clock reading.
 * @returns tokens/sec, or null while the window is empty or not yet open.
 */
export function liveTokenRate(tokens: number, firstTokenAt: number, now: number): number | null {
  const decodeMs = now - firstTokenAt
  if (tokens <= 0 || decodeMs <= 0) return null
  return tokens / (decodeMs / 1_000)
}

/**
 * Compact rate figure: whole tokens from ten up, one decimal below (same
 * shape as the core's formatTokensPerSecond, which the settled footer uses).
 * @param tps - tokens per second (negatives clamp to zero).
 * @returns display number without unit.
 */
export function formatTokenRate(tps: number): string {
  const clamped = Math.max(0, tps)
  return clamped >= 10 ? String(Math.round(clamped)) : String(Math.round(clamped * 10) / 10)
}
