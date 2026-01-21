<script lang="ts">
  import { GLTF, useGltfAnimations } from '@threlte/extras'
  import { Character } from '@threlte/rapier'
  import { PressedKeys } from 'runed'

  import type { CharacterActions } from './types'

  let actionKey = $state<CharacterActions>('idle')

  let { gltf, actions } = useGltfAnimations()
  let currentActionKey: CharacterActions = 'idle'

  $effect(() => {
    // This effect acts like an init default pose
    $actions?.['idle']?.play()
  })

  $effect(() => {
    transitionTo(actionKey, 0.3)
  })

  function transitionTo(actionKey: CharacterActions, duration = 1) {
    const currentAction = $actions[currentActionKey]
    const nextAction = $actions[actionKey]
    if (!nextAction || currentAction === nextAction) return
    // Function inspired by: https://github.com/mrdoob/three.js/blob/master/examples/webgl_animation_skinning_blending.html
    nextAction.enabled = true
    if (currentAction) {
      currentAction.crossFadeTo(nextAction, duration, true)
    }
    // Not sure why I need this but the source code does not
    nextAction.play()
    currentActionKey = actionKey
  }

  const keys = new PressedKeys()
</script>

<Character
  input={{
    forward: keys.has('s'),
    backward: keys.has('w'),
    left: keys.has('d'),
    right: keys.has('a'),
    run: keys.has('shift'),
    jump: keys.has('space')
  }}
  onwalk={() => {
    actionKey = 'walk'
  }}
  onrun={() => {
    actionKey = 'run'
  }}
  onidle={() => {
    actionKey = 'idle'
  }}
>
  <GLTF
    position.y={-1}
    bind:gltf={$gltf}
    url="https://threejs.org/examples/models/gltf/Xbot.glb"
    oncreate={(scene) => {
      scene.traverse((child) => {
        child.castShadow = true
      })
    }}
  />
</Character>
