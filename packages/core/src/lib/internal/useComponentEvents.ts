import { getContext, setContext } from 'svelte'
import { type CurrentWritable, currentWritable } from '../lib/storeUtils'

export type ComponentEvents = Record<string, ((...args: unknown[]) => void)[]>

interface ThrelteComponentEventsContext {
  events: CurrentWritable<ComponentEvents>
  ref: CurrentWritable<any>
}

const key = 'threlte-internal-component-events'

export const createComponentEventsContext = () => {
  const events = currentWritable<ComponentEvents>({})
  const ref = currentWritable<any>(undefined)

  const context: ThrelteComponentEventsContext = {
    events,
    ref
  }

  setContext(key, context)

  return context
}

export const useComponentEvents = (): ThrelteComponentEventsContext => {
  return getContext(key)
}
