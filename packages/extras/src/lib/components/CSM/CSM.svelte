<script lang="ts">
  import { useTask, useThrelte, watch } from '@threlte/core'
  import { onDestroy } from 'svelte'
  import type { Camera, ColorRepresentation, Vector3Tuple } from 'three'
  import type { CSMParameters } from 'three/examples/jsm/csm/CSM.js'
  import { CSM } from 'three/examples/jsm/csm/CSM.js'
  import { useMaterials } from './useMaterials'
  import { writable } from 'svelte/store'

  interface Props {
    /**
     * Whether or not CSM is enabled. If `enabled={false}`, a slot named
     * `"disabled"` will be rendered.
     */
    enabled?: boolean

    /**
     * The arguments to pass to the CSM constructor.
     */
    args: Partial<CSMParameters>

    /**
     * The camera to use for CSM. Defaults to the camera set by `makeDefault`.
     */
    camera?: Camera

    /**
     * A configuration callback, which is triggered when CSM is activated. This
     * callback facilitates advanced configurations, such as enabling the fade
     * feature.
     */
    configure?: (csm: CSM) => void

    lightIntensity?: number
    lightColor?: ColorRepresentation
    lightDirection?: Vector3Tuple
  }

  let {
    enabled = true,
    args = {},
    camera,
    configure,
    lightIntensity,
    lightColor,
    lightDirection = [1, -1, 1]
  }: Props = $props()

  const { camera: defaultCamera, scene, size, useLegacyLights } = useThrelte()

  let csm = $state<CSM | undefined>()

  useTask(() => csm?.update(), { autoInvalidate: false })

  const { onNewMaterial, allMaterials } = useMaterials()

  const disposeCsm = () => {
    csm?.remove()
    csm?.dispose()
    csm = undefined
  }

  $effect.pre(() => {
    size
    csm?.updateFrustums()
  })

  // set any CSM props that require frustum updates
  $effect(() => {
    if (!csm) return
    csm.camera = camera ?? $defaultCamera
    if (args.maxFar !== undefined) csm.maxFar = args.maxFar
    if (args.mode !== undefined) csm.mode = args.mode
    csm.updateFrustums()
  })

  const enabledStore = writable(enabled)
  $effect.pre(() => enabledStore.set(enabled))

  watch(enabledStore, ($enabled) => {
    if ($enabled) {
      csm = new CSM({
        camera: camera ?? $defaultCamera,
        parent: scene,
        ...args
      })
      configure?.(csm)
      for (const material of allMaterials) {
        csm.setupMaterial(material)
      }
      onNewMaterial((material) => csm?.setupMaterial(material))
    } else {
      onNewMaterial(undefined)
      disposeCsm()
    }
  })

  $effect.pre(() => {
    csm?.lights.forEach((light) => {
      if (lightIntensity !== undefined) {
        light.intensity = lightIntensity / (useLegacyLights ? 1 : Math.PI)
      }
    })
  })

  $effect.pre(() => {
    csm?.lights.forEach((light) => {
      if (lightColor !== undefined) {
        light.color.set(lightColor)
      }
    })
  })

  $effect.pre(() => {
    csm?.lightDirection.set(...lightDirection).normalize()
  })

  onDestroy(disposeCsm)
</script>

<slot />

{#if !enabled}
  <slot name="disabled" />
{/if}
