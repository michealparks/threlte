<script lang="ts">
  import { T } from '@threlte/core'
  import { OrbitControls, Grid, Billboard, Text3DGeometry, Environment } from '@threlte/extras'

  export let follow = true
  export let lockAxis: 'x' | 'y' | 'z' | 'none'
</script>

<T.AmbientLight />
<T.DirectionalLight intensity={2} />
<T.DirectionalLight
  position.x={-1}
  position.y={2}
  intensity={2}
/>

<Environment files="/hdr/shanghai_riverside_1k.hdr" />

<Billboard
  position={[-4, 3, 0]}
  {follow}
  {lockAxis}
>
  <T.Mesh>
    <T.MeshStandardMaterial
      metalness={1.0}
      roughness={0.1}
      color="green"
    />
    <Text3DGeometry
      text={'Threlte'}
      size={1}
      height={0.2}
      bevelEnabled
      bevelSize={0.05}
      bevelThickness={0.05}
    />
  </T.Mesh>
</Billboard>

<Billboard
  position={[1, 6, 3]}
  {follow}
  {lockAxis}
>
  <T.Mesh>
    <T.MeshStandardMaterial
      metalness={1.0}
      roughness={0.1}
      color="blue"
    />
    <Text3DGeometry
      text={'is'}
      size={1}
      height={0.2}
      bevelEnabled
      bevelSize={0.05}
      bevelThickness={0.05}
    />
  </T.Mesh>
</Billboard>

<Billboard
  position={[3, 1, 0]}
  {follow}
  {lockAxis}
>
  <T.Mesh>
    <T.MeshStandardMaterial
      metalness={1.0}
      roughness={0.1}
      color="red"
    />
    <Text3DGeometry
      text={'cool'}
      size={1}
      height={0.2}
      bevelEnabled
      bevelSize={0.05}
      bevelThickness={0.05}
    />
  </T.Mesh>
</Billboard>

<T.PerspectiveCamera
  makeDefault
  position.y={8}
  position.z={8}
  fov={90}
  on:create={({ ref }) => {
    ref.lookAt(0, 0, 0)
  }}
>
  <OrbitControls
    enableDamping
    enablePan={false}
    enableZoom={false}
  />
</T.PerspectiveCamera>

<Grid
  position.y={0}
  sectionThickness={1}
  infiniteGrid
  cellColor="#dddddd"
  sectionColor="#ffffff"
  sectionSize={10}
  cellSize={2}
/>
