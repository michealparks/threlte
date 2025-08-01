import { Object3D } from 'three'
import type { Brush } from './components/Brush.svelte'
import { Brush as BrushImpl } from 'three-bvh-csg'

export const resolve = (object3d: Object3D): Brush | undefined => {
	let currentOp: Object3D | undefined

	if (object3d instanceof BrushImpl) {
		object3d.updateMatrixWorld()
		currentOp = object3d
	} else {
		object3d.traverse((child) => {
			child.updateMatrixWorld()
			if (!currentOp && child instanceof BrushImpl) {
				currentOp = child
			}
		})
	}

	return currentOp as Brush | undefined
}
