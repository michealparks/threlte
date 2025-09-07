import type { Props } from '@threlte/core'
import type { Group, Object3D } from 'three'
import type { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'

type RemoveIndexSignature<T> = {
  [K in keyof T as string extends K
    ? never
    : number extends K
      ? never
      : symbol extends K
        ? never
        : K]: T[K]
}

export type TransformControlsProps = Omit<
  RemoveIndexSignature<Props<TransformControls>>,
  'oncreate' | 'children'
> &
  Props<Group> & {
    /**
     * Automatically pauses any Threlte extras camera controls
     *
     * @default true
     */
    autoPauseCameraControls?: boolean

    /**
     * @removed Use autoPauseCameraControls
     */
    autoPauseOrbitControls?: never

    /**
     * @removed Use autoPauseCameraControls
     */
    autoPauseTrackballControls?: never

    /**
     * An optional instance of a camera controls class,
     * which will be disabled when using the transform controls
     */
    cameraControls?: { enabled: boolean } & Record<string, unknown>

    object?: Object3D
    group?: Group
    controls?: TransformControls
  }
