<script lang="ts">
  import { T } from '@threlte/core'
  import { CameraControls, CameraControlsRef, Grid, interactivity, useShake } from '@threlte/extras'
  import ShakeableBox from './ShakeableBox.svelte'

  interface Props {
    intensity: number
    frequency: number
    rotational: boolean
    shake: ReturnType<typeof useShake> | undefined
  }

  let { intensity, frequency, rotational, shake = $bindable() }: Props = $props()

  interactivity()

  let controls = $state.raw<CameraControlsRef>()

  const shakeInstance = useShake(() => ({
    target: controls?.camera,
    intensity,
    frequency,
    rotational
  }))
  shake = shakeInstance

  const ringCount = 6
  const ring: number[] = Array.from({ length: ringCount }, (_, i) => i)
</script>

<T.PerspectiveCamera
  makeDefault
  fov={55}
  position={[5, 4, 7]}
/>

<CameraControls
  bind:ref={controls}
  distance={10}
  mouseButtons.wheel={CameraControlsRef.ACTION.NONE}
/>

<T.DirectionalLight
  position={[5, 10, 5]}
  intensity={1.5}
  castShadow
/>
<T.AmbientLight intensity={0.4} />

<Grid
  cellColor="#444444"
  sectionColor="#ff3e00"
  sectionSize={5}
  cellSize={1}
  gridSize={[30, 30]}
  fadeDistance={18}
  fadeOrigin={[0, 0, 0]}
  infiniteGrid
/>

<T.Mesh
  rotation.x={-Math.PI / 2}
  position.y={-0.01}
  receiveShadow
>
  <T.CircleGeometry args={[20, 72]} />
  <T.MeshStandardMaterial color="#eaeaea" />
</T.Mesh>

<ShakeableBox
  position={[0, 1, 0]}
  size={[2, 2, 2]}
  color="#4a90d9"
/>

{#each ring as i (i)}
  {@const angle = (i * Math.PI * 2) / ringCount}
  <ShakeableBox
    position={[Math.cos(angle) * 4, 0.5, Math.sin(angle) * 4]}
    size={[0.6, 1, 0.6]}
    color="#cccccc"
  />
{/each}
