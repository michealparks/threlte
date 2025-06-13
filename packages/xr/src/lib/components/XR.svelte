<!--

@component `<XR />` is a WebXR manager that configures your scene for XR rendering and interaction.

This should be placed within a Threlte `<Canvas />`.

```svelte
  <XR
    foveation={1}
    frameRate={90}
    referenceSpace='local-floor'
    onsessionstart={(event: XREvent<XRManagerEvent>) => {}}
    onsessionend={(event: XREvent<XRManagerEvent>) => {}}
    onvisibilitychange={(event: XREvent<XRSessionEvent>) => {}}
    oninputsourceschange={(event: XREvent<XRSessionEvent>) => {}}
  />
```

-->
<script lang="ts">
  import { untrack, type Snippet } from 'svelte'
  import { useThrelte } from '@threlte/core'
  import type { XRSessionEvent } from '../types'
  import { xrState } from '../internal/state.svelte'
  import { setupRaf } from '../internal/setupRaf'
  import { setupHeadset } from '../internal/setupHeadset.svelte'
  import { setupControllers } from '../internal/setupControllers'
  import { setupHands } from '../internal/setupHands'

  interface Props {
    /**
     * Enables foveated rendering. Default is `1`, the three.js default.
     *
     * 0 = no foveation, full resolution
     *
     * 1 = maximum foveation, the edges render at lower resolution
     */
    foveation?: number

    /**
     * The target framerate for the XRSystem. Smaller rates give more CPU headroom at the cost of responsiveness.
     * Recommended range is `72`-`120`. Default is unset and left to the device.
     * @note If your experience cannot effectively reach the target framerate, it will be subject to frame reprojection
     * which will halve the effective framerate. Choose a conservative estimate that balances responsiveness and
     * headroom based on your experience.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API/Rendering#refresh_rate_and_frame_rate
     */
    frameRate?: number | undefined

    /** Type of WebXR reference space to use. Default is `local-floor` */
    referenceSpace?: XRReferenceSpaceType

    fallback?: Snippet
    children?: Snippet

    /** Called as an XRSession is requested */
    onsessionstart?: (event: XRSessionEvent<'sessionstart'>) => void

    /** Called after an XRSession is terminated */
    onsessionend?: (event: XRSessionEvent<'sessionend'>) => void

    /** Called when an XRSession is hidden or unfocused. */
    onvisibilitychange?: (event: globalThis.XRSessionEvent) => void

    /** Called when available inputsources change */
    oninputsourceschange?: (event: globalThis.XRSessionEvent) => void
  }

  let {
    foveation = 1,
    frameRate,
    referenceSpace = 'local-floor',
    onsessionstart,
    onsessionend,
    onvisibilitychange,
    oninputsourceschange,
    fallback,
    children
  }: Props = $props()

  const { renderer, renderMode } = useThrelte()
  const { xr } = renderer

  xrState.xr = renderer.xr

  let originalRenderMode = $renderMode

  setupRaf()
  setupHeadset()
  setupControllers()
  setupHands()

  const handleSessionStart = () => {
    xrState.isPresenting = true
    onsessionstart?.({ type: 'sessionstart', target: xrState.session } as any)
  }

  const handleSessionEnd = () => {
    onsessionend?.({ type: 'sessionend', target: xrState.session } as any)
    xrState.isPresenting = false
    xrState.session = undefined
  }

  const handleVisibilityChange = (event: globalThis.XRSessionEvent) => {
    onvisibilitychange?.({ ...event, target: xrState.session! })
  }

  const handleInputSourcesChange = (event: XRInputSourcesChangeEvent) => {
    xrState.isHandTracking = Object.values(event.session.inputSources).some((source) => source.hand)
    oninputsourceschange?.({ ...event, target: xrState.session! })
  }

  const handleFramerateChange = (event: globalThis.XRSessionEvent) => {
    onvisibilitychange?.({ ...event, target: xrState.session! })
  }

  $effect.pre(() => {
    xr.setFoveation(foveation)
  })

  $effect.pre(() => {
    if (frameRate === undefined) return

    try {
      xrState.session?.updateTargetFrameRate(frameRate)
    } catch {
      // Do nothing
    }
  })

  $effect.pre(() => {
    xr.setReferenceSpaceType(referenceSpace)
    xrState.referenceSpaceType = referenceSpace
  })

  $effect.pre(() => {
    if (xrState.isPresenting) {
      originalRenderMode = renderMode.current
      renderMode.set('always')
    } else {
      renderMode.set(originalRenderMode)
    }
  })

  $effect.pre(() => {
    xr.enabled = true
    xr.addEventListener('sessionstart', handleSessionStart)
    xr.addEventListener('sessionend', handleSessionEnd)

    return () => {
      xr.enabled = false
      xr.removeEventListener('sessionstart', handleSessionStart)
      xr.removeEventListener('sessionend', handleSessionEnd)
    }
  })

  $effect.pre(() => {
    if (xrState.session === undefined) return

    const { session } = xrState

    session.addEventListener('visibilitychange', handleVisibilityChange)
    session.addEventListener('inputsourceschange', handleInputSourcesChange)
    session.addEventListener('frameratechange', handleFramerateChange)

    return () => {
      session.removeEventListener('visibilitychange', handleVisibilityChange)
      session.removeEventListener('inputsourceschange', handleInputSourcesChange)
      session.removeEventListener('frameratechange', handleFramerateChange)
    }
  })

  $effect.pre(() => {
    return () => {
      // if unmounted while presenting (e.g. due to sveltekit navigation), end the session
      untrack(() => xrState.session)?.end()
    }
  })
</script>

{#if xrState.isPresenting}
  {@render children?.()}
{:else}
  {@render fallback?.()}
{/if}
