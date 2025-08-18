import type { ColorRepresentation } from 'three'
import type { Props } from '@threlte/core'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'

export interface AxesHelperProps extends Props<Line2> {
  length?: number
  width?: number
  colors?: [ColorRepresentation, ColorRepresentation, ColorRepresentation]
  opacity?: number
  overlay?: boolean
}
