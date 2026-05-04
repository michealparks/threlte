<script lang="ts">
  import { useThrelte } from '@threlte/core'
  import { useGltf, useTexture } from '@threlte/extras'
  import { SheetObject } from '@threlte/theatre'
  import type { Mesh } from 'three'
  import { EquirectangularReflectionMapping, SRGBColorSpace } from 'three'
  import Scene from './Scene.svelte'
  import ScrollSheet from './ScrollSheet.svelte'
  import { cubeGeometry } from './state'

  type CubeGltf = {
    nodes: {
      Cube: Mesh
    }
    materials: {}
  }

  const { scene } = useThrelte()

  const [gltf, texture] = await Promise.all([
    useGltf<CubeGltf>('/cube.glb'),
    useTexture('/oil-on-water.png', {
      transform(texture) {
        texture.mapping = EquirectangularReflectionMapping
        texture.colorSpace = SRGBColorSpace
      }
    })
  ])

  cubeGeometry.set(gltf.nodes.Cube.geometry)
  scene.environment = texture
  scene.environmentIntensity = 10
</script>

<ScrollSheet
  name="Environment"
  startAtScrollPosition={0}
  endAtScrollPosition={5}
  useSpring
>
  <SheetObject
    key="Settings"
    props={{
      rotation: {
        x: 0,
        y: 0,
        z: 0
      }
    }}
    onchange={(values) => {
      scene.environmentRotation.x = values.rotation.x
      scene.environmentRotation.y = values.rotation.y
      scene.environmentRotation.z = values.rotation.z
    }}
  />
</ScrollSheet>

<Scene />
