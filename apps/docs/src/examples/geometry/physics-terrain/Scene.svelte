<script lang="ts">
  import FallingShapes from './FallingShapes.svelte'
  import RAPIER from '@dimforge/rapier3d-compat'
  import { Collider, Debug, RigidBody } from '@threlte/rapier'
  import { DEG2RAD } from 'three/src/math/MathUtils.js'
  import { DoubleSide, PlaneGeometry } from 'three'
  import { Environment, OrbitControls } from '@threlte/extras'
  import { SimplexNoise } from 'three/examples/jsm/Addons.js'
  import { T } from '@threlte/core'

  let { resetCounter = 0, showDebug = false }: { resetCounter?: number; showDebug?: boolean } =
    $props()

  const heights: number[] = []

  const nsubdivs = 10
  const size = 10

  const geometry = new PlaneGeometry(size, size, nsubdivs, nsubdivs)

  const noise = new SimplexNoise()
  const positions = geometry.getAttribute('position').array

  for (let x = 0; x <= nsubdivs; x++) {
    for (let y = 0; y <= nsubdivs; y++) {
      const height = noise.noise(x / 4, y / 4)
      const vertIndex = (x + (nsubdivs + 1) * y) * 3
      positions[vertIndex + 2] = height
      const heightIndex = y + (nsubdivs + 1) * x
      heights[heightIndex] = height
    }
  }

  // needed for lighting
  geometry.computeVertexNormals()

  const scale = new RAPIER.Vector3(size, 1, size)
</script>

<T.PerspectiveCamera
  makeDefault
  position.y={10}
  position.z={10}
>
  <OrbitControls />
</T.PerspectiveCamera>

{#key resetCounter}
  <FallingShapes>
    {#snippet children({ shape })}
      <T.Mesh
        castShadow
        receiveShadow
        geometry={shape.geometry}
      >
        <T.MeshStandardMaterial color={shape.color} />
      </T.Mesh>
    {/snippet}
  </FallingShapes>
{/key}

<Environment url="/textures/equirectangular/hdr/shanghai_riverside_1k.hdr" />

<T.Mesh
  receiveShadow
  {geometry}
  rotation.x={DEG2RAD * -90}
>
  <T.MeshStandardMaterial
    color="teal"
    opacity={0.8}
    transparent
    side={DoubleSide}
  />
</T.Mesh>
<RigidBody type="fixed">
  <Collider
    shape="heightfield"
    args={[nsubdivs, nsubdivs, heights, scale]}
  />
</RigidBody>

{#if showDebug}
  <Debug />
{/if}
