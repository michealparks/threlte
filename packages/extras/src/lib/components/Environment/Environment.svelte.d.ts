import { SvelteComponent } from 'svelte'
import type { Props } from '@threlte/core'
import type { GroundedSkybox } from 'three/examples/jsm/objects/GroundedSkybox.js'
import { ColorSpace, Texture } from 'three'

export interface EnvProps {
  children?: unknown
  frames?: number
  near?: number
  far?: number
  resolution?: number

  /**
   * Boolean to toggle whether to use envmap as a scene background.
   */
  isBackground?: boolean | 'only'

  /** deprecated, use backgroundBlurriness */
  // blur?: number
  backgroundBlurriness?: number
  backgroundIntensity?: number
  backgroundRotation?: [x: number, y: number, z: number]
  environmentIntensity?: number
  environmentRotation?: [x: number, y: number, z: number]

  /**
   * Defaults to "/"
   */
  path?: string
  /**
   * Provide a string to use an equirectangular envmap and a string array to use a cubic envmap
   */
  files: string | string[]
  map?: Texture
  /**
   * Props for ground projection. Scalar recommended to 100. Depending on envmap and project requirements, good starting point is radius: 200, height: 5.
   */
  groundProjection?: Props<GroundedSkybox> | undefined
  /**
   * Use `ldr` for .png, .jpg and `hdr` for .hdr file formats
   */
  format?: 'ldr' | 'hdr'
  /**
   * Envmap color space. If not provided it defaults to `srgb` for cubemap and `srgb-linear` for equirectangular
   */
  colorSpace?: ColorSpace
}

export default class Environment extends SvelteComponent<EnvProps> {}
