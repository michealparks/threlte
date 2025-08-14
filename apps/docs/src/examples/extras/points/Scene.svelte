<script lang="ts">
  import { T } from '@threlte/core'
  import { OrbitControls, PerfMonitor } from '@threlte/extras'
  import Sphere from './Sphere.svelte'
  import Tunnel from './Tunnel.svelte'

  interface Props {
    levels: number
    model: string
  }

  let { levels, model = 'sphere' }: Props = $props()
</script>

<PerfMonitor />

<T.PerspectiveCamera
  makeDefault
  position={[0, 0, 8]}
>
  <OrbitControls />
</T.PerspectiveCamera>

{#if model === 'sphere'}
  <Sphere {levels} />
{:else if model === 'tunnel'}
  <Tunnel {levels} />
{/if}
