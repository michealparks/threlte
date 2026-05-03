import { useTask } from '@threlte/core'
import { AnimationMixer, type AnimationAction, type Object3D } from 'three'
import type { ThrelteGltf } from '../types/types.js'

type UseGltfAnimationsReturnType<Actions> = {
  mixer: AnimationMixer
  actions: { readonly current: Actions }
}

/**
 * Convenience hook to use animations loaded with a <GLTF> Threlte component.
 *
 * ### Example
 *
 * ```svelte
 * <script lang="ts">
 *   import { GLTF, useGltfAnimations } from '@threlte/extras'
 *
 *   const { gltf, actions } = useGltfAnimations<'All Animations'>()
 *
 *   // play them whenever you need
 *   export const triggerAnimation = () => {
 *     $actions['All Animations']?.play()
 *   }
 * </script>
 *
 * <GLTF url={'/Bengal.glb'} bind:gltf={$gltf} />
 * ```
 * @param callback
 * @returns
 */
export function useGltfAnimations<
  T extends string,
  Actions extends Partial<Record<T, AnimationAction>> = Partial<Record<T, AnimationAction>>
>(
  gltf: () => ThrelteGltf | undefined,
  root?: () => Object3D | undefined
): UseGltfAnimationsReturnType<Actions> {
  const mixer = new AnimationMixer(undefined as unknown as Object3D)

  let actions = $state<Actions>({} as Actions)

  $effect(() => {
    const currentGltf = gltf()
    const resolvedRoot = root?.() ?? currentGltf?.scene

    if (!currentGltf?.animations.length || !resolvedRoot) return

    // if there's a mixer, we stop all running actions
    const newActions = currentGltf.animations.reduce((acc, clip) => {
      const action = mixer.clipAction(clip, resolvedRoot)
      return {
        ...acc,
        [clip.name as T]: action
      }
    }, {} as Actions)
    actions = newActions

    return () => {
      Object.values(newActions).forEach((a) => {
        const action = a as AnimationAction
        action.stop()
        mixer.uncacheClip(action.getClip())
      })
    }
  })

  useTask(
    (delta) => {
      mixer.update(delta)
    },
    { running: () => Object.keys(actions).length > 0 }
  )

  return {
    mixer,
    actions: {
      get current() {
        return actions
      }
    }
  }
}
