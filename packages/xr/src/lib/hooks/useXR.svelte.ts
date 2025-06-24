import type { CurrentReadable } from '@threlte/core'
import type { WebXRManager } from 'three'
import { runeToCurrentReadable } from '../internal/runeToCurrentReadable.svelte'

class XRState {
  isPresenting = $state(false)
  isHandTracking = $state(false)
  session = $state.raw<XRSession>()
  referenceSpaceType = $state.raw<XRReferenceSpaceType>()
  xr = $state.raw<WebXRManager>()
}

export const xrState = new XRState()

/**
 * Provides access to context related to `<XR />`.
 */
export const useXR = (): {
  isPresenting: CurrentReadable<boolean>
  isHandTracking: CurrentReadable<boolean>
  session: CurrentReadable<XRSession | undefined>
} => {
  return {
    isPresenting: runeToCurrentReadable(() => xrState.isPresenting),
    isHandTracking: runeToCurrentReadable(() => xrState.isHandTracking),
    session: runeToCurrentReadable(() => xrState.session)
  }
}
