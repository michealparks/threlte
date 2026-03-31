<script lang="ts">
  import { Text, Billboard } from '@threlte/extras'
  import { Tween } from 'svelte/motion'
  import { cubicOut } from 'svelte/easing'

  let {
    text,
    ondone,
  }: {
    text: string
    ondone: () => void
  } = $props()

  const motion = new Tween(0, { duration: 2000 })
  motion.target = 1

  const fade = new Tween(1, { duration: 1400 })
  fade.target = 0

  const y = $derived(0.6 + motion.current * 1.5)
  const opacity = $derived(Math.max(0, fade.current))

  let ref = $state<any>(undefined)

  $effect(() => {
    if (ref) {
      ref.renderOrder = 999
      if (ref.material) {
        ref.material.depthTest = false
        ref.material.needsUpdate = true
      }
    }
  })

  $effect(() => {
    if (fade.current <= 0.01) {
      ondone()
    }
  })
</script>

<Billboard>
  <Text
    bind:ref
    {text}
    fontSize={0.12}
    sdfGlyphSize={128}
    anchorX="center"
    anchorY="bottom"
    position.y={y}
    fillOpacity={opacity}
    color="#e8e8e8"
  />
</Billboard>
