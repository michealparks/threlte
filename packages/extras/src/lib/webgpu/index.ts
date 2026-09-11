/**
 * `@threlte/extras/webgpu` provides WebGPU-compatible implementations where
 * available. Components awaiting a WebGPU implementation are exported as
 * typed stubs that throw a clear error when instantiated.
 *
 * Migrating these components to TSL is in progress. Each implementation lives
 * in a `webgpu` folder next to its WebGL counterpart.
 */

// Hooks
export {
  useCursor,
  useGltf,
  useDraco,
  useMeshopt,
  useKtx2,
  useGltfAnimations,
  useProgress,
  useTexture,
  useFBO,
  useGamepad,
  type StandardGamepadEvent,
  type StandardGamepad,
  type StandardXRGamepad,
  useKeyboard,
  useInputMap,
  useFollow,
  useMask,
  useViewport,
  useTrailTexture,
  useCameraControls,
  useOrbitControls,
  useTrackballControls,
  useTransformControls,
  meshBounds
} from '../index.js'

// abstractions migrated to TSL
export { default as Grid } from '../components/Grid/webgpu/Grid.svelte'
export { default as MeshDiscardMaterial } from '../components/MeshDiscardMaterial/webgpu/MeshDiscardMaterial.svelte'

// abstractions awaiting WebGPU implementations
export { default as AnimatedSpriteMaterial } from '../components/AnimatedSpriteMaterial/webgpu/AnimatedSpriteMaterial.svelte'
export { default as AsciiRenderer } from '../components/AsciiRenderer/webgpu/AsciiRenderer.svelte'
export { default as BakeShadows } from '../components/BakeShadows/webgpu/BakeShadows.svelte'
export { default as ContactShadows } from '../components/ContactShadows/webgpu/ContactShadows.svelte'
export { default as CSM } from '../components/CSM/webgpu/CSM.svelte'
export { default as CubeCamera } from '../components/CubeCamera/webgpu/CubeCamera.svelte'
export { default as FakeGlowMaterial } from '../components/FakeGlowMaterial/webgpu/FakeGlowMaterial.svelte'
export { default as ImageMaterial } from '../components/ImageMaterial/webgpu/ImageMaterial.svelte'
export { default as InstancedSprite } from '../components/InstancedSprite/webgpu/InstancedSprite.svelte'
export { default as MeshLineMaterial } from '../components/MeshLine/webgpu/MeshLineMaterial.svelte'
export { default as MeshRefractionMaterial } from '../components/MeshRefractionMaterial/webgpu/MeshRefractionMaterial.svelte'
export { default as Outlines } from '../components/Outlines/webgpu/Outlines.svelte'
export { default as PerfMonitor } from '../components/PerfMonitor/webgpu/PerfMonitor.svelte'
export { default as PointsMaterial } from '../components/PointsMaterial/webgpu/PointsMaterial.svelte'
export { default as ShadowAlpha } from '../components/ShadowAlpha/webgpu/ShadowAlpha.svelte'
export { default as Sky } from '../components/Sky/webgpu/Sky.svelte'
export { default as SoftShadows } from '../components/SoftShadows/webgpu/SoftShadows.svelte'
export { default as Sparkles } from '../components/Sparkles/webgpu/Sparkles.svelte'
export { default as Stars } from '../components/Stars/webgpu/Stars.svelte'
export { default as Text } from '../components/Text/webgpu/Text.svelte'
export { default as UvMaterial } from '../components/UvMaterial/webgpu/UvMaterial.svelte'
export { default as VirtualEnvironment } from '../components/environment/VirtualEnvironment/webgpu/VirtualEnvironment.svelte'
export { default as Wireframe } from '../components/Wireframe/webgpu/Wireframe.svelte'
export { default as Wobble } from '../components/Wobble/webgpu/Wobble.svelte'

// abstractions
export {
  BackdropGeometry,
  Decal,
  CameraControls,
  CameraControlsRef,
  Edges,
  HTML,
  HUD,
  Float,
  GLTF,
  Gizmo,
  type GizmoOptions,
  CubeEnvironment,
  Environment,
  Bounds,
  RoundedBoxGeometry,
  TransformControls,
  OrbitControls,
  TrackballControls,
  InstancedMesh,
  Instance,
  InstancedMeshes,
  MeshLineGeometry,
  Align,
  Billboard,
  ShadowMaterial,
  SVG,
  Text3DGeometry,
  Mask,
  Detailed,
  Resize,
  LinearGradientTexture,
  RadialGradientTexture,
  type ColorStop,
  type RadialGradientOuterRadius,
  View
} from '../index.js'

// Transitions
export { transitions, createTransition, global, type TransitionProps } from '../index.js'

// suspense
export { Suspense, useSuspense, onReveal, onSuspend } from '../index.js'

// portals
export { Portal, PortalTarget } from '../index.js'

// audio components
export { AudioListener, Audio, PositionalAudio } from '../index.js'

// audio hooks
export { useAudioListener, useThrelteAudio } from '../index.js'

// interactivity
export {
  interactivity,
  useInteractivity,
  type DomEvent,
  type EventMap,
  type Intersection,
  type IntersectionEvent,
  type InteractivityProps
} from '../index.js'

// layers
export { layers, type ThrelteLayers, type ThrelteLayersContext } from '../index.js'

// bvh
export { bvh, type BVHOptions, type BVHProps, BVHSplitStrategy } from '../index.js'

export type { ThrelteGltf } from '../index.js'
