<script lang="ts">
  import { T, useTask, isInstanceOf } from '@threlte/core'
  import { useTrailTexture, useTexture, transitions, createTransition } from '@threlte/extras'
  import { cubicInOut } from 'svelte/easing'
  import { SimplexNoise } from 'three/examples/jsm/Addons.js'

  transitions()

  let {
    size = 256,
    maxAge = 3500,
    radius = 0.2,
    intensity = 1,
    interpolate = 2,
    smoothing = 0.9,
    minForce = 0.3,
    ease
  }: {
    size?: number
    maxAge?: number
    radius?: number
    intensity?: number
    interpolate?: number
    smoothing?: number
    minForce?: number
    ease?: (t: number) => number
  } = $props()

  const { texture: trailTexture, setTrail } = useTrailTexture(() => ({
    size,
    radius,
    maxAge,
    intensity,
    interpolate,
    smoothing,
    minForce,
    ease
  }))

  const fade = createTransition((ref) => {
    if (!isInstanceOf(ref, 'Material')) return
    ref.transparent = true
    ref.needsUpdate = true
    return {
      duration: 1500,
      easing: cubicInOut,
      tick: (t) => {
        ref.opacity = t
      }
    }
  })

  const noise = new SimplexNoise()

  let index = $state(0)
  let elapsed = 0
  const swapInterval = 6
  let time = 0

  const paintings = [
    '/textures/paintings/klimt.jpg',
    '/textures/paintings/vangogh.jpg',
    '/textures/paintings/caravaggio.jpg',
    '/textures/paintings/swan.jpg'
  ]

  useTask((delta) => {
    time += delta * 0.5

    const x = 0.5 + noise.noise(time, 0) * 0.4
    const y = 0.5 + noise.noise(0, time) * 0.4
    setTrail(x, y)

    elapsed += delta
    if (elapsed >= swapInterval) {
      elapsed = 0
      index = (index + 1) % paintings.length
    }
  })

  let fgIndex = $derived((index + 1) % paintings.length)

  const textures = await Promise.all(paintings.map((src) => useTexture(src)))
</script>

<T.PerspectiveCamera
  makeDefault
  position={[0, 0, 1.8]}
  fov={45}
/>

{#key index}
  <T.Mesh>
    <T.PlaneGeometry args={[1.6, 1.6]} />
    <T.MeshBasicMaterial
      map={textures[index]}
      transparent
      transition={fade}
    />
  </T.Mesh>
{/key}

{#key fgIndex}
  <T.Mesh position.z={0.001}>
    <T.PlaneGeometry args={[1.6, 1.6]} />
    <T.MeshBasicMaterial
      map={textures[fgIndex]}
      transparent
      alphaMap={trailTexture}
      transition={fade}
    />
  </T.Mesh>
{/key}
