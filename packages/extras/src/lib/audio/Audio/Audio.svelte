<script lang="ts">
  import { T, type Props } from '@threlte/core'
  import { Audio } from 'three'
  import { useAudio } from '../utils/useAudio.svelte'
  import { useThrelteAudio } from '../useThrelteAudio'
  import type { AudioProps as CommonAudioProps } from '../utils/useAudio.svelte'

  interface AudioProps extends Props<Audio<GainNode>>, CommonAudioProps {
    id?: string
  }

  let {
    src,
    id,
    volume,
    playbackRate,
    autoplay,
    detune,
    loop,
    ref = $bindable(),
    children,
    ...rest
  }: AudioProps = $props()

  const { getAudioListener } = useThrelteAudio()

  const listener = getAudioListener(id)

  if (!listener) {
    throw new Error(`No Audiolistener with id ${id} found.`)
  }

  const audio = new Audio<GainNode>(listener)

  export const { pause, play, stop } = useAudio(
    audio,
    () => src,
    () => autoplay,
    () => detune,
    () => volume,
    () => loop,
    () => playbackRate,
    rest
  )
</script>

<T
  is={audio}
  bind:ref
  {...rest}
>
  {@render children?.({ ref: audio })}
</T>
