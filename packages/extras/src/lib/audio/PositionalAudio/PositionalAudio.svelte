<script lang="ts">
  import { T, type Props } from '@threlte/core'
  import { PositionalAudio } from 'three'
  import { useAudio } from '../utils/useAudio.svelte'
  import { useThrelteAudio } from '../useThrelteAudio'
  import type { AudioProps as CommonAudioProps } from '../utils/useAudio.svelte'

  interface PositionalAudioProps extends Props<PositionalAudio>, CommonAudioProps {
    id?: string
    refDistance?: number
    rolloffFactor?: number
    distanceModel?: string
    maxDistance?: number
    directionalCone?: {
      coneInnerAngle: number
      coneOuterAngle: number
      coneOuterGain: number
    }
  }

  let {
    src,
    id,
    volume,
    playbackRate,
    autoplay,
    detune,
    loop,
    directionalCone,
    refDistance,
    rolloffFactor,
    distanceModel,
    maxDistance,
    ref = $bindable(),
    children,
    ...props
  }: PositionalAudioProps = $props()

  const { getAudioListener } = useThrelteAudio()

  const listener = getAudioListener(id)

  if (!listener) {
    throw new Error(`No Audiolistener with id ${id} found.`)
  }

  const audio = new PositionalAudio(listener)

  export const { pause, play, stop } = useAudio(
    audio,
    () => src,
    () => autoplay,
    () => detune,
    () => volume,
    () => loop,
    () => playbackRate,
    props
  )

  $effect.pre(() => {
    if (refDistance !== undefined) audio.setRefDistance(refDistance)
    if (rolloffFactor !== undefined) audio.setRolloffFactor(rolloffFactor)
    if (distanceModel !== undefined) audio.setDistanceModel(distanceModel)
    if (maxDistance !== undefined) audio.setMaxDistance(maxDistance)
    if (directionalCone !== undefined) {
      audio.setDirectionalCone(
        directionalCone.coneInnerAngle,
        directionalCone.coneOuterAngle,
        directionalCone.coneOuterGain
      )
    }
  })
</script>

<T
  is={audio}
  bind:ref
  {...props}
>
  {@render children?.({ ref: audio })}
</T>
