<script lang="ts">
  import { T, useThrelte } from '@threlte/core'
  import { InstancedMesh } from 'three'
  import { createInstancedMeshContext } from './api.svelte.js'
  import type { InstancedMeshProps } from './types.js'

  let {
    id = 'default',
    limit = 1000,
    range = 1000,
    update,
    ref = $bindable(),
    children,
    ...props
  }: InstancedMeshProps = $props()

  if (update !== undefined) {
    console.warn(
      '<InstancedMesh>: The "update" prop is deprecated and has no effect. Instances now update their transforms directly.'
    )
  }

  const { invalidate } = useThrelte()

  const instancedMesh = new InstancedMesh(undefined, undefined, limit)
  instancedMesh.count = 0

  const ctx = createInstancedMeshContext(
    instancedMesh,
    id,
    // onMatrixUpdate
    () => {
      instancedMesh.instanceMatrix.needsUpdate = true
    },
    // onColorUpdate
    () => {
      if (instancedMesh.instanceColor) {
        instancedMesh.instanceColor.needsUpdate = true
      }
    },
    // onInstanceAdded
    () => {
      instancedMesh.count = Math.min(limit, range, ctx.getAllocatedCount())
      instancedMesh.instanceMatrix.needsUpdate = true
      if (instancedMesh.instanceColor) {
        instancedMesh.instanceColor.needsUpdate = true
      }
      invalidate()
    },
    // onInstanceRemoved
    () => {
      // Don't reduce count — freed indices may be reused, and Three.js
      // renders indices 0..count-1. Reducing count would hide instances
      // at higher indices.
      invalidate()
    }
  )

  // Dispatch pointer/interaction events to the correct instance via event map
  function dispatchInstanceEvent(eventName: string) {
    return (event: any) => {
      const instanceId = event?.instanceId
      if (instanceId === undefined) return

      const events = ctx.getEvents(instanceId)
      if (events?.[eventName]) {
        events[eventName](event)
      }
    }
  }
</script>

<T
  is={instancedMesh}
  bind:ref
  matrixAutoUpdate={false}
  onclick={dispatchInstanceEvent('onclick')}
  ondblclick={dispatchInstanceEvent('ondblclick')}
  oncontextmenu={dispatchInstanceEvent('oncontextmenu')}
  onpointerup={dispatchInstanceEvent('onpointerup')}
  onpointerdown={dispatchInstanceEvent('onpointerdown')}
  onpointerover={dispatchInstanceEvent('onpointerover')}
  onpointerout={dispatchInstanceEvent('onpointerout')}
  onpointerenter={dispatchInstanceEvent('onpointerenter')}
  onpointerleave={dispatchInstanceEvent('onpointerleave')}
  onpointermove={dispatchInstanceEvent('onpointermove')}
  onpointermissed={dispatchInstanceEvent('onpointermissed')}
  {...props}
>
  {@render children?.({ ref: instancedMesh })}
</T>
