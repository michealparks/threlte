import { Vector3, Box3, Sphere } from 'three'

const v1 = new Vector3()
const v2 = new Vector3()
const sphere = new Sphere()
const box = new Box3()

const estimateMeanSpacing = (positions: Float32Array) => {
  let minX = +Infinity
  let minY = +Infinity
  let minZ = +Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let maxZ = -Infinity

  for (let i = 0, l = positions.length; i < l; i += 3) {
    const x = positions[i],
      y = positions[i + 1],
      z = positions[i + 2]
    if (x < minX) minX = x
    if (y < minY) minY = y
    if (z < minZ) minZ = z
    if (x > maxX) maxX = x
    if (y > maxY) maxY = y
    if (z > maxZ) maxZ = z
  }
  const dx = maxX - minX
  const dy = maxY - minY
  const dz = maxZ - minZ
  const volume = Math.max(dx * dy * dz, 1e-9)
  const n = Math.max(positions.length / 3, 1)
  const spacing = Math.cbrt(volume / n)
  const bbox = box.set(v1.set(minX, minY, minZ), v2.set(maxX, maxY, maxZ))
  const bs = bbox.getBoundingSphere(sphere)

  return { spacing, bbox, bs }
}

export const voxelSimplifyPoints = (
  positions: Float32Array,
  colors?: Float32Array,
  voxelSize = 1
) => {
  const voxelMap = new Map<string, number[]>()

  for (let i = 0; i < positions.length; i += 3) {
    const x = Math.floor(positions[i] / voxelSize)
    const y = Math.floor(positions[i + 1] / voxelSize)
    const z = Math.floor(positions[i + 2] / voxelSize)
    const key = `${x},${y},${z}`

    if (!voxelMap.has(key)) voxelMap.set(key, [])
    voxelMap.get(key)?.push(i)
  }

  const voxelCount = voxelMap.size
  const filteredPositions = new Float32Array(voxelCount * 3)
  const filteredColors = colors ? new Float32Array(voxelCount * 3) : undefined

  let j = 0
  voxelMap.forEach((indices) => {
    let px = 0
    let py = 0
    let pz = 0
    let cr = 0
    let cg = 0
    let cb = 0

    const count = indices.length
    indices.forEach((index) => {
      px += positions[index]
      py += positions[index + 1]
      pz += positions[index + 2]
      if (colors) {
        cr += colors[index]
        cg += colors[index + 1]
        cb += colors[index + 2]
      }
    })

    filteredPositions[j] = px / count
    filteredPositions[j + 1] = py / count
    filteredPositions[j + 2] = pz / count

    if (filteredColors) {
      filteredColors[j] = cr / count
      filteredColors[j + 1] = cg / count
      filteredColors[j + 2] = cb / count
    }

    j += 3
  })

  return [filteredPositions, filteredColors] as const
}

export function buildSizesAndThresholds({
  positions,
  pointSize = 0.02, // used when sizeAttenuation=true
  sizeAttenuation = true,
  levels = 4,
  voxelFactor = 2.0,
  baseDistanceFactor = 1.25 // scale for thresholds (relative to bounding-sphere radius)
}: {
  positions: Float32Array
  pointSize?: number
  sizeAttenuation?: boolean
  levels?: number
  voxelFactor?: number
  baseDistanceFactor?: number
}) {
  const { spacing, bs } = estimateMeanSpacing(positions)

  // Choose the anchor for smallest voxel
  const minVoxel = Math.max(sizeAttenuation ? pointSize : spacing * 0.75, 1e-6)

  // Geometric progression of voxel sizes
  const voxelSizes: number[] = [minVoxel]
  for (let i = 1; i < levels; i++) {
    voxelSizes.push(voxelSizes[i - 1] * voxelFactor)
  }

  // Simple, camera-agnostic thresholds: proportional to object scale
  // Larger voxels switch in farther away.
  const baseDist = bs.radius * baseDistanceFactor
  const thresholds: number[] = voxelSizes.map((_size, i) => baseDist * Math.pow(voxelFactor, i))

  return { voxelSizes, thresholds }
}
