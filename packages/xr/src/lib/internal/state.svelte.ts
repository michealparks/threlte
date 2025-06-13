import type { WebXRManager, Intersection } from 'three'
import type { XRControllerEvents, XRHandEvents } from '../types'

class XrState {
  isPresenting = $state(false)
  isHandTracking = $state(false)

  session = $state.raw<XRSession>()
  referenceSpaceType = $state.raw<XRReferenceSpaceType>()
  xr = $state.raw<WebXRManager>()
}

class ControllerEvents {
  left = $state.raw<XRControllerEvents>()
  right = $state.raw<XRControllerEvents>()
}

class HandEvents {
  left = $state.raw<XRHandEvents>()
  right = $state.raw<XRHandEvents>()
}

class TeleportState {
  left = $state({
    enabled: false,
    hovering: false
  })
  right = $state({
    enabled: false,
    hovering: false
  })
}

class TeleportIntersection {
  left = $state.raw<Intersection>()
  right = $state.raw<Intersection>()
}

class PointerState {
  left = $state({
    enabled: false,
    hovering: false
  })
  right = $state({
    enabled: false,
    hovering: false
  })
}

class PointerIntersection {
  left = $state<Intersection>()
  right = $state<Intersection>()
}

export const xrState = new XrState()
export const controllerEvents = new ControllerEvents()
export const handEvents = new HandEvents()
export const teleportState = new TeleportState()
export const teleportIntersection = new TeleportIntersection()
export const pointerState = new PointerState()
export const pointerIntersection = new PointerIntersection()
