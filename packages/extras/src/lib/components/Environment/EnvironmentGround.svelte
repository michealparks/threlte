<script lang="ts">
  import type { Scene } from 'three'
  import type { EnvProps } from './Environment'
  import EnvironmentMap from './EnvironmentMap.svelte'
  import GroundedSkybox from './GroundedSkybox.svelte'
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
<GroundedSkybox
  map={$texture}
  {...props}
  {...groundProjection}
/>
