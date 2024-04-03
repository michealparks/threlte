import { useComponentEvents } from '../../../internal/useComponentEvents'
import { watch, currentWritable } from '../../../lib/storeUtils'
import { onDestroy, onMount } from 'svelte'

export const useCreateEvent = () => {
  const { events, ref: componentEventsRef } = useComponentEvents()

  const cleanupFunctions: (() => void)[] = []

  const ref = currentWritable<unknown | undefined>(undefined)
  const mounted = currentWritable(false)

  const dispatchCreateEvent = () => {
    // call every cleanup function
    cleanupFunctions.forEach((cleanup) => cleanup())

    // clear the cleanup functions array
    cleanupFunctions.length = 0

    const cleanup = (callback: () => void) => {
      // add cleanup function to array
      cleanupFunctions.push(callback)
    }

    console.log(ref.current)
    events.current.create?.forEach((fn) => fn({ ref: ref.current, cleanup }))
  }

  const updateRef = (newRef: unknown) => {
    ref.set(newRef)
  }

  watch(
    [ref, componentEventsRef, events, mounted],
    ([$ref, $componentEventsRef, $events, $mounted]) => {
      const { create } = $events

      if ($ref === undefined || create === undefined || !$mounted) return

      if ($ref === $componentEventsRef) {
        dispatchCreateEvent()
      }
    }
  )

  onMount(() => {
    mounted.set(true)
  })

  onDestroy(() => {
    // call every cleanup function
    cleanupFunctions.forEach((cleanup) => cleanup())
  })

  return {
    updateRef
  }
}
