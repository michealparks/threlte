<script lang="ts">
  import type { SpaceshipProps } from './types'
  import { T } from '@threlte/core'
  import { useGltf } from '@threlte/extras'

  let { name, ...props }: SpaceshipProps = $props()

  const gltf = await useGltf(`/models/spaceships/${name}.gltf`)
</script>

<T.Group {...props}>
  <T
    is={gltf.scene}
    oncreate={(ref) => {
      for (const child of ref.children) {
        child.castShadow = true
        child.receiveShadow = true
      }
    }}
  />
</T.Group>
