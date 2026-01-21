import { useThrelte } from '@threlte/core'
import { fromStore } from 'svelte/store'
import * as THREE from 'three'

export interface UseFollowCamProps {
  disableFollowCam: boolean
  disableFollowCamPos: { x: number; y: number; z: number } | null
  disableFollowCamTarget?: { x: number; y: number; z: number } | null
  camInitDis: number
  camMaxDis: number
  camMinDis: number
  camUpLimit: number
  camLowLimit: number
  camInitDir: { x: number; y: number }
  camMoveSpeed: number
  camZoomSpeed: number
  camCollisionOffset: number
  camCollisionSpeedMult: number
}

export const useFollowCamera = function (props: () => UseFollowCamProps) {
  const _props = $derived(props())

  const { scene, camera: cameraStore, dom } = useThrelte()

  const camera = fromStore(cameraStore)

  let previousTouch1: Touch | null = null
  let previousTouch2: Touch | null = null

  let originZDis = $derived<number>(_props.camInitDis ?? -5)

  const pivot = new THREE.Object3D()
  const followCam = new THREE.Object3D()

  followCam.position.set(
    0,
    originZDis * Math.sin(-_props.camInitDir.x),
    originZDis * Math.cos(-_props.camInitDir.x)
  )

  /** Camera collison detect setups */
  let smallestDistance = null
  let cameraDistance = null
  let intersects = null

  let intersectObjects = $state<THREE.Object3D[]>([])

  const cameraRayDir = new THREE.Vector3()
  const cameraRayOrigin = new THREE.Vector3()
  const cameraPosition = new THREE.Vector3()
  const camLerpingPoint = new THREE.Vector3()
  const camRayCast = new THREE.Raycaster(cameraRayOrigin, cameraRayDir, 0, -_props.camMaxDis)

  let isMouseDown = false

  // Mouse move event
  const onDocumentMouseMove = (e: MouseEvent) => {
    if (document.pointerLockElement || isMouseDown) {
      pivot.rotation.y -= e.movementX * 0.002 * _props.camMoveSpeed
      const vy = followCam.rotation.x + e.movementY * 0.002 * _props.camMoveSpeed

      cameraDistance = followCam.position.length()

      if (vy >= _props.camLowLimit && vy <= _props.camUpLimit) {
        followCam.rotation.x = vy
        followCam.position.y = -cameraDistance * Math.sin(-vy)
        followCam.position.z = -cameraDistance * Math.cos(-vy)
      }
    }

    return false
  }

  // Mouse scroll event
  const onDocumentMouseWheel = (e: Event) => {
    const vz = originZDis - (e as WheelEvent).deltaY * 0.002 * _props.camZoomSpeed
    const vy = followCam.rotation.x

    if (vz >= _props.camMaxDis && vz <= _props.camMinDis) {
      originZDis = vz
      followCam.position.z = originZDis * Math.cos(-vy)
      followCam.position.y = originZDis * Math.sin(-vy)
    }

    return false
  }

  /**
   * Touch events
   */
  // Touch end event
  const onTouchEnd = () => {
    previousTouch1 = null
    previousTouch2 = null
  }

  // Touch move event
  const onTouchMove = (event: TouchEvent) => {
    // prevent swipe to navigate gesture
    event.preventDefault()
    event.stopImmediatePropagation()

    const touch1 = event.targetTouches[0]
    const touch2 = event.targetTouches[1]

    // One finger touch to rotate camera
    if (previousTouch1 && !previousTouch2) {
      const touch1MovementX = touch1.pageX - previousTouch1.pageX
      const touch1MovementY = touch1.pageY - previousTouch1.pageY

      pivot.rotation.y -= touch1MovementX * 0.005 * _props.camMoveSpeed
      const vy = followCam.rotation.x + touch1MovementY * 0.005 * _props.camMoveSpeed

      cameraDistance = followCam.position.length()

      if (vy >= _props.camLowLimit && vy <= _props.camUpLimit) {
        followCam.rotation.x = vy
        followCam.position.y = -cameraDistance * Math.sin(-vy)
        followCam.position.z = -cameraDistance * Math.cos(-vy)
      }
    }

    // Two fingers touch to zoom in/out camera
    if (previousTouch1 && previousTouch2) {
      const prePinchDis = Math.hypot(
        previousTouch1.pageX - previousTouch2.pageX,
        previousTouch1.pageY - previousTouch2.pageY
      )
      const pinchDis = Math.hypot(
        event.touches[0].pageX - event.touches[1].pageX,
        event.touches[0].pageY - event.touches[1].pageY
      )

      const vz = originZDis - (prePinchDis - pinchDis) * 0.01 * _props.camZoomSpeed
      const vy = followCam.rotation.x

      if (vz >= _props.camMaxDis && vz <= _props.camMinDis) {
        originZDis = vz
        followCam.position.z = originZDis * Math.cos(-vy)
        followCam.position.y = originZDis * Math.sin(-vy)
      }
    }

    previousTouch1 = touch1
    previousTouch2 = touch2
  }

  /**
   * Custom traverse function
   */
  // Prepare intersect objects for camera collision
  function customTraverseAdd(object: THREE.Object3D) {
    // Chekc if the object's userData camExcludeCollision is true
    if (object.userData && object.userData.camExcludeCollision === true) {
      return
    }

    // Check if the object is a Mesh, and is visible
    if ((object as THREE.Mesh).isMesh && (object as THREE.Mesh).visible) {
      intersectObjects.push(object)
    }

    // Recursively traverse child objects
    object.children.forEach((child) => {
      customTraverseAdd(child) // Continue the traversal for all child objects
    })
  }

  // Remove intersect objects from camera collision array
  function customTraverseRemove(object: THREE.Object3D) {
    intersectObjects = intersectObjects.filter(
      (item) => item.uuid !== object.uuid // Keep all items except the one to remove
    )

    // Recursively traverse child objects
    object.children.forEach((child) => {
      customTraverseRemove(child) // Continue the traversal for all child objects
    })
  }

  /**
   * Camera collision detection function
   */
  const cameraCollisionDetect = (delta: number) => {
    // Update collision detect ray origin and pointing direction
    // Which is from pivot point to camera position
    cameraRayOrigin.copy(pivot.position)
    camera.current.getWorldPosition(cameraPosition)
    cameraRayDir.subVectors(cameraPosition, pivot.position)

    // casting ray hit, if object in between character and camera,
    // change the smallestDistance to the ray hit toi
    // otherwise the smallestDistance is same as camera original position (originZDis)
    intersects = camRayCast.intersectObjects(intersectObjects)
    if (intersects.length && intersects[0].distance <= -originZDis) {
      smallestDistance = Math.min(
        -intersects[0].distance * _props.camCollisionOffset,
        _props.camMinDis
      )
    } else {
      smallestDistance = originZDis
    }

    // Update camera next lerping position, and lerp the camera
    camLerpingPoint.set(
      followCam.position.x,
      smallestDistance * Math.sin(-followCam.rotation.x),
      smallestDistance * Math.cos(-followCam.rotation.x)
    )

    followCam.position.lerp(camLerpingPoint, 1 - Math.exp(-_props.camCollisionSpeedMult * delta)) // delta * 2 for rapier ray setup
  }

  $effect(() => {
    // Initialize camera facing direction
    pivot.rotation.y = _props.camInitDir.y
    followCam.rotation.x = _props.camInitDir.x

    // Prepare for followCam and pivot point
    pivot.add(followCam)
    scene.add(pivot)

    // Prepare for camera ray intersect objects
    // scene.children.forEach((child) => customTraverseAdd(child))

    const onMouseDown = () => {
      isMouseDown = true
    }
    const onMouseUp = () => {
      isMouseDown = false
    }

    dom.addEventListener('mousedown', onMouseDown)
    dom.addEventListener('mouseup', onMouseUp)
    dom.addEventListener('mousemove', onDocumentMouseMove)
    dom.addEventListener('mousewheel', onDocumentMouseWheel)
    dom.addEventListener('touchend', onTouchEnd)
    dom.addEventListener('touchmove', onTouchMove, { passive: false })

    return () => {
      dom.removeEventListener('mousedown', onMouseDown)
      dom.removeEventListener('mouseup', onMouseUp)
      dom.removeEventListener('mousemove', onDocumentMouseMove)
      dom.removeEventListener('mousewheel', onDocumentMouseWheel)
      dom.removeEventListener('touchend', onTouchEnd)
      dom.removeEventListener('touchmove', onTouchMove)
    }
  })

  // If followCam is disabled set to disableFollowCamPos, target to disableFollowCamTarget
  $effect(() => {
    if (!_props.disableFollowCam) {
      return
    }

    if (_props.disableFollowCamPos) {
      camera.current.position.set(
        _props.disableFollowCamPos.x,
        _props.disableFollowCamPos.y,
        _props.disableFollowCamPos.z
      )
    }

    if (_props.disableFollowCamTarget) {
      camera.current.lookAt(
        new THREE.Vector3(
          _props.disableFollowCamTarget.x,
          _props.disableFollowCamTarget.y,
          _props.disableFollowCamTarget.z
        )
      )
    }
  })

  // Handle scene add/remove objects events
  $effect(() => {
    return
    const onObjectAdded = (event: any) => customTraverseAdd(event.child)
    const onObjectRemoved = (event: any) => customTraverseRemove(event.child)

    scene.addEventListener('childadded', onObjectAdded)
    scene.addEventListener('childremoved', onObjectRemoved)

    return () => {
      scene.removeEventListener('childadded', onObjectAdded)
      scene.removeEventListener('childremoved', onObjectRemoved)
    }
  })

  return { pivot, followCam, cameraCollisionDetect }
}
