<script lang="ts">
  import Stats from 'three/examples/jsm/libs/stats.module'
  import { T, useTask } from '@threlte/core'

  const stats = new Stats({
    trackGPU: false,
    trackHz: false,
    trackCPT: false,
    logsPerSecond: 4,
    graphsPerSecond: 30,
    samplesLog: 40,
    samplesGraph: 10,
    precision: 2,
    horizontal: true,
    minimal: false,
    mode: 0
  })

  document.body.append(stats.dom)

  const count = 1000

  let rotationX = $state(0)
  let rotationY = $state(0)

  useTask((delta) => {
    stats.end()
    stats.begin()
    rotationX += delta
    rotationY += delta
  })

  const arr = new Array(count).fill(0).map((_, index) => index)
</script>

<T.DirectionalLight />

<T.PerspectiveCamera
  makeDefault
  position={[15, 15, 15]}
  oncreate={(ref) => ref.lookAt(0, 0, 0)}
/>

{#each arr as index (index)}
  <T.Mesh
    position={[index % 10, (index / 10) % 10, Math.random() - 0.5]}
    rotation.x={rotationX}
    rotation.y={rotationY}
  >
    <T.BoxGeometry args={[0.1, 0.1, 0.1]} />
    <T.MeshStandardMaterial color="red" />

    <T.Mesh
      rotation.x={rotationX}
      rotation.y={rotationY}
      scale={0.1}
      position={[1, 1, 1]}
    >
      <T.SphereGeometry />
      <T.MeshStandardMaterial color="green" />

      <T.Mesh
        rotation.x={rotationX}
        rotation.y={rotationY}
      >
        <T.TorusKnotGeometry />
        <T.MeshStandardMaterial color="blue" />
      </T.Mesh>
    </T.Mesh>
  </T.Mesh>
{/each}
