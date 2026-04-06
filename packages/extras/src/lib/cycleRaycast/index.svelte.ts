import { fromStore } from 'svelte/store'
import { type Intersection } from 'three'
import { useInteractivity } from '../interactivity/index.js'
import type { InteractivityContext } from '../interactivity/context.js'

type CycleRaycastOptions = {
  scroll?: boolean
  key?: string
  /**
   * Modifier key that turns a click into a cycle action. When the user holds
   * this modifier and clicks, the next object behind the current one is
   * selected. Set to `false` to disable.
   * @default 'Alt'
   */
  clickModifier?: 'Alt' | 'Shift' | 'Control' | 'Meta' | false
}

export function cycleRaycast(getOptions?: () => CycleRaycastOptions) {
  const context = useInteractivity()
  const originalFilter = context.filter

  let hits: Intersection[] = $state([])
  let cycleIndex: number = $state(0)
  let lastUUIDs = ''
  let lastFilteredCount = 0

  context.filter = (items: Intersection[], ctx: InteractivityContext) => {
    const filtered = originalFilter ? originalFilter(items, ctx) : items

    lastFilteredCount = filtered.length
    hits = filtered

    const uuids = filtered.map((h) => h.object.uuid).join(',')
    if (uuids !== lastUUIDs) {
      cycleIndex = 0
      lastUUIDs = uuids
    }

    if (filtered.length <= 1 || cycleIndex === 0) return filtered

    const effectiveIndex = cycleIndex % filtered.length
    return [...filtered.slice(effectiveIndex), ...filtered.slice(0, effectiveIndex)]
  }

  const onWheel = (event: WheelEvent) => {
    if (lastFilteredCount <= 1) return
    event.preventDefault()
    cycleIndex += 1
    context.refreshPointerState()
  }

  const onKeyDown = (event: KeyboardEvent) => {
    const opts = getOptions?.()
    if (event.key !== (opts?.key ?? 'Tab')) return
    if (!context.pointerOverTarget.current) return
    if (lastFilteredCount <= 1) return
    event.preventDefault()
    cycleIndex += 1
    context.refreshPointerState()
  }

  const modifierPressed = (event: MouseEvent, modifier: string): boolean => {
    switch (modifier) {
      case 'Alt':
        return event.altKey
      case 'Shift':
        return event.shiftKey
      case 'Control':
        return event.ctrlKey
      case 'Meta':
        return event.metaKey
      default:
        return false
    }
  }

  const onClickCapture = (event: MouseEvent) => {
    const opts = getOptions?.()
    const modifier = opts?.clickModifier ?? 'Alt'
    if (!modifier || !modifierPressed(event, modifier)) return
    if (lastFilteredCount <= 1) return
    cycleIndex += 1
    context.refreshPointerState()
  }

  const target = fromStore(context.target)

  $effect(() => {
    const { current } = target
    if (!current) return

    const opts = getOptions?.()
    const scroll = opts?.scroll ?? true
    const key = opts?.key !== undefined ? opts.key : 'Tab'
    const clickModifier = opts?.clickModifier ?? 'Alt'

    if (scroll) {
      current.addEventListener('wheel', onWheel, { capture: true, passive: false })
    }
    if (key) {
      window.addEventListener('keydown', onKeyDown, { capture: true })
    }
    if (clickModifier) {
      current.addEventListener('click', onClickCapture, { capture: true })
    }

    return () => {
      current.removeEventListener('wheel', onWheel, { capture: true })
      window.removeEventListener('keydown', onKeyDown, { capture: true })
      current.removeEventListener('click', onClickCapture, { capture: true })
      context.filter = originalFilter
    }
  })

  return {
    hits: {
      get current() {
        return hits
      }
    },
    index: {
      get current() {
        return cycleIndex
      }
    }
  }
}
