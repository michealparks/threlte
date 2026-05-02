<script lang="ts">
  import { useLoader } from '../../hooks/useLoader.js'
  import type { AsyncWritable } from '../../utilities/asyncWritable.js'

  type Props = {
    onstores: (stores: { first: AsyncWritable<string>; second: AsyncWritable<string> }) => void
  }

  let { onstores }: Props = $props()

  class TestLoader {
    loadAsync(url: string) {
      return Promise.resolve(url)
    }
  }

  const loader = useLoader(TestLoader)
  const first = loader.load('/asset', {
    transform: (value) => `${value}:first`
  })
  const second = loader.load('/asset', {
    transform: (value) => `${value}:second`
  })

  $effect(() => {
    onstores({ first, second })
  })
</script>
