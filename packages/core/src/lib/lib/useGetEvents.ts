import * as Internal from 'svelte/internal'

export const useGetEvents = (restProps?: any) => {
  const component = typeof Internal.get_current_component === 'undefined'
    ? undefined
    : Internal.get_current_component()

  return () => {
    // Svelte 5
    if (restProps) {
      // Todo
      // return Object.entries(restProps.$$events)
    // Svelte 4
    } else {
      return component.$$.callbacks
    }
  }
}
