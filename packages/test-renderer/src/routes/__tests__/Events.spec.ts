import { describe, it, expect } from 'vitest'
import { render } from '../../lib'
import Events from '../Events.svelte'

describe('<Events>', () => {
	it('creates a new mesh every time one is clicked', async () => {
		const { scene, fireEvent } = render(Events)

		const mesh0 = scene.getObjectByName('mesh-0')
		expect(mesh0).toBeDefined()
		await fireEvent(mesh0!, 'click')

		const mesh1 = scene.getObjectByName('mesh-1')
		expect(mesh1).toBeDefined()
		await fireEvent(mesh1!, 'click')

		const mesh2 = scene.getObjectByName('mesh-2')
		expect(mesh2).toBeDefined()
	})
})
