import type { XRJointSpace } from 'three'
import { useTask, useThrelte } from '@threlte/core'
import type { HandJoints } from '../lib/handJoints'
import { hands } from './useHand.svelte'
import { runeToCurrentReadable } from '../internal/runeToCurrentReadable.svelte'

/**
 * Provides a reference to a requested hand joint, once available.
 */
export const useHandJoint = (handedness: 'left' | 'right', joint: HandJoints) => {
  const { invalidate } = useThrelte()

  let jointSpaceStore = $state<XRJointSpace | undefined>()

  const xrhand = $derived(hands[handedness])

  const { stop } = useTask(
    () => {
      const jointSpace = xrhand?.hand.joints[joint]
      // The joint radius is a good indicator that the joint is ready
      if (jointSpace?.jointRadius !== undefined) {
        jointSpaceStore = jointSpace
        invalidate()
        stop()
      }
    },
    { autoInvalidate: false }
  )

  return runeToCurrentReadable(() => jointSpaceStore)
}
