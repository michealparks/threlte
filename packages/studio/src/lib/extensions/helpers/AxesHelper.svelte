<script lang="ts">
  import { AxesHelper } from '@threlte/extras'
  import type { Line2 } from 'three/examples/jsm/lines/Line2.js'
  import { useStudioObjectsRegistry } from '../studio-objects-registry/useStudioObjectsRegistry.svelte'

  const { studioObjectRef } = useStudioObjectsRegistry()
  let axesHelper = $state(studioObjectRef<Line2>())

  interface Props {
    length?: number
    width?: number
    colors?: [string, string, string]
    opacity?: number
    overlay?: boolean
  }

  let { ...rest }: Props = $props()
</script>

<AxesHelper
  bind:ref={axesHelper.ref}
  userData={{ ignoreOverrideMaterial: true }}
  {...rest}
/>
