<script lang="ts">
  import type { Snippet } from 'svelte'
  import { Group } from 'three'
  import { T, useThrelte, useTask } from '@threlte/core'
  import type { XRHandEvents } from '../types'
  import { xrState } from '../hooks/useXR.svelte'
  import { handEvents } from '../internal/setupHands.svelte'
  import { hands } from '../hooks/useHand.svelte'

  type Props = {
    children?: Snippet
    targetRay?: Snippet
    wrist?: Snippet
  } & XRHandEvents &
    (
      | {
          /** Whether the XRHand should be matched with the left hand. */
          left: true
          right?: undefined
          hand?: undefined
        }
      | {
          /** Whether the XRHand should be matched with the right hand. */
          right: true
          left?: undefined
          hand?: undefined
        }
      | {
          /** Whether the XRHand should be matched with the left or right hand. */
          hand: 'left' | 'right'
          left?: undefined
          right?: undefined
        }
    )

  const {
    left,
    right,
    hand,
    onconnected,
    ondisconnected,
    onpinchend,
    onpinchstart,
    children,
    targetRay,
    wrist
  }: Props = $props()

  const { scene, renderer, scheduler, renderStage } = useThrelte()
  const { xr } = renderer
  const space = xr.getReferenceSpace()

  const handedness = $derived<'left' | 'right'>(left ? 'left' : right ? 'right' : hand ?? 'left')

  $effect.pre(() => {
    handEvents[handedness] = {
      onconnected,
      ondisconnected,
      onpinchend,
      onpinchstart
    }
  })

  const group = new Group()

  /**
   * Currently children of a hand XRSpace or model will not
   * move relative to their parent, so this hack of checking wrist position
   * and syncing any snippets is used.
   *
   * @todo(mp) investigate why this is happening and see if there's
   * a way to just parent to the hand to avoid this.
   */
  const { start, stop } = useTask(
    () => {
      const frame = xr.getFrame()
      const joint = inputSource?.get('wrist')

      if (joint === undefined || space === null) return

      const pose = frame.getJointPose?.(joint, space)

      // This isn't correctly typed by @types/xr. Pose can also be null.
      if (pose === undefined || pose === null) return

      const { position, orientation } = pose.transform
      group.position.set(position.x, position.y, position.z)
      group.quaternion.set(orientation.x, orientation.y, orientation.z, orientation.w)
    },
    {
      autoStart: false,
      stage: scheduler.createStage(Symbol('xr-hand-stage'), { before: renderStage })
    }
  )

  $effect.pre(() => {
    if (xrState.isHandTracking && (wrist !== undefined || children !== undefined) && inputSource) {
      start()
    } else {
      stop()
    }
  })

  const xrHand = $derived(hands[handedness])
  const inputSource = $derived(xrHand?.inputSource)
  const model = $derived(xrHand?.model)
</script>

{#if xrHand?.hand && xrState.isHandTracking}
  <T is={xrHand.hand}>
    {#if children === undefined}
      <T is={model} />
    {/if}
  </T>

  {#if targetRay !== undefined}
    <T is={xrHand.targetRay}>
      {@render targetRay()}
    </T>
  {/if}
{/if}

{#if xrState.isHandTracking}
  <T
    is={group}
    attach={scene}
  >
    {@render wrist?.()}
    {@render children?.()}
  </T>
{/if}
