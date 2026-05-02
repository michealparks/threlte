import { describe, expect, it } from 'vitest'
import { render } from '@threlte/test'
import UseTaskAutoInvalidation from './__fixtures__/UseTaskAutoInvalidation.svelte'

describe('useTask', () => {
  it('keeps on-demand rendering invalidated while another task with the same callback is running', async () => {
    const { context, rerender, advance } = render(UseTaskAutoInvalidation)

    expect(context.shouldRender()).toBe(true)
    advance()
    expect(context.shouldRender()).toBe(true)

    await rerender({ firstRunning: false })
    advance()

    expect(context.shouldRender()).toBe(true)

    await rerender({ secondRunning: false })
    advance()

    expect(context.shouldRender()).toBe(false)
  })
})
