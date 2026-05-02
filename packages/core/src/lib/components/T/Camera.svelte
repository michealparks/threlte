<script lang="ts">
  import type { OrthographicCamera, PerspectiveCamera } from 'three'
  import { useCamera } from './utils/useCamera.svelte.js'
  import type { Props } from './types.js'

  interface CameraProps extends Props<OrthographicCamera | PerspectiveCamera> {
    ref: PerspectiveCamera | OrthographicCamera
    manual?: boolean
    makeDefault?: boolean
  }

  let { ref, manual = false, makeDefault = false, ...rest }: CameraProps = $props()

  useCamera(
    () => ref,
    () => manual,
    () => makeDefault,
    () => rest
  )
</script>
