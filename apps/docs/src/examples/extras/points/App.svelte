<script lang="ts">
  import { Canvas } from '@threlte/core'
  import Scene from './Scene.svelte'
  import { Slider, Pane } from 'svelte-tweakpane-ui'

  let levels = $state(5)
</script>

<Pane
  position="fixed"
  title="points"
>
  <Slider
    bind:value={levels}
    min={4}
    max={20}
    step={1}
    label="Levels"
  />
</Pane>

<div>
  <Canvas>
    <Scene {levels} />
  </Canvas>
</div>

<style>
  div {
    height: 100%;
  }
</style>
