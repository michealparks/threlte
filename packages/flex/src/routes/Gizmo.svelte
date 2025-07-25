<script lang="ts">
  import { T } from '@threlte/core'
  import { DEG2RAD } from 'three/src/math/MathUtils.js'

  interface Props {
    size?: number
    thickness?: number
    arrows?: boolean
    hideX?: boolean
    hideY?: boolean
    hideZ?: boolean
  }

  let {
    size = 1,
    thickness = 0.02,
    arrows = false,
    hideX = false,
    hideY = false,
    hideZ = false
  }: Props = $props()

  let showAny = $derived(!hideX || !hideY || !hideZ)
</script>

{#if showAny}
  <T.Mesh>
    <T.SphereGeometry args={[thickness * 2]} />
    <T.MeshBasicMaterial color="white" />
  </T.Mesh>
{/if}

<!-- X Axis -->
{#if !hideX}
  <T.Mesh position.x={size / 2}>
    <T.CylinderGeometry
      args={[thickness, thickness, size]}
      oncreate={(ref) => {
        ref.rotateZ(90 * DEG2RAD)
      }}
    />
    <T.MeshBasicMaterial color="red" />

    {#if arrows}
      <T.Mesh position.x={size / 2 + thickness * 3}>
        <T.ConeGeometry
          args={[thickness * 3, thickness * 6]}
          oncreate={(ref) => {
            ref.rotateZ(-90 * DEG2RAD)
          }}
        />
        <T.MeshBasicMaterial color="red" />
      </T.Mesh>
    {/if}
  </T.Mesh>
{/if}

<!-- Y Axis -->
{#if !hideY}
  <T.Mesh position.y={size / 2}>
    <T.CylinderGeometry args={[thickness, thickness, size]} />
    <T.MeshBasicMaterial color="green" />

    {#if arrows}
      <T.Mesh position.y={size / 2 + thickness * 3}>
        <T.ConeGeometry args={[thickness * 3, thickness * 6]} />
        <T.MeshBasicMaterial color="green" />
      </T.Mesh>
    {/if}
  </T.Mesh>
{/if}

<!-- Z Axis -->
{#if !hideZ}
  <T.Mesh position.z={size / 2}>
    <T.CylinderGeometry
      args={[thickness, thickness, size]}
      oncreate={(ref) => {
        ref.rotateX(90 * DEG2RAD)
      }}
    />
    <T.MeshBasicMaterial color="blue" />

    {#if arrows}
      <T.Mesh position.z={size / 2 + thickness * 3}>
        <T.ConeGeometry
          args={[thickness * 3, thickness * 6]}
          oncreate={(ref) => {
            ref.rotateX(90 * DEG2RAD)
          }}
        />
        <T.MeshBasicMaterial color="blue" />
      </T.Mesh>
    {/if}
  </T.Mesh>
{/if}
