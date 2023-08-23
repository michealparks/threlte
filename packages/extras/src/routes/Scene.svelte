<script lang="ts">
  import { T } from '@threlte/core'
  import { OrbitControls, Suspense, Text, interactivity } from '../lib'

  const { update } = interactivity()

  let size = 1
</script>

<T.PerspectiveCamera
  makeDefault
  position={[3, 3, 3]}
  on:create={({ ref }) => ref.lookAt(0, 0, 0)}
>
  <OrbitControls
    autoRotate
    on:change={() => update()}
  />
</T.PerspectiveCamera>
<T.DirectionalLight />
<T.AmbientLight />

<Suspense>
  <T.Mesh
    on:click={() => (size === 1) ? (size = 1.5) : (size = 1)}
    on:pointerenter={(event) => event.object.material.color.set('turquoise')}
    on:pointerleave={(event) => event.object.material.color.set('orange')}
    scale={size}
  >
    <T.MeshStandardMaterial
      transparent
      opacity={0.8}
      color="orange"
    />
    <T.BoxGeometry />
    <Text
      position={[0, 0, 0.55]}
      text="Hello World!"
      anchorX="50%"
      anchorY="50%"
      color="black"
    />
  </T.Mesh>
  <svelte:fragment slot="fallback">
    <T.Mesh>
      <T.MeshStandardMaterial color="hotpink" />
      <T.BoxGeometry />
    </T.Mesh>
  </svelte:fragment>
</Suspense>
