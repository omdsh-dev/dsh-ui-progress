/**
 * 提示音（Codex 式）：会话状态跃迁的边沿检测 + Web Audio 合成播放。
 *
 * 纯逻辑（nextSoundEvent）：输入「上一帧/本帧」的条状态摘要，只在
 * 跃迁边沿产出一个声音事件——重复渲染、状态保持不响。可单测。
 *
 * 播放（SoundCue）：Web Audio 振荡器合成四种短音（无资源文件）：
 * complete 上行大三和弦琶音 C5-E5-G5 / interrupted 高音区三音下行
 * A5-G5-E5 / attention 回环 C6-G5-C6 带钟声泛音 / sandbox 增五度
 * F5-B5 断奏交替。AudioContext 由首次用户手势解锁（浏览器
 * 自动播放策略），未解锁前静默跳过。
 */
import type { PendingKind } from './SessionProgressBar.tsx'

/** 调试开关：控制台输出声音桥事件（提示音排查用）。 */
export const SOUND_DEBUG = true

function dbg(msg: string): void {
  if (SOUND_DEBUG) console.log('[dsh-ui-progress/sound] ' + msg)
}

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
  /** 主回合已收束但后台（子代理/任务）仍在跑（条的天蓝态）——完成音必须等它也结束。 */
  background: boolean
  /** 会话状态快照里的待决种类（精确通道）；不可用为 null。 */
  statusKind: string | null
  /** 当前在跑的工具是否为 ask 类（启发式回退通道）。 */
  askTool: boolean
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
  const pendingNow = frame.sandboxPending || frame.pending || (frame.statusKind !== null) || frame.askTool
  const pendingPrev = prev.sandboxPending || prev.pending || (prev.statusKind !== null) || prev.askTool
  if (frame.sandboxPending && !prev.sandboxPending) fire = 'sandbox'
  else if (!frame.sandboxPending && frame.statusKind === 'approval' && prev.statusKind !== 'approval') fire = 'sandbox'
  else if (pendingNow && !pendingPrev) fire = 'attention'
  else if (frame.pending && prev.pending && !prev.sandboxPending && frame.sandboxPending) fire = 'sandbox'
  // 2) 回合收束：中断或错误（API 限流/供应商失败）都响——都是「任务意外停了」。
  else if (prev.running && !frame.running && (frame.interrupted || frame.errored)) fire = 'interrupted'
  // 迟到的中断信号：running 已在早前帧翻 false（天蓝 background 态推进了 prev），
  // interrupted 标记此刻才升起——按上升沿触发，不依赖 prev.running。
  else if (!prev.interrupted && !prev.errored && (frame.interrupted || frame.errored) && frame.turnCount > 0) fire = 'interrupted'
  // 3) 回合收束：干净完成（errored 优先级归入 interrupted 同级但不响完成音）。
  else if (prev.running && !frame.running && !frame.interrupted && !frame.errored && frame.turnCount > 0 && !frame.background) fire = 'complete'
  state.prev = frame
  if (fire !== null && fire === state.lastFired) {
    // 同一事件去抖：状态未离开过该事件就不重复响。
    return null
  }
  if (fire !== null) state.lastFired = fire
  else state.lastFired = null
  return fire
}

/** 单个音符参数：起始偏移/频率/时长/音量/波形。 */
interface Note {
  t0: number
  freq: number
  dur: number
  volume: number
  type?: OscillatorType
}

/** 各事件的音色：一组音符（含可能的泛音叠加）。 */
type Tone = Note[]

/** A5/G5/E5/C6/B5/F5 频率（Hz）。 */
const F = { A5: 880, G5: 783.99, E5: 659.25, C6: 1046.5, B5: 987.77, F5: 698.46 }

const TONES: Record<SoundEvent, Tone> = {
  // 上行大三和弦琶音（C5-E5-G5）——完成的愉悦感。
  complete: [
    { t0: 0, freq: 523.25, dur: 0.28, volume: 0.16 },
    { t0: 0.16, freq: 659.25, dur: 0.28, volume: 0.16 },
    { t0: 0.32, freq: 783.99, dur: 0.5, volume: 0.16 },
  ],
  // 高音区三音下行（A5-G5-E5）——轻落的"叹气"感，与完成音的向上镜像。
  interrupted: [
    { t0: 0, freq: F.A5, dur: 0.12, volume: 0.22 },
    { t0: 0.11, freq: F.G5, dur: 0.12, volume: 0.25 },
    { t0: 0.22, freq: F.E5, dur: 0.32, volume: 0.3 },
  ],
  // 小回环（C6-G5-C6）+ 钟声泛音——招手"看一下我"。
  attention: [
    { t0: 0, freq: F.C6, dur: 0.12, volume: 0.22 },
    { t0: 0, freq: F.C6 * 2.4, dur: 0.06, volume: 0.05 },
    { t0: 0.11, freq: F.G5, dur: 0.12, volume: 0.22 },
    { t0: 0.22, freq: F.C6, dur: 0.4, volume: 0.3 },
    { t0: 0.22, freq: F.C6 * 2.4, dur: 0.15, volume: 0.07 },
  ],
  // 增五度交替（F5-B5 ×2，断奏方波）——不协和的点状警示。
  // 音量 0.09-0.11 实测过轻（其他事件 0.22-0.3）——提到 0.2 档并稍加长，保留断奏点状感。
  sandbox: [
    { t0: 0, freq: F.F5, dur: 0.09, volume: 0.2, type: 'square' },
    { t0: 0.11, freq: F.B5, dur: 0.09, volume: 0.22, type: 'square' },
    { t0: 0.26, freq: F.F5, dur: 0.09, volume: 0.2, type: 'square' },
    { t0: 0.37, freq: F.B5, dur: 0.14, volume: 0.24, type: 'square' },
  ],
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
   * 注册一次性用户手势解锁：浏览器自动播放策略下，AudioContext 在
   * 手势外创建即 suspended 且 resume 静默失败——第一次 play 若发生在
   * 渲染 effect 里（非点击处理器），声音可能永远不出。挂在 window
   * 的首个 pointerdown/keydown 上主动 resume，任何点击过 GUI 的用户
   * 此后提示音都有效。
   */
  /** 被自动播放策略吞掉的事件队列（解锁后补播，最多留最近一个）。 */
  private queued: SoundEvent | null = null

  registerUnlock(): void {
    const unlock = (): void => {
      try {
        if (this.ctx === null) {
          const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
          if (AC === undefined) return
          this.ctx = new AC()
        }
        dbg('unlock gesture — ctx ' + (this.ctx?.state ?? 'n/a'))
        if (this.ctx.state === 'suspended') void this.ctx.resume()
        // 手势已发生：补播被吞的事件（若 resume 稍后完成，play 内部会再排一次，无碍）。
        const pending = this.queued
        this.queued = null
        if (pending !== null && !this.muted) this.play(pending)
      } catch {
        // 无音频环境：静默降级。
      }
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
    window.addEventListener('pointerdown', unlock, { once: false })
    window.addEventListener('keydown', unlock, { once: false })
  }

  /**
   * 播放一个事件音。AudioContext 未创建/被浏览器挂起时静默跳过
   * （首次点击 GUI 后下一次调用即可出声）。
   * @param event - 事件种类。
   */
  play(event: SoundEvent): void {
    dbg('play ' + event + ' muted=' + String(this.muted) + ' ctx=' + (this.ctx === null ? 'null' : this.ctx.state))
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
      for (const note of tone) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = note.type ?? 'sine'
        osc.frequency.value = note.freq
        const start = now + note.t0
        gain.gain.setValueAtTime(0, start)
        gain.gain.linearRampToValueAtTime(note.volume, start + 0.012)
        gain.gain.exponentialRampToValueAtTime(0.0001, start + note.dur)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(start)
        osc.stop(start + note.dur + 0.02)
      }
    } catch {
      // 音频不可用（无头环境/策略限制）：静默降级。
    }
  }
}

/**
 * 从条状态派生值拼装帧摘要（纯函数，供组件与测试共用）。
 *
 * 沙箱近似：ownPending === 'approval' 视为沙箱类（许可请求域里沙箱
 * 提权是最常见的一类；提问/计划审阅走 attention 音）。
 *
 * @param running - 回合运行中。
 * @param pending - 本会话或子代理树有待决交互。
 * @param ownPending - 自己的待决种类（可能为 null——子代理的待决）。
 * @param interrupted - 最近完成回合中断。
 * @param errored - 最近完成回合错误。
 * @param turnCount - 已完成回合数。
 */
export function soundFrameOf(
  running: boolean,
  pending: boolean,
  ownPending: PendingKind | null,
  interrupted: boolean,
  errored: boolean,
  turnCount: number,
  statusKind: string | null = null,
  runningTool: string | undefined = undefined,
  background = false,
): SoundFrame {
  const askTool = runningTool !== undefined && runningTool.includes('ask')
  // 精确通道优先：状态快照的 kind；否则旧席位近似；提问类工具回退。
  const sandbox = statusKind === 'approval' || (statusKind === null && ownPending === 'approval')
  const attentionFallback = statusKind === null && !sandbox && askTool
  return {
    running,
    pending: pending || attentionFallback || statusKind !== null,
    ownPendingKind: ownPending,
    sandboxPending: sandbox,
    interrupted,
    errored,
    turnCount,
    statusKind,
    askTool,
    background,
  }
}

/**
 * 声音桥（模块级单例）：跨越进度条组件的卸载周期存活。
 *
 * 为什么需要：审批/提问卡片以更高优先级顶掉 conversation.composer
 * 槽位，住在 input dock 里的进度条随之卸载——待决出现的那一刻恰好
 * 没有任何组件在监听。桥的对策：
 * - 正常帧边沿照常检测（完成/中断）。
 * - 卸载即信号：运行中的卸载 = 卡片接管。600ms 内未重挂载（排除
 *   会话切换的重挂载）则按卸载时在跑的工具定音——ask_user_question
 *   → attention 钟声，其他 → sandbox 警示音；同时把边沿状态推进到
 *   「已待决」合成帧，重挂载后真实帧不会重复响。
 */
export class SoundBridge {
  private cue = new SoundCue()
  private edge: SoundEdgeState | null = null
  private lastTool: string | undefined = undefined

  /** 静音状态（进度条按钮切换；持久化由调用方做）。 */
  setMuted(muted: boolean): void {
    this.cue.setMuted(muted)
  }

  isMuted(): boolean {
    return this.cue.isMuted()
  }

  /** 解锁音频（挂载时注册手势监听）。 */
  registerUnlock(): void {
    this.cue.registerUnlock()
  }

  /** 试音（喇叭按钮开启时）。 */
  testTone(): void {
    this.cue.play('complete')
  }

  /**
   * 进度条每帧上报：驱动常规边沿（完成/中断/待决出现）。
   * @param frame - 帧摘要。
   * @param runningTool - 当前在跑的工具名（卸载定音用）。
   */
  /** 收束延迟定音计时器。 */
  private settleTimer: number | undefined = undefined
  /** 挂起期间最新的干净收束帧。 */
  private lastSettleFrame: SoundFrame | null = null

  update(frame: SoundFrame, runningTool: string | undefined): void {
    dbg('frame run=' + String(frame.running) + ' pend=' + String(frame.pending) + ' bg=' + String(frame.background) + ' tool=' + String(runningTool))
    this.lastTool = runningTool
    this.edge = this.edge ?? createSoundEdgeState(frame)
    // 完成音延迟定音：主回合干净收束（running→false、无中断标记）不立即
    // 响——手动中断时 aborted 信号会迟到（常见路径：先转天蓝 background
    // 态，随后才橘红）。天蓝期间完全挂起；空闲后挂 1500ms，窗口内中断/
    // 错误升起（上升沿）立即播中断音。
    const settling = this.lastSettleFrame !== null || (this.edge.prev.running && !frame.running)
    const clean = !frame.interrupted && !frame.errored
    if (settling && clean && !frame.running && frame.turnCount > 0) {
      if (frame.background) {
        if (this.settleTimer !== undefined) { window.clearTimeout(this.settleTimer); this.settleTimer = undefined }
        this.lastSettleFrame = frame
        dbg('settling held — background active')
        return
      }
      this.lastSettleFrame = frame
      if (this.settleTimer === undefined) {
        dbg('settle clean — deferring complete tone 1500ms')
        this.settleTimer = window.setTimeout(() => {
          this.settleTimer = undefined
          const latest = this.lastSettleFrame
          this.lastSettleFrame = null
          if (latest === null || this.edge === null) return
          const ev = nextSoundEvent(this.edge, latest)
          dbg('settle resolved → ' + String(ev))
          if (ev !== null) this.cue.play(ev)
        }, 1500)
      }
      return
    }
    // 中断/错误升起（含窗口内到达）：取消挂起，立即定音。
    if (this.settleTimer !== undefined || this.lastSettleFrame !== null) {
      window.clearTimeout(this.settleTimer)
      this.settleTimer = undefined
      this.lastSettleFrame = null
      dbg('interrupt arrived within settle window — firing now')
    }
    const ev = nextSoundEvent(this.edge, frame)
    if (ev !== null) this.cue.play(ev)
  }

  /** 进度条挂载：仅日志（接管启发式已移除）。 */
  markMounted(): void {
    dbg('strip mounted')
  }

  /**
   * 进度条卸载：仅记录，不发声。
   *
   * 原实现把「运行中卸载」当卡片接管信号（600ms 未重挂载播沙箱/提问
   * 音）——后经实测证伪：审批/提问卡并不会卸载本条（帧日志在卡片期间
   * 连续输出），真正触发卸载的是切换会话/切走页面等场景，该启发式只
   * 会误报（运行中切会话 600ms 后凭空响起沙箱音）。待决检测已由
   * useSessionStatus 精确通道接管，本方法保留为空操作以兼容调用方。
   * @param frame - 卸载时的最后帧（未使用）。
   */
  markUnmounted(frame: SoundFrame): void {
    void frame
    dbg('strip unmounted (no sound — takeover heuristic removed)')
  }
}
