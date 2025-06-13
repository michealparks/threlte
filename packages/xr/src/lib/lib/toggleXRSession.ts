import { xrState } from '../internal/state.svelte'
import { getXRSessionOptions } from './getXRSessionOptions'

/**
 * Starts / ends an XR session.
 *
 * @param sessionMode an XR session mode: 'inline' | 'immersive-vr' | 'immersive-ar'
 * @param sessionInit an XRSessionInit object
 * @param force Whether this button should only enter / exit an `XRSession`. Default is to toggle both ways
 * @returns
 */
export const toggleXRSession = async (
  sessionMode: XRSessionMode,
  sessionInit?: (XRSessionInit & { domOverlay?: { root: HTMLElement } | undefined }) | undefined,
  force?: 'enter' | 'exit'
): Promise<XRSession | undefined> => {
  const currentSession = xrState.session
  const hasSession = currentSession !== undefined

  if (force === 'enter' && hasSession) return currentSession
  if (force === 'exit' && !hasSession) return

  // Exit a session if entered
  if (hasSession) {
    await currentSession.end()
    xrState.session = undefined
    return
  }

  if (xrState.xr === undefined) {
    throw new Error('An <XR> component was not created when attempting to toggle a session.')
  }

  // Otherwise enter a session
  const options = getXRSessionOptions(xrState.referenceSpaceType, sessionInit)
  const nextSession = await navigator.xr!.requestSession(sessionMode, options)

  await xrState.xr.setSession(nextSession)

  xrState.session = nextSession
  return nextSession
}
