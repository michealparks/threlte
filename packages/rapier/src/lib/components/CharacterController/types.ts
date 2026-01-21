import { RigidBody } from '@dimforge/rapier3d-compat'
import type { Snippet } from 'svelte'

export type CharacterControlsSchema = {
  maxVelLimit: number
  turnVelMultiplier: number
  turnSpeed: number
  sprintMult: number
  jumpVel: number
  jumpForceToGroundMult: number
  slopJumpMult: number
  sprintJumpMult: number
  airDragMultiplier: number
  dragDampingC: number
  accDeltaTime: number
  rejectVelMult: number
  moveImpulsePointY: number
  camFollowMult: number
}

export type FloatingRaySchema = {
  rayOriginOffest: { x: number; y: number; z: number }
  rayHitForgiveness: number
  rayLength: number
  rayDir: { x: number; y: number; z: number }
  floatingDis: number
  springK: number
  dampingC: number
}

export type SlopeRaySchema = {
  showSlopeRayOrigin: boolean
  slopeMaxAngle: number
  slopeRayOriginOffest: number
  slopeRayLength: number
  slopeRayDir: { x: number; y: number; z: number }
  slopeUpExtraForce: number
  slopeDownExtraForce: number
}

export type AutoBalanceForceSchema = {
  autoBalance: boolean
  autoBalanceSpringK: number
  autoBalanceDampingC: number
  autoBalanceSpringOnY: number
  autoBalanceDampingOnY: number
}

export type camListenerTargetType = 'document' | 'domElement'

export interface CustomEcctrlRigidBody {
  group: RigidBody | null
  rotateCamera: (x: number, y: number) => void
  rotateCharacterOnY: (rad: number) => void
}

export interface EcctrlProps extends RigidBody {
  children?: Snippet
  capsuleHalfHeight?: number
  capsuleRadius?: number
  floatHeight?: number
  characterInitDir?: number
  disableControl?: boolean
  disableFollowCam?: boolean
  disableFollowCamPos?: { x: number; y: number; z: number } | null
  disableFollowCamTarget?: { x: number; y: number; z: number } | null
  // Follow camera setups
  camInitDis?: number
  camMaxDis?: number
  camMinDis?: number
  camUpLimit?: number
  camLowLimit?: number
  camInitDir?: { x: number; y: number }
  camTargetPos?: { x: number; y: number; z: number }
  camMoveSpeed?: number
  camZoomSpeed?: number
  camCollision?: boolean
  camCollisionOffset?: number
  camCollisionSpeedMult?: number
  fixedCamRotMult?: number
  camListenerTarget?: camListenerTargetType

  // Base control setups
  maxVelLimit?: number
  turnVelMultiplier?: number
  turnSpeed?: number
  sprintMult?: number
  jumpVel?: number
  jumpForceToGroundMult?: number
  slopJumpMult?: number
  sprintJumpMult?: number
  airDragMultiplier?: number
  dragDampingC?: number
  accDeltaTime?: number
  rejectVelMult?: number
  moveImpulsePointY?: number
  camFollowMult?: number
  camLerpMult?: number
  fallingGravityScale?: number
  fallingMaxVel?: number
  wakeUpDelay?: number

  // Floating Ray setups
  rayOriginOffest?: { x: number; y: number; z: number }
  rayHitForgiveness?: number
  rayLength?: number
  rayDir?: { x: number; y: number; z: number }
  floatingDis?: number
  springK?: number
  dampingC?: number

  // Slope Ray setups
  showSlopeRayOrigin?: boolean
  slopeMaxAngle?: number
  slopeRayOriginOffest?: number
  slopeRayLength?: number
  slopeRayDir?: { x: number; y: number; z: number }
  slopeUpExtraForce?: number
  slopeDownExtraForce?: number

  // Head Ray setups
  showHeadRayOrigin?: boolean
  headRayOriginOffest?: number
  headRayLength?: number
  headRayDir?: { x: number; y: number; z: number }
  // AutoBalance Force setups
  autoBalance?: boolean
  autoBalanceSpringK?: number
  autoBalanceDampingC?: number
  autoBalanceSpringOnY?: number
  autoBalanceDampingOnY?: number

  // Mode setups
  mode?: string | null
  // Point-to-move setups
  bodySensorSize?: Array<number>
  bodySensorPosition?: { x: number; y: number; z: number }

  onidle?: () => void
  onwalk?: () => void
  onrun?: () => void
  onjump?: () => void
  onjumpIdle?: () => void
  onfall?: () => void

  input: {
    forward: boolean
    backward: boolean
    left: boolean
    right: boolean
    jump: boolean
    run: boolean
  }
}

export interface userDataType {
  canJump?: boolean
  slopeAngle?: number | null
  characterRotated?: boolean
  isOnMovingObject?: boolean
  excludeEcctrlRay?: boolean
}
