<script
	module
	lang="ts"
>
	import type { Snippet } from 'svelte'
	import { T, type Props as ThrelteProps } from '@threlte/core'
	import {
		SUBTRACTION,
		ADDITION,
		DIFFERENCE,
		INTERSECTION,
		REVERSE_SUBTRACTION,
		HOLLOW_SUBTRACTION,
		HOLLOW_INTERSECTION,
		Brush as CSGBrush,
	} from 'three-bvh-csg'
	import { useCSG } from '../context'

	export interface Brush extends CSGBrush {
		operator?: keyof typeof TYPES
	}

	export interface Props extends ThrelteProps<typeof CSGBrush> {
		operator?: keyof typeof TYPES
		ref?: Brush
		children?: Snippet
	}

	export const TYPES = {
		addition: ADDITION,
		subtraction: SUBTRACTION,
		difference: DIFFERENCE,
		intersection: INTERSECTION,
		reverseSubtraction: REVERSE_SUBTRACTION,
		hollowSubtraction: HOLLOW_SUBTRACTION,
		hollowIntersection: HOLLOW_INTERSECTION,
	}
</script>

<script lang="ts">
	let { ref = $bindable(), children, ...rest }: Props = $props()

	const csg = useCSG()
</script>

<T
	is={CSGBrush}
	bind:ref
	raycast={() => null}
	visible={rest.visible || csg.visible}
	{...rest}
>
	{@render children?.()}
</T>
