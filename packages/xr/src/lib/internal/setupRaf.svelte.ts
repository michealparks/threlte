import { raf } from './raf'
import { xrState } from '../hooks/useXR.svelte'

export const setupRaf = () => {
  if (typeof window === 'undefined') return

  const originalTick = raf.tick

  $effect.pre(() => {
    const currentSession = xrState.session

    raf.tick =
      currentSession === undefined
        ? originalTick
        : (fn: XRFrameRequestCallback) => currentSession.requestAnimationFrame(fn)

    return () => {
      raf.tick = originalTick
    }
  })
}
