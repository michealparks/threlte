import { currentWritable, useCache } from '@threlte/core'
import {
  EquirectangularReflectionMapping,
  CubeTextureLoader,
  Texture,
  CubeReflectionMapping,
  LinearSRGBColorSpace,
  SRGBColorSpace,
  FloatType,
  type ColorSpace
} from 'three'
import { RGBELoader, HDRCubeTextureLoader } from 'three/examples/jsm/Addons.js'
import { TextureLoader } from 'three'
import type { EnvProps } from './Environment.svelte'
import { useSuspense } from '../../suspense/useSuspense'

export type EnvironmentLoaderProps = {
  files?: string | string[]
  path?: string
  colorSpace?: ColorSpace
}

const LoaderType = (
  files: string[] | string,
  format?: string
): typeof CubeTextureLoader | typeof TextureLoader => {
  const isCubeMap = Array.isArray(files)
  const inferredFormat =
    format || (isCubeMap ? files[0] : files).split('.').pop() == 'hdr' ? 'hdr' : 'ldr'

  if (isCubeMap && inferredFormat == 'ldr') return CubeTextureLoader
  if (!isCubeMap && inferredFormat == 'ldr') return TextureLoader
  if (isCubeMap && inferredFormat == 'hdr') return HDRCubeTextureLoader
  if (!isCubeMap && inferredFormat == 'hdr') return RGBELoader
  return TextureLoader
}

export const useEnvironment = () => {
  const { remember } = useCache()
  const suspend = useSuspense()

  const textureStore = currentWritable<Texture | undefined>(undefined)

  const loadEnvironment = ({
    files = ['/px.png', '/nx.png', '/py.png', '/ny.png', '/pz.png', '/nz.png'],
    colorSpace,
    format,
    path = ''
  }: Partial<EnvProps> = {}) => {
    const loader = new (LoaderType(files, format))()
    const isCubemap = Array.isArray(files) && files.length === 6
    const firstEntry = Array.isArray(files) ? files[0] : files
    const filesKey = Array.isArray(files) ? files.join(',') : files
    const cacheKey = [loader, filesKey]

    // Everything else
    const extension: string | false | undefined = isCubemap
      ? 'cube'
      : firstEntry.startsWith('data:application/exr')
        ? 'exr'
        : firstEntry.startsWith('data:application/hdr')
          ? 'hdr'
          : firstEntry.startsWith('data:image/jpeg')
            ? 'jpg'
            : firstEntry.split('.').pop()?.split('?')?.shift()?.toLowerCase()

    if (!loader) throw new Error('useEnvironment: Unrecognized file extension: ' + files)

    loader.setDataType?.(FloatType)

    remember(() => suspend(loader.setPath(path).loadAsync(files)), cacheKey).then((texture) => {
      if (extension === 'jpg' || extension === 'jpeg' || extension === 'webp') {
        texture = texture.renderTarget?.texture
      }

      texture.mapping = isCubemap ? CubeReflectionMapping : EquirectangularReflectionMapping
      texture.colorSpace = colorSpace ?? isCubemap ? LinearSRGBColorSpace : SRGBColorSpace

      textureStore.set(texture)
    })

    return textureStore
  }

  return { loadEnvironment }
}
