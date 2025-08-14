<script lang="ts">
  import { Float32BufferAttribute } from 'three'
  import { T } from '@threlte/core'
  import { buildSizesAndThresholds, voxelSimplifyPoints } from './voxel'
  import PointsMaterial from './material.svelte'
  import Detailed from '../Detailed/Detailed.svelte'

  interface Props {
    positions: Float32Array
    colors?: Float32Array

    levels?: number
    voxelFactor?: number
    baseDistanceFactor?: number
    hysteresis?: number
  }

  let { positions, colors, levels, voxelFactor, baseDistanceFactor, hysteresis }: Props = $props()

  const size = 0.01
  const sizeAttenuation = true

  const { voxelSizes, thresholds } = $derived(
    buildSizesAndThresholds({
      positions,
      pointSize: size,
      sizeAttenuation,
      levels,
      voxelFactor,
      baseDistanceFactor
    })
  )

  type Data = { positions: Float32Array; colors?: Float32Array; threshold: number }

  const LODs = $derived.by<Data[]>(() => {
    const results: Data[] = []

    for (let i = 0, l = voxelSizes.length; i < l; i += 1) {
      const [filteredPositions, filteredColors] = voxelSimplifyPoints(
        positions,
        colors,
        voxelSizes[i]
      )

      results.push({
        positions: filteredPositions,
        colors: filteredColors,
        threshold: thresholds[i]
      })
    }
    return results
  })
</script>

<Detailed>
  {#each LODs as { threshold, colors, positions } (threshold)}
    <T.Points
      distance={threshold}
      {hysteresis}
    >
      <T.BufferGeometry
        oncreate={(ref) => {
          ref.setAttribute('position', new Float32BufferAttribute(positions, 3))

          if (colors) {
            ref.setAttribute('color', new Float32BufferAttribute(colors, 3))
          }
        }}
      />
      <PointsMaterial
        vertexColors={colors !== undefined}
        {size}
        {sizeAttenuation}
        toneMapped={false}
      />
    </T.Points>
  {/each}
</Detailed>
