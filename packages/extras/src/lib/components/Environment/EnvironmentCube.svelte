<script lang="ts">
  import type { EnvProps } from './Environment.svelte'
  import { setEnvProps } from './utils'
  import type { Scene } from 'three'
  import { useEnvironment } from './useEnvironment'

  let {
    isBackground = false,
    scene,
    backgroundBlurriness,
    backgroundIntensity,
    backgroundRotation,
    environmentIntensity,
    environmentRotation,
    ...props
  }: EnvProps & { scene: Scene } = $props()

  const { loadEnvironment } = useEnvironment()

  let texture = $derived(loadEnvironment(props))

  $effect.pre(() => {
    if (!$texture) return
    return setEnvProps(isBackground, scene, $texture, {
      backgroundBlurriness,
      backgroundIntensity,
      backgroundRotation,
      environmentIntensity,
      environmentRotation
    })
  })
</script>
