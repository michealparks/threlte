import { isInstanceOf } from '@threlte/core'
import type { Euler, Vector3 } from 'three'

export /* @inline @pure */ const isVector3 = (v: any): v is Vector3 => {
  return isInstanceOf(v, 'Vector3')
}

export /* @inline @pure */ const isEuler = (v: any): v is Euler => {
  return isInstanceOf(v, 'Euler')
}
