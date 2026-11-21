import { describe, expect, it } from 'vitest'
import { createSoundEdgeState, nextSoundEvent, type SoundFrame } from '../src/client/sounds.ts'

function frame(over: Partial<SoundFrame> = {}): SoundFrame {
  return {
    running: false,
    pending: false,
    ownPendingKind: null,
    sandboxPending: false,
    interrupted: false,
    errored: false,
    turnCount: 1,
    ...over,
  }
}

describe('sound edge detection', () => {
  it('running → idle clean emits complete once', () => {
    const st = createSoundEdgeState(frame({ running: true }))
    expect(nextSoundEvent(st, frame({ running: false }))).toBe('complete')
    expect(nextSoundEvent(st, frame({ running: false }))).toBe(null)
  })

  it('running → interrupted emits interrupted, not complete', () => {
    const st = createSoundEdgeState(frame({ running: true }))
    expect(nextSoundEvent(st, frame({ running: false, interrupted: true }))).toBe('interrupted')
  })

  it('running → errored emits nothing (error palette suffices)', () => {
    const st = createSoundEdgeState(frame({ running: true }))
    expect(nextSoundEvent(st, frame({ running: false, errored: true }))).toBe(null)
  })

  it('pending appearing emits attention; escalating to sandbox emits sandbox', () => {
    const st = createSoundEdgeState(frame({ running: true }))
    expect(nextSoundEvent(st, frame({ running: true, pending: true, ownPendingKind: 'question' }))).toBe('attention')
    expect(nextSoundEvent(st, frame({ running: true, pending: true, ownPendingKind: 'approval', sandboxPending: true }))).toBe('sandbox')
  })

  it('sandbox pending direct from idle emits sandbox (not attention)', () => {
    const st = createSoundEdgeState(frame({ running: true }))
    expect(nextSoundEvent(st, frame({ running: true, pending: true, sandboxPending: true }))).toBe('sandbox')
  })

  it('pending persisting does not re-fire; clearing resets debounce', () => {
    const st = createSoundEdgeState(frame({ running: true }))
    expect(nextSoundEvent(st, frame({ running: true, pending: true }))).toBe('attention')
    expect(nextSoundEvent(st, frame({ running: true, pending: true }))).toBe(null)
    expect(nextSoundEvent(st, frame({ running: true }))).toBe(null)
    expect(nextSoundEvent(st, frame({ running: true, pending: true }))).toBe('attention')
  })

  it('complete after an attention wait fires once the wait clears and turn settles', () => {
    const st = createSoundEdgeState(frame({ running: true, pending: true, ownPendingKind: 'question' }))
    expect(nextSoundEvent(st, frame({ running: true, pending: true }))).toBe(null)
    expect(nextSoundEvent(st, frame({ running: false }))).toBe('complete')
  })

  it('zero-turn session going idle emits nothing (never-run rest)', () => {
    const st = createSoundEdgeState(frame({ running: true, turnCount: 0 }))
    expect(nextSoundEvent(st, frame({ turnCount: 0 }))).toBe(null)
  })
})
