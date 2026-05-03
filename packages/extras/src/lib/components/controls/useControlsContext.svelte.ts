import { useThrelteUserContext } from '@threlte/core'
import CameraControls from 'camera-controls'
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'

interface ControlsContext {
  orbitControls: {
    readonly current: OrbitControls | undefined
    set(value?: OrbitControls | undefined): void
  }
  trackballControls: {
    readonly current: TrackballControls | undefined
    set(value?: TrackballControls | undefined): void
  }
  cameraControls: {
    readonly current: CameraControls | undefined
    set(value?: CameraControls | undefined): void
  }
}

/**
 * ### `useControlsContext`
 *
 * This hook is used to register the `OrbitControls` or `TrackballControls instance
 * with the `ControlsContext`. We're using this context to enable and disable the
 * controls when the user is interacting with the TransformControls.
 */
export const useControlsContext = (): ControlsContext => {
  let orbitControls = $state<OrbitControls>()
  let trackballControls = $state<TrackballControls>()
  let cameraControls = $state<CameraControls>()

  return useThrelteUserContext<ControlsContext>('threlte-controls', {
    orbitControls: {
      get current() {
        return orbitControls
      },
      set(value) {
        orbitControls = value
      }
    },
    trackballControls: {
      get current() {
        return trackballControls
      },
      set(value) {
        trackballControls = value
      }
    },
    cameraControls: {
      get current() {
        return cameraControls
      },
      set(value) {
        cameraControls = value
      }
    }
  })
}
