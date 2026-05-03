<script lang="ts">
  import { type Mesh, type MeshStandardMaterial, RepeatWrapping, DoubleSide } from 'three'
  import { T } from '@threlte/core'
  import { useGltf, useTexture, InstancedMesh, Instance } from '@threlte/extras'

  interface Props {
    transformData?: [number, number, number, number][]
  }

  let { transformData = [] }: Props = $props()

  interface GLTFResult {
    nodes: {
      Cube004: Mesh
      Cube004_1: Mesh
    }
    materials: {
      BirchTree_Bark: MeshStandardMaterial
      BirchTree_Leaves: MeshStandardMaterial
    }
  }

  const [gltf, barkTexture, leavesTexture, normalMap] = await Promise.all([
    useGltf<GLTFResult>('https://fun-bit.vercel.app/Ultimate-Stylized-Nature/BirchTree_1.gltf'),
    useTexture('https://fun-bit.vercel.app/Ultimate-Stylized-Nature/Textures/BirchTree_Bark.png'),
    useTexture('https://fun-bit.vercel.app/Ultimate-Stylized-Nature/Textures/BirchTree_Leaves.png'),
    useTexture(
      'https://fun-bit.vercel.app/Ultimate-Stylized-Nature/Textures/BirchTree_Bark_Normal.png'
    )
  ])
</script>

<InstancedMesh castShadow>
  <T is={gltf.nodes.Cube004.geometry} />
  <T.MeshStandardMaterial
    map={barkTexture}
    map.wrapS={RepeatWrapping}
    map.wrapT={RepeatWrapping}
    {normalMap}
    normalMap.wrapS={RepeatWrapping}
    normalMap.wrapT={RepeatWrapping}
  />
  {#each transformData as randomValues}
    {@const x = randomValues[0] * 20 - 10}
    {@const z = randomValues[1] * 20 - 10}
    {@const rot = randomValues[2] * Math.PI * 2}
    {@const scale = randomValues[3] * 2 + 1}
    <Instance
      position.x={x}
      position.z={z}
      rotation.y={rot}
      {scale}
    />
  {/each}
</InstancedMesh>
<InstancedMesh castShadow>
  <T is={gltf.nodes.Cube004_1.geometry} />
  <T.MeshStandardMaterial
    map={leavesTexture}
    side={DoubleSide}
    alphaTest={0.5}
  />
  {#each transformData as randomValues}
    {@const x = randomValues[0] * 20 - 10}
    {@const z = randomValues[1] * 20 - 10}
    {@const rot = randomValues[2] * Math.PI * 2}
    {@const scale = randomValues[3] * 2 + 1}
    <Instance
      position.x={x}
      position.z={z}
      rotation.y={rot}
      {scale}
    />
  {/each}
</InstancedMesh>
