/**
 * 提示音（Codex 式）：会话状态跃迁的边沿检测 + Web Audio 合成播放。
 *
 * 纯逻辑（nextSoundEvent）：输入「上一帧/本帧」的条状态摘要，只在
 * 跃迁边沿产出一个声音事件——重复渲染、状态保持不响。可单测。
 *
 * 播放（SoundCue）：Web Audio 振荡器合成四种短音（无资源文件）：
 * complete 上行大三和弦琶音 / interrupted 下行小二度 / attention 双音
 * 提示铃 / sandbox 低频双击。AudioContext 由首次用户手势解锁（浏览器
 * 自动播放策略），未解锁前静默跳过。
 */
import type { PendingKind } from './SessionProgressBar.tsx'

/** 声音事件种类。 */
export type SoundEvent = 'complete' | 'interrupted' | 'attention' | 'sandbox'

/** 每帧喂给边沿检测的状态摘要（组件从既有派生值拼装）。 */
export interface SoundFrame {
  /** 本会话回合是否在跑。 */
  running: boolean
  /** 本会话是否有待决人工交互（approval/question/plan-review 任意）。 */
  pending: boolean
  /** 自己（非子代理）待决的种类；无则 null。 */
  ownPendingKind: PendingKind | null
  /** 待决是否为沙箱提权类（approval 且请求含 sandbox 特征）。 */
  sandboxPending: boolean
  /** 最近完成回合是否中断（手动停止/崩溃修复）。 */
  interrupted: boolean
  /** 最近完成回合是否错误。 */
  errored: boolean
  /** 是否完成过至少一个回合（用于完成音的判定）。 */
  turnCount: number
}

/** 边沿检测内部状态：上次帧摘要 + 已为该事件发过声的标记。 */
export interface SoundEdgeState {
  prev: SoundFrame
  /** 上一个已发声的边沿（同事件持续期间不重复响）。 */
  lastFired: SoundEvent | null
}

/**
 * 由首帧初始化边沿状态。
 * @param frame - 首帧摘要。
 */
export function createSoundEdgeState(frame: SoundFrame): SoundEdgeState {
  return { prev: frame, lastFired: null }
}

/**
 * 计算本帧应发声的事件（纯函数；无跃迁返回 null）。
 *
 * 优先级：attention/sandbox（等待用户，最紧迫）> interrupted > complete。
 * 边沿定义：
 * - attention：pending 从 false→true（或种类变化），非沙箱
 * - sandbox：沙箱类待决从无→有
 * - interrupted：running 从 true→false 且 interrupted 为真
 * - complete：running 从 true→false、无中断无错误、且完成过回合
 * 同一事件在状态保持期间只响一次（lastFired 去重）。
 *
 * @param state - 边沿状态（就地更新 prev/lastFired）。
 * @param frame - 本帧摘要。
 * @returns 应播放的事件，或 null。
 */
export function nextSoundEvent(state: SoundEdgeState, frame: SoundFrame): SoundEvent | null {
  const prev = state.prev
  let fire: SoundEvent | null = null
  // 1) 等待用户：出现（或升级为沙箱）待决。
  if (frame.sandboxPending && !prev.sandboxPending) fire = 'sandbox'
  else if (frame.pending && !prev.pending) fire = 'attention'
  else if (frame.pending && prev.pending && !prev.sandboxPending && frame.sandboxPending) fire = 'sandbox'
  // 2) 回合收束：中断。
  else if (prev.running && !frame.running && frame.interrupted) fire = 'interrupted'
  // 3) 回合收束：干净完成（errored 优先级归入 interrupted 同级但不响完成音）。
  else if (prev.running && !frame.running && !frame.interrupted && !frame.errored && frame.turnCount > 0) fire = 'complete'
  state.prev = frame
  if (fire !== null && fire === state.lastFired) {
    // 同一事件去抖：状态未离开过该事件就不重复响。
    return null
  }
  if (fire !== null) state.lastFired = fire
  else state.lastFired = null
  return fire
}

/** 各事件的音色参数（频率 Hz / 时长 s / 音量 / 波形 / 音符间隔）。 */
interface Tone {
  freqs: number[]
  gap: number
  dur: number
  volume: number
  type: OscillatorType
}

const TONES: Record<SoundEvent, Tone> = {
  // 上行大三和弦琶音（C5-E5-G5）——完成的愉悦感。
  complete: { freqs: [523.25, 659.25, 783.99], gap: 0.09, dur: 0.16, volume: 0.16, type: 'sine' },
  // 下行小二度（E4-Eb4）——中断的顿挫感。
  interrupted: { freqs: [329.63, 311.13], gap: 0.12, dur: 0.18, volume: 0.14, type: 'triangle' },
  // 双音提示铃（A5-A5）——需要用户注意。
  attention: { freqs: [880, 880], gap: 0.14, dur: 0.1, volume: 0.14, type: 'sine' },
  // 低频双击（D3-D3 方波弱音）——沙箱操作等待。
  sandbox: { freqs: [146.83, 146.83], gap: 0.11, dur: 0.07, volume: 0.18, type: 'square' },
}

/**
 * 合成播放器：懒创建 AudioContext（首次用户手势后 ctx.resume 才有
 * 声），静音开关由调用方持久化。
 */
export class SoundCue {
  private ctx: AudioContext | null = null
  private muted = false

  /** 是否静音（条上按钮切换，localStorage 持久化由调用方负责）。 */
  setMuted(muted: boolean): void {
    this.muted = muted
  }

  isMuted(): boolean {
    return this.muted
  }

  /**
   * 播放一个事件音。AudioContext 未创建/被浏览器挂起时静默跳过
   * （首次点击 GUI 后下一次调用即可出声）。
   * @param event - 事件种类。
   */
  play(event: SoundEvent): void {
    if (this.muted) return
    try {
      if (this.ctx === null) {
        const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        if (AC === undefined) return
        this.ctx = new AC()
      }
      const ctx = this.ctx
      if (ctx.state === 'suspended') { void ctx.resume() }
      const tone = TONES[event]
      const now = ctx.currentTime
      tone.freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = tone.type
        osc.frequency.value = freq
        const start = now + i * tone.gap
        gain.gain.setValueAtTime(0, start)
        gain.gain.linearRampToValueAtTime(tone.volume, start + 0.012)
        gain.gain.exponentialRampToValueAtTime(0.0001, start + tone.dur)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(start)
        osc.stop(start + tone.dur + 0.02)
      })
    } catch {
      // 音频不可用（无头环境/策略限制）：静默降级。
    }
  }
}
