import { getContext, setContext } from 'svelte'
import {
  AgXToneMapping,
  ColorManagement,
  PCFSoftShadowMap,
  WebGLRenderer,
  type ColorSpace,
  type ShadowMapType,
  type ToneMapping
} from 'three'
import type { Task } from '../../frame-scheduling'
import { useTask } from '../../hooks/useTask'
import { currentWritable, watch, type CurrentWritable } from '../../utilities'
import { useCamera } from './camera'
import { useDisposal } from './disposal'
import { useDOM } from './dom.svelte'
import { useScene } from './scene'
import { useScheduler } from './scheduler.svelte'
import type { WebGPURenderer } from 'three/webgpu'

export type Renderer = WebGLRenderer | WebGPURenderer

type CreateRenderer<T extends Renderer> = (canvas: HTMLCanvasElement) => T

type RendererContext<T extends Renderer> = {
  renderer: T
  colorManagementEnabled: CurrentWritable<boolean>
  colorSpace: CurrentWritable<ColorSpace>
  toneMapping: CurrentWritable<ToneMapping>
  shadows: CurrentWritable<boolean | ShadowMapType>
  dpr: CurrentWritable<number>
  autoRenderTask: Task
}

export type CreateRendererContextOptions<T extends Renderer> = {
  createRenderer?: CreateRenderer<T>
  /**
   * Colors supplied to three.js — from color pickers, textures, 3D models, and other sources —
   * each have an associated color space. Those not already in the Linear-sRGB working color
   * space must be converted, and textures be given the correct texture.colorSpace assignment.
   *
   * Set to true for certain conversions (for hexadecimal and CSS colors in sRGB) to be made automatically.
   *
   * This property is not reactive and must be enabled before initializing colors.
   *
   * @default true
   */
  colorManagementEnabled?: boolean
  /**
   * @default 'srgb'
   */
  colorSpace?: ColorSpace
  /**
   * @default AgXToneMapping
   */
  toneMapping?: ToneMapping
  /**
   * @default PCFSoftShadowMap
   */
  shadows?: boolean | ShadowMapType
  /**
   * @default window.devicePixelRatio
   */
  dpr?: number
}

export const createRendererContext = <T extends Renderer>(
  options: CreateRendererContextOptions<T>
): RendererContext<T> => {
  const { dispose } = useDisposal()
  const { camera } = useCamera()
  const { scene } = useScene()
  const { invalidate, renderStage, autoRender, scheduler, resetFrameInvalidation } = useScheduler()
  const { size, canvas } = useDOM()

  const renderer =
    options.createRenderer?.(canvas) ??
    (new WebGLRenderer({
      canvas,
      powerPreference: 'high-performance',
      antialias: true,
      alpha: true
    }) as T)

  const autoRenderTask = renderStage.createTask(Symbol('threlte-auto-render-task'), () => {
    renderer.render(scene, camera.current)
  })

  const colorManagementEnabled = currentWritable(options.colorManagementEnabled ?? true)
  const colorSpace = currentWritable(options.colorSpace ?? 'srgb')
  const dpr = currentWritable(options.dpr ?? window.devicePixelRatio)
  const shadows = currentWritable(options.shadows ?? PCFSoftShadowMap)
  const toneMapping = currentWritable(options.toneMapping ?? AgXToneMapping)

  // Resize the renderer when the size changes
  const { start, stop } = useTask(
    () => {
      if (renderer.xr.isPresenting) return
      renderer.setSize(size.current.width, size.current.height)
      invalidate()
      stop()
    },
    {
      before: autoRenderTask,
      autoStart: false,
      autoInvalidate: false
    }
  )

  watch([size], () => {
    start()
  })

  watch([autoRender], ([autoRender]) => {
    if (autoRender) {
      autoRenderTask.start()
    } else {
      autoRenderTask.stop()
    }
    return () => {
      autoRenderTask.stop()
    }
  })

  if ('setAnimationLoop' in renderer) {
    renderer.setAnimationLoop((time) => {
      dispose()
      scheduler.run(time)
      resetFrameInvalidation()
    })
  }

  $effect.pre(() => {
    return () => {
      if ('dispose' in renderer) {
        renderer.dispose()
      }
    }
  })

  $effect.pre(() => {
    const value = options.colorManagementEnabled ?? true
    colorManagementEnabled.set(value)
    ColorManagement.enabled = value
  })

  $effect.pre(() => {
    const value = options.colorSpace ?? 'srgb'
    colorSpace.set(value)
    renderer.outputColorSpace = value
  })

  $effect.pre(() => {
    const value = options.toneMapping ?? AgXToneMapping
    toneMapping.set(value)
    renderer.toneMapping = value
  })

  $effect.pre(() => {
    const value = options.shadows ?? PCFSoftShadowMap
    shadows.set(value)

    renderer.shadowMap.enabled = !!shadows
    if (value && value !== true) {
      renderer.shadowMap.type = value
    } else if (value === true) {
      renderer.shadowMap.type = PCFSoftShadowMap
    }
  })

  $effect.pre(() => {
    const value = options.dpr ?? window.devicePixelRatio
    dpr.set(value)
    renderer.setPixelRatio(value)
  })

  const context: RendererContext<T> = {
    renderer,
    colorManagementEnabled,
    colorSpace,
    dpr,
    shadows,
    toneMapping,
    autoRenderTask
  }

  setContext<RendererContext<T>>('threlte-renderer-context', context)

  return context
}

export const useRenderer = <T extends Renderer>(): RendererContext<T> => {
  const context = getContext<RendererContext<T>>('threlte-renderer-context')

  if (!context) {
    throw new Error('useRenderer can only be used in a child component to <Canvas>.')
  }

  return context
}
