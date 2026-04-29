import { Euler, Object3D, Quaternion, Vector3, type Vector3Tuple } from 'three'
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js'
import { useTask, useThrelte } from '@threlte/core'

export interface UseShakeOptions {
  /**
   * The `Object3D` to shake — typically a camera, but anything works. The
   * hook is a no-op while this is falsy, so it's safe to pass a ref that
   * hasn't mounted yet.
   *
   * Shake offsets are added to `target.position` and (optionally)
   * multiplied into `target.quaternion` each frame. The target's pose is
   * expected to be re-derived from elsewhere each frame
   * (`<CameraControls>`'s update, your own task, an animation system) —
   * otherwise shake offsets will accumulate.
   */
  target?: Object3D | null

  /**
   * Constant ambient amplitude in world units. Adds on top of any active
   * triggers each frame. Use this for scene-wide effects like an earthquake
   * or a low-grade rumble; leave at `0` for trigger-only shake.
   * @default 0
   */
  intensity?: number

  /**
   * Rate at which the noise is sampled, in noise-units per second. Higher
   * values produce a faster, jitterier shake; lower values feel like a slow
   * sway.
   * @default 25
   */
  frequency?: number

  /**
   * Whether to additively shake the target's rotation in addition to its
   * position. Rotational amplitude is a fixed fraction of the positional
   * amplitude (radians per world-unit).
   * @default true
   */
  rotational?: boolean
}

export type ShakeEasingFn = (t: number) => number

export interface ShakeTriggerParams {
  /** Peak random shake amplitude in world units. */
  amplitude: number

  /** Total time the shake lasts, in seconds. */
  duration: number
  /**
   * Per-axis multiplier on the random shake (world space) — only the
   * positional noise is scaled, not rotation. Use to bias a shake toward a
   * single axis (e.g. mostly vertical: `[0.2, 1, 0.2]`).
   * @default [1, 1, 1]
   */
  axisScale?: Vector3Tuple
  /**
   * Deterministic translation added each frame, scaled by the envelope.
   * Use for recoil-like directional kicks (e.g. gunshot push-up:
   * `[0, 0.4, 0]`). Independent of `amplitude`.
   * @default [0, 0, 0]
   */
  direction?: Vector3Tuple
  /**
   * Deterministic rotational kick — Euler angles in radians (YXZ order:
   * `[pitch, yaw, roll]`) added each frame and scaled by the envelope.
   * Use for one-direction tilts that don't drift through the shake, like
   * a speaker hop or a recoil pitch. Suppressed when the hook's
   * `rotational` option is `false`.
   * @default [0, 0, 0]
   */
  rotationDirection?: Vector3Tuple
  /**
   * Easing for the **attack** (rise from 0 to peak amplitude). Receives
   * the elapsed fraction within the attack phase, `∈ [0, 1]`. Compatible
   * with `svelte/easing`. Ignored when `attackDuration` is `0`.
   * @default linear
   */
  attack?: ShakeEasingFn
  /**
   * Easing for the **release** (fall from peak amplitude to 0). Receives
   * the elapsed fraction within the release phase, `∈ [0, 1]`. Compatible
   * with `svelte/easing`.
   * @default linear
   */
  release?: ShakeEasingFn
  /**
   * Length of the attack phase as a fraction of `duration`. `0` (default)
   * means the envelope starts at full amplitude and only releases.
   * @default 0
   */
  attackDuration?: number
  /**
   * Length of the release phase as a fraction of `duration`. `1` (default)
   * means the envelope releases over the full duration (pure decay). The
   * gap between the attack and release — `1 - attackDuration -
   * releaseDuration` — is held at peak amplitude (sustain).
   * @default 1
   */
  releaseDuration?: number
}

const EPSILON = 1e-6
const ROT_AMP_RATIO = 0.1

const linearEasing: ShakeEasingFn = (t) => t

export interface ShakeTrigger {
  /**
   * Promise that resolves when the trigger expires — naturally on
   * timeout, via `cancel()`, or via the hook's `clear()`.
   */
  done: Promise<void>
  /** Remove this specific trigger immediately and resolve `done`. */
  cancel: () => void
}

interface ActiveTrigger {
  amplitude: number
  remaining: number
  duration: number
  axisScaleX: number
  axisScaleY: number
  axisScaleZ: number
  directionX: number
  directionY: number
  directionZ: number
  rotDirectionX: number
  rotDirectionY: number
  rotDirectionZ: number
  attack: ShakeEasingFn
  release: ShakeEasingFn
  attackEnd: number
  releaseStart: number
  resolve: () => void
}

export const useShake = (optionsFn?: () => UseShakeOptions) => {
  const { invalidate, scheduler, mainStage, renderStage } = useThrelte()

  const { target, intensity = 0, frequency = 25, rotational = true } = $derived(optionsFn?.() ?? {})

  const stage = scheduler.createStage(Symbol('useShake'), {
    after: mainStage,
    before: renderStage
  })

  const triggers: ActiveTrigger[] = []
  const noise = new SimplexNoise()

  let phase = 0

  const offset = new Vector3()
  const rotEuler = new Euler()
  const rotQuat = new Quaternion()

  const { task } = useTask(
    Symbol('useShake'),
    (delta) => {
      if (!target) return

      phase += delta * frequency

      let ampX = intensity
      let ampY = intensity
      let ampZ = intensity
      let rotAmplitude = intensity
      let dirX = 0
      let dirY = 0
      let dirZ = 0
      let rotDirX = 0
      let rotDirY = 0
      let rotDirZ = 0

      for (let i = triggers.length - 1; i >= 0; i--) {
        const t = triggers[i]
        t.remaining -= delta
        if (t.remaining <= 0) {
          triggers.splice(i, 1)
          t.resolve()
          continue
        }
        const elapsed = 1 - t.remaining / t.duration
        let envelope: number
        if (elapsed < t.attackEnd) {
          envelope = t.attack(elapsed / t.attackEnd)
        } else if (elapsed < t.releaseStart) {
          envelope = 1
        } else if (t.releaseStart < 1) {
          envelope = 1 - t.release((elapsed - t.releaseStart) / (1 - t.releaseStart))
        } else {
          envelope = 1
        }
        const contrib = t.amplitude * envelope
        ampX += contrib * t.axisScaleX
        ampY += contrib * t.axisScaleY
        ampZ += contrib * t.axisScaleZ
        rotAmplitude += contrib
        dirX += t.directionX * envelope
        dirY += t.directionY * envelope
        dirZ += t.directionZ * envelope
        rotDirX += t.rotDirectionX * envelope
        rotDirY += t.rotDirectionY * envelope
        rotDirZ += t.rotDirectionZ * envelope
      }

      const hasNoise = ampX > EPSILON || ampY > EPSILON || ampZ > EPSILON
      const hasDirection = dirX !== 0 || dirY !== 0 || dirZ !== 0
      if (hasNoise || hasDirection) {
        offset.set(
          (hasNoise ? noise.noise(phase, 0) * ampX : 0) + dirX,
          (hasNoise ? noise.noise(phase, 100) * ampY : 0) + dirY,
          (hasNoise ? noise.noise(phase, 200) * ampZ : 0) + dirZ
        )
        target.position.add(offset)
      }

      if (rotational) {
        const hasRotNoise = rotAmplitude > EPSILON
        const hasRotDirection = rotDirX !== 0 || rotDirY !== 0 || rotDirZ !== 0
        if (hasRotNoise || hasRotDirection) {
          const rotAmp = rotAmplitude * ROT_AMP_RATIO
          rotEuler.set(
            (hasRotNoise ? noise.noise(phase, 300) * rotAmp : 0) + rotDirX,
            (hasRotNoise ? noise.noise(phase, 400) * rotAmp : 0) + rotDirY,
            (hasRotNoise ? noise.noise(phase, 500) * rotAmp : 0) + rotDirZ
          )
          rotQuat.setFromEuler(rotEuler)
          target.quaternion.multiply(rotQuat)
        }
      }

      invalidate()
    },
    { stage, autoInvalidate: false }
  )

  const trigger = (params: ShakeTriggerParams): ShakeTrigger => {
    const attackDuration = Math.max(0, Math.min(1, params.attackDuration ?? 0))
    const releaseDuration = Math.max(
      0,
      Math.min(1 - attackDuration, params.releaseDuration ?? 1)
    )
    let resolve!: () => void
    const done = new Promise<void>((r) => {
      resolve = r
    })
    const active: ActiveTrigger = {
      amplitude: params.amplitude,
      duration: params.duration,
      remaining: params.duration,
      axisScaleX: params.axisScale?.[0] ?? 1,
      axisScaleY: params.axisScale?.[1] ?? 1,
      axisScaleZ: params.axisScale?.[2] ?? 1,
      directionX: params.direction?.[0] ?? 0,
      directionY: params.direction?.[1] ?? 0,
      directionZ: params.direction?.[2] ?? 0,
      rotDirectionX: params.rotationDirection?.[0] ?? 0,
      rotDirectionY: params.rotationDirection?.[1] ?? 0,
      rotDirectionZ: params.rotationDirection?.[2] ?? 0,
      attack: params.attack ?? linearEasing,
      release: params.release ?? linearEasing,
      attackEnd: attackDuration,
      releaseStart: 1 - releaseDuration,
      resolve
    }
    triggers.push(active)
    return {
      done,
      cancel: () => {
        const idx = triggers.indexOf(active)
        if (idx >= 0) {
          triggers.splice(idx, 1)
          resolve()
        }
      }
    }
  }

  const clear = () => {
    for (const t of triggers) t.resolve()
    triggers.length = 0
  }

  return {
    /**
     * Internal task, exposed for ordering other tasks via `after`/`before`.
     * Runs in a dedicated stage between `mainStage` and `renderStage`.
     */
    task,

    /**
     * Add a shake. The amplitude envelope has up to three phases —
     * **attack** (rise from 0 to peak), **sustain** (hold at peak), and
     * **release** (fall from peak to 0) — set with `attackDuration`,
     * `releaseDuration`, and the corresponding `attack` / `release`
     * easings. Defaults to a pure linear release over the full duration
     * (instant peak, classic decay). Multiple active triggers stack
     * additively.
     *
     * Returns a `ShakeTrigger` with a `done` Promise that resolves
     * when the trigger expires (naturally, via the handle's `cancel()`,
     * or via the hook's `clear()`) and a `cancel()` method to remove
     * this specific trigger. Most call sites can ignore the return value.
     */
    trigger,

    /** Remove all active triggers. The ambient `intensity` option is unaffected. */
    clear
  }
}

export type UseShakeReturn = ReturnType<typeof useShake>
