import type { CurrentReadable } from '@threlte/core'
import type { XRController } from '../types'
import { runeToCurrentReadable } from '../internal/runeToCurrentReadable.svelte'

class Controllers {
  left = $state.raw<XRController>()
  right = $state.raw<XRController>()
  none = $state.raw<XRController>()
}

export const controllers = new Controllers()

/**
 * Provides a reference to a current XRController, filtered by handedness.
 */
export const useController = (
  handedness: XRHandedness
): CurrentReadable<XRController | undefined> => {
  switch (handedness) {
    case 'left':
      return runeToCurrentReadable(() => controllers.left)
    case 'right':
      return runeToCurrentReadable(() => controllers.right)
    case 'none':
      return runeToCurrentReadable(() => controllers.none)
    default:
      throw new Error('useController handedness must be left, right, or none.')
  }
}
