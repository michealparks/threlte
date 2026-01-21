<script lang="ts">
  import { Group, Object3D, Vector3, Euler, Quaternion, Mesh, MathUtils } from 'three'
  import { T, useThrelte } from '@threlte/core'
  import { RigidBody } from '@dimforge/rapier3d-compat'
  import RigidBodyComponent from '../RigidBody/RigidBody.svelte'
  import ColliderComponent from '../Colliders/Collider/Collider.svelte'
  import { useFollowCamera } from './useFollowCamera.svelte.js'
  import { QueryFilterFlags } from '@dimforge/rapier3d-compat'
  import type { Collider, RayColliderHit, Vector } from '@dimforge/rapier3d-compat'
  import { useTask } from '@threlte/core'
  import { getMovingDirection } from './util.js'
  import type { EcctrlProps } from './types.js'
  import { useRapier } from '../../hooks/useRapier.js'

  let {
    capsuleHalfHeight = 0.35,
    capsuleRadius = 0.3,
    floatHeight = 0.3,
    characterInitDir = 0, // in rad
    disableControl = false,
    disableFollowCam = false,
    disableFollowCamPos = null,
    disableFollowCamTarget = null,

    // Follow camera setups
    camInitDis = -5,
    camMaxDis = -7,
    camMinDis = -0.7,
    camUpLimit = 2, // in rad
    camLowLimit = -2, // in rad
    camInitDir = { x: 0, y: 0 }, // in rad
    camTargetPos = { x: 0, y: 0, z: 0 },
    camMoveSpeed = 1,
    camZoomSpeed = 1,
    camCollision = true,
    camCollisionOffset = 0.7,
    camCollisionSpeedMult = 4,
    fixedCamRotMult = 1,

    // Base control setups
    maxVelLimit = 2.5,
    turnVelMultiplier = 0.2,
    turnSpeed = 15,
    sprintMult = 2,
    jumpVel = 4,
    jumpForceToGroundMult = 5,
    slopJumpMult = 0.25,
    sprintJumpMult = 1.2,
    airDragMultiplier = 0.2,
    dragDampingC = 0.15,
    accDeltaTime = 8,
    rejectVelMult = 4,
    moveImpulsePointY = 0.5,
    camFollowMult = 11,
    camLerpMult = 25,
    fallingGravityScale = 2.5,
    fallingMaxVel = -20,
    wakeUpDelay = 200,

    // Floating Ray setups
    rayOriginOffest = { x: 0, y: -capsuleHalfHeight, z: 0 },
    rayHitForgiveness = 0.1,
    rayLength = capsuleRadius + 2,
    rayDir = { x: 0, y: -1, z: 0 },
    floatingDis = capsuleRadius + floatHeight,
    springK = 1.2,
    dampingC = 0.08,

    // Slope Ray setups
    showSlopeRayOrigin = true,
    slopeMaxAngle = 1, // in rad
    slopeRayOriginOffest = capsuleRadius - 0.03,
    slopeRayLength = capsuleRadius + 3,
    slopeRayDir = { x: 0, y: -1, z: 0 },
    slopeUpExtraForce = 0.1,
    slopeDownExtraForce = 0.2,

    // AutoBalance Force setups
    autoBalance = true,
    autoBalanceSpringK = 0.3,
    autoBalanceDampingC = 0.03,
    autoBalanceSpringOnY = 0.5,
    autoBalanceDampingOnY = 0.015,

    // Mode setups
    mode = null,

    // Controller setups
    // Point-to-move setups
    bodySensorSize = [capsuleHalfHeight / 2, capsuleRadius],
    bodySensorPosition = { x: 0, y: 0, z: capsuleRadius / 2 },

    input,

    children,

    // Other rigibody props from parent
    ...props
  }: EcctrlProps = $props()

  const { camera } = useThrelte()

  let characterRef = $state.raw<RigidBody>()
  const characterModelRef = new Group()
  const characterModelIndicator = new Object3D()

  /**
   * Mode setup
   */
  let isModePointToMove = $state(false)
  let functionKeyDown: boolean = false
  let isModeFixedCamera: boolean = false
  let isModeCameraBased: boolean = false

  let moveToPoint = $state.raw<Vector3>()

  const findMode = (mode: string, modes: string) => {
    return modes.split(' ').some((m) => m === mode)
  }

  if (mode) {
    if (findMode('PointToMove', mode)) isModePointToMove = true
    if (findMode('FixedCamera', mode)) isModeFixedCamera = true
    if (findMode('CameraBasedMovement', mode)) isModeCameraBased = true
  }

  /**
   * Body collider setup
   */
  const modelFacingVec = new Vector3()
  const bodyFacingVec = new Vector3()
  const bodyBalanceVec = new Vector3()
  const bodyBalanceVecOnX = new Vector3()
  const bodyFacingVecOnY = new Vector3()
  const bodyBalanceVecOnZ = new Vector3()
  const vectorY = new Vector3(0, 1, 0)
  const vectorZ = new Vector3(0, 0, 1)
  const crossVecOnX = new Vector3()
  const crossVecOnY = new Vector3()
  const crossVecOnZ = new Vector3()
  const bodyContactForce = new Vector3()
  const slopeRayOriginUpdatePosition = new Vector3()
  const camBasedMoveCrossVecOnY = new Vector3()

  const { rapier, world } = useRapier()

  // can jump setup
  let canJump: boolean = false
  let isFalling: boolean = false
  const initialGravityScale = props.gravityScale ?? 1

  // on moving object state
  let massRatio: number = 1
  let isOnMovingObject: boolean = false
  const standingForcePoint = new Vector3()
  const movingObjectDragForce = new Vector3()
  const movingObjectVelocity = new Vector3()
  const movingObjectVelocityInCharacterDir = new Vector3()
  const distanceFromCharacterToObject = new Vector3()
  const objectAngvelToLinvel = new Vector3()
  const velocityDiff = new Vector3()

  /**
   * Follow camera initial setups from props
   */
  const cameraSetups = $derived({
    disableFollowCam,
    disableFollowCamPos,
    disableFollowCamTarget,
    camInitDis,
    camMaxDis,
    camMinDis,
    camUpLimit,
    camLowLimit,
    camInitDir,
    camMoveSpeed: isModeFixedCamera ? 0 : camMoveSpeed, // Disable camera move in fixed camera mode
    camZoomSpeed: isModeFixedCamera ? 0 : camZoomSpeed, // Disable camera zoom in fixed camera mode
    camCollisionOffset,
    camCollisionSpeedMult
  })

  /**
   * Load camera pivot and character move preset
   */
  const { pivot, followCam, cameraCollisionDetect } = useFollowCamera(() => cameraSetups)
  const pivotPosition = new Vector3()
  const pivotXAxis = new Vector3(1, 0, 0)
  const pivotYAxis = new Vector3(0, 1, 0)
  const pivotZAxis = new Vector3(0, 0, 1)
  const followCamPosition = new Vector3()
  const modelEuler = new Euler()
  const modelQuat = new Quaternion()
  const moveImpulse = new Vector3()
  const movingDirection = new Vector3()
  const moveAccNeeded = new Vector3()
  const jumpVelocityVec = new Vector3()
  const jumpDirection = new Vector3()
  const currentVel = new Vector3()
  const currentPos = new Vector3()
  const dragForce = new Vector3()
  const dragAngForce = new Vector3()
  const wantToMoveVel = new Vector3()
  const rejectVel = new Vector3()

  /**
   * Floating Ray setup
   */
  let floatingForce = null
  const springDirVec = new Vector3()
  const characterMassForce = new Vector3()
  const rayOrigin = new Vector3()
  const rayCast = new rapier.Ray(rayOrigin, rayDir)
  let rayHit: RayColliderHit | null = null

  /**Test shape ray */
  // const shape = new rapier.Capsule(0.2,0.1)

  /**
   * Slope detection ray setup
   */
  let slopeAngle: number = 0
  let actualSlopeNormal: Vector | null = null
  let actualSlopeAngle: number = 0
  const actualSlopeNormalVec = new Vector3()
  const floorNormal = new Vector3(0, 1, 0)
  const slopeRayOriginRef = new Mesh()
  const slopeRayorigin = new Vector3()
  const slopeRayCast = new rapier.Ray(slopeRayorigin, slopeRayDir)
  let slopeRayHit: RayColliderHit | null = null

  /**
   * Point to move setup
   */
  let isBodyHitWall = false
  let isPointMoving = false
  const crossVector = new Vector3()
  const pointToPoint = new Vector3()
  let bodySensorRef = $state<Collider>()

  const handleOnIntersectionEnter = () => {
    isBodyHitWall = true
  }
  const handleOnIntersectionExit = () => {
    isBodyHitWall = false
  }

  /**
   * Character moving function
   */
  let characterRotated: boolean = true
  const moveCharacter = (
    _: number,
    run: boolean,
    slopeAngle: number,
    movingObjectVelocity: Vector3
  ) => {
    if (!characterRef) return

    /**
     * Setup moving direction
     */
    // Only apply slope angle to moving direction
    // when slope angle is between 0.2rad and slopeMaxAngle,
    // and actualSlopeAngle < slopeMaxAngle
    if (
      actualSlopeAngle < slopeMaxAngle &&
      Math.abs(slopeAngle) > 0.2 &&
      Math.abs(slopeAngle) < slopeMaxAngle
    ) {
      movingDirection.set(0, Math.sin(slopeAngle), Math.cos(slopeAngle))
    }
    // If on a slopeMaxAngle slope, only apply small a mount of forward direction
    else if (actualSlopeAngle >= slopeMaxAngle) {
      movingDirection.set(
        0,
        Math.sin(slopeAngle) > 0 ? 0 : Math.sin(slopeAngle),
        Math.sin(slopeAngle) > 0 ? 0.1 : 1
      )
    } else {
      movingDirection.set(0, 0, 1)
    }

    // Apply character quaternion to moving direction
    movingDirection.applyQuaternion(characterModelIndicator.quaternion)

    /**
     * Moving object conditions
     */
    // Calculate moving object velocity direction according to character moving direction
    movingObjectVelocityInCharacterDir
      .copy(movingObjectVelocity)
      .projectOnVector(movingDirection)
      .multiply(movingDirection)
    // Calculate angle between moving object velocity direction and character moving direction
    const angleBetweenCharacterDirAndObjectDir = movingObjectVelocity.angleTo(movingDirection)

    /**
     * Setup rejection velocity, (currently only work on ground)
     */
    const wantToMoveMeg = currentVel.dot(movingDirection)
    wantToMoveVel.set(movingDirection.x * wantToMoveMeg, 0, movingDirection.z * wantToMoveMeg)
    rejectVel.copy(currentVel).sub(wantToMoveVel)

    /**
     * Calculate required accelaration and force: a = Δv/Δt
     * If it's on a moving/rotating platform, apply platform velocity to Δv accordingly
     * Also, apply reject velocity when character is moving opposite of it's moving direction
     */
    moveAccNeeded.set(
      (movingDirection.x *
        (maxVelLimit * (run ? sprintMult : 1) + movingObjectVelocityInCharacterDir.x) -
        (currentVel.x -
          movingObjectVelocity.x * Math.sin(angleBetweenCharacterDirAndObjectDir) +
          rejectVel.x * (isOnMovingObject ? 0 : rejectVelMult))) /
        accDeltaTime,
      0,
      (movingDirection.z *
        (maxVelLimit * (run ? sprintMult : 1) + movingObjectVelocityInCharacterDir.z) -
        (currentVel.z -
          movingObjectVelocity.z * Math.sin(angleBetweenCharacterDirAndObjectDir) +
          rejectVel.z * (isOnMovingObject ? 0 : rejectVelMult))) /
        accDeltaTime
    )

    // Wanted to move force function: F = ma
    const moveForceNeeded = moveAccNeeded.multiplyScalar(characterRef.mass())

    /**
     * Check if character complete turned to the wanted direction
     */
    characterRotated =
      Math.sin(characterModelIndicator.rotation.y).toFixed(3) == Math.sin(modelEuler.y).toFixed(3)

    // If character hasn't complete turning, change the impulse quaternion follow characterModelIndicator quaternion
    if (!characterRotated) {
      moveImpulse.set(
        moveForceNeeded.x * turnVelMultiplier * (canJump ? 1 : airDragMultiplier), // if it's in the air, give it less control
        slopeAngle === null || slopeAngle == 0 // if it's on a slope, apply extra up/down force to the body
          ? 0
          : movingDirection.y *
              turnVelMultiplier *
              (movingDirection.y > 0 // check it is on slope up or slope down
                ? slopeUpExtraForce
                : slopeDownExtraForce) *
              (run ? sprintMult : 1),
        moveForceNeeded.z * turnVelMultiplier * (canJump ? 1 : airDragMultiplier) // if it's in the air, give it less control
      )
    }
    // If character complete turning, change the impulse quaternion default
    else {
      moveImpulse.set(
        moveForceNeeded.x * (canJump ? 1 : airDragMultiplier),
        slopeAngle === null || slopeAngle == 0 // if it's on a slope, apply extra up/down force to the body
          ? 0
          : movingDirection.y *
              (movingDirection.y > 0 // check it is on slope up or slope down
                ? slopeUpExtraForce
                : slopeDownExtraForce) *
              (run ? sprintMult : 1),
        moveForceNeeded.z * (canJump ? 1 : airDragMultiplier)
      )
    }

    // Move character at proper direction and impulse
    characterRef.applyImpulseAtPoint(
      moveImpulse,
      {
        x: currentPos.x,
        y: currentPos.y + moveImpulsePointY,
        z: currentPos.z
      },
      true
    )
  }

  /**
   * Character auto balance function
   */
  const autoBalanceCharacter = () => {
    if (!characterRef) return

    // Match body component to character model rotation on Y
    bodyFacingVec.set(0, 0, 1).applyQuaternion(characterRef.rotation())
    bodyBalanceVec.set(0, 1, 0).applyQuaternion(characterRef.rotation())

    bodyBalanceVecOnX.set(0, bodyBalanceVec.y, bodyBalanceVec.z)
    bodyFacingVecOnY.set(bodyFacingVec.x, 0, bodyFacingVec.z)
    bodyBalanceVecOnZ.set(bodyBalanceVec.x, bodyBalanceVec.y, 0)

    // Check if is camera based movement
    if (isModeCameraBased && slopeRayOriginRef) {
      modelEuler.y = pivot.rotation.y
      pivot.getWorldDirection(modelFacingVec)
      // Update slopeRayOrigin to new positon
      slopeRayOriginUpdatePosition.set(movingDirection.x, 0, movingDirection.z)
      camBasedMoveCrossVecOnY.copy(slopeRayOriginUpdatePosition).cross(modelFacingVec)
      slopeRayOriginRef.position.x =
        slopeRayOriginOffest *
        Math.sin(
          slopeRayOriginUpdatePosition.angleTo(modelFacingVec) *
            (camBasedMoveCrossVecOnY.y < 0 ? 1 : -1)
        )
      slopeRayOriginRef.position.z =
        slopeRayOriginOffest *
        Math.cos(
          slopeRayOriginUpdatePosition.angleTo(modelFacingVec) *
            (camBasedMoveCrossVecOnY.y < 0 ? 1 : -1)
        )
    } else {
      characterModelIndicator.getWorldDirection(modelFacingVec)
    }
    crossVecOnX.copy(vectorY).cross(bodyBalanceVecOnX)
    crossVecOnY.copy(modelFacingVec).cross(bodyFacingVecOnY)
    crossVecOnZ.copy(vectorY).cross(bodyBalanceVecOnZ)

    dragAngForce.set(
      (crossVecOnX.x < 0 ? 1 : -1) * autoBalanceSpringK * bodyBalanceVecOnX.angleTo(vectorY) -
        characterRef.angvel().x * autoBalanceDampingC,
      (crossVecOnY.y < 0 ? 1 : -1) *
        autoBalanceSpringOnY *
        modelFacingVec.angleTo(bodyFacingVecOnY) -
        characterRef.angvel().y * autoBalanceDampingOnY,
      (crossVecOnZ.z < 0 ? 1 : -1) * autoBalanceSpringK * bodyBalanceVecOnZ.angleTo(vectorY) -
        characterRef.angvel().z * autoBalanceDampingC
    )

    // Apply balance torque impulse
    characterRef.applyTorqueImpulse(dragAngForce, true)
  }

  /**
   * Character sleep function
   */
  const sleepCharacter = () => {
    if (!characterRef) {
      return
    }

    if (document.visibilityState === 'hidden') {
      characterRef.sleep()
    } else {
      setTimeout(() => {
        characterRef?.wakeUp()
      }, wakeUpDelay)
    }
  }

  /**
   * Point-to-move function
   */
  const pointToMove = (
    delta: number,
    slopeAngle: number,
    movingObjectVelocity: Vector3,
    functionKeyDown: boolean
  ) => {
    if (moveToPoint) {
      pointToPoint.set(moveToPoint.x - currentPos.x, 0, moveToPoint.z - currentPos.z)
      crossVector.crossVectors(pointToPoint, vectorZ)

      // Rotate character to moving direction
      modelEuler.y = (crossVector.y > 0 ? -1 : 1) * pointToPoint.angleTo(vectorZ)
      // If mode is also set to fixed camera. keep the camera on the back of character
      if (isModeFixedCamera)
        pivot.rotation.y = MathUtils.lerp(
          pivot.rotation.y,
          modelEuler.y,
          fixedCamRotMult * delta * 3
        )

      // Once character close to the target point (distance<0.3),
      // Or character close to the wall (bodySensor intersects)
      // stop moving
      if (characterRef) {
        if (pointToPoint.length() > 0.3 && !isBodyHitWall && !functionKeyDown) {
          moveCharacter(delta, false, slopeAngle, movingObjectVelocity)
          isPointMoving = true
        } else {
          moveToPoint = undefined
          isPointMoving = false
        }
      }
    }
  }

  /**
   * Rotate camera function
   */
  export const rotateCamera = (x: number, y: number) => {
    pivot.rotation.y += y
    followCam.rotation.x = Math.min(Math.max(followCam.rotation.x + x, camLowLimit), camUpLimit)
  }

  /**
   * Rotate character on Y function
   */
  export const rotateCharacterOnY = (rad: number) => {
    modelEuler.y += rad
  }

  $effect(() => {
    // Lock character rotations at Y axis
    characterRef?.setEnabledRotations(
      autoBalance ? true : false,
      autoBalance ? true : false,
      autoBalance ? true : false,
      false
    )

    // Reset character quaternion
    return () => {
      characterModelRef.quaternion.set(0, 0, 0, 1)
      characterRef?.setRotation({ x: 0, y: 0, z: 0, w: 1 }, false)
    }
  })

  $effect(() => {
    // Initialize character facing direction
    modelEuler.y = characterInitDir

    window.addEventListener('visibilitychange', sleepCharacter)
    return () => {
      window.removeEventListener('visibilitychange', sleepCharacter)
    }
  })

  useTask((delta) => {
    if (delta > 1) delta %= 1

    // Character current position/velocity
    if (!characterRef) return

    currentPos.copy(characterRef.translation())
    currentVel.copy(characterRef.linvel())
    // Assign userDate properties
    ;(characterRef.userData as Record<string, unknown>).canJump = canJump
    ;(characterRef.userData as Record<string, unknown>).slopeAngle = slopeAngle
    ;(characterRef.userData as Record<string, unknown>).characterRotated = characterRotated
    ;(characterRef.userData as Record<string, unknown>).isOnMovingObject = isOnMovingObject

    /**
     * Camera movement
     */
    pivotXAxis.set(1, 0, 0).applyQuaternion(pivot.quaternion)
    pivotZAxis.set(0, 0, 1).applyQuaternion(pivot.quaternion)
    pivotPosition
      .copy(currentPos)
      .addScaledVector(pivotXAxis, camTargetPos.x)
      .addScaledVector(pivotYAxis, camTargetPos.y + (capsuleHalfHeight + capsuleRadius / 2))
      .addScaledVector(pivotZAxis, camTargetPos.z)
    pivot.position.lerp(pivotPosition, 1 - Math.exp(-camFollowMult * delta))

    if (!disableFollowCam) {
      followCam.getWorldPosition(followCamPosition)
      camera.current.position.lerp(followCamPosition, 1 - Math.exp(-camLerpMult * delta))
      camera.current.lookAt(pivot.position)
    }

    /**
     * Camera collision detect
     */
    if (camCollision) {
      cameraCollisionDetect(delta)
    }

    /**
     * If disableControl is true, skip all following features
     */
    if (disableControl) return

    // Getting moving directions (IIFE)
    modelEuler.y = ((movingDirection) =>
      movingDirection === null ? modelEuler.y : movingDirection)(
      getMovingDirection(input.forward, input.backward, input.left, input.right, pivot)
    )

    // Getting moving directions (IIFE)
    modelEuler.y = ((movingDirection) =>
      movingDirection === null ? modelEuler.y : movingDirection)(
      getMovingDirection(input.forward, input.backward, input.left, input.right, pivot)
    )

    // Move character to the moving direction
    if (input.forward || input.backward || input.left || input.right) {
      moveCharacter(delta, input.run, slopeAngle, movingObjectVelocity)
    }

    // Jump impulse
    if (input.jump && canJump) {
      // characterRef.current.applyImpulse(jumpDirection.set(0, 0.5, 0), true);
      jumpVelocityVec.set(
        currentVel.x,
        input.run ? sprintJumpMult * jumpVel : jumpVel,
        currentVel.z
      )
      // Apply slope normal to jump direction
      characterRef.setLinvel(
        jumpDirection
          .set(0, (input.run ? sprintJumpMult * jumpVel : jumpVel) * slopJumpMult, 0)
          .projectOnVector(actualSlopeNormalVec)
          .add(jumpVelocityVec),
        true
      )
      // Apply jump force downward to the standing platform
      characterMassForce.y *= jumpForceToGroundMult
      rayHit?.collider.parent()?.applyImpulseAtPoint(characterMassForce, standingForcePoint, true)
    }

    // Rotate character Indicator
    modelQuat.setFromEuler(modelEuler)
    characterModelIndicator.quaternion.rotateTowards(modelQuat, delta * turnSpeed)

    // If autobalance is off, rotate character model itself
    if (!autoBalance && characterModelRef) {
      if (isModeCameraBased) {
        characterModelRef.quaternion.copy(pivot.quaternion)
      } else {
        characterModelRef.quaternion.copy(characterModelIndicator.quaternion)
      }
    }

    /**
     * Ray casting detect if on ground
     */
    rayOrigin.addVectors(currentPos, rayOriginOffest as Vector3)
    rayHit = world.castRay(
      rayCast,
      rayLength,
      false,
      QueryFilterFlags.EXCLUDE_SENSORS,
      undefined,
      undefined,
      characterRef,
      // this exclude any collider with userData: excludeEcctrlRay
      (collider: Collider) => {
        const parent = collider.parent()
        if (!parent) return false
        const data = parent.userData as Record<string, unknown> | undefined
        return !data?.excludeEcctrlRay
      }
    )

    if (rayHit && rayHit.timeOfImpact < floatingDis + rayHitForgiveness) {
      if (slopeRayHit && actualSlopeAngle < slopeMaxAngle) {
        canJump = true
      }
    } else {
      canJump = false
    }

    /**
     * Ray detect if on rigid body or dynamic platform, then apply the linear velocity and angular velocity to character
     */
    if (rayHit && canJump) {
      if (rayHit.collider.parent()) {
        // Getting the standing force apply point
        standingForcePoint.set(rayOrigin.x, rayOrigin.y - rayHit.timeOfImpact, rayOrigin.z)
        const rayHitObjectBodyType = rayHit.collider.parent()?.bodyType()
        const rayHitObjectBodyMass = rayHit.collider.parent()?.mass()

        if (rayHitObjectBodyMass) {
          massRatio = characterRef.mass() / rayHitObjectBodyMass
        }

        // Body type 0 is rigid body, body type 1 is fixed body, body type 2 is kinematic body
        if (rayHitObjectBodyType === 0 || rayHitObjectBodyType === 2) {
          isOnMovingObject = true
          // Calculate distance between character and moving object
          distanceFromCharacterToObject
            .copy(currentPos)
            .sub(rayHit.collider.parent()?.translation() as Vector3)
          // Moving object linear velocity
          const movingObjectLinvel = rayHit.collider.parent()?.linvel() as Vector3
          // Moving object angular velocity
          const movingObjectAngvel = rayHit.collider.parent()?.angvel() as Vector3
          // Combine object linear velocity and angular velocity to movingObjectVelocity
          movingObjectVelocity
            .set(
              movingObjectLinvel.x +
                objectAngvelToLinvel.crossVectors(movingObjectAngvel, distanceFromCharacterToObject)
                  .x,
              movingObjectLinvel.y,
              movingObjectLinvel.z +
                objectAngvelToLinvel.crossVectors(movingObjectAngvel, distanceFromCharacterToObject)
                  .z
            )
            .multiplyScalar(Math.min(1, 1 / massRatio))

          // If the velocity diff is too high (> 30), ignore movingObjectVelocity
          velocityDiff.subVectors(movingObjectVelocity, currentVel)
          if (velocityDiff.length() > 30) {
            movingObjectVelocity.multiplyScalar(1 / velocityDiff.length())
          }

          // Apply opposite drage force to the stading rigid body, body type 0
          // Character moving and unmoving should provide different drag force to the platform
          if (rayHitObjectBodyType === 0) {
            if (
              !input.forward &&
              !input.backward &&
              !input.left &&
              !input.right &&
              canJump &&
              !isPointMoving
            ) {
              movingObjectDragForce
                .copy(bodyContactForce)
                .multiplyScalar(delta)
                .multiplyScalar(Math.min(1, 1 / massRatio)) // Scale up/down base on different masses ratio
                .negate()
              bodyContactForce.set(0, 0, 0)
            } else {
              movingObjectDragForce
                .copy(moveImpulse)
                .multiplyScalar(Math.min(1, 1 / massRatio)) // Scale up/down base on different masses ratio
                .negate()
            }
            rayHit.collider
              .parent()
              ?.applyImpulseAtPoint(movingObjectDragForce, standingForcePoint, true)
          }
        } else {
          // on fixed body
          massRatio = 1
          isOnMovingObject = false
          bodyContactForce.set(0, 0, 0)
          movingObjectVelocity.set(0, 0, 0)
        }
      }
    } else {
      // in the air
      massRatio = 1
      isOnMovingObject = false
      bodyContactForce.set(0, 0, 0)
      movingObjectVelocity.set(0, 0, 0)
    }

    /**
     * Slope ray casting detect if on slope
     */
    slopeRayOriginRef?.getWorldPosition(slopeRayorigin)
    slopeRayorigin.y = rayOrigin.y
    slopeRayHit = world.castRay(
      slopeRayCast,
      slopeRayLength,
      false,
      QueryFilterFlags.EXCLUDE_SENSORS,
      undefined,
      undefined,
      characterRef,
      // this exclude any collider with userData: excludeEcctrlRay
      (collider: Collider) => {
        const parent = collider.parent()

        if (!parent) return false

        const data = parent.userData as Record<string, unknown> | undefined
        return !data?.excludeEcctrlRay
      }
    )

    // Calculate slope angle
    if (slopeRayHit) {
      actualSlopeNormal =
        slopeRayHit.collider.castRayAndGetNormal(slopeRayCast, slopeRayLength, false)?.normal ??
        null
      if (actualSlopeNormal) {
        actualSlopeNormalVec?.set(actualSlopeNormal.x, actualSlopeNormal.y, actualSlopeNormal.z)
        actualSlopeAngle = actualSlopeNormalVec?.angleTo(floorNormal)
      }
    }
    if (slopeRayHit && rayHit && slopeRayHit.timeOfImpact < floatingDis + 0.5) {
      if (canJump) {
        // Round the slope angle to 2 decimal places
        slopeAngle = Number(
          Math.atan(
            (rayHit.timeOfImpact - slopeRayHit.timeOfImpact) / slopeRayOriginOffest
          ).toFixed(2)
        )
      } else {
        slopeAngle = 0
      }
    } else {
      slopeAngle = 0
    }

    /**
     * Apply floating force
     */
    if (rayHit != null) {
      if (canJump && rayHit.collider.parent()) {
        floatingForce =
          springK * (floatingDis - rayHit.timeOfImpact) - characterRef.linvel().y * dampingC
        characterRef.applyImpulse(springDirVec.set(0, floatingForce, 0), false)

        // Apply opposite force to standing object (gravity g in rapier is 0.11 ?_?)
        characterMassForce.set(0, floatingForce > 0 ? -floatingForce : 0, 0)
        rayHit.collider.parent()?.applyImpulseAtPoint(characterMassForce, standingForcePoint, true)
      }
    }

    /**
     * Apply drag force if it's not moving
     */
    if (
      !input.forward &&
      !input.backward &&
      !input.left &&
      !input.right &&
      canJump &&
      !isPointMoving
    ) {
      // not on a moving object
      if (!isOnMovingObject) {
        dragForce.set(-currentVel.x * dragDampingC, 0, -currentVel.z * dragDampingC)
        characterRef.applyImpulse(dragForce, false)
      }
      // on a moving object
      else {
        dragForce.set(
          (movingObjectVelocity.x - currentVel.x) * dragDampingC,
          0,
          (movingObjectVelocity.z - currentVel.z) * dragDampingC
        )
        characterRef.applyImpulse(dragForce, true)
      }
    }

    /**
     * Detect character falling state
     */
    isFalling = currentVel.y < 0 && !canJump ? true : false

    /**
     * Setup max falling speed && extra falling gravity
     * Remove gravity if falling speed higher than fallingMaxVel (negetive number so use "<")
     */
    if (characterRef) {
      if (currentVel.y < fallingMaxVel) {
        if (characterRef.gravityScale() !== 0) {
          characterRef.setGravityScale(0, true)
        }
      } else {
        if (!isFalling && characterRef.gravityScale() !== initialGravityScale) {
          // Apply initial gravity after landed
          characterRef.setGravityScale(initialGravityScale, true)
        } else if (isFalling && characterRef.gravityScale() !== fallingGravityScale) {
          // Apply larger gravity when falling (if initialGravityScale === fallingGravityScale, won't trigger this)
          characterRef.setGravityScale(fallingGravityScale, true)
        }
      }
    }

    /**
     * Apply auto balance force to the character
     */
    if (autoBalance && characterRef) autoBalanceCharacter()

    /**
     * Point to move feature
     */
    if (isModePointToMove) {
      functionKeyDown = input.forward || input.backward || input.left || input.right || input.jump
      pointToMove(delta, slopeAngle, movingObjectVelocity, functionKeyDown)
    }

    /**
     * Fixed camera feature
     */
    if (isModeFixedCamera) {
      if (input.left) {
        pivot.rotation.y += input.run
          ? delta * sprintMult * fixedCamRotMult
          : delta * fixedCamRotMult
      } else if (input.right) {
        pivot.rotation.y -= input.run
          ? delta * sprintMult * fixedCamRotMult
          : delta * fixedCamRotMult
      }
    }

    /**
     * Apply all the animations
     */

    if (
      !input.forward &&
      !input.backward &&
      !input.left &&
      !input.right &&
      !input.jump &&
      !isPointMoving &&
      canJump
    ) {
      props.onidle?.()
    } else if (input.jump && canJump) {
      props.onjump?.()
    } else if (
      canJump &&
      (input.forward || input.backward || input.left || input.right || isPointMoving)
    ) {
      if (input.run) {
        props.onrun?.()
      } else {
        props.onwalk?.()
      }
    } else if (!canJump) {
      props.onjumpIdle?.()
    }
    // On high sky, play falling animation
    if (rayHit == null && isFalling) {
      props.onfall?.()
    }
  })
</script>

<RigidBodyComponent
  type="dynamic"
  colliders={false}
  bind:rigidBody={characterRef}
  friction={props.friction || -0.5}
  oncontact={(e) => bodyContactForce.set(e.totalForce.x, e.totalForce.y, e.totalForce.z)}
  oncollisionexit={() => bodyContactForce.set(0, 0, 0)}
  userData={{ canJump: false }}
  {...props}
  oncreate={(ref) => {
    ref.setTranslation(props.position || { x: 0, y: 5, z: 0 }, true)
  }}
>
  <ColliderComponent
    shape="capsule"
    args={[capsuleHalfHeight, capsuleRadius]}
  />

  <!-- Body collide sensor (only for point to move mode) -->
  {#if isModePointToMove}
    <ColliderComponent
      bind:collider={bodySensorRef}
      shape="cylinder"
      sensor
      mass={0}
      args={[bodySensorSize[0], bodySensorSize[1]]}
      onsensorenter={handleOnIntersectionEnter}
      onsensorexit={handleOnIntersectionExit}
      oncreate={(ref) => {
        ref.setTranslation(bodySensorPosition)
      }}
    />
  {/if}

  <T
    is={characterModelRef}
    userData={{ camExcludeCollision: true }}
  >
    <!-- This mesh is used for positioning the slope ray origin -->
    <T
      is={slopeRayOriginRef}
      position={[rayOriginOffest.x, rayOriginOffest.y, rayOriginOffest.z + slopeRayOriginOffest]}
      visible={showSlopeRayOrigin}
      userData={{ camExcludeCollision: true /** this won't be collide by camera ray */ }}
    >
      <T.BoxGeometry args={[0.15, 0.15, 0.15]} />
    </T>

    {@render children?.()}
  </T>
</RigidBodyComponent>
