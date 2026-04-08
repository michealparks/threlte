<script lang="ts">
  import { T, useTask } from '@threlte/core'
  import { Instance, InstancedMesh } from '@threlte/extras'

  let now = $state(0)
  useTask((delta) => (now += delta))
</script>

<InstancedMesh>
  <T.SphereGeometry args={[0.5]} />
  <T.MeshStandardMaterial color="white" />

  <Instance
    position.x={-2}
    position.y={Math.sin(now + 100)}
  />
  <Instance
    position.x={-1}
    position.y={Math.sin(now + 200)}
  />
  <Instance
    position.x={0}
    position.y={Math.sin(now + 300)}
  />
  <Instance
    position.x={1}
    position.y={Math.sin(now + 400)}
  />
  <Instance
    position.x={2}
    position.y={Math.sin(now + 500)}
  />
</InstancedMesh>

<T.DirectionalLight
  position.y={10}
  position.z={5}
/>

<T.AmbientLight intensity={0.1} />
