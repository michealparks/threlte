import { createCacheContext } from './fragments/cache'
import { createCameraContext } from './fragments/camera'
import { createDisposalContext } from './fragments/disposal'
import { createDOMContext, type CreateDOMContextOptions } from './fragments/dom.svelte'
import { createParentContext } from './fragments/parent'
import { createRootParentObject3DContext } from './fragments/parentObject3D'
import {
  createRendererContext,
  type CreateRendererContextOptions,
  type Renderer
} from './fragments/renderer.svelte'
import { createSceneContext } from './fragments/scene'
import {
  createSchedulerContext,
  type CreateSchedulerContextOptions
} from './fragments/scheduler.svelte'
import { createUserContext } from './fragments/user'
import type { ThrelteContext } from './compounds/useThrelte'
import { setContext } from 'svelte'

export type CreateThrelteContextOptions<T extends Renderer> = CreateRendererContextOptions<T> &
  CreateDOMContextOptions &
  CreateSchedulerContextOptions

export const createThrelteContext = <T extends Renderer>(
  options: CreateThrelteContextOptions<T>
) => {
  const domCtx = createDOMContext(options)
  const sceneCtx = createSceneContext()
  const cacheCtx = createCacheContext()
  const parentCtx = createParentContext(sceneCtx.scene)
  const object3dCtx = createRootParentObject3DContext(sceneCtx.scene)
  const disposalCtx = createDisposalContext()
  const schedulerCtx = createSchedulerContext(options)
  const cameraCtx = createCameraContext()
  const userCtx = createUserContext()
  const rendererCtx = createRendererContext(options)

  const context: ThrelteContext<T> = {
    advance: schedulerCtx.advance,
    autoRender: schedulerCtx.autoRender,
    autoRenderTask: rendererCtx.autoRenderTask,
    camera: cameraCtx.camera,
    colorManagementEnabled: rendererCtx.colorManagementEnabled,
    colorSpace: rendererCtx.colorSpace,
    dpr: rendererCtx.dpr,
    invalidate: schedulerCtx.invalidate,
    mainStage: schedulerCtx.mainStage,
    renderer: rendererCtx.renderer as T,
    renderMode: schedulerCtx.renderMode,
    renderStage: schedulerCtx.renderStage,
    scheduler: schedulerCtx.scheduler,
    shadows: rendererCtx.shadows,
    shouldRender: schedulerCtx.shouldRender,
    dom: domCtx.dom,
    canvas: domCtx.canvas,
    size: domCtx.size,
    toneMapping: rendererCtx.toneMapping,
    get scene() {
      return sceneCtx.scene
    },
    set scene(scene) {
      sceneCtx.scene = scene
    }
  }

  setContext<ThrelteContext<T>>('threlte-context', context)

  return {
    scene: sceneCtx.scene,
    ...domCtx,
    ...cacheCtx,
    ...parentCtx,
    ...object3dCtx,
    ...disposalCtx,
    ...schedulerCtx,
    ...cameraCtx,
    ...rendererCtx,
    ...userCtx
  }
}
