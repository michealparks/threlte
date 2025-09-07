<script lang="ts">
  import type { Event, PerspectiveCamera, OrthographicCamera } from 'three'
  import { isInstanceOf, T, useParent, useTask, useThrelte } from '@threlte/core'
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
  import { useControlsContext } from '../useControlsContext.svelte'
  import type { OrbitControlsProps } from './types'

  let { camera: userCamera, ref = $bindable(), children, ...props }: OrbitControlsProps = $props()

  const { dom, camera: defaultCamera, invalidate } = useThrelte()
  const parent = useParent()
  const controlsCtx = useControlsContext()

  const getCamera = () => {
    if (userCamera) {
      return userCamera
    }

    if (isInstanceOf($parent, 'PerspectiveCamera') || isInstanceOf($parent, 'OrthographicCamera')) {
      return $parent
    }

    return $defaultCamera as PerspectiveCamera | OrthographicCamera
  }

  const controls = new OrbitControls(getCamera(), dom)

  const camera = $derived(getCamera())
  $effect.pre(() => {
    controls.object = camera
  })

  $effect.pre(() => {
    const handleChange = (event: Event<'change', OrbitControls>) => {
      invalidate()
      props.onchange?.(event)
    }

    controlsCtx.orbit = controls
    controls.addEventListener('change', handleChange)
    return () => {
      controlsCtx.orbit = undefined
      controls.removeEventListener('change', handleChange)
    }
  })

  const { start, stop } = useTask(
    () => {
      controls.update()
    },
    {
      autoStart: false,
      autoInvalidate: false
    }
  )

  $effect.pre(() => {
    if (props.autoRotate || props.enableDamping) {
      start()
    } else {
      stop()
    }
  })
</script>

<T
  is={controls}
  bind:ref
  {...props}
>
  {@render children?.({ ref: controls })}
</T>
