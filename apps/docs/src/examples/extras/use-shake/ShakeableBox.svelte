<script lang="ts">
  import { Quaternion, Vector3, type Mesh } from 'three'
  import { T, useTask } from '@threlte/core'
  import { useCursor, useShake } from '@threlte/extras'
  import { cubicIn, cubicOut } from 'svelte/easing'
  import { untrack } from 'svelte'

  interface Props {
    position: [number, number, number]
    size: [number, number, number]
    color: string
  }

  let { position, size, color }: Props = $props()

  let mesh = $state.raw<Mesh>()

  const basePosition = new Vector3(...untrack(() => position))
  const baseQuaternion = new Quaternion()

  const tilt = 0.2
  const randomTilt = () => (Math.random() * 2 - 1) * tilt

  const cursor = useCursor()
  const shake = useShake(() => ({ target: mesh, intensity: 0 }))

  useTask(
    () => {
      if (!mesh) return
      mesh.position.copy(basePosition)
      mesh.quaternion.copy(baseQuaternion)
    },
    { before: shake.task }
  )
</script>

<T.Mesh
  bind:ref={mesh}
  {position}
  castShadow
  receiveShadow
  onpointerenter={() => {
    cursor.onPointerEnter()
  }}
  onpointerleave={() => {
    cursor.onPointerLeave()
  }}
  onclick={(event) => {
    event.stopPropagation()

    // Asymmetric speaker-style bounce: snappy rise (20%), longer release
    // (80%), no sustain. The two phases together produce a single
    // "pop and settle" peak at the 20% mark.
    shake.trigger({
      amplitude: 0.5,
      duration: 0.3,
      direction: [0, 0.4, 0],
      rotationDirection: [randomTilt(), 0, randomTilt()],
      axisScale: [0, 0.2, 0],
      attackDuration: 0.2,
      releaseDuration: 0.8,
      attack: cubicOut,
      release: cubicIn
    })
  }}
>
  <T.BoxGeometry args={size} />
  <T.MeshStandardMaterial {color} />
</T.Mesh>
