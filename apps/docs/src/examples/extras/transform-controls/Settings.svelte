<script lang="ts">
  import { Pane, List, ThemeUtils } from 'svelte-tweakpane-ui'

  interface Props {
    controls: 'none' | '<TrackballControls>' | '<OrbitControls>' | '<CameraControls>'
  }

  let { controls = $bindable() }: Props = $props()
</script>

<Pane
  theme={ThemeUtils.presets.light}
  position="fixed"
  title="TransformControls"
>
  <List
    label="Camera Controls"
    bind:value={controls}
    options={{
      '<TrackballControls>': '<TrackballControls>',
      '<OrbitControls>': '<OrbitControls>',
      '<CameraControls>': '<CameraControls>',
      none: 'none'
    }}
  />
</Pane>
