<script lang="ts">
  import { useTask } from '../../hooks/useTask.svelte.js'

  type Props = {
    firstRunning?: boolean
    secondRunning?: boolean
  }

  let { firstRunning = true, secondRunning = true }: Props = $props()

  const task = () => undefined

  useTask(task, {
    running: () => firstRunning
  })

  useTask(task, {
    running: () => secondRunning
  })
</script>
