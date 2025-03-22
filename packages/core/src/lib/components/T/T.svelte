<script
  lang="ts"
  generics="Type"
>
  import type { TProps } from './types'
  import { useAttach } from './utils/useAttach.svelte'
  import { useCamera } from './utils/useCamera.svelte'
  import { useDispose } from './utils/useDispose.svelte'
  import { useEvents } from './utils/useEvents.svelte'
  import { useIs } from './utils/useIs'
  import { usePlugins } from './utils/usePlugins'
  import { useProps } from './utils/useProps'
  import { determineRef } from './utils/utils'
  import { isInstanceOf } from '../../utilities'

  let {
    is = useIs<Type>(),
    args,
    attach,
    manual = false,
    makeDefault = false,
    dispose,
    ref = $bindable(),
    oncreate,
    children,
    ...rest
  }: TProps<Type> = $props()

  // We can't create the object in a reactive statement due to providing context
  let internalRef = $derived(determineRef<Type>(is, args))

  // When "is" or "args" change, we need to create a new ref.
  $effect.pre(() => {
    if (ref === internalRef) return
    ref = internalRef
  })

  // Create Event
  $effect(() => oncreate?.(internalRef))

  // Plugins are initialized here so that pluginsProps
  // is available in the props update
  const plugins = usePlugins(() => ({
    get ref() {
      return internalRef
    },
    get args() {
      return args
    },
    get attach() {
      return attach
    },
    get manual() {
      return manual
    },
    get makeDefault() {
      return makeDefault
    },
    get dispose() {
      return dispose
    },
    get props() {
      return rest
    }
  }))

  // Props
  const { updateProp } = useProps()
  Object.keys(rest).forEach((key) => {
    $effect.pre(() => {
      updateProp(internalRef, key, rest[key], {
        manualCamera: manual,
        pluginsProps: plugins?.pluginsProps
      })
    })
  })

  // Attachment
  useAttach<Type>(
    () => internalRef,
    () => attach
  )

  // Camera management
  $effect.pre(() => {
    if (
      isInstanceOf(internalRef, 'PerspectiveCamera') ||
      isInstanceOf(internalRef, 'OrthographicCamera')
    ) {
      useCamera(
        () => internalRef,
        () => manual,
        () => makeDefault
      )
    }
  })

  // Disposal
  useDispose(
    () => internalRef,
    () => dispose
  )

  // Events
  useEvents(
    () => internalRef,
    () => rest
  )
</script>

{@render children?.({ ref: internalRef })}
