import { EventDispatcher } from 'three'
import { useThrelte } from '../../../context/compounds/useThrelte.js'
import { resolvePropertyPath } from '../../../utilities/index.js'
import { untrack } from 'svelte'

export const useProps = <Type>(
  object: () => Type,
  props: () => Record<string, unknown>,
  pluginProps: () => string[] | undefined
) => {
  const { invalidate } = useThrelte()

  const setProp = <Type>(instance: Type, propertyPath: string, value: any) => {
    const { key, target } = resolvePropertyPath(instance, propertyPath)

    const typeofValue = typeof value

    /**
     * If we can determine that this is an event listener prop,
     * attach it.
     */
    if (
      typeofValue === 'function' &&
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

    const prop = target[key]
    const valueIsArray = Array.isArray(value)

    if (
      !valueIsArray &&
      typeofValue === 'number' &&
      typeof prop === 'object' &&
      prop !== null &&
      typeof prop?.setScalar === 'function' &&
      // colors do have a setScalar function, but we don't want to use it, because
      // the hex notation (i.e. 0xff0000) is very popular and matches the number
      // type. So we exclude colors here.
      !prop?.isColor
    ) {
      // edge case of setScalar setters
      prop.setScalar(value)
    } else {
      if (typeof prop?.set === 'function' && typeof prop === 'object' && prop !== null) {
        // if the property has a "set" function, we can use it
        if (valueIsArray) {
          prop.set(...value)
        } else {
          prop.set(value)
        }
      } else {
        // otherwise, we just set the value
        target[key] = value
      }
    }

    invalidate()

    return
  }

  $effect.pre(() => {
    const _object = object()
    const _props = props()
    const _pluginProps = pluginProps()

    return untrack(() => {
      for (const key in _props) {
        $effect.pre(() => {
          if (_pluginProps?.includes(key)) {
            return
          }

          return setProp(_object, key, _props[key])
        })
      }
    })
  })
}
