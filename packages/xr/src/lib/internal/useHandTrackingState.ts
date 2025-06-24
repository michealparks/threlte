import { useThrelte } from '@threlte/core'

/**
 * There are some cases where we need to know if hand tracking is now active before an input source
 * connection or disconnection event. This is the way to do that.
 */
export const useHandTrackingState = () => {
  const { xr } = useThrelte().renderer

  return () => {
    const sources = xr.getSession()?.inputSources

    if (sources === undefined) {
      return false
    }

    for (const value of sources) {
      if (value.hand) {
        return true
      }
    }

    return false
  }
}
