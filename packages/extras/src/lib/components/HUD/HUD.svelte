<script lang="ts">
  import { T, createCameraContext, createSceneContext, useThrelte } from '@threlte/core'
  import type { HUDProps } from './types'
  import { setContext } from 'svelte'

  const { renderStage, renderer, toneMapping } = useThrelte()

  let {
    autoRender = true,
    toneMapping: hudToneMapping,
    stage = renderStage,
    ref = $bindable(),
    children,
    ...rest
  }: HUDProps = $props()

  const ctx = useThrelte()
  const sceneCtx = createSceneContext()
  const cameraCtx = createCameraContext()
  const { scene } = sceneCtx
  const { camera } = cameraCtx

  setContext('threlte-context', {
    ...ctx,
    ...sceneCtx,
    ...cameraCtx
  })

  const key = Symbol('threlte-hud-render-stage')

  $effect.pre(() => {
    if (!autoRender) {
      return
    }

    stage.createTask(key, () => {
      const { autoClear } = renderer

      renderer.autoClear = false
      renderer.toneMapping = hudToneMapping ?? toneMapping.current

      renderer.clearDepth()
      renderer.render(scene, camera.current)

      renderer.autoClear = autoClear
      renderer.toneMapping = toneMapping.current
    })

    return () => stage.removeTask(key)
  })
</script>

<T
  is={scene}
  bind:ref
  attach={false}
  {...rest}
>
  {@render children?.({ ref: scene })}
</T>
