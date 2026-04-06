<script lang="ts">
  import { T } from '@threlte/core'
  import { interactivity, cycleRaycast, OrbitControls } from '@threlte/extras'

  let { scroll, clickModifier, enableKeyboard }: {
    scroll: boolean
    clickModifier: 'Alt' | 'Shift' | 'Control' | 'Meta' | false
    enableKeyboard: boolean
  } = $props()

  interactivity()
  cycleRaycast(() => ({
    scroll,
    clickModifier,
    key: enableKeyboard ? 'Tab' : undefined
  }))

  let selected: string | null = $state(null)

  const boxes = [
    { id: 'red', color: '#e74c3c', position: [0, 0, 0] as [number, number, number] },
    { id: 'green', color: '#2ecc71', position: [0.6, 0.3, 0.3] as [number, number, number] },
    { id: 'blue', color: '#3498db', position: [-0.4, -0.2, 0.6] as [number, number, number] }
  ]
</script>

<T.PerspectiveCamera
  makeDefault
  position={[0, 2, 5]}
>
  <OrbitControls enableZoom={false} />
</T.PerspectiveCamera>

<T.AmbientLight intensity={0.6} />
<T.DirectionalLight position={[2, 4, 3]} />

{#each boxes as box (box.id)}
  <T.Mesh
    position={box.position}
    scale={selected === box.id ? 1.2 : 1}
    onclick={(e) => {
      e.stopPropagation()
      selected = box.id
    }}
    onpointerenter={(e) => {
      e.stopPropagation()
    }}
  >
    <T.BoxGeometry />
    <T.MeshStandardMaterial
      color={box.color}
      transparent
      opacity={selected === box.id ? 1 : 0.7}
    />
  </T.Mesh>
{/each}
