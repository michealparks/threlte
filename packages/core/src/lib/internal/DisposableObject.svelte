<script
  context="module"
  lang="ts"
>
  const contextKey = Symbol('threlte-disposable-object')
</script>

<script lang="ts">
  import { getContext, setContext } from 'svelte'
  import { useThrelteInternal } from '../hooks/useThrelteInternal'
  import type { DisposableThreeObject } from '../types'

  interface Props {
    object?: DisposableThreeObject
    dispose?: boolean
  }

  let { object, dispose }: Props = $props()

  const { collectDisposableObjects, addDisposableObjects, removeDisposableObjects } =
    useThrelteInternal()

  const parent = getContext<{ dispose: boolean } | undefined>(contextKey)

  console.log(parent)

  let mergedDispose = $derived(dispose ?? parent?.dispose ?? true)
  let disposables = $derived(mergedDispose ? collectDisposableObjects(object) : [])

  $effect.pre(() => {
    addDisposableObjects(disposables)
    return () => removeDisposableObjects(disposables)
  })

  setContext(contextKey, {
    get dispose() {
      return mergedDispose
    }
  })
</script>
