<script
  lang="ts"
  module
>
  import { Color, Matrix4, Object3D } from 'three'

  const zeroMatrix = new Matrix4().makeScale(0, 0, 0)
  const _tempMatrix = new Matrix4()
  const _shared = new Object3D()
  const _color = new Color()
</script>

<script lang="ts">
  import { resolvePropertyPath, useParentObject3D, useThrelte } from '@threlte/core'
  import { fromStore } from 'svelte/store'
  import { useInstancedMeshContext } from './api.svelte.js'
  import type { InstanceProps } from './types.js'
  import { useInstanceId } from './useInstanceId.js'

  let {
    id = useInstanceId(),
    ref = $bindable(),
    color,
    children,
    ...props
  }: InstanceProps = $props()

  const ctx = useInstancedMeshContext(id)
  const { invalidate } = useThrelte()
  const parentObject3D = fromStore(useParentObject3D())

  const index = ctx.allocateIndex()

  // Single effect for transforms, color, and events
  $effect.pre(() => {
    // Reset shared Object3D to identity
    _shared.position.set(0, 0, 0)
    _shared.quaternion.set(0, 0, 0, 1)
    _shared.scale.set(1, 1, 1)

    let hasEvents = false
    const events: Record<string, (event: any) => void> = {}

    for (const key in props) {
      const value = (props as Record<string, unknown>)[key]
      if (value === undefined || value === null) continue

      if (typeof value === 'function' && key.startsWith('on') && !key.includes('.')) {
        events[key] = value as (event: any) => void
        hasEvents = true
        continue
      }

      const { target, key: k } = resolvePropertyPath(_shared, key)
      if (!target || !k) continue

      if (
        typeof target[k]?.set === 'function' &&
        typeof target[k] === 'object' &&
        target[k] !== null
      ) {
        if (Array.isArray(value)) {
          target[k].set(...value)
        } else if (
          typeof value === 'number' &&
          typeof target[k]?.setScalar === 'function' &&
          !target[k]?.isColor
        ) {
          target[k].setScalar(value)
        } else {
          target[k].set(value)
        }
      } else {
        target[k] = value
      }
    }

    // Compose matrix from the shared Object3D's transform
    _shared.updateMatrix()

    const parent = parentObject3D.current
    if (parent && parent !== ctx.instancedMesh) {
      parent.updateWorldMatrix(true, false)
      ctx.instancedMesh.updateWorldMatrix(true, false)
      _tempMatrix
        .copy(ctx.instancedMesh.matrixWorld)
        .invert()
        .multiply(parent.matrixWorld)
        .multiply(_shared.matrix)
      ctx.instancedMesh.setMatrixAt(index, _tempMatrix)
    } else {
      ctx.instancedMesh.setMatrixAt(index, _shared.matrix)
    }
    ctx.matrixUpdated()

    // Color
    if (color !== undefined) {
      _color.set(color)
      ctx.instancedMesh.setColorAt(index, _color)
      ctx.colorUpdated()
    }

    // Events
    if (hasEvents) {
      ctx.setEvents(index, events)
    }

    invalidate()

    return () => {
      ctx.removeEvents(index)
    }
  })

  ctx.instanceAdded()

  $effect(() => {
    return () => {
      ctx.instancedMesh.setMatrixAt(index, zeroMatrix)
      ctx.matrixUpdated()
      ctx.releaseIndex(index)
      ctx.removeEvents(index)
      ctx.instanceRemoved()
      invalidate()
    }
  })
</script>

{@render children?.({ ref: _shared })}
