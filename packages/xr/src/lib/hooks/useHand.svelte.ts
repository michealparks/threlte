import type { CurrentReadable } from '@threlte/core'
import type { XRHand } from '../types'
import { runeToCurrentReadable } from '../internal/runeToCurrentReadable.svelte'

class Hands {
  left = $state<XRHand>()
  right = $state<XRHand>()
}

export const hands = new Hands()

/**
 * Provides a reference to a current XRHand, filtered by handedness.
 */
export const useHand = (handedness: 'left' | 'right'): CurrentReadable<undefined | XRHand> => {
  switch (handedness) {
    case 'left':
      return runeToCurrentReadable(() => hands.left)
    case 'right':
      return runeToCurrentReadable(() => hands.right)
    default:
      throw new Error('useHand handedness must be left or right.')
  }
}
