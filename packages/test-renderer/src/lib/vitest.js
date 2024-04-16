import { afterEach } from 'vitest'
import { act, cleanup } from './index'

afterEach(async () => {
	await act()
	cleanup()
})
