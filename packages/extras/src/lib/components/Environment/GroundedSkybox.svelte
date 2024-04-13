<script lang="ts">
  import { T } from '@threlte/core'
  import type { Texture } from 'three'
  import { GroundedSkybox } from 'three/examples/jsm/objects/GroundedSkybox.js'

  interface Props {
    map: Texture | undefined
  }

  let { map, ...props }: Props = $props()

  $effect(() => console.log(map, props))
</script>

{#if map}
  <T
    is={GroundedSkybox}
    args={[map]}
  />
{/if}
