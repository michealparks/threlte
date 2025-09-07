<script lang="ts">
  import { isInstanceOf, T, useParent, useTask, useThrelte } from '@threlte/core'
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
  import { useControlsContext } from '../useControlsContext.svelte'
  import type { OrbitControlsProps } from './types'
  import type { Event } from 'three'

  let { ref = $bindable(), children, ...props }: OrbitControlsProps = $props()

  const parent = useParent()
  const { dom, invalidate } = useThrelte()

  if (!isInstanceOf($parent, 'Camera')) {
    throw new Error('Parent missing: <OrbitControls> need to be a child of a <Camera>')
  }

  // <HTML> sets canvas pointer-events to "none" if occluding, so events must be placed on the canvas parent.
  const controls = new OrbitControls($parent, dom)

  const controlsCtx = useControlsContext()

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
</script>

<T
  is={controls}
  bind:ref
  {...props}
>
  {@render children?.({ ref: controls })}
</T>
