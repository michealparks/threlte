<script lang="ts">
	import { T } from '@threlte/core'
	import { Grid, OrbitControls, TransformControls } from '@threlte/extras'
	import { Geometry, Brush, Addition, Subtraction } from '../../lib'
	import { BoxGeometry } from 'three'
</script>

<T.PerspectiveCamera
	makeDefault
	position={[5, 5, 5]}
>
	<OrbitControls />
</T.PerspectiveCamera>

<Grid />

<T.Mesh>
	<T.MeshNormalMaterial />

	<!-- This will yield a regular THREE.BufferGeometry which needs to be paired with a mesh. -->
	<Geometry>
		{#snippet children({ update })}
			<!-- The chain begins with a base geometry, where all operations are carried out on. -->
			<Brush
				scale={1.5}
				position={[0, 0.5, 0]}
			>
				<T.TorusGeometry />
			</Brush>

			<TransformControls
				onchange={update}
				position={[-1, 1, 1]}
			>
				<!-- Chain your boolean operations: Addition, Subtraction, Difference and Intersection. -->
				<Subtraction visible>
					<!-- Geometry can be set by prop or by child, just like any regular <mesh>. -->
					<T.SphereGeometry />
					<T.MeshBasicMaterial
						transparent
						opacity={0.4}
						color="blue"
					/>
				</Subtraction>
			</TransformControls>

			<TransformControls
				position={[0, 0, -1.5]}
				onchange={update}
			>
				<!-- Geometry is re-usable, form hierachies with previously created CSG geometries. -->
				<Addition>
					<!-- Combining two boxes into a cross -->
					<Geometry>
						<Brush scale={[2, 0.5, 0.5]}>
							<T.BoxGeometry />
						</Brush>

						<Addition
							geometry={new BoxGeometry()}
							scale={[0.5, 2, 0.5]}
						/>
					</Geometry>
				</Addition>
			</TransformControls>

			<!-- You can deeply nest operations. -->
			<TransformControls
				position={[0.7, 2.2, 0]}
				onchange={update}
			>
				<Subtraction visible>
					<T.SphereGeometry args={[0.65, 32, 32]} />
					<T.MeshBasicMaterial
						transparent
						opacity={0.5}
						color="red"
					/>
				</Subtraction>
			</TransformControls>
		{/snippet}
	</Geometry>
</T.Mesh>
