<script lang="ts">
  import { Canvas } from '@threlte/core'

  import Scene from './Scene.svelte'
  import Settings from './Settings.svelte'

  let staticMoving: boolean = $state(false)
  let noRotate: boolean = $state(false)
  let rotateSpeed: number = $state(1)
  let noZoom: boolean = $state(false)
  let zoomSpeed: number = $state(1.2)
  let noPan: boolean = $state(false)
  let panSpeed: number = $state(0.3)
</script>

<div>
  <Canvas>
    <Scene
      {staticMoving}
      {noRotate}
      {rotateSpeed}
      {noZoom}
      {zoomSpeed}
      {noPan}
      {panSpeed}
    />
  </Canvas>
</div>

<Settings
  bind:staticMoving
  bind:noRotate
  bind:rotateSpeed
  bind:noZoom
  bind:zoomSpeed
  bind:noPan
  bind:panSpeed
/>

<style>
  div {
    position: relative;
    height: 100%;
    width: 100%;
    background-color: rgb(14, 22, 37);
  }
</style>
