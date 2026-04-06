<script lang="ts">
  import { Canvas } from '@threlte/core'
  import { World } from '@threlte/rapier'
  import Scene from './Scene.svelte'
</script>

<div>
  <Canvas>
    <World>
      <Scene />
    </World>
  </Canvas>
</div>

<style>
  div {
    height: 100%;
  }
</style>
