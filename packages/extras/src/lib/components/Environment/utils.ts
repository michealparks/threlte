import { type Scene, type Texture } from 'three'
import type { EnvProps } from './Environment.svelte'

export function setEnvProps(
  isBackground: boolean | 'only',
  scene: Scene,
  texture: Texture,
  props: Partial<EnvProps> = {}
) {
  const oldEnvironment = scene.environment
  const oldEnvironmentIntensity = scene.environmentIntensity
  const oldEnvironmentRotation = scene.environmentRotation?.clone?.()
  const oldBackground = scene.background
  const oldBackgroundBlurriness = scene.backgroundBlurriness
  const oldBackgroundIntensity = scene.backgroundIntensity
  const oldBackgroundRotation = scene.backgroundRotation?.clone?.()

  if (isBackground !== 'only') {
    scene.environment = texture
  }

  if (isBackground) {
    scene.background = texture
    scene.backgroundBlurriness = props.backgroundBlurriness ?? 0
    scene.backgroundIntensity = props.backgroundIntensity ?? 1
    if (props.backgroundRotation) {
      scene.backgroundRotation?.fromArray(props.backgroundRotation)
    }
    scene.environmentIntensity = props.environmentIntensity ?? 1
    if (props.environmentRotation) {
      scene.environmentRotation?.fromArray(props.environmentRotation)
    }
  }

  return () => {
    scene.environment = oldEnvironment
    scene.environmentIntensity = oldEnvironmentIntensity
    scene.environmentRotation = oldEnvironmentRotation
    scene.background = oldBackground
    scene.backgroundBlurriness = oldBackgroundBlurriness
    scene.backgroundIntensity = oldBackgroundIntensity
    scene.backgroundRotation = oldBackgroundRotation
  }
}
