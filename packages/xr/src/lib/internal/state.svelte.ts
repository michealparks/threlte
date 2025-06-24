import type { Intersection } from 'three'
import { currentWritable } from '@threlte/core'

export const teleportIntersection = {
  left: currentWritable<undefined | Intersection>(undefined),
  right: currentWritable<undefined | Intersection>(undefined)
}

export const pointerState = currentWritable({
  left: {
    enabled: false,
    hovering: false
  },
  right: {
    enabled: false,
    hovering: false
  }
})

export const pointerIntersection = {
  left: currentWritable<undefined | Intersection>(undefined),
  right: currentWritable<undefined | Intersection>(undefined)
}
