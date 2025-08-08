import { useThrelteUserContext } from '@threlte/core'
import CameraControls from 'camera-controls'
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'

type ControlsContext = {
  orbit?: OrbitControls
  trackball?: TrackballControls
  camera?: CameraControls
}

/**
 * This hook is used to register the `OrbitControls`, `TrackballControls`, or `CameraControls` instance
 * with the `ControlsContext`. We're using this context to enable and disable the
 * controls when the user is interacting with the TransformControls.
 */
export const useControlsContext = (): ControlsContext => {
  class Controls {
    orbit = $state.raw<OrbitControls>()
    trackball = $state.raw<TrackballControls>()
    camera = $state.raw<CameraControls>()
  }

  return useThrelteUserContext<ControlsContext>('threlte-controls', new Controls())
}
