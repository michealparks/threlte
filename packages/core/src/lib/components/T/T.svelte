<script
  lang="ts"
  generics="Type"
>
  import type { TProps } from './types.js'
  import { useAttach } from './utils/useAttach.svelte.js'
  import { useCamera } from './utils/useCamera.svelte.js'
  import { isDisposableObject, useDispose, useSetDispose } from './utils/useDispose.svelte.js'
  import { useEvents } from './utils/useEvents.svelte.js'
  import { useIs } from './utils/useIs.js'
  import { usePlugins } from './utils/usePlugins.js'
  import { useProps } from './utils/useProps.js'
  import { determineRef } from './utils/utils.js'
  import { untrack } from 'svelte'
  import type { OrthographicCamera, PerspectiveCamera } from 'three'

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
    ...props
  }: TProps<Type> = $props()

  /**
   * When "is" or "args" change, we need to create a new ref.
   */
  const object = $derived(determineRef<Type>(is, args))

  // Plugins are initialized here so that pluginsProps
  // is available in the props update
  const plugins = usePlugins(() => ({
    get ref() {
      return object
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
      return props
    }
  }))

  // Props
  const propKeys = Object.keys(props)
  const { updateProp } = useProps()
  propKeys.forEach((key) => {
    const prop = $derived(props[key])
    $effect.pre(() => {
      updateProp(object, key, prop, plugins?.pluginsProps, manual)
    })
  })

  // Attachment
  useAttach<Type>(
    () => object,
    () => attach
  )

  // Camera management
  $effect.pre(() => {
    if (
      (object as PerspectiveCamera).isPerspectiveCamera ||
      (object as OrthographicCamera).isOrthographicCamera
    ) {
      useCamera(
        () => object as PerspectiveCamera | OrthographicCamera,
        () => manual,
        () => makeDefault,
        () => props
      )
    }
  })

  // Disposal
  useSetDispose(() => dispose)

  $effect.pre(() => {
    if (isDisposableObject(object)) {
      useDispose(() => object)
    }
  })

  // Events
  useEvents(() => object, propKeys, props)

  /**
   * oncreate needs to be called after all other hooks
   * so that props will have been set once ref is passed
   * to this callback
   */
  $effect.pre(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    object

    return untrack(() => {
      ref = object
      return oncreate?.(object)
    })
  })
</script>

{@render children?.({ ref: object })}
