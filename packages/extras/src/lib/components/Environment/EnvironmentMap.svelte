<script lang="ts">
  import type { Scene } from 'three'
  import type { EnvProps } from './Environment.svelte'
  import { setEnvProps } from './utils'

  let { isBackground = false, scene, map, ...props }: EnvProps & { scene: Scene } = $props()

  $effect.pre(() => {
    if (!map) return
    return setEnvProps(isBackground, scene, map, props)
  })
</script>
