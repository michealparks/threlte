import type { XRJointSpace } from 'three'
import { useTask, useThrelte } from '@threlte/core'
import type { HandJoints } from '../lib/handJoints'
import { useHand } from './useHand'

/**
 * Provides a reference to a requested hand joint, once available.
 */
export const useHandJoint = (handedness: 'left' | 'right', joint: HandJoints) => {
  const { invalidate } = useThrelte()

  let jointSpace = $state<XRJointSpace | undefined>(undefined)

  const xrhand = useHand(handedness)

  const { stop } = useTask(
    () => {
      const space = xrhand.current?.hand.joints[joint]
      // The joint radius is a good indicator that the joint is ready
      if (space?.jointRadius !== undefined) {
        jointSpace = space
        invalidate()
        stop()
      }
    },
    { autoInvalidate: false }
  )

  return jointSpace
}
