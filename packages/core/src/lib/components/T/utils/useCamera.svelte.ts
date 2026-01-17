import { fromStore } from 'svelte/store'
import { useThrelte } from '../../../context/compounds/useThrelte.js'
import { isInstanceOf } from '../../../utilities/index.js'
import type { OrthographicCamera, PerspectiveCamera } from 'three'

const updateProjectionMatrixKeys = new Set([
  'fov',
  'aspect',
  'near',
  'far',
  'left',
  'right',
  'top',
  'bottom',
  'zoom',
  'filmGauge',
  'filmOffset'
])

const defaultCameras = new Set()

export const useCamera = (
  getCamera: () => PerspectiveCamera | OrthographicCamera,
  getManual: () => boolean,
  getMakeDefault: () => boolean,
  props: () => Record<string, unknown>
) => {
  const { invalidate, size: sizeStore, camera: defaultCamera } = useThrelte()

  const camera = $derived(getCamera())
  const manual = $derived(getManual())
  const size = fromStore(sizeStore)

  $effect.pre(() => {
    if (!getMakeDefault()) {
      return
    }

    const current = camera

    defaultCameras.add(current)
    defaultCamera.set(current)
    invalidate()

    return () => {
      defaultCameras.delete(current)
      if (defaultCameras.size === 0) {
        defaultCamera.set(undefined!)
        invalidate()
      }
    }
  })

  $effect.pre(() => {
    if (manual) {
      return
    }

    for (const key in props()) {
      if (updateProjectionMatrixKeys.has(key)) {
        camera.updateProjectionMatrix()
        invalidate()
        break
      }
    }
  })

  $effect.pre(() => {
    if (manual) {
      return
    }

    const { width, height } = size.current

    if ((camera as PerspectiveCamera).isPerspectiveCamera) {
      const perspective = camera as PerspectiveCamera
      perspective.aspect = width / height
    } else if ((camera as OrthographicCamera).isOrthographicCamera) {
      const ortho = camera as OrthographicCamera
      ortho.left = width / -2
      ortho.right = width / 2
      ortho.top = height / 2
      ortho.bottom = height / -2
    }

    camera.updateProjectionMatrix()
    invalidate()
  })
}
