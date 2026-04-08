import type { Props } from '@threlte/core'
import type { ColorRepresentation, Euler, Quaternion, Vector3 } from 'three'
import type { InstancedMesh as ThreeInstancedMesh } from 'three'

export type InstanceRef = {
  position: Vector3
  rotation: Euler
  quaternion: Quaternion
  scale: Vector3
  color: import('three').Color
  index: number
}

export type InstanceProps = {
  id?: string
  color?: ColorRepresentation
  ref?: InstanceRef
  children?: import('svelte').Snippet<[{ ref: InstanceRef }]>
  // Transform props (direct or pierced)
  position?: Parameters<Vector3['set']> | Vector3
  'position.x'?: number
  'position.y'?: number
  'position.z'?: number
  rotation?: Parameters<Euler['set']> | Euler
  'rotation.x'?: number
  'rotation.y'?: number
  'rotation.z'?: number
  scale?: Parameters<Vector3['set']> | Vector3 | number
  'scale.x'?: number
  'scale.y'?: number
  'scale.z'?: number
  // Event handlers
  onclick?: (event: any) => void
  ondblclick?: (event: any) => void
  oncontextmenu?: (event: any) => void
  onpointerup?: (event: any) => void
  onpointerdown?: (event: any) => void
  onpointerover?: (event: any) => void
  onpointerout?: (event: any) => void
  onpointerenter?: (event: any) => void
  onpointerleave?: (event: any) => void
  onpointermove?: (event: any) => void
  onpointermissed?: (event: any) => void
  // Allow arbitrary pierced props
  [key: string]: any
}

export type InstancedMeshProps = Props<ThreeInstancedMesh> & {
  /**
   * @default 'default'
   */
  id?: string

  /**
   * @default 1000
   */
  limit?: number

  /**
   * @default 1000
   */
  range?: number

  /**
   * @deprecated This prop has no effect. Instances now update their transforms directly.
   */
  update?: boolean
}
