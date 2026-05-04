<script lang="ts">
  import { T } from '@threlte/core'
  import { AnimatedSpriteMaterial, Suspense } from '@threlte/extras'
  import Fire from './Fire.svelte'
  import Player from './Player.svelte'
  import ThrelteLogo from './ThrelteLogo.svelte'
  import { Tween } from 'svelte/motion'
  import { cubicOut } from 'svelte/easing'
  import Background from './Background.svelte'

  let playerPosition = $state<[number, number, number]>([-2.0, -2.75, 0.01])
  let playerAtFire = $derived(Math.abs(playerPosition[0]) < 0.7)

  const fov = Tween.of(() => (playerAtFire ? 45 : 50), {
    easing: cubicOut,
    duration: 900
  })

  const cameraPosY = Tween.of(() => (playerAtFire ? -0.9 : -0.2), {
    easing: cubicOut,
    duration: 900
  })
</script>

<T.AmbientLight
  color="#6697C7"
  intensity={0.3}
/>

<T.PerspectiveCamera
  makeDefault
  position.z={7}
  position.y={cameraPosY.current}
  fov={fov.current}
/>

<Suspense>
  <Background />
  <Fire />

  {#each { length: 9 }, index}
    <T.Sprite
      scale={0.5}
      position.y={-1.99}
      position.x={index < 5
        ? index / 2.4 + Math.random() * 0.4 - 2.8
        : index / 2.4 + Math.random() * 0.4 - 1}
    >
      <AnimatedSpriteMaterial
        textureUrl="/textures/sprites/grass.png"
        totalFrames={6}
        fps={5}
        delay={index * 40}
      />
    </T.Sprite>
  {/each}

  <ThrelteLogo show={playerAtFire} />

  <Player bind:position={playerPosition} />
</Suspense>
