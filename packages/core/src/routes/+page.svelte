<script lang="ts">
  import * as THREE from 'three'
  import { Canvas } from '$lib'
  import Scene from './scene.svelte'

  setInterval(() => (value = !value), 2000)

  let value = true
</script>

<main>
  <Canvas
    useLegacyLights={value}
  >
    <Scene />
  </Canvas>
</main>

<style>
  main {
    height: 100dvh;
  }
</style>
