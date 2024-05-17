<script lang="ts">
  import HierarchicalObject from './HierarchicalObject.svelte'
  import type { Object3D } from 'three'

  interface Props {
    object: Object3D
  }

  let { object }: Props = $props()
</script>

<HierarchicalObject
  {object}
  onChildMount={(child) => object.add(child)}
  onChildDestroy={(child) => object.remove(child)}
>
  <slot />
</HierarchicalObject>
