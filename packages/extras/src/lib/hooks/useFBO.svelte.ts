import type { RenderTargetOptions } from 'three'
import { DepthTexture, WebGLRenderTarget } from 'three'
import { isInstanceOf, useThrelte } from '@threlte/core'

export interface UseFBOOptions extends Omit<RenderTargetOptions, 'depth'> {
  /**
   * if set, the scene depth will be rendered into buffer.depthTexture
   */
  depth?: { width?: number; height?: number } | DepthTexture | boolean
  /**
   * if set, the render target size will be set to the corresponding width and height and not use or follow the size of the canvas
   */
  size?: { width?: number; height?: number }
}

export const useFBO = (options?: () => UseFBOOptions | undefined): WebGLRenderTarget => {
  const { dpr, size: defaultSize } = useThrelte()

  const { size, depth, ...targetOptions } = $derived(options?.() ?? {})

  const target = $derived(new WebGLRenderTarget(1, 1, targetOptions))

  $effect(() => {
    // first set the width and height because if a depth texture has to be created, it can only have its width and height set in its constructor
    if (size === undefined) {
      target.setSize(
        dpr.current * defaultSize.current.width,
        dpr.current * defaultSize.current.height
      )
    } else {
      target.setSize(size.width ?? 1, size.height ?? 1)
    }
  })

  $effect(() => {
    if (depth === true) {
      target.depthTexture = new DepthTexture(target.width, target.height)
    } else if (isInstanceOf(depth, 'DepthTexture')) {
      target.depthTexture = depth
    } else if (depth !== false) {
      const width = Math.max(depth?.width ?? 1, 1)
      const height = Math.max(depth?.height ?? 1, 1)
      target.depthTexture = new DepthTexture(width, height)
    }
  })

  $effect(() => {
    return () => target.dispose()
  })

  return target
}
