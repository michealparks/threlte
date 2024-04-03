import type { EventDispatcher } from 'three'
import { writable } from 'svelte/store'
import { watch } from '../../../lib/storeUtils'
import { useComponentEvents, type ComponentEvents } from '../../../internal/useComponentEvents'

/**
 * Typeguard to check if a value is extending THREE.EventDispatcher
 * @param value
 * @returns
 */
const isEventDispatcher = (value: object): value is EventDispatcher => {
  return 'addEventListener' in value && 'removeEventListener' in value
}

export const useEvents = () => {
  const { events } = useComponentEvents()

  const cleanupEventListeners = (ref: EventDispatcher, events: ComponentEvents) => {
    for (const [eventName, callbacks] of Object.entries(events)) {
      for (const callback of callbacks) {
        ref.removeEventListener(eventName, callback)
      }
    }
  }

  const addEventListeners = (ref: EventDispatcher, events: ComponentEvents) => {
    for (const [eventName, callbacks] of Object.entries(events)) {
      for (const callback of callbacks) {
        ref.addEventListener(eventName, callback)
      }
    }
  }

  const ref = writable<EventDispatcher | undefined>()

  watch([ref, events], ([$ref, $events]) => {
    if ($ref === undefined || $events === undefined) return

    addEventListeners($ref, $events)
    return () => cleanupEventListeners($ref, $events)
  })

  const updateRef = (nextRef: object) => {
    if (isEventDispatcher(nextRef)) {
      ref.set(nextRef)
    }
  }

  return {
    updateRef
  }
}
