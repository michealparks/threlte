<script lang="ts">
  import { setEnvProps } from './utils'
  import { SceneGraphObject, useTask, useThrelte } from '@threlte/core'
  import { Scene, CubeCamera, WebGLCubeRenderTarget, HalfFloatType } from 'three'
  import type { EnvProps } from './Environment'
  import EnvironmentCube from './EnvironmentCube.svelte'
  import EnvironmentMap from './EnvironmentMap.svelte'

  let {
    near = 1,
    far = 1000,
    resolution = 256,
    frames = 2,
    isBackground = false,
    backgroundBlurriness,
    backgroundIntensity,
    backgroundRotation,
    environmentIntensity,
    environmentRotation,
    files,
    map,
    children,
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

  let count = $state(0)

  const { start } = useTask(
    () => camera.update(renderer, virtualScene),
    { autoStart: false }
  )

  const { start: startCount, stop: stopCount } = useTask(() => {
    camera.update(renderer, virtualScene)
    count += 1
  }, { autoStart: false, autoInvalidate: false })

  $effect.pre(() => {
    if (frames === Number.POSITIVE_INFINITY) {
      start()
    } else if (count < frames) {
      startCount()
    } else {
      stopCount()
    }
  })

  console.log(children)
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

  {@render children()}
</SceneGraphObject>
