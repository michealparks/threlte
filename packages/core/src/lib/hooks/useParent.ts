
import { getContext, setContext } from 'svelte'
import { writable, type Writable } from 'svelte/store'
import type { Object3D } from 'three'

export type ThrelteParentContext = Writable<Object3D | undefined>

export const useParent = () => {
  return getContext<ThrelteParentContext>('threlte-hierarchical-parent-context')
}

export const createParent = () => {
  const parent = writable<Object3D | undefined>()
  setContext<ThrelteParentContext>('threlte-hierarchical-parent-context', parent)
  return parent
}
