import { describe, expect, it } from 'vitest'
import { render } from '@threlte/test'
import UseLoaderTransforms from './__fixtures__/UseLoaderTransforms.svelte'
import type { AsyncWritable } from '../utilities/asyncWritable.js'

type Stores = {
  first: AsyncWritable<string>
  second: AsyncWritable<string>
}

describe('useLoader', () => {
  it('applies transforms per load call when the resource is served from cache', async () => {
    let stores!: Stores

    render(UseLoaderTransforms, {
      props: {
        onstores: (nextStores: Stores) => {
          stores = nextStores
        }
      }
    })

    expect(await stores.first).toBe('/asset:first')
    expect(await stores.second).toBe('/asset:second')
  })
})
