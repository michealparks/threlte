import type { Events, Props, Slots } from '@threlte/core'
import { SvelteComponent } from 'svelte'
import type { Group } from 'three'

export type BillboardProps = Props<Group> & {
  follow?: boolean
  lockAxis?: 'x' | 'y' | 'z' | 'none'
}

export type BillboardEvents = Events<Group>
export type BillboardSlots = Slots<Group>

export default class Billboard extends SvelteComponent<
  BillboardProps,
  BillboardEvents,
  BillboardSlots
> {}
