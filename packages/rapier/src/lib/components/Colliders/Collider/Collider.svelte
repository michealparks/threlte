<script
  lang="ts"
  generics="TShape extends Shape, TMassDef extends MassDef"
>
  import {
    ActiveCollisionTypes,
    CoefficientCombineRule,
    ColliderDesc
  } from '@dimforge/rapier3d-compat'
  import { useParentObject3D, useTask } from '@threlte/core'
  import { Quaternion, Vector3 } from 'three'
  import { useCollisionGroups } from '../../../hooks/useCollisionGroups.js'
  import { useRapier } from '../../../hooks/useRapier.js'
  import { useRigidBody } from '../../../hooks/useRigidBody.js'
  import { applyColliderActiveEvents } from '../../../lib/applyColliderActiveEvents.js'
  import { eulerToQuaternion } from '../../../lib/eulerToQuaternion.js'
  import { getWorldPosition, getWorldQuaternion } from '../../../lib/getWorldTransforms.js'
  import { useParentRigidbodyObject } from '../../../lib/rigidBodyObjectContext.js'
  import { scaleColliderArgs } from '../../../lib/scaleColliderArgs.js'
  import type { ColliderProps, MassDef, Shape } from './types.js'

  let {
    shape,
    args,
    type,
    restitution,
    restitutionCombineRule,
    friction,
    frictionCombineRule,
    sensor,
    contactForceEventThreshold,
    density,
    mass,
    centerOfMass,
    principalAngularInertia,
    angularInertiaLocalFrame,
    collider = $bindable(),
    oncreate,
    oncollisionenter,
    oncollisionexit,
    oncontact,
    onsensorenter,
    onsensorexit
  }: ColliderProps<TShape, TMassDef> = $props()

  const rigidBody = useRigidBody()
  const parentRigidBodyObject = useParentRigidbodyObject()
  const parent3DObject = useParentObject3D()

  const rapierContext = useRapier()
  const { world } = rapierContext

  const collisionGroups = useCollisionGroups()

  const events = $derived({
    oncollisionenter,
    oncollisionexit,
    oncontact,
    onsensorenter,
    onsensorexit
  })

  /**
   * Create the collider. Runs after the parent Object3D is available.
   * The cleanup function handles teardown — no async gap, no orphan leak.
   */
  $effect(() => {
    const parentObject = $parent3DObject
    if (!parentObject) return

    parentObject.updateWorldMatrix(true, false)

    const scale = parentObject.getWorldScale(new Vector3())
    const scaledArgs = scaleColliderArgs(shape, args, scale)

    // @ts-expect-error
    const colliderDesc = ColliderDesc[shape](...scaledArgs) as ColliderDesc

    const c = world.createCollider(colliderDesc, rigidBody)
    c.setActiveCollisionTypes(ActiveCollisionTypes.ALL)
    collider = c

    rapierContext.addColliderToContext(c, parentObject, events)
    collisionGroups.registerColliders([c])

    if (rigidBody) {
      const rigidBodyWorldPos = new Vector3()
      const rigidBodyWorldQuatInversed = new Quaternion()

      parentRigidBodyObject?.getWorldPosition(rigidBodyWorldPos)
      parentRigidBodyObject?.getWorldQuaternion(rigidBodyWorldQuatInversed)
      rigidBodyWorldQuatInversed.invert()

      const localPosition = parentObject
        .getWorldPosition(new Vector3())
        .sub(rigidBodyWorldPos)
        .applyQuaternion(rigidBodyWorldQuatInversed)

      const localRotation = parentObject
        .getWorldQuaternion(new Quaternion())
        .premultiply(rigidBodyWorldQuatInversed)

      c.setTranslationWrtParent(localPosition)
      c.setRotationWrtParent(localRotation)
    } else {
      c.setTranslation(parentObject.getWorldPosition(new Vector3()))
      c.setRotation(parentObject.getWorldQuaternion(new Quaternion()))
    }

    const cleanup = oncreate?.(c)

    return () => {
      rapierContext.removeColliderFromContext(c)
      collisionGroups.removeColliders([c])
      if (c.isValid()) {
        world.removeCollider(c, true)
      }
      collider = undefined
      cleanup?.()
    }
  })

  $effect(() => {
    collider?.setRestitution(restitution ?? 0)
  })
  $effect(() => {
    collider?.setRestitutionCombineRule(restitutionCombineRule ?? CoefficientCombineRule.Average)
  })
  $effect(() => {
    collider?.setFriction(friction ?? 0.7)
  })
  $effect(() => {
    collider?.setFrictionCombineRule(frictionCombineRule ?? CoefficientCombineRule.Average)
  })
  $effect(() => {
    collider?.setSensor(sensor ?? false)
  })
  $effect(() => {
    collider?.setContactForceEventThreshold(contactForceEventThreshold ?? 0)
  })
  $effect(() => {
    if (density !== undefined) collider?.setDensity(density)
  })
  $effect(() => {
    if (collider && mass !== undefined) {
      if (centerOfMass && principalAngularInertia && angularInertiaLocalFrame) {
        collider.setMassProperties(
          mass,
          { x: centerOfMass[0], y: centerOfMass[1], z: centerOfMass[2] },
          {
            x: principalAngularInertia[0],
            y: principalAngularInertia[1],
            z: principalAngularInertia[2]
          },
          eulerToQuaternion(angularInertiaLocalFrame)
        )
      } else {
        collider.setMass(mass)
      }
    }
  })

  $effect(() => {
    if (collider) {
      rapierContext.colliderEventDispatchers.set(collider.handle, events)
      applyColliderActiveEvents(collider, events, rigidBody?.userData?.events)
    }
  })

  export const refresh = () => {
    const parentObject = $parent3DObject
    if (!collider || !parentObject) return

    if (rigidBody) {
      const rigidBodyWorldPos = new Vector3()
      const rigidBodyWorldQuatInversed = new Quaternion()

      parentRigidBodyObject?.getWorldPosition(rigidBodyWorldPos)
      parentRigidBodyObject?.getWorldQuaternion(rigidBodyWorldQuatInversed)
      rigidBodyWorldQuatInversed.invert()

      const localPosition = getWorldPosition(parentObject, new Vector3())
        .sub(rigidBodyWorldPos)
        .applyQuaternion(rigidBodyWorldQuatInversed)

      const localRotation = getWorldQuaternion(parentObject, new Quaternion())
        .premultiply(rigidBodyWorldQuatInversed)

      collider.setTranslationWrtParent(localPosition)
      collider.setRotationWrtParent(localRotation)
    } else {
      collider.setTranslation(getWorldPosition(parentObject))
      collider.setRotation(getWorldQuaternion(parentObject))
    }
  }

  /**
   * If the Collider is NOT attached to a RigidBody, update the
   * transforms on every frame.
   */
  useTask(
    () => {
      refresh()
    },
    {
      running: () => rigidBody === undefined && type === 'dynamic'
    }
  )
</script>
