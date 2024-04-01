<script lang="ts">
  import { Canvas } from '@threlte/core'
  import Scene from './Scene.svelte'
  import { Pane, Checkbox, List } from 'svelte-tweakpane-ui'

  let follow = true
  let lockAxis: 'x' | 'y' | 'z' | 'none' = 'none'
</script>

<div>
  <Canvas>
    <Scene
      {follow}
      {lockAxis}
    />
  </Canvas>
</div>

<Pane
  position="fixed"
  title="Billboard"
>
  <Checkbox
    bind:value={follow}
    label="follow"
  />
  <List
    bind:value={lockAxis}
    label="lockAxis"
    options={['x', 'y', 'z', 'none']}
  />
</Pane>

<style>
  div {
    height: 100%;
  }
</style>
