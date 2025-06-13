import { useThrelte } from '@threlte/core'

/**
 * There are some cases where we need to know if hand tracking is now active before an input source
 * connection or disconnection event. This is the way to do that.
 */
export const useHandTrackingState = () => {
  const { xr } = useThrelte().renderer

  return () => {
    for (const { hand } of xr.getSession()?.inputSources ?? []) {
      if (hand) {
        return true
      }
    }

    return false
  }
}
