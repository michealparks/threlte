<script lang="ts">
  import { useTask } from '@threlte/core'
  import type { Euler, Vector3 } from 'three'
  import Particle from './Particle.svelte'

  const getId = () => {
    return Math.random().toString(16).slice(2)
  }

  const getRandomPosition = (): Parameters<Vector3['set']> => {
    return [0.5 - Math.random() * 1, 5 - Math.random() * 1 + 10, 0.5 - Math.random() * 1]
  }

  const getRandomRotation = (): Parameters<Euler['set']> => {
    return [Math.random() * 10, Math.random() * 10, Math.random() * 10]
  }

  type Body = {
    id: string
    mounted: number
    position: Parameters<Vector3['set']>
    rotation: Parameters<Euler['set']>
  }

  let bodies = $state<Body[]>([])

  let lastBodyMounted: number = 0
  let bodyEveryMilliseconds = 100
  let longevityMilliseconds = 8000

  useTask(() => {
    if (lastBodyMounted + bodyEveryMilliseconds < Date.now()) {
      const body: Body = {
        id: getId(),
        mounted: Date.now(),
        position: getRandomPosition(),
        rotation: getRandomRotation()
      }
      bodies.unshift(body)
      lastBodyMounted = Date.now()
    }
    const deleteIds: string[] = []
    bodies.forEach((body) => {
      if (body.mounted + longevityMilliseconds < Date.now()) {
        deleteIds.push(body.id)
      }
    })

    if (deleteIds.length) {
      deleteIds.forEach((id) => {
        const index = bodies.findIndex((body) => body.id === id)
        if (index !== -1) bodies.splice(index, 1)
      })
    }
  })
</script>

{#each bodies as body (body.id)}
  <Particle
    position={body.position}
    rotation={body.rotation}
  />
{/each}
