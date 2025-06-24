import { Matrix4 } from 'three'
import { useThrelte, useTask } from '@threlte/core'
import { xrState } from './useXR.svelte'
import { controllers } from './useController.svelte'
import { hands } from './useHand.svelte'
import type { XRController } from '../types'

export type HitTestCallback = (hitMatrix: Matrix4, hit: XRHitTestResult | undefined) => void

export type UseHitTestOptions = {
  /**
   * The ray source when performing hit testing.
   *
   * @default 'viewer'
   */
  source?: 'viewer' | 'leftInput' | 'rightInput'
}

/**
 * Use this hook to perform a hit test per frame in an AR environment.
 *
 * ```ts
 * useHitTest((hitMatrix, hit) => {
 *   mesh.matrix.copy(hitMatrix)
 * }, {
 *   source: 'viewer' | 'leftInput' | 'rightInput' // Default 'viewer'
 * })
 * ```
 */
export const useHitTest = (
  hitTestCallback: HitTestCallback,
  options: UseHitTestOptions = {}
): void => {
  const source = options.source ?? 'viewer'
  const { xr } = useThrelte().renderer
  const hitMatrix = new Matrix4()

  let hitTestSource = $state<XRHitTestSource>()

  const viewerHitTest = async (session?: XRSession) => {
    if (session === undefined) {
      hitTestSource = undefined
      return
    }

    const space = await session.requestReferenceSpace('viewer')
    hitTestSource = await session.requestHitTestSource?.({ space })
  }

  const controllerHitTest = async (session?: XRSession, controller?: XRController) => {
    if (controller === undefined || session === undefined) {
      hitTestSource = undefined
      return
    }

    const space = controller.inputSource.targetRaySpace
    hitTestSource = await session.requestHitTestSource?.({ space })
  }

  const handHitTest = async (session?: XRSession, hand?: XRHand) => {
    if (hand === undefined || session === undefined) {
      hitTestSource = undefined
      return
    }

    const space = hand.get('index-finger-tip')

    if (space === undefined) {
      return
    }

    hitTestSource = await session.requestHitTestSource?.({ space })
  }

  if (source === 'viewer') {
    $effect.pre(() => {
      viewerHitTest(xrState.session)
    })
  } else {
    const controller = $derived(controllers[source === 'leftInput' ? 'left' : 'right'])
    const hand = $derived(hands[source === 'leftInput' ? 'left' : 'right'])

    $effect.pre(() => {
      controllerHitTest(xrState.session, controller)
    })

    $effect.pre(() => {
      handHitTest(xrState.session, hand)
    })
  }

  const { start, stop } = useTask(
    () => {
      const referenceSpace = xr.getReferenceSpace()

      if (referenceSpace === null || hitTestSource === undefined) {
        return hitTestCallback(hitMatrix, undefined)
      }

      const [hit] = xr.getFrame().getHitTestResults(hitTestSource)
      const pose = hit?.getPose(referenceSpace)

      if (pose === undefined) {
        return hitTestCallback(hitMatrix, undefined)
      }

      hitMatrix.fromArray(pose.transform.matrix)
      hitTestCallback(hitMatrix, hit)
    },
    { autoStart: false }
  )

  $effect.pre(() => {
    if (!xrState.isPresenting) {
      stop()
      return
    }

    if (hitTestSource === undefined) {
      stop()
      // Execute callback one last time to inform consumers of no hits.
      hitTestCallback(hitMatrix, undefined)
    } else {
      start()
    }
  })
}
