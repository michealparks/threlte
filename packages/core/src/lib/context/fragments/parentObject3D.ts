import { getContext, setContext } from 'svelte'
import type { Object3D } from 'three'
import { runeToCurrentReadable } from '../../utilities/currentWritable.js'

const key = Symbol('threlte-parent-object3d-context')

interface Context {
  current: Object3D
}

/**
 * The parentObject3D context is used to access the parent `THREE.Object3D`
 * created by a `<T>` component. The context is automatically merged with the
 * parentObject3D context of the parent component when the local context store
 * is `undefined`.
 */
export const createParentObject3DContext = (object: () => Object3D | undefined) => {
  const parent = useParentObject3D()

  const context: Context = {
    get current() {
      return object() ?? parent.current
    }
  }

  setContext(key, context)

  return context
}

export const useParentObject3D = () => {
  return getContext<Context>(key)
}

/**
 * The parentObject3D context is used to access the parent `THREE.Object3D`
 * created by a `<T>` component.
 *
 * @example
 * ```svelte
 * <T.Mesh>
 *   <T.MeshStandardMaterial>
 *     <CustomComponent />
 *   </T.MeshStandardMaterial>
 * </T.Mesh>
 * ```
 *
 * The parentObject3D as retrieved inside the component `<CustomComponent>`
 * will be the mesh created by the `<T.Mesh>` component.
 */
export const useParentObject3DExternal = () => {
  const parent = useParentObject3D()
  return runeToCurrentReadable(() => parent.current)
}
