<script lang="ts">
  import { T } from '@threlte/core'
  import { Environment, OrbitControls, Float, ContactShadows } from '@threlte/extras'
</script>

<T.PerspectiveCamera
  makeDefault
  position={[0, 0, 5]}
>
  <OrbitControls
    autoRotate
    minPolarAngle={Math.PI / 1.8}
    maxPolarAngle={Math.PI / 1.8}
  />
</T.PerspectiveCamera>

<T.PointLight
  intensity={2}
  position={[10, 10, 5]}
/>
<T.PointLight position={[-10, -10, -5]} />
<T.AmbientLight intensity={0.4} />
<T.Group position={[0, -1.5, 0]}>
  <Float
    position={[0, 2.15, 0]}
    speed={2}
    rotationIntensity={2}
    floatIntensity={2}
  >
    <T.Mesh
      castShadow
      receiveShadow
    >
      <T.TorusKnotGeometry args={[1, 0.25, 256, 24, 1, 3]} />
      <T.MeshStandardMaterial
        color="white"
        roughness={0.1}
        metalness={0.925}
      />
    </T.Mesh>
  </Float>
  <ContactShadows
    scale={10}
    blur={3}
    opacity={0.25}
    far={10}
  />
</T.Group>

<Environment
  isBackground
  resolution={64}
>
  <T.Mesh
    position={[10, 2, 0]}
    scale={[1, 3, 10]}
  >
    <T.BoxGeometry />
    <T.MeshBasicMaterial color="white" />
  </T.Mesh>

  <T.Mesh
    position={[-10, 2, 0]}
    scale={[1, 3, 10]}
  >
    <T.BoxGeometry />
    <T.MeshBasicMaterial color="white" />
  </T.Mesh>
</Environment>
