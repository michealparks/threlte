<script lang="ts">
  import type { Scene } from 'three'
  import type { EnvProps } from './Environment.svelte'
  import EnvironmentMap from './EnvironmentMap.svelte'
  import GroundProjectedSkybox from './GroundProjectedSkybox.svelte'
  import { useEnvironment } from './useEnvironment'

  let { groundProjection, scene, ...props }: EnvProps & { scene: Scene } = $props()

  const { loadEnvironment } = useEnvironment()

  let texture = $derived(loadEnvironment(props))
</script>

<EnvironmentMap
  map={$texture}
  {scene}
  {...props}
/>
<GroundProjectedSkybox
  map={$texture}
  {...props}
  {...groundProjection}
/>
