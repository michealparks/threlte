import type { Events, Props, Slots } from '@threlte/core'
import { SvelteComponent } from 'svelte'
import type { Camera, Group, Object3D } from 'three'

type PointerEventsProperties =
  | 'auto'
  | 'none'
  | 'visiblePainted'
  | 'visibleFill'
  | 'visibleStroke'
  | 'visible'
  | 'painted'
  | 'fill'
  | 'stroke'
  | 'all'
  | 'inherit'

interface Propssss extends Props<Group> {
  prepend?: boolean
  center?: boolean
  fullscreen?: boolean
  eps?: number
  portal?: HTMLElement
  distanceFactor?: number
  sprite?: boolean
  transform?: boolean
  zIndexRange?: Array<number>
  calculatePosition?: CalculatePosition
  as?: string
  wrapperClass?: string
  pointerEvents?: PointerEventsProperties

  // Occlusion based off work by Jerome Etienne and James Baicoianu
  // https://www.youtube.com/watch?v=ScZcUEDGjJI
  // as well as Joe Pea in CodePen: https://codepen.io/trusktr/pen/RjzKJx
  occlude?: Object3D[] | boolean | 'raycast' | 'blending'
  onOcclude?: (visible: boolean) => null
  material?: THREE.Material // Material for occlusion plane
  geometry?: THREE.BufferGeometry // Material for occlusion plane
  castShadow?: boolean // Cast shadow for occlusion plane
  receiveShadow?: boolean // Receive shadow for occlusion plane
}

export type HTMLProps = Props<Group> & {
  transform?: boolean
  calculatePosition?: (
    obj: Object3D,
    camera: Camera,
    size: { width: number; height: number }
  ) => [number, number]
  eps?: number
  occlude?: boolean | Object3D[]
  zIndexRange?: [number, number]
  sprite?: boolean
  pointerEvents?:
    | 'auto'
    | 'none'
    | 'visiblePainted'
    | 'visibleFill'
    | 'visibleStroke'
    | 'visible'
    | 'painted'
    | 'fill'
    | 'stroke'
    | 'all'
    | 'inherit'
  center?: boolean
  fullscreen?: boolean
  distanceFactor?: number
  as?: keyof HTMLElementTagNameMap
  portal?: HTMLElement
}

export type HTMLEvents = Events<Group>

export type HTMLSlots = {
  threlte: Slots<Group>['default']
  // eslint-disable-next-line @typescript-eslint/ban-types
  default: {}
}

export default class HTML extends SvelteComponent<HTMLProps, HTMLEvents, HTMLSlots> {}
