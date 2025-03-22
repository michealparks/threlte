import { fromStore } from 'svelte/store'
import type { OrthographicCamera, PerspectiveCamera } from 'three'
import { useThrelte } from '../../../context/compounds/useThrelte'
import { isInstanceOf } from '../../../utilities'

export const useCamera = (
  currentRef: () => PerspectiveCamera | OrthographicCamera,
  manual: () => boolean,
  makeDefault: () => boolean
) => {
  const { invalidate, size: currentSize, camera } = useThrelte()
  const size = fromStore(currentSize)

  $effect.pre(() => {
    if (makeDefault()) {
      camera.set(currentRef())
      invalidate()
    }
  })

  $effect.pre(() => {
    if (manual()) return

    const ref = currentRef()
    const { width, height } = size.current

    if (isInstanceOf(ref, 'OrthographicCamera')) {
      ref.left = width / -2
      ref.right = width / 2
      ref.top = height / 2
      ref.bottom = height / -2
      ref.updateProjectionMatrix()
      ref.updateMatrixWorld()
      invalidate()
    } else if (isInstanceOf(ref, 'PerspectiveCamera')) {
      ref.aspect = width / height
      ref.updateProjectionMatrix()
      ref.updateMatrixWorld()
      invalidate()
    }
  })
}
