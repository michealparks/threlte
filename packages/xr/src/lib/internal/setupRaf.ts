import { onDestroy } from 'svelte'
import { raf } from 'svelte/internal/client'
import { observe } from '@threlte/core'
import { xrState } from './state.svelte'

export const setupRaf = () => {
  if (typeof window === 'undefined') return

  const originalTick = raf.tick

  observe(
    () => [xrState.session],
    ([session]) => {
      raf.tick =
        session === undefined
          ? originalTick
          : (fn: XRFrameRequestCallback) => session.requestAnimationFrame(fn)
    }
  )

  onDestroy(() => (raf.tick = originalTick))
}
