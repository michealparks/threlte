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

export const useDispose = (refSignal: () => unknown, disposeSignal: () => boolean | undefined) => {
  let currentRef = $state<DisposableObject>()

  $effect.pre(() => {
    const ref = refSignal()
    if (!isDisposableObject(ref)) return
    currentRef = ref
  })

  let previousRef: DisposableObject | undefined

  const localDispose = $derived(disposeSignal())

  const { disposableObjectMounted, disposableObjectUnmounted, removeObjectFromDisposal } =
    useDisposal()

  const parentDispose = getContext<ThrelteDisposeContext | undefined>(contextName)

  // We merge the local dispose with the parent dispose. If the parent dispose
  // is not set, we use true as default.
  const mergedDispose = $derived(localDispose ?? parentDispose?.() ?? true)

  setContext<ThrelteDisposeContext>(contextName, () => mergedDispose)

  $effect.pre(() => {
    if (currentRef === previousRef) {
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
        if (currentRef) disposableObjectMounted(currentRef)
      }
    }

    previousRef = currentRef
  })

  onDestroy(() => {
    if (mergedDispose) return
    if (currentRef) {
      disposableObjectUnmounted(currentRef)
    }
  })
}
