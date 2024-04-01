<script lang="ts">
  import { Euler, Group, Quaternion, Vector3 } from 'three'
  import { T, useStage, useTask, useThrelte } from '@threlte/core'
  import type { BillboardEvents, BillboardProps, BillboardSlots } from './Billboard.svelte'

  type $$Props = Required<BillboardProps>
  type $$Events = BillboardEvents
  type $$Slots = BillboardSlots

  export let follow: $$Props['follow'] = true
  export let lockAxis: $$Props['lockAxis'] = 'none'

  let inner: Group
  export let ref = new Group()

  const { camera, renderStage } = useThrelte()
  const stage = useStage(Symbol('before-render'), { before: renderStage })

  const q = new Quaternion()

  const { start, stop } = useTask(
    () => {
      // always face the camera
      ref.updateMatrix()
      ref.updateWorldMatrix(false, false)
      ref.getWorldQuaternion(q)
      camera.current.getWorldQuaternion(inner.quaternion).premultiply(q.invert())
    },
    { autoStart: false, stage }
  )

  $: if (follow) {
    start()
  } else {
    stop()
  }
</script>

<T
  is={ref}
  {...$$restProps}
>
  <T.Group bind:ref={inner}>
    <slot {ref} />
  </T.Group>
</T>
