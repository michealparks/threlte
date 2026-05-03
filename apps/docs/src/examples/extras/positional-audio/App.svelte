<script lang="ts">
  import { Canvas } from '@threlte/core'
  import { Suspense } from '@threlte/extras'
  import Scene from './Scene.svelte'
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
