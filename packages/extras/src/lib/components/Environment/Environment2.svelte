<script lang="ts">
  import { useCache, useParent, useThrelte } from '@threlte/core'
  import { onDestroy } from 'svelte'
  import type { Scene } from 'three'
  import {
    CubeReflectionMapping,
    CubeTextureLoader,
    EquirectangularReflectionMapping,
    FloatType,
    Texture,
    TextureLoader,
    SRGBColorSpace,
    LinearSRGBColorSpace
  } from 'three'
  import { HDRCubeTextureLoader } from 'three/examples/jsm/loaders/HDRCubeTextureLoader.js'
  import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
  import type { EnvironmentProps } from './Environment.svelte'
  import GroundProjectedSkybox from './GroundProjectedSkybox.svelte'
  import { useSuspense } from '../../suspense/useSuspense'

  let {
    path = '',
    files,
    isBackground,
    groundProjection,
    format,
    colorSpace,
    ...props
  }: EnvironmentProps = $props()

  const isScene = (obj: any): obj is Scene => 'isScene' in obj

  const { scene: globalScene, invalidate } = useThrelte()
  const parent = useParent()

  let scene = $derived(isScene($parent) ? $parent : globalScene)

  let previousSceneEnvironment = scene.environment
  let previousSceneBackground = scene.background

  let isCubeMap = $derived(Array.isArray(files))
  let envPath = $derived(`${path}${files}`)

  let previousEnvPath: string = $state(envPath)
  let previousEnvMap: Texture | undefined = $state()
  let previousFormat: string | undefined = $state()

  const pickLoader = (): typeof CubeTextureLoader | typeof TextureLoader => {
    const inferredFormat =
      format || (Array.isArray(files) ? files[0] : files).split('.').pop() == 'hdr' ? 'hdr' : 'ldr'

    if (isCubeMap && inferredFormat == 'ldr') return CubeTextureLoader
    if (!isCubeMap && inferredFormat == 'ldr') return TextureLoader
    if (isCubeMap && inferredFormat == 'hdr') return HDRCubeTextureLoader
    if (!isCubeMap && inferredFormat == 'hdr') return RGBELoader
    return TextureLoader
  }

  const { remember } = useCache()

  const suspend = useSuspense()

  const loadEnvironment = async () => {
    const LoaderType = pickLoader()
    const loader: any = new LoaderType()
    loader.setDataType?.(FloatType)

    const filesKey = Array.isArray(files) ? files.join(',') : files
    const cacheKey = [LoaderType, path, filesKey]

    const texture = await remember(async () => {
      return suspend(
        new Promise<Texture>((resolve) => {
          loader.setPath(path).load(files, (texture: Texture) => {
            resolve(texture)
          })
        })
      )
    }, cacheKey)

    texture.mapping = isCubeMap ? CubeReflectionMapping : EquirectangularReflectionMapping
    texture.colorSpace = colorSpace ?? isCubeMap ? LinearSRGBColorSpace : SRGBColorSpace

    previousEnvMap = texture
    scene.environment = previousEnvMap

    if (isBackground) {
      scene.background = previousEnvMap
    }

    invalidate()

    previousFormat = format || undefined
    previousEnvPath = envPath
  }

  $effect.pre(() => {
    if (envPath !== previousEnvPath || format !== previousFormat) {
      if (previousEnvMap) {
        previousEnvMap.dispose()
      }
      loadEnvironment()
      groundProjection = groundProjection
    }

    if (!isBackground && scene.background) {
      scene.background = null
      invalidate()
    }

    if (isBackground && !scene.background && previousEnvMap) {
      scene.background = previousEnvMap
      invalidate()
    }
  })

  onDestroy(() => {
    scene.environment = previousSceneEnvironment
    scene.background = previousSceneBackground

    if (previousEnvMap) previousEnvMap.dispose()

    groundProjection = undefined

    invalidate()
  })
</script>

{#if groundProjection}
  <GroundProjectedSkybox
    {...groundProjection}
    envMap={previousEnvMap}
    {...props}
  />
{/if}
