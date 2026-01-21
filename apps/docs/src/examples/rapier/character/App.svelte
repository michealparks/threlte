<script lang="ts">
  import { Canvas } from '@threlte/core'
  import Scene from './Scene.svelte'
  import { World, CharacterDebug } from '@threlte/rapier'
</script>

<CharacterDebug />

<div>
  <Canvas>
    <World>
      <Scene />
    </World>
  </Canvas>
</div>

<style>
  div {
    position: relative;
    height: 100%;
    width: 100%;
  }
</style>
