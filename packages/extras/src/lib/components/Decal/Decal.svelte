<script lang="ts">
  import { T, useParent } from '@threlte/core'
  import { Mesh, Vector3, Euler, Matrix4, Object3D, Texture } from 'three'
  import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js'

  type DecalProps = {
    debug?: boolean
    mesh?: Mesh
    position?: [x: number, y: number, z: number]
    rotation?: [x: number, y: number, z: number] | number
    scale?: [x: number, y: number, z: number] | number
    map?: Texture
    polygonOffsetFactor?: number
    depthTest?: boolean
  }

  type $$Props = DecalProps

  type Props = Required<DecalProps>

  export let debug: Props['debug'] = false
  export let depthTest: Props['depthTest'] = false
  export let polygonOffsetFactor: Props['polygonOffsetFactor'] = -10
  export let map: $$Props['map'] = undefined
  export let position: Props['position'] = [0, 0, 0]
  export let rotation: Props['rotation'] = [0, 0, 0]
  export let size: Props['scale'] = 1

  export let ref = new Mesh()

  const parent = useParent()

  let helper: Mesh

  const object3d = new Object3D()
  const matrix = new Matrix4()
  const pos = new Vector3()
  const rot = new Euler()
  const s = new Vector3(1, 1, 1)

  $: {
    if ($parent) {
      ref.geometry?.dispose?.()

      pos.set(position[0], position[1], position[2])

      if (typeof size === 'number') {
        s.setScalar(size)
      } else {
        s.set(size[0], size[1], size[2])
      }

      // Zero out the parents matrix world for this operation
      matrix.copy($parent.matrixWorld)
      $parent.matrixWorld.identity()

      if (!rotation || typeof rotation === 'number') {
        object3d.position.copy(pos)
        object3d.lookAt($parent.position)

        if (typeof rotation === 'number') {
          object3d.rotateZ(rotation)
        }

        rot.copy(object3d.rotation)
      } else {
        rot.set(rotation[0], rotation[1], rotation[2])
      }

      ref.geometry = new DecalGeometry($parent as Mesh, pos, rot, s)

      if (debug && helper) {
        helper.position.copy(pos)
        helper.rotation.copy(rot)
        helper.scale.copy(s)

        // Prevent the helpers from blocking rays
        helper.traverse((child) => (child.raycast = () => null))
      }

      // Reset parent matrixWorld
      $parent.matrixWorld.copy(matrix)
    }
  }
</script>

<T
  is={ref}
  {...$$restProps}
>
  <slot {ref}>
    <T.MeshBasicMaterial
      transparent
      polygonOffset
      {polygonOffsetFactor}
      {depthTest}
      {map}
    />
  </slot>

  {#if debug}
    <T.Mesh bind:ref={helper}>
      <T.BoxGeometry />
      <T.MeshNormalMaterial wireframe />
      <T.AxesHelper />
    </T.Mesh>
  {/if}
</T>
