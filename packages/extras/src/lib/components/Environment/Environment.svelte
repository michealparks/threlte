<script lang="ts">
  import { useThrelte } from '@threlte/core'
  import EnvironmentGround from './EnvironmentGround.svelte'
  import EnvironmentMap from './EnvironmentMap.svelte'
  import EnvironmentPortal from './EnvironmentPortal.svelte'
  import EnvironmentCube from './EnvironmentCube.svelte'
  import type { EnvProps } from './Environment.svelte'

  let { ...props }: EnvProps = $props()

  const { scene } = useThrelte()
</script>

{#if props.groundProjection !== undefined}
  <EnvironmentGround
    {scene}
    {...props}
  />
{:else if props.map !== undefined}
  <EnvironmentMap
    {scene}
    {...props}
  />
{:else if props.children !== undefined}
  <EnvironmentPortal {...props} />
{:else}
  <EnvironmentCube
    {scene}
    {...props}
  />
{/if}
