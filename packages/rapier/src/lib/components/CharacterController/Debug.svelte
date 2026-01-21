<script lang="ts">
  import { Binding, Pane, Folder } from 'svelte-tweakpane-ui'
  import {
    defaults as _defaults,
    camera as defaultsCamera,
    control as defaultsControl
  } from './defaults.js'

  let { children, ...rest } = $props()

  let defaults = $state({ ..._defaults })
  let camera = $state({ ...defaultsCamera })
  let control = $state({ ...defaultsControl })

  // Character controls debug
  let characterControlsDebug = $derived({
    turnVelMultiplier: {
      value: rest.turnVelMultiplier,
      min: 0,
      max: 1,
      step: 0.01
    },
    turnSpeed: {
      value: rest.turnSpeed,
      min: 5,
      max: 30,
      step: 0.1
    },
    sprintMult: {
      value: rest.sprintMult,
      min: 1,
      max: 5,
      step: 0.01
    },
    jumpVel: {
      value: rest.jumpVel,
      min: 0,
      max: 10,
      step: 0.01
    },
    jumpForceToGroundMult: {
      value: rest.jumpForceToGroundMult,
      min: 0,
      max: 80,
      step: 0.1
    },
    slopJumpMult: {
      value: rest.slopJumpMult,
      min: 0,
      max: 1,
      step: 0.01
    },
    sprintJumpMult: {
      value: rest.sprintJumpMult,
      min: 1,
      max: 3,
      step: 0.01
    },
    airDragMultiplier: {
      value: rest.airDragMultiplier,
      min: 0,
      max: 1,
      step: 0.01
    },
    dragDampingC: {
      value: rest.dragDampingC,
      min: 0,
      max: 0.5,
      step: 0.01
    },
    accDeltaTime: {
      value: rest.accDeltaTime,
      min: 0,
      max: 50,
      step: 1
    },
    rejectVelMult: {
      value: rest.rejectVelMult,
      min: 0,
      max: 10,
      step: 0.1
    },
    moveImpulsePointY: {
      value: rest.moveImpulsePointY,
      min: 0,
      max: 3,
      step: 0.1
    },
    camFollowMult: {
      value: rest.camFollowMult,
      min: 0,
      max: 15,
      step: 0.1
    }
  }) as Partial<CharacterControlsSchema>

  // Floating ray debug
  let floatingRayDebug = $derived({
    rayOriginOffest: {
      value: {
        x: 0,
        y: -rest.capsuleHalfHeight,
        z: 0
      }
    },
    rayHitForgiveness: {
      value: rest.rayHitForgiveness,
      min: 0,
      max: 0.5,
      step: 0.01
    },
    rayLength: {
      value: rest.capsuleRadius + 2,
      min: 0,
      max: rest.capsuleRadius + 10,
      step: 0.01
    },
    rayDir: {
      value: { x: 0, y: -1, z: 0 }
    },
    floatingDis: {
      value: rest.capsuleRadius + rest.floatHeight,
      min: 0,
      max: rest.capsuleRadius + 2,
      step: 0.01
    },
    springK: {
      value: rest.springK,
      min: 0,
      max: 5,
      step: 0.01
    },
    dampingC: {
      value: rest.dampingC,
      min: 0,
      max: 3,
      step: 0.01
    }
  }) as Partial<FloatingRaySchema>

  // Slope ray debug
  let slopeRayDebug = $state({
    showSlopeRayOrigin: {
      value: false
    },
    slopeMaxAngle: {
      value: rest.slopeMaxAngle,
      min: 0,
      max: 1.57,
      step: 0.01
    },
    slopeRayOriginOffest: {
      value: rest.capsuleRadius,
      min: 0,
      max: rest.capsuleRadius + 3,
      step: 0.01
    },
    slopeRayLength: {
      value: rest.capsuleRadius + 3,
      min: 0,
      max: rest.capsuleRadius + 13,
      step: 0.01
    },
    slopeRayDir: {
      value: { x: 0, y: -1, z: 0 }
    },
    slopeUpExtraForce: {
      value: rest.slopeUpExtraForce,
      min: 0,
      max: 5,
      step: 0.01
    },
    slopeDownExtraForce: {
      value: rest.slopeDownExtraForce,
      min: 0,
      max: 5,
      step: 0.01
    }
  }) as Partial<SlopeRaySchema>

  // Auto balance force debug
  let autoBalanceForceDebug = $derived({
    autoBalance: {
      value: true
    },
    autoBalanceSpringK: {
      value: rest.autoBalanceSpringK,
      min: 0,
      max: 5,
      step: 0.01
    },
    autoBalanceDampingC: {
      value: rest.autoBalanceDampingC,
      min: 0,
      max: 0.1,
      step: 0.001
    },
    autoBalanceSpringOnY: {
      value: rest.autoBalanceSpringOnY,
      min: 0,
      max: 5,
      step: 0.01
    },
    autoBalanceDampingOnY: {
      value: rest.autoBalanceDampingOnY,
      min: 0,
      max: 0.1,
      step: 0.001
    }
  }) as Partial<AutoBalanceForceSchema>
</script>

<Pane position="draggable">
  <Folder>
    {#each Object.entries(defaults) as [key] (key)}
      <Binding
        bind:object={defaults}
        {key}
        label={key}
        min={0}
        max={10}
        step={0.01}
      />
    {/each}
  </Folder>

  <Folder>
    {#each Object.entries(camera) as [key] (key)}
      <Binding
        bind:object={camera}
        {key}
        label={key}
        min={0}
        max={10}
        step={0.01}
      />
    {/each}
  </Folder>

  <Folder>
    {#each Object.entries(control) as [key] (key)}
      <Binding
        bind:object={control}
        {key}
        label={key}
        min={0}
        max={10}
        step={0.01}
      />
    {/each}
  </Folder>
</Pane>

{@render children?.({ ...defaults, ...camera, ...control })}
