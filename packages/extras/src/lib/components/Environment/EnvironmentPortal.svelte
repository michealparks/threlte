<script lang="ts">
  import { setEnvProps } from './utils'
  import { SceneGraphObject, useTask, useThrelte } from '@threlte/core'
  import { Scene, CubeCamera, WebGLCubeRenderTarget, HalfFloatType } from 'three'
  import type { EnvProps } from './Environment.svelte'
  import EnvironmentCube from './EnvironmentCube.svelte'
  import EnvironmentMap from './EnvironmentMap.svelte'

  let {
    near = 1,
    far = 1000,
    resolution = 256,
    frames = 1,
    isBackground = false,
    backgroundBlurriness,
    backgroundIntensity,
    backgroundRotation,
    environmentIntensity,
    environmentRotation,
    files,
    map,
    ...props
  }: EnvProps = $props()

  const { renderer, scene: defaultScene } = useThrelte()
  const fbo = $derived.by(() => {
    const target = new WebGLCubeRenderTarget(resolution)
    target.texture.type = HalfFloatType
    return target
  })
  const camera = $derived(new CubeCamera(near, far, fbo))
  const virtualScene = new Scene()

  $effect.pre(() => {
    if (frames === 1) camera.update(renderer, virtualScene)

    return setEnvProps(isBackground, virtualScene, fbo.texture, {
      backgroundBlurriness,
      backgroundIntensity,
      backgroundRotation,
      environmentIntensity,
      environmentRotation
    })
  })

  let count = $state(1)

  const { start, stop } = useTask(
    () => {
      camera.update(renderer, virtualScene)
    },
    { autoStart: false }
  )

  $effect.pre(() => {
    if (frames === Number.POSITIVE_INFINITY) {
      start()
    } else if (count < frames) {
      start()
      count += 1
    } else {
      stop()
    }
  })
</script>

<SceneGraphObject object={virtualScene}>
  {#if files}
    <EnvironmentCube
      scene={virtualScene}
      isBackground
      {files}
    />
  {:else}
    <EnvironmentMap
      scene={virtualScene}
      isBackground
      {map}
      {files}
    />
  {/if}
  <slot />
</SceneGraphObject>
