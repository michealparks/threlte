import type { SvelteComponent, ComponentConstructorOptions } from 'svelte'
import * as THREE from 'three'
import TComp from './T.svelte'
import type { Events, Props, Slots } from './types'
import type { ValueOf } from 'type-fest'

/**
 * ## `<T>`
 *
 * Threlte's `<T>` component is a wrapper around Three.js objects. It is a generic component that can be used to create any Three.js object.
 *
 * @example
 *
 * ```svelte
 * <script>
 * 	import { T } from 'threlte'
 * </script>
 *
 * <T.PerspectiveCamera makeDefault />
 *
 * <T.Mesh>
 * 	<T.BoxGeometry />
 * 	<T.MeshBasicMaterial color="red" />
 * </T.Mesh>
 * ```
 */
export const T = TComp

type Extensions = Record<string, unknown>

type TType = typeof TComp & {
  [Key in keyof typeof THREE]: typeof SvelteComponent<
    Props<(typeof THREE)[Key]>,
    Events<(typeof THREE)[Key]>,
    Slots<(typeof THREE)[Key]>
  >
} & Record<string, typeof SvelteComponent>

const createT = (value: ValueOf<typeof THREE>): TType =>
  class T extends TComp<TType> {
    constructor(args: ComponentConstructorOptions) {
      args.props ??= {}
      args.props.is = value
      super(args)
    }
  }

const extendT = (extensions: Extensions) => {
  for (const [key, value] of Object.entries(extensions)) {
    if (typeof value === 'function') {
      T[key] = 'render' in TComp ? TComp : createT(value)
    }
  }
}

/**
 * Extends the default THREE namespace and allows using custom Three.js objects with `<T>`.
 *
 * @example
 * ```svelte
 * <script>
 * 	import { extend, T } from 'threlte'
 * 	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
 *
 * 	extend({ OrbitControls })
 * </script>
 *
 * <T.OrbitControls />
 * ```
 */
export const extend = (extensions: Extensions) => extendT(extensions)

extendT(THREE)
