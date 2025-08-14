<script lang="ts">
  import { Points } from '@threlte/extras'
  import { generateVertexColors, generateSpherePoints } from './points'

  interface Props {
    levels: number
  }

  let { levels }: Props = $props()

  const count = 3_000_000
  const radius = 2
  const positions = $derived(generateSpherePoints(count, radius))
  const colors = $derived(generateVertexColors(positions, radius, 'red', 'blue'))
</script>

<Points
  {positions}
  {colors}
  {levels}
/>
