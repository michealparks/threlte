import type { Props } from '@threlte/core'
import type { Group, Object3D } from 'three'
import type { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'

export type TransformControlsProps = Props<Group> &
  Props<TransformControls> & {
    /**
     * Automatically pauses any Threlte extras camera controls
     *
     * @default true
     */
    autoPauseCameraControls?: boolean

    /**
     * @deprecated Use autoPauseCameraControls
     */
    autoPauseOrbitControls?: boolean

    /**
     * @deprecated Use autoPauseCameraControls
     */
    autoPauseTrackballControls?: boolean

    /**
     * An optional instance of a camera controls class,
     * which will be disabled when using the transform controls
     */
    cameraControls?: { enabled: boolean } & Record<string, unknown>

    object?: Object3D
    group?: Group
    controls?: TransformControls
  }
