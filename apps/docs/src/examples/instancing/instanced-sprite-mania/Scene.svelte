<script lang="ts">
  import type { Snippet } from 'svelte'
  import { T, useThrelte } from '@threlte/core'
  import { CSM, Sky, useTexture } from '@threlte/extras'
  import { BackSide, NearestFilter, RepeatWrapping, MathUtils } from 'three'
  import DudeSprites from './sprites/DudeSprites.svelte'
  import FlyerSprites from './sprites/FlyerSprites.svelte'
  import FlyerSpritesTyped from './sprites/FlyerSpritesTyped.svelte'
  import GoblinSprites from './sprites/GoblinSprites.svelte'
  import TreeSpriteAtlas from './sprites/TreeSpriteAtlas.svelte'

  interface Props {
    billboarding?: boolean
    fps: number
    children?: Snippet
  }

  let { billboarding = false, fps, children }: Props = $props()

  const { dpr } = useThrelte()
  dpr.set(1)

  const [grass, sky] = await Promise.all([
    useTexture('/textures/sprites/pixel-grass.png', {
      transform: (texture) => {
        texture.wrapS = texture.wrapT = RepeatWrapping
        texture.repeat.set(500, 500)
        texture.minFilter = NearestFilter
        texture.magFilter = NearestFilter
        texture.needsUpdate = true
        return texture
      }
    }),
    useTexture('/textures/sprites/pixel-sky.png', {
      transform: (texture) => {
        texture.wrapS = texture.wrapT = RepeatWrapping
        texture.repeat.set(10, 2)
        texture.minFilter = NearestFilter
        texture.magFilter = NearestFilter
        texture.needsUpdate = true
        return texture
      }
    })
  ])
</script>

{@render children?.()}

<CSM
  args={{
    mode: 'logarithmic'
  }}
  lightDirection={[-1, -1, -1]}
  lightIntensity={5}
>
  <!--
	Dudes:
	- Michael's Aseprite loader
	- One is WASD controlled
-->
  <DudeSprites
    {billboarding}
    {fps}
  />

  <!--
	Flyers:
	- Loading .png file with multiple animations
-->
  <FlyerSprites
    {billboarding}
    {fps}
  />

  <!--
	Goblins:
	- Assemble a spritesheet out of multiple .png files.
-->
  <GoblinSprites
    {billboarding}
    {fps}
  />

  <!--
	Flyers:
	- Loading .png file with multiple animations
	- uses a typed utility hook for animation name autocomplete etc.
-->
  <FlyerSpritesTyped {billboarding} />

  <!-- Multiple trees in a spritesheet, 1 frame each animation - acting as atlas - not animated -->
  <TreeSpriteAtlas {billboarding} />

  <!-- SCENE SETUP: grass, sky, lights -->
  <T.Mesh
    position.y={-10}
    scale.y={0.5}
  >
    <T.SphereGeometry args={[300, 8, 8]} />
    <T.MeshBasicMaterial
      map={sky}
      side={BackSide}
    />
  </T.Mesh>

  <T.Mesh
    rotation.x={-MathUtils.DEG2RAD * 90}
    receiveShadow
  >
    <T.CircleGeometry args={[300]} />
    <T.MeshLambertMaterial map={grass} />
  </T.Mesh>
</CSM>

<Sky elevation={13.35} />

<T.AmbientLight intensity={1} />
