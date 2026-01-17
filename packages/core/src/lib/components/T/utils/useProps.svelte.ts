import { EventDispatcher } from 'three'
import { useThrelte } from '../../../context/compounds/useThrelte.js'
import { resolvePropertyPath } from '../../../utilities/index.js'
import { untrack } from 'svelte'

/**
 * Only scalar values are memoized, objects and arrays are considered
 * non-equa by default, to ensure reactivity works as you would
 * expect in svelte.
 * @param value
 * @returns
 */
export const memoizeProp = (value: unknown): boolean => {
  // scalar values are memoized
  if (typeof value === 'string') return true
  if (typeof value === 'number') return true
  if (typeof value === 'boolean') return true
  if (typeof value === 'undefined') return true
  if (value === null) return true

  // objects and arrays cannot be reliably memoized
  return false
}

export const useProps = <Type>(
  object: () => Type,
  props: () => Record<string, unknown>,
  pluginProps: () => string[] | undefined
) => {
  const { invalidate } = useThrelte()

  const setProp = <Type>(instance: Type, propertyPath: string, value: any) => {
    const { key, target } = resolvePropertyPath(instance, propertyPath)

    /**
     * If we can determine that this is an event listener prop,
     * attach it.
     */
    if (
      typeof value === 'function' &&
      key.startsWith('on') &&
      !propertyPath.includes('.') &&
      'addEventListener' in (target as EventDispatcher)
    ) {
      const dispatcher = target as EventDispatcher<Record<string, any>>
      const eventName = key.slice(2)

      dispatcher.addEventListener(eventName, value)

      return () => {
        dispatcher.removeEventListener?.(eventName, value)
      }
    }

    if (
      !Array.isArray(value) &&
      typeof value === 'number' &&
      typeof target[key] === 'object' &&
      target[key] !== null &&
      typeof target[key]?.setScalar === 'function' &&
      // colors do have a setScalar function, but we don't want to use it, because
      // the hex notation (i.e. 0xff0000) is very popular and matches the number
      // type. So we exclude colors here.
      !target[key]?.isColor
    ) {
      // edge case of setScalar setters
      target[key].setScalar(value)
    } else {
      console.log(instance, target, key)
      if (
        typeof target[key]?.set === 'function' &&
        typeof target[key] === 'object' &&
        target[key] !== null
      ) {
        // if the property has a "set" function, we can use it
        if (Array.isArray(value)) {
          target[key].set(...value)
        } else {
          target[key].set(value)
        }
      } else {
        // otherwise, we just set the value
        target[key] = value
      }
    }

    return
  }

  $effect.pre(() => {
    const _object = object()
    const _props = props()
    const _pluginProps = pluginProps()

    return untrack(() => {
      for (const key in _props) {
        $effect.pre(() => {
          if (!_pluginProps?.includes(key)) {
            setProp(_object, key, _props[key])
          }

          invalidate()
        })
      }
    })
  })
}
