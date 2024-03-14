<script lang="ts">
  import { Canvas } from '@threlte/core'
  import { Pane, List, Checkbox, Point, Slider } from 'svelte-tweakpane-ui'
  import Scene from './Scene.svelte'

  let debug = false
  let rotation = Math.PI
  let scale = 1
  let depthTest = false
  let polygonOffsetFactor = 10
</script>

<Pane
  title="Decal"
  position="fixed"
>
  <Checkbox
    label="debug"
    bind:value={debug}
  />
  <Checkbox
    label="depthTest"
    bind:value={depthTest}
  />
  <Slider
    bind:value={rotation}
    label="rotation"
    min={0}
    max={Math.PI * 2}
  />
  <Slider
    bind:value={scale}
    label="scale"
    min={0.01}
    max={10}
  />
  <Slider
    bind:value={polygonOffsetFactor}
    label="polygonOffsetFactor"
    min={0.01}
    max={20}
  />
</Pane>

<div>
  <Canvas>
    <Scene
      {debug}
      {depthTest}
      {rotation}
      {scale}
      {polygonOffsetFactor}
    />
  </Canvas>
</div>

<style>
  div {
    height: 100%;
  }
</style>
