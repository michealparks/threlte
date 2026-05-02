import {
  LinearSRGBColorSpace,
  LinearToneMapping,
  PerspectiveCamera,
  Scene,
  VSMShadowMap
} from 'three'
import { describe, it, expect, vi } from 'vitest'
import { mount, tick } from 'svelte'
import { render } from '@threlte/test'
import { T } from '../components/T/T.js'
import CanvasContext from './__fixtures__/CanvasContext.svelte'
import type { ThrelteContext } from '../context/compounds/useThrelte.js'
import type { Renderer } from '../context/fragments/renderer.svelte.js'

describe('useThrelte', () => {
  it('updates renderer colorSpace when set via context', async () => {
    const { context } = render(T.Group)
    context.colorSpace.set(LinearSRGBColorSpace)
    await tick()
    expect(context.renderer.outputColorSpace).toBe(LinearSRGBColorSpace)
  })

  it('updates renderer toneMapping when set via context', async () => {
    const { context } = render(T.Group)
    context.toneMapping.set(LinearToneMapping)
    await tick()
    expect(context.renderer.toneMapping).toBe(LinearToneMapping)
  })

  it('updates renderer shadows when set via context', async () => {
    const { context } = render(T.Group)
    context.shadows.set(VSMShadowMap)
    await tick()
    expect(context.renderer.shadowMap.type).toBe(VSMShadowMap)
  })

  it('disables shadows when set to false via context', async () => {
    const { context } = render(T.Group)
    context.shadows.set(false)
    await tick()
    expect(context.renderer.shadowMap.enabled).toBe(false)
  })

  it('updates renderer dpr when set via context', async () => {
    const { context } = render(T.Group)
    context.dpr.set(1)
    await tick()
    expect(context.renderer.getPixelRatio()).toBe(1)
  })

  it('allows setting a custom camera', () => {
    const { context } = render(T.Group)
    const camera = new PerspectiveCamera()
    context.camera.set(camera)
    expect(context.camera.current).toBe(camera)
  })

  it('allows setting a custom scene', () => {
    const { context } = render(T.Group)
    const scene = new Scene()
    context.scene = scene
    expect(context.scene).toBe(scene)
  })

  it('renders the current scene after setting a custom scene', async () => {
    const oncontext = vi.fn()

    mount(CanvasContext, {
      target: document.body,
      props: { oncontext }
    })
    await tick()

    const context = oncontext.mock.calls[0]![0] as ThrelteContext<Renderer>
    const scene = new Scene()
    const renderSpy = vi.spyOn(context.renderer, 'render')

    context.scene = scene
    context.invalidate()
    context.scheduler.run(16)

    expect(renderSpy.mock.calls.at(-1)?.[0]).toBe(scene)
    expect(renderSpy.mock.calls.at(-1)?.[1]).toBe(context.camera.current)
  })

  it('allows switching renderMode', () => {
    const { context } = render(T.Group)
    expect(context.renderMode.current).toBe('on-demand')

    context.renderMode.set('always')
    expect(context.renderMode.current).toBe('always')

    context.renderMode.set('manual')
    expect(context.renderMode.current).toBe('manual')
  })

  it('allows toggling autoRender', () => {
    const { context } = render(T.Group)
    expect(context.autoRender.current).toBe(true)

    context.autoRender.set(false)
    expect(context.autoRender.current).toBe(false)
  })

  it('invalidates the frame for on-demand rendering', () => {
    const { context } = render(T.Group)
    expect(context.shouldRender()).toBe(true)

    context.invalidate()
    expect(context.shouldRender()).toBe(true)
  })

  it('shouldRender reflects the current renderMode', () => {
    const { context } = render(T.Group)

    // on-demand: shouldRender is true when frame is invalidated (initial state)
    expect(context.renderMode.current).toBe('on-demand')
    expect(context.shouldRender()).toBe(true)

    // always: shouldRender is always true
    context.renderMode.set('always')
    expect(context.shouldRender()).toBe(true)
  })
})
