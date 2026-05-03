<script lang="ts">
  import { T } from '@threlte/core'
  import type { Snippet } from 'svelte'
  import { Group } from 'three'
  import { createSuspenseContext } from './context.js'

  interface Props {
    children?: Snippet<[{ suspended: boolean }]>
    failed?: Snippet<[{ error: unknown }]>
    pending?: Snippet

    onload?: () => void
    onerror?: (error: unknown) => void
    onsuspend?: () => void
  }

  let {
    onload,
    onsuspend,
    onerror,
    failed: failedSnippet,
    pending: pendingSnippet,
    children
  }: Props = $props()

  createSuspenseContext(
    () => $effect.pending() > 0,
    () => undefined
  )

  $effect(() => {
    if ($effect.pending() === 0) {
      onload?.()
    } else {
      onsuspend?.()
    }
  })

  const group = new Group()
</script>

<svelte:boundary
  onerror={(reason) => {
    onerror?.(reason)
  }}
>
  <!-- Block the graph from mounting to the parent -->
  <T
    is={group}
    attach={$effect.pending() > 0 ? false : undefined}
  >
    {@render children?.({ suspended: $effect.pending() > 0 })}
  </T>

  {#snippet pending()}
    {@render pendingSnippet?.()}
  {/snippet}

  {#snippet failed(reason)}
    {@render failedSnippet?.({ error: reason })}
  {/snippet}
</svelte:boundary>
