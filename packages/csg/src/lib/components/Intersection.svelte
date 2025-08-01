<script lang="ts">
	import Brush, { type Props } from './Brush.svelte'

	let { children, ref = $bindable(), ...rest }: Omit<Props, 'operator'> = $props()
</script>

<Brush
	bind:ref
	operator="intersection"
	{...rest}
>
	{@render children?.()}
</Brush>
