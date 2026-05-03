<script lang="ts">
  import { Canvas } from '@threlte/core'
  import Scene from './Scene.svelte'
  import { Suspense } from '@threlte/extras'
</script>

<div>
  <Canvas>
    <Suspense>
      <Scene />
    </Suspense>
  </Canvas>
  <ul>
    <li>Press <b>S</b> to toggle scope mode.</li>
    <li><b>Mousewheel</b> or <b>A/D</b> to adjust zoom level.</li>
  </ul>
</div>

<style>
  ul {
    position: absolute;
    top: 1rem;
    left: 1rem;
  }
  div {
    height: 100%;
  }
</style>
