import { useThrelte } from '@threlte/core'
import { xrState } from '../internal/state.svelte'

/**
 * Provides access to context related to `<XR />`.
 */
export const useXR = (): {
  isPresenting: { current: boolean }
  isHandTracking: { current: boolean }
  session: { current: XRSession | undefined }
  xrFrame: { current: XRFrame }
} => {
  const { xr } = useThrelte().renderer

  return {
    isPresenting: {
      get current() {
        return xrState.isPresenting
      }
    },
    isHandTracking: {
      get current() {
        return xrState.isHandTracking
      }
    },
    session: {
      get current() {
        return xrState.session
      }
    },
    xrFrame: {
      get current() {
        return xr.getFrame()
      }
    }
  }
}
