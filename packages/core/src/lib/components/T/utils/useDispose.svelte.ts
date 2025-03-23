import { getContext, onDestroy, setContext } from 'svelte'
import { useDisposal, type DisposableObject } from '../../../context/fragments/disposal'
import { isInstanceOf } from '../../../utilities'

const contextName = Symbol('threlte-disposable-object-context')
type ThrelteDisposeContext = () => boolean

/**
 * Checks if the given object is a disposable object. Scenes are not disposable.
 * @param object - The object to check.
 * @returns True if the object is a disposable object, false otherwise.
 */
const isDisposableObject = (object: unknown): object is DisposableObject => {
  return typeof (object as any)?.dispose === 'function' && !isInstanceOf(object, 'Scene')
}

export const useDispose = (
  currentRef: () => unknown,
  currentDispose: () => boolean | undefined
) => {
  let ref = $state<DisposableObject>()

  $effect.pre(() => {
    const r = currentRef()
    if (isDisposableObject(r)) {
      ref = r
    }
  })

  let previousRef: DisposableObject | undefined

  const { disposableObjectMounted, disposableObjectUnmounted, removeObjectFromDisposal } =
    useDisposal()

  const parentDispose = getContext<ThrelteDisposeContext | undefined>(contextName)

  // We merge the local dispose with the parent dispose. If the parent dispose
  // is not set, we use true as default.
  const mergedDispose = $derived(currentDispose() ?? parentDispose?.() ?? true)

  setContext<ThrelteDisposeContext>(contextName, () => mergedDispose)

  $effect.pre(() => {
    if (ref === previousRef) {
      // dispose changed
      if (!mergedDispose) {
        // disposal is no longer enabled, so we need to deregister the previous ref
        if (previousRef) removeObjectFromDisposal(previousRef)
      } else {
        // disposal is enabled, so we need to register the previous ref
        if (previousRef) disposableObjectMounted(previousRef)
      }
    } else {
      // ref changed
      if (mergedDispose) {
        // we're disposing the old ref
        if (previousRef) disposableObjectUnmounted(previousRef)
        // and registering the new ref
        if (ref) disposableObjectMounted(ref)
      }
    }

    previousRef = ref
  })

  onDestroy(() => {
    if (mergedDispose && ref) {
      disposableObjectUnmounted(ref)
    }
  })
}
