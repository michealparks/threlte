<!--
@component

`<TrackballControls>` allow the camera to orbit freely around a target
without causing gimbal lock. This type of camera controller is commonly used
when the concepts of up and down are less important than the ability to
carefully inspect a model from every angle.

For an alternative camera controller, see
[`<OrbitControls>`](https://threlte.xyz/docs/reference/extras/orbit-controls).

The component `<TrackballControls>` must be a direct child of a camera
component and will mount itself to that camera. By default, damping is
enabled. You can disable this by setting `staticMoving` to true.

## Usage

```svelte
<script>
  import { TrackballControls } from '@threlte/extras'
  import { T } from '@threlte/core'
</script>

<T.PerspectiveCamera
  makeDefault
  fov={50}
>
  <TrackballControls />
</T.PerspectiveCamera>
```

`<TrackballControls>` is a light wrapper that will use its parent as the target camera and 
the DOM element the renderer is rendering to as the DOM element to listen to. It will also 
by demand invalidate the frame loop.
-->
<script lang="ts">
  import type { Event, PerspectiveCamera, OrthographicCamera } from 'three'
  import { isInstanceOf, T, useParent, useTask, useThrelte } from '@threlte/core'
  import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
  import { useControlsContext } from '../useControlsContext.svelte'
  import type { TrackballControlsProps } from './types'

  let {
    camera: userCamera,
    onchange,
    ref = $bindable(),
    children,
    ...props
  }: TrackballControlsProps = $props()

  const { dom, camera: defaultCamera, invalidate, size } = useThrelte()
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

  const controls = new TrackballControls(getCamera())

  const camera = $derived(getCamera())
  $effect.pre(() => {
    controls.object = camera
  })

  $effect.pre(() => {
    const handleChange = (event: Event<'change', TrackballControls>) => {
      invalidate()
      onchange?.(event)
    }
    const currentControls = controls

    controlsCtx.trackball = controls
    currentControls.addEventListener('change', handleChange)
    return () => {
      controlsCtx.trackball = undefined
      currentControls.removeEventListener('change', handleChange)
    }
  })

  $effect(() => {
    controls.connect(dom)
    return () => controls.disconnect()
  })

  $effect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    $size
    controls.handleResize()
  })

  useTask(
    () => {
      controls.update()
    },
    {
      autoInvalidate: false
    }
  )
</script>

<T
  is={controls}
  bind:ref
  {...props}
>
  {@render children?.({ ref: controls })}
</T>
