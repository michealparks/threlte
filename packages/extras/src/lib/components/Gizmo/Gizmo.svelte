<script lang="ts">
  import { HierarchicalObject, T, useTask, useThrelte } from '@threlte/core'
  import { onMount } from 'svelte'
  import {
    CapsuleGeometry,
    Euler,
    Object3D,
    OrthographicCamera,
    Quaternion,
    Raycaster,
    Scene,
    Sprite,
    Vector2,
    Vector3,
    Vector4,
    type Intersection
  } from 'three'
  import type { GizmoEvents, GizmoProps, GizmoSlots } from './Gizmo'
  import { getSpriteTexture } from './getSpriteTexture'

  type $$Props = GizmoProps
  type $$Events = GizmoEvents
  type $$Slots = GizmoSlots

  export let renderTask: $$Props['renderTask'] = undefined
  export let animationTask: $$Props['animationTask'] = undefined

  export let turnRate: Required<$$Props>['turnRate'] = 2 * Math.PI
  export let center: Required<$$Props>['center'] = [0, 0, 0]
  export let verticalPlacement: Required<$$Props>['verticalPlacement'] = 'bottom'
  export let horizontalPlacement: Required<$$Props>['horizontalPlacement'] = 'right'
  export let size: Required<$$Props>['size'] = 128
  export let xColor: Required<$$Props>['xColor'] = 0xff3653
  export let yColor: Required<$$Props>['yColor'] = 0x8adb00
  export let zColor: Required<$$Props>['zColor'] = 0x2c8fff
  export let toneMapped: Required<$$Props>['toneMapped'] = false
  export let paddingX: Required<$$Props>['paddingX'] = 0
  export let paddingY: Required<$$Props>['paddingY'] = 0

  const centerVec = new Vector3(center[0], center[1], center[2])
  $: centerVec.set(center[0], center[1], center[2])

  const { autoRenderTask, renderer, camera, invalidate } = useThrelte()

  // invalidate the frame when any of the following values change
  $: size, horizontalPlacement, verticalPlacement, toneMapped, paddingX, paddingY, invalidate()

  const orthoCam = new OrthographicCamera(-1.25, 1.25, 1.25, -1.25, 0, 4)
  orthoCam.position.set(0, 0, 2)

  const root = new Scene()

  const viewport = new Vector4()

  useTask(
    renderTask?.key ?? Symbol('threlte-extras-gizmo-render'),
    () => {
      const { autoClear, toneMapping } = renderer
      renderer.autoClear = false
      renderer.getViewport(viewport)
      renderer.toneMapping = toneMapped ? renderer.toneMapping : 0

      const x =
        horizontalPlacement === 'left'
          ? paddingX
          : renderer.domElement.offsetWidth - size - paddingX
      const y =
        verticalPlacement === 'bottom'
          ? paddingY
          : renderer.domElement.offsetHeight - size - paddingY

      renderer.setViewport(x, y, size, size)
      renderer.render(root, orthoCam)
      renderer.setViewport(viewport.x, viewport.y, viewport.z, viewport.w)
      renderer.autoClear = autoClear
      renderer.toneMapping = toneMapping
    },
    {
      ...(renderTask ?? { after: autoRenderTask }),
      autoInvalidate: false
    }
  )

  // User interaction must be handled manually because
  // the gizmo is not in the main scene. The click
  // target is added as a sibling of the renderer's
  // dom element.
  const clickTarget = document.createElement('div')
  // We need to know the bounding rect of the renderer's dom element
  const renderTarget = renderer.domElement
  const boundingRect = renderTarget.getBoundingClientRect()

  clickTarget.style.position = 'absolute'
  $: {
    if (horizontalPlacement === 'right') {
      clickTarget.style.right = ''
      clickTarget.style.left = `${boundingRect.right - size - paddingX}px`
    } else {
      clickTarget.style.right = ''
      clickTarget.style.left = `${paddingX + boundingRect.left}px`
    }

    if (verticalPlacement === 'bottom') {
      clickTarget.style.bottom = ''
      clickTarget.style.top = `${boundingRect.bottom - size - paddingY}px`
    } else {
      clickTarget.style.bottom = ''
      clickTarget.style.top = `${paddingY + boundingRect.top}px`
    }

    clickTarget.style.height = `${size}px`
    clickTarget.style.width = `${size}px`
  }

  let posX: Sprite
  let posY: Sprite
  let posZ: Sprite
  let negX: Sprite
  let negY: Sprite
  let negZ: Sprite

  const targetPosition = new Vector3()
  const targetQuaternion = new Quaternion()
  const currentQuaternion = new Quaternion()
  const finalQuaternion = new Quaternion()
  let radius = 0

  let animating = false
  const mouse = new Vector2()
  const raycaster = new Raycaster()

  /**
   * Floating point operations make it hard to compare quaternions, controls
   * (such as the OrbitControls) may also restrict the rotation of the camera on
   * certain axes. To allow for loose equality checks, we use a sensible
   * threshold to compare quaternions.
   *
   * @param a - Quaternion a
   * @param b - Quaternion b
   * @param threshold - Threshold to use for comparison
   */
  const quaternionsAreEqual = (a: Quaternion, b: Quaternion, threshold: number) => {
    const delta =
      Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z) + Math.abs(a.w - b.w)
    return delta < threshold
  }

  const dummy = new Object3D()

  /**
   * @returns boolean that indicates if the target and the current rotation are equal.
   */
  const handleIntersection = (intersection: Intersection<Object3D>): boolean => {
    const { object } = intersection
    const targetPos = object.userData.targetPosition as [number, number, number]
    const targetEuler = object.userData.targetEuler as [number, number, number]

    radius = camera.current.position.distanceTo(centerVec)
    targetPosition.fromArray(targetPos).multiplyScalar(radius).add(centerVec)
    targetQuaternion.setFromEuler(new Euler().fromArray(targetEuler))

    dummy.position.copy(centerVec)

    dummy.lookAt(camera.current.position)
    currentQuaternion.copy(dummy.quaternion)

    dummy.lookAt(targetPosition)
    finalQuaternion.copy(dummy.quaternion)

    if (quaternionsAreEqual(finalQuaternion, currentQuaternion, 0.0001)) {
      return true
    }

    animating = true
    return false
  }

  const handleClick = (event: MouseEvent) => {
    if (animating) {
      return
    }

    // Raycasting is done manually.
    const rect = clickTarget.getBoundingClientRect()
    const offsetX = rect.left + (clickTarget.offsetWidth - size)
    const offsetY = rect.top + (clickTarget.offsetHeight - size)
    mouse.x = ((event.clientX - offsetX) / (rect.right - offsetX)) * 2 - 1
    mouse.y = -((event.clientY - offsetY) / (rect.bottom - offsetY)) * 2 + 1

    raycaster.setFromCamera(mouse, orthoCam)

    const intersects = raycaster.intersectObjects([posX, posY, posZ, negX, negY, negZ])

    if (intersects.length > 0) {
      const alreadyReached = handleIntersection(intersects[0])
      if (alreadyReached) {
        // get the second closest intersection
        if (intersects.length > 1) {
          handleIntersection(intersects[1])
        }
      }
    }
  }

  onMount(() => {
    renderer.domElement.parentElement?.appendChild(clickTarget)
    clickTarget.addEventListener('click', handleClick)

    return () => {
      renderer.domElement.parentElement?.removeChild(clickTarget)
      clickTarget.removeEventListener('click', handleClick)
    }
  })

  // Used to test which axis (pos or neg) are closer to the camera.
  let point = new Vector3()
  const lastPoint = new Vector3()

  // Used to decrease atifacts of intersecting axis stems.
  let frontMostAxisIndex = 0
  let usePolygonOffset = false

  const defaultUp = new Vector3()
  $: defaultUp.copy($camera.up)

  useTask(
    animationTask?.key ?? Symbol('threlte-extras-gizmo-animation'),
    (delta) => {
      point.set(0, 0, 1).applyQuaternion(camera.current.quaternion)
      if (point.x !== lastPoint.x || point.y !== lastPoint.y || point.z !== lastPoint.z) {
        // Trigger reactivity in the template
        point = point
        lastPoint.copy(point)

        const max = Math.max(point.x, point.y, point.z)
        frontMostAxisIndex = max === point.x ? 0 : max === point.y ? 1 : 2
        usePolygonOffset = point.x < 0 || point.y < 0 || point.z < 0

        root.quaternion.copy(camera.current.quaternion).invert()
        invalidate()
      }

      if (animating) {
        const step = delta * turnRate

        // animate position by doing a slerp and then scaling the position on the unit sphere
        currentQuaternion.rotateTowards(finalQuaternion, step)
        camera.current.position
          .set(0, 0, 1)
          .applyQuaternion(currentQuaternion)
          .multiplyScalar(radius)
          .add(centerVec)

        // animate orientation
        camera.current.quaternion.rotateTowards(targetQuaternion, step)

        if (currentQuaternion.angleTo(finalQuaternion) === 0) {
          animating = false
        }

        invalidate()
      }
    },
    {
      ...animationTask,
      autoInvalidate: false
    }
  )

  const findClosestPow2LargerThan = (x: number) => {
    if (x <= 0) {
      return 1
    }
    let pow2 = 1
    while (pow2 < x) {
      pow2 <<= 1
    }
    return pow2
  }

  $: textureSize = findClosestPow2LargerThan(size * 0.3 * renderer.getPixelRatio())

  const stemGeometry = new CapsuleGeometry(0.025, 0.78)
  stemGeometry.rotateZ(Math.PI / 2)
</script>

<HierarchicalObject>
  <T is={root}>
    {@const polygonOffsetFactor = -20}

    <!-- xAxis -->
    <T.Sprite
      renderOrder={1}
      bind:ref={posX}
      position.x={1}
      userData.targetPosition={[1, 0, 0]}
      userData.targetEuler={[0, Math.PI / 2, 0]}
    >
      <T.SpriteMaterial
        map={getSpriteTexture(textureSize, xColor, 'X')}
        opacity={point.x >= 0 ? 1 : 0.5}
      />
    </T.Sprite>

    <T.Mesh
      position.x={0.39}
      renderOrder={frontMostAxisIndex === 0 ? -1 : 0}
    >
      <T is={stemGeometry} />
      <T.MeshBasicMaterial
        transparent
        opacity={point.x >= 0 ? 1 : 0.5}
        color={xColor}
        polygonOffset={usePolygonOffset && frontMostAxisIndex === 0 && point.x < 0.75}
        {polygonOffsetFactor}
      />
    </T.Mesh>

    <T.Sprite
      renderOrder={1}
      bind:ref={negX}
      position.x={-1}
      scale={0.8}
      userData.targetPosition={[-1, 0, 0]}
      userData.targetEuler={[0, -Math.PI * 0.5, 0]}
    >
      <T.SpriteMaterial
        map={getSpriteTexture(textureSize, xColor)}
        opacity={point.x >= 0 ? 0.5 : 1}
      />
    </T.Sprite>

    <!-- yAxis -->
    <T.Sprite
      renderOrder={1}
      bind:ref={posY}
      position.y={1}
      userData.targetPosition={[0, 1, 0]}
      userData.targetEuler={[-Math.PI * 0.5, 0, 0]}
    >
      <T.SpriteMaterial
        map={getSpriteTexture(textureSize, yColor, 'Y')}
        opacity={point.y >= 0 ? 1 : 0.5}
      />
    </T.Sprite>

    <T.Mesh
      position.y={0.39}
      rotation.z={Math.PI / 2}
      renderOrder={frontMostAxisIndex === 1 ? -1 : 0}
    >
      <T is={stemGeometry} />
      <T.MeshBasicMaterial
        transparent
        opacity={point.y >= 0 ? 1 : 0.5}
        color={yColor}
        polygonOffset={usePolygonOffset && frontMostAxisIndex === 1 && point.y < 0.75}
        {polygonOffsetFactor}
      />
    </T.Mesh>

    <T.Sprite
      renderOrder={1}
      bind:ref={negY}
      position.y={-1}
      scale={0.8}
      userData.targetPosition={[0, -1, 0]}
      userData.targetEuler={[Math.PI * 0.5, 0, 0]}
    >
      <T.SpriteMaterial
        map={getSpriteTexture(textureSize, yColor)}
        opacity={point.y >= 0 ? 0.5 : 1}
      />
    </T.Sprite>

    <!-- zAxis -->
    <T.Sprite
      renderOrder={1}
      bind:ref={posZ}
      position.z={1}
      userData.targetPosition={[0, 0, 1]}
      userData.targetEuler={[0, 0, 0]}
    >
      <T.SpriteMaterial
        map={getSpriteTexture(textureSize, zColor, 'Z')}
        opacity={point.z >= 0 ? 1 : 0.5}
      />
    </T.Sprite>

    <T.Mesh
      position.z={0.39}
      rotation.y={-Math.PI / 2}
      renderOrder={frontMostAxisIndex === 2 ? -1 : 0}
    >
      <T is={stemGeometry} />
      <T.MeshBasicMaterial
        transparent
        opacity={point.z >= 0 ? 1 : 0.5}
        color={zColor}
        polygonOffset={usePolygonOffset && frontMostAxisIndex === 2 && point.z < 0.75}
        {polygonOffsetFactor}
      />
    </T.Mesh>

    <T.Sprite
      renderOrder={1}
      bind:ref={negZ}
      position.z={-1}
      scale={0.8}
      userData.targetPosition={[0, 0, -1]}
      userData.targetEuler={[0, Math.PI, 0]}
    >
      <T.SpriteMaterial
        map={getSpriteTexture(textureSize, zColor)}
        opacity={point.z >= 0 ? 0.5 : 1}
      />
    </T.Sprite>
  </T>
</HierarchicalObject>
