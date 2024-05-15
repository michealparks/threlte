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

  const key = Symbol('threlte-disposable-object-context')
  const parent = getContext<{ dispose: boolean } | undefined>(key)

  let mergedDispose = $derived(dispose ?? parent?.dispose ?? true)
  let disposables = $derived(mergedDispose ? collectDisposableObjects(object) : [])

  setContext(key, {
    get dispose() {
      return mergedDispose
    }
  })

  $effect.pre(() => {
    addDisposableObjects(disposables)
    return () => removeDisposableObjects(disposables)
  })
</script>
