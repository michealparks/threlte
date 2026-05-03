<script lang="ts">
  import { Mesh } from 'three'
  import { T, useLoader } from '@threlte/core'
  import { useGltf, MeshRefractionMaterial, useDraco } from '@threlte/extras'

  import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'

  let { ...props } = $props()

  type GLTFResult = {
    nodes: {
      Diamond_1_0: Mesh
    }
    materials: {}
  }

  const dracoLoader = useDraco()

  const [gltf, envMap] = await Promise.all([
    useGltf<GLTFResult>('/models/diamond/dflat.glb', { dracoLoader }),
    useLoader(RGBELoader).load('/textures/equirectangular/hdr/aerodynamics_workshop_1k.hdr')
  ])
</script>

<T.Mesh
  castShadow
  receiveShadow
  geometry={gltf.nodes.Diamond_1_0.geometry}
  {...props}
>
  <MeshRefractionMaterial
    {envMap}
    fresnel={0.5}
    ior={2.75}
    aberrationStrength={0.04}
    bounces={3}
    color={'#ffdddd'}
  />
</T.Mesh>
