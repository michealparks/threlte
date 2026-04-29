import type { EventDispatcher } from 'three'
import { useThrelte } from '../../../context/compounds/useThrelte.js'

const ignoredProps = new Set(['$$scope', '$$slots', 'type', 'args', 'attach', 'instance'])

/**
 * Only scalar values, Three-style tuples and event listeners are memoized.
 * Objects/functions/direct arrays are treated as dynamic so Svelte-style
 * reactivity remains intuitive.
 */
const memoizeProp = (value: unknown): boolean => {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'undefined' ||
    value === null
  )
}

const areArraysShallowEqual = (a: unknown[], b: unknown[]) => {
  if (a === b) return true
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

type ParsedPropertyPath = {
  key: string
  path?: string[]
}

const getParsedPropertyPath = (() => {
  const cache = new Map<string, ParsedPropertyPath>()

  return (propertyPath: string) => {
    const cached = cache.get(propertyPath)
    if (cached) return cached

    if (!propertyPath.includes('.')) {
      const parsed: ParsedPropertyPath = { key: propertyPath }
      cache.set(propertyPath, parsed)
      return parsed
    }

    const path = propertyPath.split('.')
    const key = path.pop() as string
    const parsed: ParsedPropertyPath = { key, path }
    cache.set(propertyPath, parsed)
    return parsed
  }
})()

const resolveCachedPropertyPath = (target: any, propertyPath: string) => {
  const { key, path } = getParsedPropertyPath(propertyPath)

  if (path) {
    for (let i = 0; i < path.length; i += 1) {
      target = target[path[i]]
      if (target == null) {
        console.error(`Cannot resolve property path "${propertyPath}": "${path[i]}" is ${target}`)
        return {
          target: {},
          key: ''
        }
      }
    }
  }

  return {
    target,
    key
  }
}

const canUseSetter = (target: any, key: string) => {
  return (
    typeof target[key]?.set === 'function' &&
    typeof target[key] === 'object' &&
    target[key] !== null
  )
}

const setter = (target: any, key: any, value: any) => {
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
}

type PropRecord = {
  cleanup?: () => void
  instance: any
  key: string
  memoized: boolean
  target: any
  value: any
}

export const useProps = <Type>(
  object: () => Type,
  props: () => Record<string, unknown>,
  pluginProps: () => string[] | undefined
) => {
  const { invalidate } = useThrelte()

  const propRecords = new Map<string, PropRecord>()

  const cleanupRecord = (record: PropRecord | undefined) => {
    record?.cleanup?.()
  }

  const recordValue = (value: any, memoized: boolean) => {
    return memoized && Array.isArray(value) ? value.slice() : value
  }

  const canSkipProp = (
    record: PropRecord | undefined,
    instance: any,
    target: any,
    key: string,
    value: any,
    memoized: boolean
  ) => {
    if (!record?.memoized || !memoized) return false
    if (record.instance !== instance || record.target !== target || record.key !== key) return false

    if (Array.isArray(record.value) && Array.isArray(value)) {
      return areArraysShallowEqual(record.value, value)
    }

    return record.value === value
  }

  const setProp = <T>(instance: T, propertyPath: string, value: any) => {
    const record = propRecords.get(propertyPath)
    const { key, target } = resolveCachedPropertyPath(instance, propertyPath)

    const isEvent =
      typeof value === 'function' &&
      key.startsWith('on') &&
      !propertyPath.includes('.') &&
      'addEventListener' in (target as EventDispatcher)

    const memoized =
      isEvent || memoizeProp(value) || (Array.isArray(value) && canUseSetter(target, key))

    if (canSkipProp(record, instance, target, key, value, memoized)) {
      return
    }

    cleanupRecord(record)

    /**
     * If we can determine that this is an event listener prop,
     * attach it.
     */
    if (isEvent) {
      const dispatcher = target as EventDispatcher<Record<string, any>>
      const eventName = key.slice(2)

      dispatcher.addEventListener(eventName, value)

      propRecords.set(propertyPath, {
        cleanup: () => {
          dispatcher.removeEventListener?.(eventName, value)
        },
        instance,
        key,
        memoized,
        target,
        value: recordValue(value, memoized)
      })
      return
    }

    if (value !== undefined && value !== null) {
      setter(target, key, value)
    } else {
      target[key] = value
    }

    propRecords.set(propertyPath, {
      instance,
      key,
      memoized,
      target,
      value: recordValue(value, memoized)
    })

    invalidate()
    return
  }

  $effect.pre(() => {
    const _object = object()
    const _props = props()
    const _pluginProps = pluginProps()

    const seen = new Set<string>()

    for (const key in _props) {
      if (_pluginProps?.includes(key) || ignoredProps.has(key)) {
        continue
      }

      seen.add(key)
      setProp(_object, key, _props[key])
    }

    for (const [key, record] of propRecords) {
      if (seen.has(key)) continue
      cleanupRecord(record)
      propRecords.delete(key)
    }
  })

  $effect.pre(() => {
    return () => {
      for (const record of propRecords.values()) {
        cleanupRecord(record)
      }
      propRecords.clear()
    }
  })
}
