<script lang="ts">
  import { T, useThrelte, useFrame } from '@threlte/core'
  import {
    Vector3,
    Group,
    Object3D,
    Matrix4,
    Camera,
    PerspectiveCamera,
    OrthographicCamera,
    Raycaster,
    DoubleSide,
    Mesh
  } from 'three'
  import { useHasEventListeners } from '../../hooks/useHasEventListeners'
  import type { HTMLProps } from './HTML.svelte'
  import VertexShader from './vertex.glsl?raw'

  type $$Props = HTMLProps
  type $$PropsWithDefaults = Required<$$Props>

  // Group Properties
  export let transform: $$PropsWithDefaults['transform'] = false
  export let calculatePosition: $$PropsWithDefaults['calculatePosition'] = defaultCalculatePosition
  export let eps = 0.001
  export let prepend: $$PropsWithDefaults['prepend']
  export let center: $$PropsWithDefaults['center']
  export let fullscreen: $$PropsWithDefaults['fullscreen']
  export let distanceFactor: $$PropsWithDefaults['distanceFactor']
  export let sprite: $$PropsWithDefaults['sprite'] = false

  export let occlude: $$PropsWithDefaults['occlude'] = true
  export let onOcclude: $$PropsWithDefaults['onOcclude']
  export let castShadow: $$PropsWithDefaults['castShadow']
  export let receiveShadow: $$PropsWithDefaults['receiveShadow']
  export let material: $$PropsWithDefaults['material']
  export let geometry: $$PropsWithDefaults['geometry']
  export let zIndexRange = [16777271, 0]
  export let as = 'div'
  export let wrapperClass: $$PropsWithDefaults['wrapperClass']
  export let pointerEvents = 'auto'
  export let portal: $$Props['portal'] | undefined = undefined

  const raycaster = new Raycaster()
  const v1 = new Vector3()
  const v2 = new Vector3()
  const v3 = new Vector3()

  const portalAction = (el: HTMLElement) => {
    const target = portal ?? renderer.domElement.parentElement
    if (!target) {
      console.warn('<HTML>: target is undefined.')
      return
    }
    target.appendChild(el)
    return {
      destroy: () => {
        if (!el.parentNode) return
        el.parentNode.removeChild(el)
      }
    }
  }

  function defaultCalculatePosition(
    el: Object3D,
    camera: Camera,
    size: { width: number; height: number }
  ) {
    const objectPos = v1.setFromMatrixPosition(el.matrixWorld)
    objectPos.project(camera)
    const widthHalf = size.width / 2
    const heightHalf = size.height / 2
    return [objectPos.x * widthHalf + widthHalf, -(objectPos.y * heightHalf) + heightHalf]
  }

  type CalculatePosition = typeof defaultCalculatePosition

  function isObjectBehindCamera(el: Object3D, camera: Camera) {
    const objectPos = v1.setFromMatrixPosition(el.matrixWorld)
    const cameraPos = v2.setFromMatrixPosition(camera.matrixWorld)
    const deltaCamObj = objectPos.sub(cameraPos)
    const camDir = camera.getWorldDirection(v3)
    return deltaCamObj.angleTo(camDir) > Math.PI / 2
  }

  function isObjectVisible(
    el: Object3D,
    camera: Camera,
    raycaster: Raycaster,
    occlude: Object3D[]
  ) {
    const elPos = v1.setFromMatrixPosition(el.matrixWorld)
    const screenPos = elPos.clone()
    screenPos.project(camera)
    raycaster.setFromCamera(screenPos, camera)
    const intersects = raycaster.intersectObjects(occlude, true)
    if (intersects.length) {
      const intersectionDistance = intersects[0].distance
      const pointDistance = elPos.distanceTo(raycaster.ray.origin)
      return pointDistance < intersectionDistance
    }
    return true
  }

  function objectScale(el: Object3D, camera: Camera) {
    if (camera instanceof OrthographicCamera) {
      return camera.zoom
    } else if (camera instanceof PerspectiveCamera) {
      const objectPos = v1.setFromMatrixPosition(el.matrixWorld)
      const cameraPos = v2.setFromMatrixPosition(camera.matrixWorld)
      const vFOV = (camera.fov * Math.PI) / 180
      const dist = objectPos.distanceTo(cameraPos)
      const scaleFOV = 2 * Math.tan(vFOV / 2) * dist
      return 1 / scaleFOV
    } else {
      return 1
    }
  }

  function objectZIndex(el: Object3D, camera: Camera, zIndexRange: Array<number>) {
    if (camera instanceof PerspectiveCamera || camera instanceof OrthographicCamera) {
      const objectPos = v1.setFromMatrixPosition(el.matrixWorld)
      const cameraPos = v2.setFromMatrixPosition(camera.matrixWorld)
      const dist = objectPos.distanceTo(cameraPos)
      const A = (zIndexRange[1] - zIndexRange[0]) / (camera.far - camera.near)
      const B = zIndexRange[1] - A * camera.far
      return Math.round(A * dist + B)
    }
    return undefined
  }

  const epsilon = (value: number) => (Math.abs(value) < 1e-10 ? 0 : value)

  function getCSSMatrix(matrix: Matrix4, multipliers: number[], prepend = '') {
    let matrix3d = 'matrix3d('
    for (let i = 0; i !== 16; i++) {
      matrix3d += epsilon(multipliers[i] * matrix.elements[i]) + (i !== 15 ? ',' : ')')
    }
    return prepend + matrix3d
  }

  const getCameraCSSMatrix = ((multipliers: number[]) => {
    return (matrix: Matrix4) => getCSSMatrix(matrix, multipliers)
  })([1, -1, 1, 1, 1, -1, 1, 1, 1, -1, 1, 1, 1, -1, 1, 1])

  const getObjectCSSMatrix = ((scaleMultipliers: (n: number) => number[]) => {
    return (matrix: Matrix4, factor: number) =>
      getCSSMatrix(matrix, scaleMultipliers(factor), 'translate(-50%,-50%)')
  })((f: number) => [
    1 / f,
    1 / f,
    1 / f,
    1,
    -1 / f,
    -1 / f,
    -1 / f,
    -1,
    1 / f,
    1 / f,
    1 / f,
    1,
    1,
    1,
    1,
    1
  ])

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

  const { renderer, camera, scene, size, viewport } = useThrelte()

  $: width = $size.width
  $: height = $size.height
  $: halfWidth = width / 2
  $: halfHeight = height / 2
  $: fov = $camera.projectionMatrix.elements[5] * halfHeight

  const group = new Group()
  const occlusionMesh = new Mesh()

  let element = document.createElement(as)
  let oldZoom = 0
  let oldPosition = [0, 0]
  let transformOuterRef: HTMLDivElement = null!
  let transformInnerRef: HTMLDivElement = null!
  let isMeshSizeSet = false

  $: isRayCastOcclusion =
    (occlude && occlude !== 'blending') || (Array.isArray(occlude) && occlude.length > 0)

  $: {
    const canvas = renderer.domElement

    if (occlude === 'blending') {
      canvas.style.zIndex = `${Math.floor(zIndexRange[0] / 2)}`
      canvas.style.position = 'absolute'
      canvas.style.pointerEvents = 'none'
    } else {
      canvas.style.zIndex = null!
      canvas.style.position = null!
      canvas.style.pointerEvents = null!
    }
  }

  $: {
    if (wrapperClass) element.className = wrapperClass
  }

  let visible = true

  useFrame(() => {
    // @todo
    // isMeshSizeSet = false

    camera.current.updateMatrixWorld()
    group.updateWorldMatrix(true, false)
    const vec = transform ? oldPosition : calculatePosition(group, camera.current, $size)

    if (
      transform ||
      Math.abs(oldZoom - camera.current.zoom) > eps ||
      Math.abs(oldPosition[0] - vec[0]) > eps ||
      Math.abs(oldPosition[1] - vec[1]) > eps
    ) {
      const isBehindCamera = isObjectBehindCamera(group, camera.current)
      let raytraceTarget: null | undefined | boolean | Object3D[] = false

      if (isRayCastOcclusion) {
        if (Array.isArray(occlude)) {
          raytraceTarget = occlude as Object3D[]
        } else if (occlude !== 'blending') {
          raytraceTarget = [scene]
        }
      }

      const previouslyVisible = visible

      if (raytraceTarget) {
        const isvisible = isObjectVisible(group, camera.current, raycaster, raytraceTarget)
        visible = isvisible && !isBehindCamera
      } else {
        visible = !isBehindCamera
      }

      if (previouslyVisible !== visible) {
        if (onOcclude) onOcclude(!visible)
        else element.style.display = visible ? 'block' : 'none'
      }

      const halfRange = Math.floor(zIndexRange[0] / 2)
      const zRange = occlude
        ? isRayCastOcclusion //
          ? [zIndexRange[0], halfRange]
          : [halfRange - 1, 0]
        : zIndexRange

      element.style.zIndex = `${objectZIndex(group, camera.current, zRange)}`

      if (transform) {
        const { isOrthographicCamera, top, left, bottom, right } =
          camera.current as OrthographicCamera
        const cameraMatrix = getCameraCSSMatrix(camera.current.matrixWorldInverse)
        const cameraTransform = isOrthographicCamera
          ? `scale(${fov})translate(${epsilon(-(right + left) / 2)}px,${epsilon(
              (top + bottom) / 2
            )}px)`
          : `translateZ(${fov}px)`
        let matrix = group.matrixWorld
        if (sprite) {
          matrix = camera.current.matrixWorldInverse
            .clone()
            .transpose()
            .copyPosition(matrix)
            .scale(group.scale)
          matrix.elements[3] = matrix.elements[7] = matrix.elements[11] = 0
          matrix.elements[15] = 1
        }
        element.style.width = `${width}px`
        element.style.height = `${height}px`
        element.style.perspective = isOrthographicCamera ? '' : `${fov}px`
        if (transformOuterRef && transformInnerRef) {
          transformOuterRef.style.transform = `${cameraTransform}${cameraMatrix}translate(${halfWidth}px,${halfHeight}px)`
          transformInnerRef.style.transform = getObjectCSSMatrix(
            matrix,
            1 / ((distanceFactor || 10) / 400)
          )
        }
      } else {
        const scale =
          distanceFactor === undefined ? 1 : objectScale(group, camera.current) * distanceFactor
        element.style.transform = `translate3d(${vec[0]}px,${vec[1]}px,0) scale(${scale})`
      }
      oldPosition = vec
      oldZoom = camera.current.zoom
    }

    if (!isRayCastOcclusion && !isMeshSizeSet) {
      if (transform) {
        if (transformOuterRef) {
          const el = transformOuterRef.children[0]

          if (el?.clientWidth && el?.clientHeight) {
            const { isOrthographicCamera } = camera.current as OrthographicCamera

            if (isOrthographicCamera || geometry) {
              if ($$restProps.scale) {
                if (!Array.isArray($$restProps.scale)) {
                  occlusionMesh.scale.setScalar(1 / ($$restProps.scale as number))
                } else if ($$restProps.scale instanceof Vector3) {
                  occlusionMesh.scale.copy($$restProps.scale.clone().divideScalar(1))
                } else {
                  occlusionMesh.scale.set(
                    1 / $$restProps.scale[0],
                    1 / $$restProps.scale[1],
                    1 / $$restProps.scale[2]
                  )
                }
              }
            } else {
              const ratio = (distanceFactor || 10) / 400
              const w = el.clientWidth * ratio
              const h = el.clientHeight * ratio

              occlusionMesh.scale.set(w, h, 1)
            }

            isMeshSizeSet = true
          }
        }
      } else {
        const ele = element.children[0]

        if (ele?.clientWidth && ele?.clientHeight) {
          const ratio = 1 // / viewport.factor
          const w = ele.clientWidth * ratio
          const h = ele.clientHeight * ratio

          occlusionMesh.scale.set(w, h, 1)

          isMeshSizeSet = true
        }

        occlusionMesh.lookAt(camera.current.position)
      }
    }
  })

  $: pos = calculatePosition(group, camera.current, $size)
  $: vertexShader = transform ? undefined : VertexShader
</script>

<T
  is={group}
  {...$$restProps}
>
  {#if occlude && !isRayCastOcclusion}
    <T
      is={occlusionMesh}
      {castShadow}
      {receiveShadow}
    >
      {#if geometry}
        <T.PlaneGeometry />
      {/if}

      {#if material}
        <T.ShaderMaterial
          side={DoubleSide}
          {vertexShader}
          fragmentShader={`void main() { gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); }`}
        />
      {/if}
    </T>
  {/if}
</T>

<svelte:element
  this={as}
  use:portalAction
  bind:this={element}
  style:position="absolute"
  style:top="0"
  style:left="0"
  style:pointer-events={transform ? 'none' : 'auto'}
  style:overflow={transform ? 'hidden' : undefined}
  style:transform={transform ? undefined : `translate3d(${pos[0]}px,${pos[1]}px,0)`}
>
  {#if transform}
    <div
      bind:this={transformOuterRef}
      style:position="absolute"
      style:top="0"
      style:left="0"
      style:width={`${width}px`}
      style:height={`${height}px`}
      style:transform-style="preserve-3d"
      style:pointer-events="none"
    >
      <div
        bind:this={transformInnerRef}
        style:position="absolute"
        style:pointer-events={pointerEvents}
      >
        <div
          class={$$restProps.class}
          style={$$restProps.style}
        >
          <slot />
        </div>
      </div>
    </div>
  {:else}
    <div
      style:position="absolute"
      style:transform={center ? 'translate3d(-50%,-50%,0)' : 'none'}
      style:top={fullscreen ? `${-height / 2}px` : undefined}
      style:left={fullscreen ? `${-width / 2}px` : undefined}
      style:width={fullscreen ? `${width / 2}px` : undefined}
      style:height={fullscreen ? `${height}px` : undefined}
      style={$$restProps.style}
      class={$$restProps.class}
    >
      <slot />
    </div>
  {/if}
</svelte:element>
