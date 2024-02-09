import type { Object3D } from 'three'
import type { AnyClass } from '../types'
import type { DisposableThreeObject } from '../../../types'

// Type Gaurds
export const isClass = (type: unknown): type is AnyClass => {
  return typeof type === 'function' && /^\s*class\s+/.test(type.toString())
}

export const argsIsConstructorParameters = (args: unknown): args is ConstructorParameters<AnyClass> => {
  return Array.isArray(args)
}

export const extendsObject3D = (object: any): object is Object3D => {
  return 'isObject3D' in object
}

export const isDisposableObject = (object: any): object is DisposableThreeObject => {
  return 'dispose' in object
}
