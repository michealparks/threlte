<script lang="ts">
  import { T } from '@threlte/core'
  import { RoundedBoxGeometry, Text, interactivity, useCursor, OrbitControls, Grid } from '@threlte/extras'
  import { Spring } from 'svelte/motion'
  import FloatingLabel from './FloatingLabel.svelte'

  interactivity()

  const { onPointerEnter, onPointerLeave } = useCursor()

  type Label = {
    id: number
  }

  type Box = {
    event: string
    x: number
    z: number
    color: string
    scale: Spring<number>
    y: Spring<number>
    rotationY: Spring<number>
    hovered: boolean
    labels: Label[]
  }

  const events: { name: string; color: string }[] = [
    { name: 'click', color: '#6366f1' },
    { name: 'dblclick', color: '#ec4899' },
    { name: 'contextmenu', color: '#14b8a6' },
    { name: 'pointerenter', color: '#f59e0b' },
    { name: 'pointerleave', color: '#ef4444' },
    { name: 'pointerdown', color: '#8b5cf6' },
    { name: 'pointerup', color: '#06b6d4' },
    { name: 'pointermove', color: '#84cc16' },
    { name: 'wheel', color: '#f97316' },
  ]

  let labelId = 0

  let boxes = $state<Box[]>(
    events.map((event, i) => {
      const col = i % 3
      const row = Math.floor(i / 3)
      return {
        event: event.name,
        x: (col - 1) * 1.6,
        z: (row - 1) * 1.6,
        color: event.color,
        scale: new Spring(1),
        y: new Spring(0),
        rotationY: new Spring(0),
        hovered: false,
        labels: [],
      }
    })
  )

  function spawnLabel(box: Box) {
    box.labels.push({ id: labelId++ })
  }

  function removeLabel(box: Box, id: number) {
    box.labels = box.labels.filter((l) => l.id !== id)
  }

  // click: bounce up
  function handleClick(box: Box) {
    spawnLabel(box)
    box.y.target = 1.2
    setTimeout(() => { box.y.target = 0 }, 400)
  }

  // dblclick: spin 360
  function handleDblClick(box: Box) {
    spawnLabel(box)
    box.rotationY.target += Math.PI * 2
  }

  // contextmenu: squash and stretch
  function handleContextMenu(box: Box) {
    spawnLabel(box)
    box.scale.target = 0.5
    setTimeout(() => { box.scale.target = 1 }, 300)
  }

  // pointerenter: scale up
  function handlePointerEnter(box: Box) {
    onPointerEnter()
    box.hovered = true
    spawnLabel(box)
    box.scale.target = 1.3
    box.y.target = 0.2
  }

  // pointerleave: scale back
  function handlePointerLeave(box: Box) {
    onPointerLeave()
    box.hovered = false
    spawnLabel(box)
    box.scale.target = 1
    box.y.target = 0
  }

  // pointerdown: press down
  function handlePointerDown(box: Box) {
    spawnLabel(box)
    box.y.target = -0.3
    box.scale.target = 0.85
  }

  // pointerup: spring back
  function handlePointerUp(box: Box) {
    spawnLabel(box)
    box.y.target = 0.4
    box.scale.target = 1.1
    setTimeout(() => {
      box.y.target = 0
      box.scale.target = 1
    }, 300)
  }

  // pointermove: wobble via rotation
  let moveRotation = $state(0)
  function handlePointerMove(box: Box) {
    spawnLabel(box)
    moveRotation += 0.3
    box.rotationY.target = moveRotation
  }

  // wheel: scale up/down
  function handleWheel(box: Box, e: any) {
    spawnLabel(box)
    const dir = e.nativeEvent.deltaY > 0 ? -0.15 : 0.15
    box.scale.target = Math.max(0.5, Math.min(2, box.scale.target + dir))
  }

  function resetBox(box: Box) {
    onPointerLeave()
    box.hovered = false
    box.scale.target = 1
    box.y.target = 0
    box.rotationY.target = 0
    moveRotation = 0
  }

  const handlers: Record<string, (box: Box, e?: any) => void> = {
    click: handleClick,
    dblclick: handleDblClick,
    contextmenu: handleContextMenu,
    pointerenter: handlePointerEnter,
    pointerleave: handlePointerLeave,
    pointerdown: handlePointerDown,
    pointerup: handlePointerUp,
    pointermove: handlePointerMove,
    wheel: handleWheel,
  }
</script>

<T.PerspectiveCamera
  makeDefault
  position={[5, 5, 5]}
  fov={35}
>
  <OrbitControls
    enablePan={false}
    minDistance={6}
    maxDistance={16}
  />
</T.PerspectiveCamera>

<T.AmbientLight intensity={0.6} />
<T.DirectionalLight position={[5, 8, 3]} intensity={1.2} />
<T.DirectionalLight position={[-3, 4, -5]} intensity={0.3} />

{#each boxes as box (box.event)}
  <T.Group
    position.x={box.x}
    position.y={box.y.current}
    position.z={box.z}
  >
    <T.Group
      scale={box.scale.current}
      rotation.y={box.rotationY.current}
    >
      <T.Mesh
        onclick={box.event === 'click' ? () => handlers.click(box) : undefined}
        ondblclick={box.event === 'dblclick' ? () => handlers.dblclick(box) : undefined}
        oncontextmenu={box.event === 'contextmenu' ? () => handlers.contextmenu(box) : undefined}
        onpointerenter={(e) => {
          onPointerEnter()
          box.hovered = true
          if (box.event === 'pointerenter') handlers.pointerenter(box)
        }}
        onpointerleave={() => {
          resetBox(box)
          if (box.event === 'pointerleave') spawnLabel(box)
        }}
        onpointerdown={box.event === 'pointerdown' ? () => handlers.pointerdown(box) : undefined}
        onpointerup={box.event === 'pointerup' ? () => handlers.pointerup(box) : undefined}
        onpointermove={box.event === 'pointermove' ? () => handlers.pointermove(box) : undefined}
        onwheel={box.event === 'wheel' ? (e) => handlers.wheel(box, e) : undefined}
      >
        <RoundedBoxGeometry args={[1, 1, 1]} radius={0.15} />
        <T.MeshStandardMaterial
          color={box.color}
          emissive={box.color}
          emissiveIntensity={box.hovered ? 0.3 : 0}
          roughness={0.3}
          metalness={0.2}
        />
      </T.Mesh>

      <Text
        text={box.event}
        fontSize={0.12}
        sdfGlyphSize={128}
        anchorX="center"
        anchorY="middle"
        position.y={0.51}
        rotation.x={-Math.PI / 2}
        color="#e8e8e8"
      />
    </T.Group>
  </T.Group>
{/each}

{#each boxes as box (box.event)}
  <T.Group
    position.x={box.x}
    position.z={box.z}
  >
    {#each box.labels as label (label.id)}
      <FloatingLabel
        text={box.event}
        ondone={() => removeLabel(box, label.id)}
      />
    {/each}
  </T.Group>
{/each}

<Grid
  position.y={-0.51}
  cellColor="#4a4a4a"
  sectionColor="#4a4a4a"
  sectionThickness={0}
  fadeDistance={20}
  cellSize={2}
/>
