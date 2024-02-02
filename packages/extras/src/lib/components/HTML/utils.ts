import type { Writable } from 'svelte/store'
import {
  Camera,
  Matrix4,
  Object3D,
  OrthographicCamera,
  PerspectiveCamera,
  Raycaster,
  Vector2,
  Vector3
} from 'three'

const vec2 = new Vector2()
const v1 = new Vector3()
const v2 = new Vector3()
const v3 = new Vector3()

const isOrthographicCamera = (object: Camera): object is OrthographicCamera => {
  return 'isOrthographicCamera' in object
}

const isPerspectiveCamera = (object: Camera): object is PerspectiveCamera => {
  return 'isPerspectiveCamera' in object
}

const isOrthographicCameraOrPerspectiveCamera = (
  object: Camera
): object is OrthographicCamera | PerspectiveCamera => {
  return isOrthographicCamera(object) || isPerspectiveCamera(object)
}

export const defaultCalculatePosition = (
  object: Object3D,
  camera: Camera,
  size: { width: number; height: number }
) => {
  const objectPos = v1.setFromMatrixPosition(object.matrixWorld)
  objectPos.project(camera)
  const widthHalf = size.width / 2
  const heightHalf = size.height / 2
  return [objectPos.x * widthHalf + widthHalf, -(objectPos.y * heightHalf) + heightHalf]
}

export const isObjectVisible = (
  el: Object3D,
  camera: Camera,
  raycaster: Raycaster,
  occlude: Object3D[]
) => {
  const elPos = v1.setFromMatrixPosition(el.matrixWorld)
  const screenPos = v2.copy(v1)
  screenPos.project(camera)
  raycaster.setFromCamera(vec2.set(screenPos.x, screenPos.y), camera)
  const intersects = raycaster.intersectObjects(occlude, true)

  if (intersects.length) {
    const intersectionDistance = intersects[0].distance
    const pointDistance = elPos.distanceTo(raycaster.ray.origin)
    return pointDistance < intersectionDistance
  }

  return true
}

export const isObjectBehindCamera = (object: Object3D, camera: Camera) => {
  const objectPos = v1.setFromMatrixPosition(object.matrixWorld)
  const cameraPos = v2.setFromMatrixPosition(camera.matrixWorld)
  const deltaCamObj = objectPos.sub(cameraPos)
  const camDir = camera.getWorldDirection(v3)
  return deltaCamObj.angleTo(camDir) > Math.PI / 2
}

export const objectScale = (object: Object3D, camera: Camera) => {
  if (isOrthographicCamera(camera)) {
    return camera.zoom
  } else if (isPerspectiveCamera(camera)) {
    const objectPos = v1.setFromMatrixPosition(object.matrixWorld)
    const cameraPos = v2.setFromMatrixPosition(camera.matrixWorld)
    const vFOV = (camera.fov * Math.PI) / 180
    const dist = objectPos.distanceTo(cameraPos)
    const scaleFOV = 2 * Math.tan(vFOV / 2) * dist
    return 1 / scaleFOV
  } else {
    return 1
  }
}

export const objectZIndex = (el: Object3D, camera: Camera, zIndexRange: Array<number>) => {
  if (isOrthographicCameraOrPerspectiveCamera(camera)) {
    const objectPos = v1.setFromMatrixPosition(el.matrixWorld)
    const cameraPos = v2.setFromMatrixPosition(camera.matrixWorld)
    const dist = objectPos.distanceTo(cameraPos)
    const A = (zIndexRange[1] - zIndexRange[0]) / (camera.far - camera.near)
    const B = zIndexRange[1] - A * camera.far
    return Math.round(A * dist + B)
  }
  return undefined
}

export const epsilon = (value: number) => (Math.abs(value) < 1e-10 ? 0 : value)

export const getCSSMatrix = (matrix: Matrix4, multipliers: number[], prepend = '') => {
  let matrix3d = 'matrix3d('
  for (let i = 0; i !== 16; i++) {
    matrix3d += epsilon(multipliers[i] * matrix.elements[i]) + (i !== 15 ? ',' : ')')
  }
  return prepend + matrix3d
}

export const getCameraCSSMatrix = ((multipliers: number[]) => {
  return (matrix: Matrix4) => getCSSMatrix(matrix, multipliers)
})([1, -1, 1, 1, 1, -1, 1, 1, 1, -1, 1, 1, 1, -1, 1, 1])

export const getObjectCSSMatrix = ((scaleMultipliers: (n: number) => number[]) => {
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

const styleDeclarationKeyToCssString = (s: string): string => {
  return s
    .split(/(?=[A-Z])/)
    .join('-')
    .toLowerCase()
}

export const compileStyles = (styles: Partial<CSSStyleDeclaration>): string => {
  return Object.entries(styles)
    .filter(([_, value]) => !!value)
    .map(([key, value]) => `${styleDeclarationKeyToCssString(key)}: ${value}`)
    .join('; ')
}

export const updateStyles = (
  store: Writable<Partial<CSSStyleDeclaration>>,
  styles: Partial<CSSStyleDeclaration>
): void => {
  store.update((values) => {
    return {
      ...values,
      ...styles
    }
  })
}
