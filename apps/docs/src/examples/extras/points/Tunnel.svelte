<script lang="ts">
  import { T } from '@threlte/core'
  import { Points, useGltf } from '@threlte/extras'
  import { Float32BufferAttribute } from 'three'

  interface Props {
    levels: number
  }

  let { levels }: Props = $props()

  const gltf = useGltf('/models/pointcloud_graffiti_tunnel.glb')

  const geometries = $derived.by(() => {
    if (!$gltf) return []

    const results = []
    for (const node of Object.values($gltf.nodes)) {
      if ('geometry' in node) {
        results.push(node.geometry)
      }
    }

    return results
  })
</script>

{#if $gltf}
  {#each geometries as geometry}
    <!-- <T.Points>
      <T.BufferGeometry
        oncreate={(ref) => {
          console.log(geometry)
          ref.setAttribute(
            'position',
            new Float32BufferAttribute(geometry.attributes.position.array, 3)
          )

          if (geometry.attributes.color) {
            ref.setAttribute(
              'color',
              new Float32BufferAttribute(geometry.attributes.color.array, 3)
            )
          }
        }}
      />
      <T.PointsMaterial
        vertexColors
        size={0.1}
        toneMapped={false}
      />
    </T.Points> -->

    <Points
      positions={geometry.attributes.position.array}
      colors={geometry.attributes.color.array}
    />
  {/each}
{/if}
