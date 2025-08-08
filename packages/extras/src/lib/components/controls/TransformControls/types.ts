import type { Props } from '@threlte/core'
import type { Group, Object3D } from 'three'
import type { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'

export type TransformControlsProps = Props<Group> &
  Props<TransformControls> & {
    /**
     * @default true
     */
    autoPauseControls?: boolean

    object?: Object3D
    group?: Group
    controls?: TransformControls
  }
