<script lang="ts">
  import { Canvas } from '@threlte/core'
  import { Pane, Slider, Checkbox, Button, Folder } from 'svelte-tweakpane-ui'
  import { cubicInOut, cubicOut, sineInOut } from 'svelte/easing'
  import { useShake } from '@threlte/extras'
  import Scene from './Scene.svelte'

  let intensity = $state(0.05)
  let frequency = $state(0.4)
  let rotational = $state(true)
  let shake = $state<ReturnType<typeof useShake>>()

  const recoil = () => {
    // Sharp upward kick + pitch up + small horizontal scatter so successive
    // shots don't look identical. Tiny attack so the kick has shape, smooth
    // release so it doesn't snap off.
    const lateralScatter = (Math.random() * 2 - 1) * 0.04
    shake?.trigger({
      amplitude: 0.04,
      duration: 0.22,
      direction: [lateralScatter, 0.18, 0],
      rotationDirection: [0.06, 0, 0],
      attackDuration: 0.06,
      releaseDuration: 0.94,
      attack: cubicOut,
      release: cubicInOut
    })
  }

  const blockJolt = () => {
    // Push camera away from a random "attacker" direction in the XZ plane,
    // with a small yaw twist toward the impact.
    const angle = Math.random() * Math.PI * 2
    const push = 0.3
    shake?.trigger({
      amplitude: 0.06,
      duration: 0.28,
      direction: [-Math.cos(angle) * push, 0, -Math.sin(angle) * push],
      rotationDirection: [0, (Math.random() * 2 - 1) * 0.05, 0],
      attackDuration: 0.08,
      releaseDuration: 0.92,
      attack: cubicOut,
      release: cubicInOut
    })
  }

  const footstep = () => {
    // Foot hits ground: small downward dip + return. Mostly deterministic
    // direction (the impact) with vertical-biased noise on top for
    // variability. Quick attack so the dip feels like an impact, smooth
    // release for the settle.
    shake?.trigger({
      amplitude: 0.06,
      duration: 0.25,
      direction: [0, -0.05, 0],
      axisScale: [0.3, 1, 0.3],
      attackDuration: 0.2,
      releaseDuration: 0.8,
      attack: cubicOut,
      release: cubicInOut
    })
  }

  const hit = () => {
    // Combat tap. Brief but shaped: 8% attack so it doesn't pop, smooth
    // release so it doesn't snap off.
    shake?.trigger({
      amplitude: 0.2,
      duration: 0.18,
      attackDuration: 0.08,
      releaseDuration: 0.92,
      attack: cubicOut,
      release: cubicInOut
    })
  }

  const heavyHit = () => {
    // Heavier strike. Longer than `hit` and slightly more attack so the
    // weight reads.
    shake?.trigger({
      amplitude: 0.6,
      duration: 0.4,
      attackDuration: 0.1,
      releaseDuration: 0.9,
      attack: cubicOut,
      release: cubicInOut
    })
  }

  const windGust = () => {
    // ADSR envelope so the gust builds, sustains, and dies down. Generous
    // release so the wind dies away instead of clipping. Significant noise
    // on top so the camera buffets during the sustain instead of sitting
    // still.
    shake?.trigger({
      amplitude: 0.4,
      duration: 2.8,
      direction: [0.4, 0, 0],
      rotationDirection: [0.03, 0, -0.06],
      axisScale: [0.5, 0.6, 0.5],
      attackDuration: 0.12,
      releaseDuration: 0.5,
      attack: sineInOut,
      release: sineInOut
    })
  }
</script>

<Pane
  title=""
  position="fixed"
>
  <Folder title="Ambient">
    <Slider
      label="intensity"
      bind:value={intensity}
      min={0}
      max={0.3}
      step={0.005}
    />
    <Slider
      label="frequency"
      bind:value={frequency}
      min={0}
      max={20}
      step={0.1}
    />
    <Checkbox
      label="rotational"
      bind:value={rotational}
    />
  </Folder>
  <Folder title="Trigger">
    <Button
      title="Hit"
      on:click={hit}
    />
    <Button
      title="Heavy hit"
      on:click={heavyHit}
    />
    <Button
      title="Explosion (1.5 / 1.2s)"
      on:click={() =>
        shake?.trigger({
          amplitude: 1.5,
          duration: 1.2,
          attackDuration: 0.05,
          releaseDuration: 0.95,
          attack: cubicOut,
          release: cubicInOut
        })}
    />
    <Button
      title="Recoil (gunshot)"
      on:click={recoil}
    />
    <Button
      title="Block jolt"
      on:click={blockJolt}
    />
    <Button
      title="Wind gust"
      on:click={windGust}
    />
    <Button
      title="Footstep"
      on:click={footstep}
    />
    <Button
      title="Clear"
      on:click={() => shake?.clear()}
    />
  </Folder>
</Pane>

<div>
  <Canvas>
    <Scene
      {intensity}
      {frequency}
      {rotational}
      bind:shake
    />
  </Canvas>
</div>

<style>
  div {
    height: 100%;
  }
</style>
