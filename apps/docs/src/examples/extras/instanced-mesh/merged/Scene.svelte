<script lang="ts">
  import { T } from '@threlte/core'
  import { InstancedMeshes, OrbitControls, useGltf } from '@threlte/extras'
  import { DoubleSide, Mesh, MathUtils } from 'three'
  import Flower from './Flower.svelte'

  const gltf = useGltf<{
    nodes: {
      Blossom: Mesh
      Stem: Mesh
    }
    materials: {}
  }>('/models/Flower.glb')

  // make an array of random x-z coordinates in the range of -20 to 20 with 200 elements
  const items = Array.from({ length: 1000 }, () => ({
    position: [Math.random() * 5 - 2.5, 0, Math.random() * 5 - 2.5],
    scale: Math.random() * 0.5 + 0.5,
    rotation: [
      Math.random() * 8 * MathUtils.DEG2RAD,
      Math.random() * 360 * MathUtils.DEG2RAD,
      Math.random() * 8 * MathUtils.DEG2RAD
    ]
  }))
</script>

{#if $gltf}
  <InstancedMeshes
    castShadow
    meshes={$gltf.nodes}
  >
    {#snippet children({ components: { Blossom, Stem } })}
      {#each items as item}
        <Flower
          position={item.position}
          scale={item.scale}
          rotation={item.rotation}
        >
          <Blossom />
          <Stem />
        </Flower>
      {/each}
    {/snippet}
  </InstancedMeshes>
{/if}

<T.DirectionalLight
  position.y={10}
  position.z={5}
  castShadow
  shadow.camera.left={-2.5}
  shadow.camera.right={2.5}
  shadow.camera.top={2.5}
  shadow.camera.bottom={-2.5}
  shadow.mapSize.width={1024}
  shadow.mapSize.height={1024}
/>

<T.Mesh
  receiveShadow
  rotation.x={-90 * MathUtils.DEG2RAD}
>
  <T.PlaneGeometry args={[5, 5]} />
  <T.MeshStandardMaterial
    color="#288278"
    side={DoubleSide}
  />
</T.Mesh>

<T.AmbientLight intensity={0.1} />

<T.PerspectiveCamera
  position={[3, 0.5, 3]}
  makeDefault
  fov={20}
>
  <OrbitControls
    autoRotate
    enableZoom={false}
    enableDamping
    autoRotateSpeed={0.1}
    enablePan={false}
  />
</T.PerspectiveCamera>
