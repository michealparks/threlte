<script lang="ts">
  import { Pane, List, ThemeUtils } from 'svelte-tweakpane-ui'

  interface Props {
    controls?: '<TrackballControls>' | '<OrbitControls>'
  }

  let { controls = $bindable('<OrbitControls>') }: Props = $props()
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
      '<OrbitControls>': '<OrbitControls>'
    }}
  />
</Pane>
