<script lang="ts">
  import { Color } from 'three'
  import { T, useThrelte } from '@threlte/core'
  import { Line2 } from 'three/examples/jsm/lines/Line2.js'
  import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
  import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
  import type { AxesHelperProps } from './types'

  let {
    length = 2,
    width = 1,
    colors = ['red', 'green', 'blue'],
    opacity = 1,
    overlay = false,
    ref = $bindable(),
    children,
    ...rest
  }: AxesHelperProps = $props()

  const { invalidate } = useThrelte()

  const color = new Color()
  const lineGeometry = new LineGeometry()
  const lineMaterial = new LineMaterial()

  const line2 = new Line2(lineGeometry, lineMaterial)
  const positions = new Float32Array(27)
  const colorArray = new Float32Array(27)

  $effect.pre(() => {
    positions[3] = positions[13] = positions[23] = length
    lineGeometry.setPositions(positions)
    line2.computeLineDistances()
    invalidate()
  })

  $effect.pre(() => {
    colors.forEach((axis, i) => {
      color.set(axis)
      for (let j = i * 9; j < i * 9 + 9; j += 3) {
        colorArray[j + 0] = color.r
        colorArray[j + 1] = color.g
        colorArray[j + 2] = color.b
      }
    })
    lineGeometry.setColors(colorArray)
    invalidate()
  })
</script>

<T
  is={line2}
  bind:ref
  renderOrder={overlay ? Number.POSITIVE_INFINITY : undefined}
  {...rest}
>
  <T is={lineGeometry} />
  <T
    is={lineMaterial}
    {opacity}
    vertexColors
    linewidth={width}
    transparent={overlay || opacity < 1}
  />
  {@render children?.({ ref: line2 })}
</T>
