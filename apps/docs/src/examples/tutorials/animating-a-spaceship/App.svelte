<script>
  import { Canvas } from '@threlte/core'
  import Scene from './Scene.svelte'
  import { Suspense } from '@threlte/extras'
</script>

<div>
  <Canvas autoRender={false}>
    <Suspense>
      <Scene />
    </Suspense>
  </Canvas>
</div>

<style>
  div {
    width: 100%;
    height: 100%;
  }
</style>
