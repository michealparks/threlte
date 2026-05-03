<script
  lang="ts"
  module
>
  const loaders: {
    hdr?: HDRCubeTextureLoader
    tex?: CubeTextureLoader
  } = {}
</script>

<script lang="ts">
  import { useCache, useThrelte } from '@threlte/core'
  import { CubeTextureLoader } from 'three'
  import { HDRCubeTextureLoader } from 'three/examples/jsm/loaders/HDRCubeTextureLoader.js'
  import { useEnvironment } from '../utils/useEnvironment.svelte.js'
  import type { CubeEnvironmentProps } from './types.js'

  const ctx = useThrelte()

  let {
    isBackground = false,
    scene = ctx.scene,
    texture = $bindable(),
    urls
  }: CubeEnvironmentProps = $props()

  const cache = useCache()

  useEnvironment({
    get scene() {
      return scene
    },
    get isBackground() {
      return isBackground
    },
    get texture() {
      return texture
    }
  })

  const first = $derived(urls?.[0])
  const firstIsHDR = $derived(first?.endsWith('hdr') ?? false)

  const loader = $derived.by(() => {
    if (urls === undefined) return
    if (firstIsHDR) {
      loaders.hdr ??= new HDRCubeTextureLoader()
      return loaders.hdr
    }
    loaders.tex ??= new CubeTextureLoader()
    return loaders.tex
  })

  const tex = $derived(await cache.remember(() => loader.loadAsync(urls), urls))
  texture = tex

  $effect(() => {
    return () => {
      texture.dispose()
    }
  })
</script>
