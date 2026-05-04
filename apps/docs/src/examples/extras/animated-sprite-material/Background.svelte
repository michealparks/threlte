<script lang="ts">
  import { T } from '@threlte/core'
  import { useTexture } from '@threlte/extras'

  const texture = await useTexture('/textures/sprites/bg.png')
</script>

<T.Sprite
  scale={7.5}
  position.z={-0.01}
  position.y={0.4}
>
  <T.MeshBasicMaterial map={texture} />
</T.Sprite>
