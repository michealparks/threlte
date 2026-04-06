<script lang="ts">
  import { T } from '@threlte/core'
  import { AutoColliders, Collider, Debug, RigidBody } from '@threlte/rapier'
</script>

<T.PerspectiveCamera
  makeDefault
  position={[10, 10, 10]}
  oncreate={(ref) => ref.lookAt(0, 2, 0)}
/>

<T.AmbientLight intensity={0.4} />
<T.DirectionalLight position={[5, 10, 5]} />

<Debug />

<!-- Ground -->
<Collider
  shape="cuboid"
  args={[10, 0.1, 10]}
/>

<!-- Cuboid -->
<RigidBody type="fixed">
  <T.Group position={[-4, 1, 0]}>
    <Collider
      shape="cuboid"
      args={[0.5, 0.5, 0.5]}
    />
  </T.Group>
</RigidBody>

<!-- Ball -->
<RigidBody type="fixed">
  <T.Group position={[-2, 1, 0]}>
    <Collider
      shape="ball"
      args={[0.5]}
    />
  </T.Group>
</RigidBody>

<!-- Capsule -->
<RigidBody type="fixed">
  <T.Group position={[0, 1.5, 0]}>
    <Collider
      shape="capsule"
      args={[0.5, 0.3]}
    />
  </T.Group>
</RigidBody>

<!-- Cylinder -->
<RigidBody type="fixed">
  <T.Group position={[2, 1, 0]}>
    <Collider
      shape="cylinder"
      args={[0.5, 0.3]}
    />
  </T.Group>
</RigidBody>

<!-- Cone -->
<RigidBody type="fixed">
  <T.Group position={[4, 1, 0]}>
    <Collider
      shape="cone"
      args={[0.5, 0.3]}
    />
  </T.Group>
</RigidBody>

<!-- AutoColliders with trimesh -->
<RigidBody
  type="fixed"
  position={[-3, 1, 3]}
>
  <AutoColliders shape="trimesh">
    <T.Mesh>
      <T.TorusKnotGeometry args={[0.5, 0.15, 64, 16]} />
      <T.MeshStandardMaterial color="#ff6060" />
    </T.Mesh>
  </AutoColliders>
</RigidBody>

<!-- AutoColliders with convexHull -->
<RigidBody
  type="fixed"
  position={[0, 1, 3]}
>
  <AutoColliders shape="convexHull">
    <T.Mesh>
      <T.TorusGeometry args={[0.5, 0.2, 8, 12]} />
      <T.MeshStandardMaterial color="#60b0ff" />
    </T.Mesh>
  </AutoColliders>
</RigidBody>

<!-- Dynamic ball to show interaction -->
<RigidBody position={[-2, 5, 0]}>
  <AutoColliders shape="ball">
    <T.Mesh>
      <T.SphereGeometry args={[0.3]} />
      <T.MeshStandardMaterial color="#ffcc00" />
    </T.Mesh>
  </AutoColliders>
</RigidBody>

<!-- Dynamic cuboid -->
<RigidBody position={[2, 5, 3]}>
  <AutoColliders shape="cuboid">
    <T.Mesh>
      <T.BoxGeometry args={[0.6, 0.6, 0.6]} />
      <T.MeshStandardMaterial color="#cc60ff" />
    </T.Mesh>
  </AutoColliders>
</RigidBody>
