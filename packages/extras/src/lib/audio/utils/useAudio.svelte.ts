import { useLoader } from '@threlte/core'
import { AudioLoader, type Audio, type PositionalAudio } from 'three'

export type AudioProps = {
  src: string | AudioBuffer | HTMLMediaElement | AudioBufferSourceNode | MediaStream
  autoplay?: boolean
  loop?: boolean
  volume?: number | undefined
  playbackRate?: number | undefined
  detune?: number
}

export type AudioEvents = {
  load: AudioBuffer | void
  progress: ProgressEvent<EventTarget>
  error: ErrorEvent
}

/**
 * This hook handles basic audio functionality.
 * It’s used by the <Audio> and <PositionalAudio> components.
 */
export const useAudio = <T extends Audio<GainNode> | PositionalAudio>(
  audio: T,
  getSrc: () => AudioProps['src'],
  getAutoplay: () => boolean | undefined,
  getDetune: () => number | undefined,
  getVolume: () => number | undefined,
  getLoop: () => boolean | undefined,
  getPlaybackRate: () => number | undefined,
  props: Record<string, (arg?: unknown) => void> = {}
) => {
  const autoplay = $derived(getAutoplay() ?? false)

  let shouldPlay = $state(false)
  let loaded = $state(false)

  let audioDestroyed = false

  const loader = useLoader(AudioLoader)

  const setSrc = async (source: AudioProps['src']) => {
    loaded = false

    try {
      if (typeof source === 'string') {
        const audioBuffer = await loader.load(source, {
          onProgress(event) {
            props.onprogress?.(event)
          }
        })
        audio.setBuffer(audioBuffer)
      } else if (source instanceof AudioBuffer) {
        audio.setBuffer(source)
      } else if (source instanceof HTMLMediaElement) {
        audio.setMediaElementSource(source)
      } else if (source instanceof AudioBufferSourceNode) {
        audio.setNodeSource(source)
      } else if (source instanceof MediaStream) {
        audio.setMediaStreamSource(source)
      }
      loaded = true

      props.onload?.(audio.buffer)
    } catch (error) {
      props.onerror?.(error as ErrorEvent)
    }
  }

  const play = async (delay?: number) => {
    // source is not loaded yet, so we should play it after it's loaded
    if (!loaded) {
      shouldPlay = true
      return
    }

    if (audio.context.state !== 'running') {
      await audio.context.resume()
      if (audioDestroyed) {
        return
      }
    }

    return audio.play(delay)
  }

  const pause = () => {
    return audio.pause()
  }

  const stop = () => {
    return audio.source ? audio.stop() : audio
  }

  $effect.pre(() => {
    setSrc(getSrc())
  })

  $effect.pre(() => {
    if (audio.source && 'detune' in audio) {
      audio.setDetune(getDetune() ?? 0)
    }
  })

  $effect.pre(() => {
    audio.setVolume(getVolume() ?? 1)
  })

  $effect.pre(() => {
    audio.setPlaybackRate(getPlaybackRate() ?? 1)
  })

  $effect.pre(() => {
    audio.setLoop(getLoop() ?? false)
  })

  $effect.pre(() => {
    if (!loaded) {
      if (audio.isPlaying) stop()
      return
    }

    if (autoplay || shouldPlay) {
      play()
    }
  })

  $effect.pre(() => {
    return () => {
      try {
        audioDestroyed = true
        stop()
      } catch (error) {
        console.warn('Error while destroying audio', error)
      }
    }
  })

  return {
    play,
    pause,
    stop
  }
}
