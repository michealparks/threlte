import { setContext } from 'svelte'

export interface SuspenseContext {
  suspended: { current: boolean }
  error: { current: unknown }
}

export const key = Symbol('THRELTE_SUSPENSE_CONTEXT_IDENTIFIER')

export const createSuspenseContext = (suspended: () => boolean, error: () => unknown) => {
  const context: SuspenseContext = {
    error: {
      get current() {
        return error()
      }
    },
    suspended: {
      get current() {
        return suspended()
      }
    }
  }

  setContext<SuspenseContext>(key, context)

  return context
}
