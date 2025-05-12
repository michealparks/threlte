<script lang="ts">
  import { T } from '@threlte/core'
  import { PositionMesh } from './PositionMesh'
  import { useApi } from './api'
  import type { InstanceProps } from './types'
  import { useInstanceId } from './useInstanceId'

  let { id = useInstanceId(), ref = $bindable(), children, ...props }: InstanceProps = $props()

  const { addInstance, removeInstance, instancedMesh, instances } = useApi(id)

  const mesh = new PositionMesh(instancedMesh, instances)

  addInstance(mesh)

  $effect.pre(() => {
    return () => removeInstance(mesh)
  })
</script>

<T
  is={mesh}
  bind:ref
  {...props}
>
  {@render children?.({ ref: mesh })}
</T>
