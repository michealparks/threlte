<script lang="ts">
  import { T } from '@threlte/core'
  import { Decal, useTexture, TrackballControls, interactivity } from '@threlte/extras'

  export let debug = false
  export let rotation = Math.PI
  export let scale = 1
  export let depthTest = false
  export let polygonOffsetFactor = 10

  interactivity()

  const texture = useTexture('/textures/decal/decal-diffuse.png', {
    transform: (map) => {
      return map
    }
  })

  const addDecal = (event) => {
    decals.push({ position: event.intersections[0].point.toArray() })
    decals = decals
  }

  let decals: { position: [x: number, y: number, z: number] }[] = []
</script>

<T.PerspectiveCamera
  makeDefault
  position.z={10}
  fov={20}
>
  <TrackballControls noZoom />
</T.PerspectiveCamera>

<T.AmbientLight />
<T.DirectionalLight />

{#if $texture}
  <T.Mesh on:click={(event) => addDecal(event)}>
    <T.SphereGeometry />
    <T.MeshToonMaterial color="turquoise" />

    {#each decals as { position }}
      <Decal
        {debug}
        {scale}
        {position}
        {rotation}
        {depthTest}
        {polygonOffsetFactor}
        map={$texture}
      />
    {/each}
  </T.Mesh>
{/if}
