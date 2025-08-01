<script
  module
  lang="ts"
>
  import { Group, Matrix3, Vector3 } from 'three'

  const vec3 = new Vector3()
  const normalMatrix = new Matrix3()
  const worldNormal = new Vector3()
</script>

<script lang="ts">
  import { Spring } from 'svelte/motion'
  import { T, useTask, useThrelte } from '@threlte/core'
  import { teleportIntersection } from '../../internal/stores'
  import Cursor from './Cursor.svelte'
  import type { Snippet } from 'svelte'

  interface Props {
    handedness: 'left' | 'right'
    children?: Snippet
  }

  const { handedness, children }: Props = $props()

  const { scene } = useThrelte()
  const ref = new Group()
  const intersection = $derived(teleportIntersection[handedness])

  const { start, stop } = useTask(
    () => {
      if (intersection.current === undefined) {
        return
      }

      const { point, face, object } = intersection.current
      ref.position.lerp(point, 0.4)

      if (face) {
        normalMatrix.getNormalMatrix(object.matrixWorld)
        worldNormal.copy(face.normal).applyMatrix3(normalMatrix).normalize()
        ref.lookAt(vec3.addVectors(point, worldNormal))
      }
    },
    {
      autoStart: false
    }
  )

  const size = new Spring(0.1, { stiffness: 0.2 })

  $effect.pre(() => {
    if ($intersection === undefined) {
      size.set(0.1)
      stop()
    } else {
      size.set(1)
      ref.position.copy($intersection.point)
      start()
    }
  })
</script>

<T
  is={ref}
  attach={scene}
  visible={$intersection !== undefined}
>
  {#if children}
    {@render children()}
  {:else}
    <Cursor
      size={size.current}
      thickness={0.015}
    />
  {/if}
</T>
