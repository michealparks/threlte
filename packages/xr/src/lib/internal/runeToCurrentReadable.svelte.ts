import { toStore } from 'svelte/store'

export const runeToCurrentReadable = <T>(getter: () => T) => {
  const store = toStore(getter)

  const extendedReadable = {
    subscribe: store.subscribe,
    current: getter()
  }

  $effect.pre(() => {
    return store.subscribe((value) => (extendedReadable.current = value))
  })

  return extendedReadable
}
