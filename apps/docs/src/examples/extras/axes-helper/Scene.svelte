<script lang="ts">
  import { OrbitControls, AxesHelper, Edges } from '@threlte/extras'
  import { T } from '@threlte/core'

  let { ...rest } = $props()
</script>

<T.PerspectiveCamera
  makeDefault
  position={[3, 3, 3]}
>
  <OrbitControls
    enableDamping
    enablePan={false}
    enableZoom={false}
  />
</T.PerspectiveCamera>

<T.Mesh>
  <T.BoxGeometry />
  <T.MeshToonMaterial
    transparent
    opacity={0.8}
    color="lightgreen"
  />

  <Edges color="green" />
</T.Mesh>

<AxesHelper {...rest} />

<T.DirectionalLight />
