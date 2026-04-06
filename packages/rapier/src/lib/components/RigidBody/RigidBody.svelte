<script lang="ts">
  import { T } from '@threlte/core'
  import { setContext } from 'svelte'
  import { Group, Vector3 } from 'three'
  import { useRapier } from '../../hooks/useRapier.js'
  import {
    initializeRigidBodyUserData,
    setInitialRigidBodyState
  } from '../../lib/createPhysicsTasks.js'
  import {
    getWorldPosition,
    getWorldQuaternion,
    getWorldScale
  } from '../../lib/getWorldTransforms.js'
  import { parseRigidBodyType } from '../../lib/parseRigidBodyType.js'
  import { setParentRigidbodyObject } from '../../lib/rigidBodyObjectContext.js'
  import type { RigidBodyContext, ThrelteRigidBody } from '../../types/types.js'
  import { overrideTeleportMethods } from './overrideTeleportMethods.js'
  import type { RigidBodyProps } from './types.js'

  const { world, rapier, addRigidBodyToContext, removeRigidBodyFromContext } = useRapier()

  let {
    linearVelocity,
    angularVelocity,
    type = 'dynamic',
    canSleep = true,
    gravityScale = 1,
    ccd = false,
    angularDamping = 0,
    linearDamping = 0,
    lockRotations = false,
    lockTranslations = false,
    enabledRotations = [true, true, true],
    enabledTranslations = [true, true, true],
    dominance = 0,
    enabled = true,
    userData = {},
    rigidBody = $bindable(),
    oncreate,
    oncollisionenter,
    oncollisionexit,
    oncontact,
    onsensorenter,
    onsensorexit,
    onsleep,
    onwake,
    children,
    ...rest
  }: RigidBodyProps = $props()

  const object = new Group()
  initializeRigidBodyUserData(object)

  /**
   * Used by child colliders to restore transform
   */
  setParentRigidbodyObject(object)

  /**
   * isSleeping used for events "sleep" and "wake" in `createPhysicsTasks`
   */
  object.userData.isSleeping = false

  /**
   * Temporary RigidBody init
   */
  let rigidBodyInternal = $derived.by(() => {
    if (rigidBody) return rigidBody

    const description = new rapier.RigidBodyDesc(parseRigidBodyType(type)).setCanSleep(canSleep)

    return world.createRigidBody(description) as ThrelteRigidBody
  })

  $effect.pre(() => {
    if (rigidBody !== rigidBodyInternal) {
      rigidBody = rigidBodyInternal

      /**
       * Will come in handy in the future for joints
       */
      object.userData.rigidBody = rigidBodyInternal
    }
  })
  $effect.pre(() => {
    overrideTeleportMethods(rigidBodyInternal, object)
  })

  /**
   * Apply transforms after the parent component added "object" to itself
   */
  $effect(() => {
    object.updateMatrix()
    object.updateWorldMatrix(true, false)
    const parentWorldScale = object.parent ? getWorldScale(object.parent) : new Vector3(1, 1, 1)
    const worldPosition = getWorldPosition(object).multiply(parentWorldScale)
    const worldQuaternion = getWorldQuaternion(object)
    setInitialRigidBodyState(object, worldPosition, worldQuaternion)
    rigidBodyInternal.setTranslation(worldPosition, true)
    rigidBodyInternal.setRotation(worldQuaternion, true)

    const cleanup = oncreate?.(rigidBodyInternal)

    return () => {
      removeRigidBodyFromContext(rigidBodyInternal)
      world.removeRigidBody(rigidBodyInternal)
      cleanup?.()
    }
  })

  $effect(() => {
    rigidBodyInternal.setBodyType(parseRigidBodyType(type), true)
  })
  $effect(() => {
    if (linearVelocity) {
      rigidBodyInternal.setLinvel(
        { x: linearVelocity[0], y: linearVelocity[1], z: linearVelocity[2] },
        true
      )
    }
  })
  $effect(() => {
    if (angularVelocity) {
      rigidBodyInternal.setAngvel(
        { x: angularVelocity[0], y: angularVelocity[1], z: angularVelocity[2] },
        true
      )
    }
  })
  $effect(() => rigidBodyInternal.setGravityScale(gravityScale, true))
  $effect(() => rigidBodyInternal.enableCcd(ccd))
  $effect(() => rigidBodyInternal.setDominanceGroup(dominance))
  $effect(() => rigidBodyInternal.lockRotations(lockRotations, true))
  $effect(() => rigidBodyInternal.lockTranslations(lockTranslations, true))
  $effect(() => rigidBodyInternal.setEnabledRotations(...enabledRotations, true))
  $effect(() => rigidBodyInternal.setEnabledTranslations(...enabledTranslations, true))
  $effect(() => rigidBodyInternal.setAngularDamping(angularDamping))
  $effect(() => rigidBodyInternal.setLinearDamping(linearDamping))
  $effect(() => rigidBodyInternal.setEnabled(enabled))

  /**
   * Add userData to the rigidBody
   */
  $effect(() => {
    rigidBodyInternal.userData = {
      events: {
        oncollisionenter,
        oncollisionexit,
        oncontact,
        onsensorenter,
        onsensorexit,
        onsleep,
        onwake
      },
      ...userData
    }
  })

  /**
   * Setting the RigidBody context so that colliders can
   * hook onto.
   */
  setContext<RigidBodyContext>('threlte-rapier-rigidbody', rigidBodyInternal)

  /**
   * Add the mesh to the context
   */
  addRigidBodyToContext(rigidBodyInternal, object, {
    oncollisionenter,
    oncollisionexit,
    oncontact,
    onsensorenter,
    onsensorexit,
    onsleep,
    onwake
  })
</script>

<T
  is={object}
  {...rest}
>
  {@render children?.({ rigidBody: rigidBodyInternal })}
</T>
