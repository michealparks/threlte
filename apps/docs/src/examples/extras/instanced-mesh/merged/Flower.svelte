<script lang="ts">
  import { T } from '@threlte/core'

  let { children, ...rest } = $props()
</script>

<T.Group {...rest}>
  <!-- Correct rotation -->
  <T.Group rotation.x={(90 * Math.PI) / 180}>
    {@render children?.()}
  </T.Group>
</T.Group>
