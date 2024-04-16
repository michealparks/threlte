<script>
	import { T } from '@threlte/core'

	let count = 1
</script>

{#each { length: count } as _, index}
	<T.Mesh name="mesh-{index}" on:click={() => (count += 1)}>
		<T.MeshStandardMaterial />
		<T.BoxGeometry />
	</T.Mesh>
{/each}
