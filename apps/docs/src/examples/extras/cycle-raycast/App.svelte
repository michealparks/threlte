<script lang="ts">
  import { Canvas } from '@threlte/core'
  import { Checkbox, List, Pane, ThemeUtils } from 'svelte-tweakpane-ui'
  import Scene from './Scene.svelte'

  let scroll = $state(true)
  let clickModifier: 'Alt' | 'Shift' | 'Control' | 'Meta' | false = $state('Alt')
  let enableKeyboard = $state(true)
</script>

<div>
  <Canvas>
    <Scene {scroll} {clickModifier} {enableKeyboard} />
  </Canvas>
</div>

<Pane
  theme={ThemeUtils.presets.light}
  position="fixed"
  title="cycleRaycast"
>
  <Checkbox
    bind:value={scroll}
    label="scroll"
  />
  <List
    bind:value={clickModifier}
    label="clickModifier"
    options={{
      Alt: 'Alt',
      Shift: 'Shift',
      Control: 'Control',
      Meta: 'Meta',
      disabled: false
    }}
  />
  <Checkbox
    bind:value={enableKeyboard}
    label="keyboard (Tab)"
  />
</Pane>

<style>
  div {
    height: 100%;
  }
</style>
