export const defaults = {
  capsuleHalfHeight: 0.35,
  capsuleRadius: 0.3,
  floatHeight: 0.3,
  characterInitDir: 0, // in rad
  disableControl: false,
  disableFollowCam: false,
  disableFollowCamPos: null,
  disableFollowCamTarget: null
}

// Follow camera setups
export const camera = {
  initDis: -5,
  maxDis: -7,
  minDis: -0.7,
  upLimit: 1.5, // in rad
  lowLimit: -1.3, // in rad
  initDir: { x: 0, y: 0 }, // in rad
  targetPos: { x: 0, y: 0, z: 0 },
  moveSpeed: 1,
  zoomSpeed: 1,
  collision: true,
  collisionOffset: 0.7,
  collisionSpeedMult: 4,
  fixedRotMult: 1
}

// Base control setups
export const control = {
  maxVelLimit: 20.5,
  turnVelMultiplier: 0.2,
  turnSpeed: 15,
  sprintMult: 2,
  jumpVel: 4,
  jumpForceToGroundMult: 5,
  slopJumpMult: 0.25,
  sprintJumpMult: 1.2,
  airDragMultiplier: 0.2,
  dragDampingC: 0.15,
  accDeltaTime: 8,
  rejectVelMult: 4,
  moveImpulsePointY: 0.5,
  camFollowMult: 11,
  camLerpMult: 25,
  fallingGravityScale: 2.5,
  fallingMaxVel: -20,
  wakeUpDelay: 200
}

// Floating Ray setups
export const ray = {
  rayOriginOffest: { x: 0, y: -defaults.capsuleHalfHeight, z: 0 },
  rayHitForgiveness: 0.1,
  rayLength: defaults.capsuleRadius + 2,
  rayDir: { x: 0, y: -1, z: 0 },
  floatingDis: defaults.capsuleRadius + defaults.floatHeight,
  springK: 1.2,
  dampingC: 0.08
}

// Slope Ray setups
export const showSlopeRayOrigin = true
export const slopeMaxAngle = 1 // in rad
export const slopeRayOriginOffest = defaults.capsuleRadius - 0.03
export const slopeRayLength = defaults.capsuleRadius + 3
export const slopeRayDir = { x: 0, y: -1, z: 0 }
export const slopeUpExtraForce = 0.1
export const slopeDownExtraForce = 0.2

// AutoBalance Force setups
export const autoBalance = true
export const autoBalanceSpringK = 0.3
export const autoBalanceDampingC = 0.03
export const autoBalanceSpringOnY = 0.5
export const autoBalanceDampingOnY = 0.015

// Mode setups
export const mode = null

// Controller setups
// Point-to-move setups
export const bodySensorSize = [defaults.capsuleHalfHeight / 2, defaults.capsuleRadius]
export const bodySensorPosition = { x: 0, y: 0, z: defaults.capsuleRadius / 2 }
