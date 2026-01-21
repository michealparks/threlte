<script lang="ts">
  import { T } from '@threlte/core'
  import { Grid } from '@threlte/extras'
  import { AutoColliders, Debug, RigidBody } from '@threlte/rapier'
  import Character from './Character.svelte'
</script>

<T.PerspectiveCamera
  makeDefault
  position={[-0.85, 1.75, 2.46]}
  oncreate={(ref) => {
    ref.lookAt(0, 1, 0)
  }}
/>

<T.AmbientLight />
<T.DirectionalLight
  position={[10, 5, 5]}
  castShadow
/>

<Character />

<Debug />

<RigidBody type="fixed">
  <AutoColliders shape="cuboid">
    <T.Mesh
      position.y={-0}
      receiveShadow
    >
      <T.BoxGeometry args={[72, 0.01, 72]} />
      <T.MeshStandardMaterial
        color="white"
        transparent
        opacity={0}
      />
    </T.Mesh>
  </AutoColliders>
</RigidBody>

<Grid />
