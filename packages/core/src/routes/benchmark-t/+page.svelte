<script lang="ts">
  import { Canvas } from '$lib'
  import Scene from './Scene.svelte'
</script>

<main>
  <Canvas renderMode="always">
    <Scene />
  </Canvas>
</main>

<style>
  :global(body) {
    margin: 0;
  }

  main {
    height: 100dvh;
  }
</style>
