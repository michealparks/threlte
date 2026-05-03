import { getContext, setContext } from 'svelte'
import { Scene } from 'three'

export const createSceneContext = (): Scene => {
  const scene = new Scene()

  setContext<Scene>('threlte-scene-context', scene)

  return scene
}

export const useScene = (): Scene => {
  const context = getContext<Scene>('threlte-scene-context')

  if (!context) {
    throw new Error('useScene can only be used in a child component to <Canvas>.')
  }

  return context
}
