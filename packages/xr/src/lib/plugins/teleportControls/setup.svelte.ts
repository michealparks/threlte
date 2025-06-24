import { xrState } from '../../hooks/useXR.svelte'
import type { Context, HandContext } from './context'
import { controllers } from '../../hooks/useController.svelte'
import { useTeleport } from '../../hooks/useTeleport'
import { useFixed } from '../../internal/useFixed'
import { teleportIntersection } from '../../internal/state.svelte'
import { fromStore } from 'svelte/store'

export const setupTeleportControls = (
  context: Context,
  handContext: HandContext,
  fixedStep = 1 / 40
) => {
  const enabled = fromStore(handContext.enabled)
  const handedness = handContext.hand
  const controller = $derived(controllers[handedness])
  const teleport = useTeleport()

  const handleHoverEnd = () => {
    handContext.hovered.set(undefined)
    teleportIntersection[handedness].set(undefined)
  }

  const { start, stop } = useFixed(
    () => {
      const gamepad = controller?.inputSource.gamepad

      if (gamepad === undefined) {
        return
      }

      const selecting = (gamepad.axes[3] ?? 0) < -0.8

      if (handContext.active.current && !selecting) {
        handContext.active.set(false)
      } else if (!handContext.active.current && selecting) {
        handContext.active.set(true)
      }

      if (!handContext.active.current) {
        if (handContext.hovered.current !== undefined) {
          teleport(handContext.hovered.current.point)
          handleHoverEnd()
        }
        return
      }

      context.compute(context, handContext)

      const [intersect] = context.raycaster.intersectObjects(context.interactiveObjects, true)

      if (intersect === undefined) {
        if (handContext.hovered.current !== undefined) {
          handleHoverEnd()
        }
        return
      }

      if (intersect !== undefined && context.blockers.has(intersect.object.uuid)) {
        if (handContext.hovered.current !== undefined) {
          handleHoverEnd()
        }
        return
      }

      teleportIntersection[handedness].set(intersect)
      handContext.hovered.set(intersect)
    },
    {
      fixedStep,
      autoStart: false
    }
  )

  $effect.pre(() => {
    if (xrState.isPresenting && enabled) {
      start()
    } else {
      stop()
    }
  })
}
