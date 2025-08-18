<script lang="ts">
  import Scene from './Scene.svelte'
  import { Canvas } from '@threlte/core'
  import { Pane, Ring, Slider, Checkbox } from 'svelte-tweakpane-ui'

  let length = $state(2)
  let width = $state(1)
  let colors = $state(['red', 'green', 'blue'])
  let opacity = $state(1)
  let overlay = $state(false)
</script>

<Pane
  title="Billboard"
  position="fixed"
>
  <Ring
    label="Length"
    min={0}
    step={0.01}
    pointerScale={0.001}
    bind:value={length}
  />

  <Ring
    label="Width"
    min={0}
    step={0.01}
    bind:value={width}
  />

  <Slider
    label="Opacity"
    min={0}
    max={1}
    step={0.01}
    bind:value={opacity}
  />

  <Checkbox
    label="Overlay"
    bind:value={overlay}
  />
</Pane>

<Canvas>
  <Scene
    {length}
    {width}
    {opacity}
    {overlay}
  />
</Canvas>
