<script
  lang="ts"
  module
>
  import { Group } from 'three'
  import { T, useThrelte, useTask } from '@threlte/core'
  import type { XRHandEvents } from '../types'
  import { isHandTracking, handEvents } from '../internal/stores'
  import { left as leftStore, right as rightStore } from '../hooks/useHand'
  import type { Snippet } from 'svelte'

  const stores = {
    left: leftStore,
    right: rightStore
  } as const
</script>

<script lang="ts">
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

  $effect.pre(() =>
    handEvents[handedness].set({
      onconnected,
      ondisconnected,
      onpinchend,
      onpinchstart
    })
  )

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
    if ($isHandTracking && (wrist !== undefined || children !== undefined) && inputSource) {
      start()
    } else {
      stop()
    }
  })

  const store = $derived(stores[handedness])
  const inputSource = $derived($store?.inputSource)
  const model = $derived($store?.model)
</script>

{#if $store?.hand && $isHandTracking}
  <T is={$store.hand}>
    {#if children === undefined}
      <T is={model} />
    {/if}
  </T>

  {#if targetRay !== undefined}
    <T is={$store.targetRay}>
      {@render targetRay()}
    </T>
  {/if}
{/if}

{#if $isHandTracking}
  <T
    is={group}
    attach={scene}
  >
    {@render wrist?.()}
    {@render children?.()}
  </T>
{/if}
