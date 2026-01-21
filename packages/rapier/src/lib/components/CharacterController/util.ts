import type { Object3D } from 'three'

// Retrieve current moving direction of the character
export const getMovingDirection = (
  forward: boolean,
  backward: boolean,
  leftward: boolean,
  rightward: boolean,
  pivot: Object3D
): number | null => {
  const x = (rightward ? 1 : 0) - (leftward ? 1 : 0)
  const z = (backward ? 1 : 0) - (forward ? 1 : 0)

  if (x === 0 && z === 0) return null

  // atan2 gives the angle in local space
  const localAngle = Math.atan2(x, z)

  // rotate by the character's yaw
  return pivot.rotation.y + localAngle
}
