import { Matrix4 } from 'three'
import { useThrelte, useTask, observe } from '@threlte/core'
import { useXR } from './useXR.svelte'
import { useController } from './useController'

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
  const { session, isPresenting } = useXR()
  const hitMatrix = new Matrix4()

  let hitTestSource = $state<XRHitTestSource>()

  const setHitTestSource = async (space?: XRSpace) => {
    if (space === undefined) {
      hitTestSource = undefined
      return
    }

    hitTestSource = await session.current?.requestHitTestSource?.({ space })
  }

  if (source === 'viewer') {
    observe(
      () => [session.current],
      ([session]) => {
        session?.requestReferenceSpace('viewer').then(async (space) => {
          setHitTestSource(space)
        })
      }
    )
  } else {
    const controller = useController(source === 'leftInput' ? 'left' : 'right')
    const hand = useController(source === 'leftInput' ? 'left' : 'right')

    observe(
      () => [controller, session.current],
      ([input]) => {
        const space = input?.inputSource.targetRaySpace
        setHitTestSource(space)
      }
    )

    observe(
      () => [hand, session.current],
      ([input]) => {
        const space = input?.inputSource.targetRaySpace
        setHitTestSource(space)
      }
    )
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

  observe(
    () => [isPresenting.current, hitTestSource],
    ([isPresenting, testSource]) => {
      if (!isPresenting) {
        stop()
        return
      }

      if (testSource === undefined) {
        stop()
        // Execute callback one last time to inform consumers of no hits.
        hitTestCallback(hitMatrix, undefined)
      } else {
        start()
      }
    }
  )
}
