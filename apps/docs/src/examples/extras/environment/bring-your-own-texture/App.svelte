<script lang="ts">
  import { Suspense } from '@threlte/extras'
  import Scene from './Scene.svelte'
  import { Canvas } from '@threlte/core'
</script>

<div>
  <Canvas>
    <Suspense>
      <Scene />
    </Suspense>
  </Canvas>
</div>

<style>
  div {
    height: 100%;
  }
</style>
