<script lang="ts">
  import { T, useTask } from '@threlte/core'
  import { BufferAttribute, BufferGeometry, LineSegments } from 'three'
  import { useRapier } from '../../hooks/useRapier'
  import type { DebugProps } from './types'

  let { ref = $bindable(new LineSegments()), ...props }: DebugProps = $props()

  const { world, debug } = useRapier()

  const geometry = new BufferGeometry()

  useTask(() => {
    const buffers = world.debugRender()

    const vertices = new BufferAttribute(buffers.vertices, 3)
    const colors = new BufferAttribute(buffers.colors, 4)

    geometry.setAttribute('position', vertices)
    geometry.setAttribute('color', colors)
  })

  debug.set(true)

  $effect.pre(() => {
    return () => debug.set(false)
  })
</script>

<T
  is={ref}
  frustumCulled={false}
  renderOrder={Infinity}
  {...props}
>
  <T is={geometry} />
  <T.LineBasicMaterial vertexColors />
</T>
