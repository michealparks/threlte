<script
  lang="ts"
  module
>
  import { PointsMaterial as ThreePointsMaterial } from 'three'
  import { T, type Props as ThrelteProps } from '@threlte/core'
  import type { Snippet } from 'svelte'

  const fragment = `
    #include <opaque_fragment>
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r = dot(cxy, cxy);
    if (r > 1.0) discard;
    float delta = fwidth(r);     
    float mask = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, r);
    gl_FragColor.a = mask * gl_FragColor.a;
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  `

  class PointsMaterial extends ThreePointsMaterial {
    override alphaToCoverage = true

    override onBeforeCompile(shader: { fragmentShader: string }) {
      shader.fragmentShader = shader.fragmentShader.replace(`#include <opaque_fragment>`, fragment)
    }
  }
</script>

<script lang="ts">
  interface Props extends ThrelteProps<typeof PointsMaterial> {
    children?: Snippet
  }

  let { children, ...rest }: Props = $props()
</script>

<T
  is={PointsMaterial}
  {...rest}
>
  {@render children?.()}
</T>
