import { getContext, setContext } from 'svelte'

const key = Symbol('csg')

interface Context {
	computeVertexNormals: boolean
	visible: boolean
	useGroups: boolean
	consolidateGroups: boolean
	update: () => void
}

export const provideCSG = (
	computeVertexNormals: () => boolean,
	visible: () => boolean,
	useGroups: () => boolean,
	consolidateGroups: () => boolean,
	update: () => void
) => {
	setContext<Context>(key, {
		get computeVertexNormals() {
			return computeVertexNormals()
		},
		get visible() {
			return visible()
		},
		get useGroups() {
			return useGroups()
		},
		get consolidateGroups() {
			return consolidateGroups()
		},
		update,
	})
}

export const useCSG = () => {
	return getContext<Context>(key)
}
