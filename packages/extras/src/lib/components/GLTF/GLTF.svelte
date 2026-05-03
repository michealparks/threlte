<script lang="ts">
  import { T } from '@threlte/core'
  import { useGltf } from '../../hooks/useGltf.js'
  import type { ThrelteGltf } from '../../types/types.js'
  import type { GltfProps } from './types.js'
  import { untrack } from 'svelte'

  type Props = GltfProps & { gltf?: ThrelteGltf | undefined } & ThrelteGltf['materials']

  let {
    url,
    dracoLoader,
    meshoptDecoder,
    ktx2Loader,
    gltf = $bindable(),
    scene = $bindable(),
    animations = $bindable(),
    asset = $bindable(),
    cameras = $bindable(),
    scenes = $bindable(),
    userData = $bindable(),
    parser = $bindable(),
    materials = $bindable(),
    nodes = $bindable(),
    onload,
    onunload,
    onerror,
    children,
    ...props
  }: Props = $props()

  const loader = $derived(
    useGltf({
      dracoLoader,
      meshoptDecoder,
      ktx2Loader
    })
  )

  const onLoad = (data: ThrelteGltf) => {
    if (gltf) onunload?.()

    gltf = data
    scene = data.scene
    animations = data.animations
    asset = data.asset
    cameras = data.cameras
    scenes = data.scenes
    userData = data.userData
    parser = data.parser
    materials = data.materials
    nodes = data.nodes

    onload?.(gltf)
  }

  const onError = (error: Error) => {
    gltf = undefined
    scene = undefined!
    animations = undefined!
    asset = undefined!
    cameras = undefined!
    scenes = undefined!
    userData = undefined!
    parser = undefined!
    nodes = undefined
    materials = undefined
    onerror?.(error)
  }

  const loadGltf = async (url: string): Promise<boolean> => {
    try {
      // eslint-disable-next-line svelte/require-store-reactive-access
      const model = await loader.load(url)
      untrack(() => onLoad(model))

      return true
    } catch (error) {
      untrack(() => onError(error as Error))
      return false
    }
  }

  const success = $derived(await loadGltf(url))
</script>

{#if success}
  <T
    is={scene}
    {...props}
  >
    {@render children?.({ ref: scene })}
  </T>
{/if}
