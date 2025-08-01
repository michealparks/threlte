<script lang="ts">
	import { untrack, type Snippet } from 'svelte'
	import { T, useParent } from '@threlte/core'
	import { BufferGeometry, Group, Mesh } from 'three'
	import { Evaluator } from 'three-bvh-csg'
	import { type Brush, TYPES } from './Brush.svelte'
	import { dispose } from '../dispose'
	import { resolve } from '../resolve'
	import { provideCSG } from '../context'

	interface Props {
		/**
		 * Use material groups, each operation can have its own material
		 * @default false
		 */
		useGroups?: boolean

		/**
		 * If true then any group in the final geometry that shares a common material
		 * with another group will be merged into one to reduce the number of draw calls
		 * required by the resulting mesh.
		 * @default true
		 */
		consolidateGroups?: boolean

		/**
		 * Show operation meshes
		 * @default false
		 */
		showOperations?: boolean

		/**
		 * Re-compute vertx normals
		 * @default false
		 */
		computeVertexNormals?: boolean

		operations?: Group
		ref?: BufferGeometry

		children?: Snippet<[{ update: () => void }]>
	}

	let {
		computeVertexNormals = false,
		useGroups = false,
		consolidateGroups = true,
		showOperations = false,
		operations: operationsRef = $bindable(),
		ref = $bindable(),
		children,
	}: Props = $props()

	const parent = useParent()
	const geometry = new BufferGeometry()
	const operations = new Group()
	const evaluator = new Evaluator()

	export const update = () => {
		let cursor = 0

		const ops = operations.children as Brush[]

		if (ops.length === 0) {
			return
		}

		// Dispose old geometry
		dispose(geometry)

		// Set the ops groups matrix to identiy
		operations.matrixWorld.identity()

		let brush1 = resolve(ops[cursor])
		cursor += 1

		if (brush1 === undefined) {
			return
		}

		while (cursor < ops.length) {
			const brush2 = resolve(ops[cursor])
			cursor += 1

			if (brush2) {
				brush1 = evaluator.evaluate(brush1, brush2, TYPES[brush2.operator ?? 'addition'])
			}
		}

		geometry.boundsTree = brush1.geometry.boundsTree
		geometry.index = brush1.geometry.index
		geometry.attributes = brush1.geometry.attributes
		geometry.groups = brush1.geometry.groups
		geometry.drawRange = brush1.geometry.drawRange

		const p = parent.current as Mesh | undefined
		if (evaluator.useGroups && p?.material) {
			p.material = brush1.material
		}

		if (computeVertexNormals) {
			geometry.computeVertexNormals()
		}
	}

	provideCSG(
		() => computeVertexNormals,
		() => showOperations,
		() => useGroups,
		() => consolidateGroups,
		update
	)

	$effect(() => {
		evaluator.useGroups = useGroups
		;(evaluator as any).consolidateGroups = consolidateGroups
		untrack(() => update())
	})
</script>

<T
	is={operations}
	bind:ref={operationsRef}
	matrixAutoUpdate={false}
>
	{@render children?.({ update })}
</T>

<T
	is={geometry}
	bind:ref
/>
