import type { Event, EventDispatcher } from 'three'
import type { MaybeInstance } from '../types'

type Props = Record<string, (arg: unknown) => void>

/**
 * Typeguard to check if a value is extending THREE.EventDispatcher
 * @param value
 * @returns
 */
const isEventDispatcher = <T>(
  value: MaybeInstance<T>
): value is MaybeInstance<T> & EventDispatcher<any> => {
  return (
    value !== null &&
    typeof value === 'object' &&
    'addEventListener' in value &&
    'removeEventListener' in value
  )
}

const addEventListeners = <T>(ref: MaybeInstance<T>, props: Props) => {
  if (!isEventDispatcher(ref)) return

  const eventHandlerProxy = (event?: Event) => {
    if (event?.type) {
      props[`on${event.type}`]?.(event)
    }
  }

  const eventNames = new Set<string>()

  for (const eventName of Object.keys(props)) {
    if (eventName.startsWith('on')) {
      ref.addEventListener(eventName.slice(2), eventHandlerProxy)
      eventNames.add(eventName)
    }
  }

  return () => {
    for (const name of eventNames) {
      ref.removeEventListener(name, eventHandlerProxy)
    }
    eventNames.clear()
  }
}

export const useEvents = <T>(ref: () => MaybeInstance<T>, props: () => Props) => {
  $effect.pre(() => addEventListeners<T>(ref(), props()))
}
