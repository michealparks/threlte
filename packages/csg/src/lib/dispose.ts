import type { BufferGeometry } from 'three'

export const dispose = (geometry: BufferGeometry) => {
	geometry.dispose()

	geometry.attributes = {}
	geometry.groups = []
	;(geometry as any).boundsTree =
		geometry.index =
		geometry.boundingBox =
		geometry.boundingSphere =
			null

	geometry.drawRange = { start: 0, count: Infinity }
}
