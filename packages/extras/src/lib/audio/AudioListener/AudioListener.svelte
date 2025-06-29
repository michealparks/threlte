<script lang="ts">
  import { T, type Props } from '@threlte/core'
  import { AudioListener } from 'three'
  import { useThrelteAudio } from '../useThrelteAudio'

  interface AudioListenerProps extends Props<AudioListener> {
    id?: string
    masterVolume?: number
  }

  let { id, masterVolume, ref = $bindable(), children, ...rest }: AudioListenerProps = $props()

  const listener = new AudioListener()

  export const audioContext = listener.context
  export const resumeContext = () => listener.context.resume()

  $effect.pre(() => {
    if (masterVolume === undefined) {
      return
    }

    listener.setMasterVolume(masterVolume)
  })

  const { addAudioListener, removeAudioListener } = useThrelteAudio()

  addAudioListener(listener, id)
  $effect.pre(() => {
    return () => removeAudioListener(id)
  })
</script>

<T
  is={listener}
  bind:ref
  {...rest}
>
  {@render children?.({ ref: listener })}
</T>
