import type { InstancedMesh } from 'three'
import { getContext, setContext } from 'svelte'

const getContextId = (instancedMeshId: string) => `threlte-instanced-mesh-${instancedMeshId}`

type InstanceEventHandlers = Record<string, (event: any) => void>

type InstancedMeshContext = {
  instancedMesh: InstancedMesh
  /** Allocate a slot index for a new instance */
  allocateIndex: () => number
  /** Release a slot index when an instance is destroyed */
  releaseIndex: (index: number) => void
  /** Register event handlers for an instance by its index */
  setEvents: (index: number, events: InstanceEventHandlers) => void
  /** Remove event handlers for an instance */
  removeEvents: (index: number) => void
  /** Get event handlers for an instance by its index */
  getEvents: (index: number) => InstanceEventHandlers | undefined
  /** Notify that an instance's matrix has been updated */
  matrixUpdated: () => void
  /** Notify that an instance's color has been updated */
  colorUpdated: () => void
  /** Get the number of allocated slots (including gaps from freed indices) */
  getAllocatedCount: () => number
  /** Notify that an instance was added */
  instanceAdded: () => void
  /** Notify that an instance was removed */
  instanceRemoved: () => void
}

export const createInstancedMeshContext = (
  instancedMesh: InstancedMesh,
  instancedMeshId: string,
  onMatrixUpdate: () => void,
  onColorUpdate: () => void,
  onInstanceAdded: () => void,
  onInstanceRemoved: () => void
) => {
  const freeIndices: number[] = []
  let nextIndex = 0
  const eventMap = new Map<number, InstanceEventHandlers>()

  const ctx: InstancedMeshContext = {
    instancedMesh,

    allocateIndex() {
      const index = freeIndices.length > 0 ? freeIndices.pop()! : nextIndex++
      return index
    },

    releaseIndex(index: number) {
      freeIndices.push(index)
    },

    getAllocatedCount() {
      return nextIndex
    },

    setEvents(index: number, events: InstanceEventHandlers) {
      eventMap.set(index, events)
    },

    removeEvents(index: number) {
      eventMap.delete(index)
    },

    getEvents(index: number) {
      return eventMap.get(index)
    },

    matrixUpdated: onMatrixUpdate,
    colorUpdated: onColorUpdate,
    instanceAdded: onInstanceAdded,
    instanceRemoved: onInstanceRemoved
  }

  setContext<InstancedMeshContext>(getContextId(instancedMeshId), ctx)
  return ctx
}

export const useInstancedMeshContext = (instancedMeshId: string) => {
  const context = getContext<InstancedMeshContext>(getContextId(instancedMeshId))
  if (!context) throw new Error(`No <InstancedMesh> component found for id ${instancedMeshId}`)
  return context
}
