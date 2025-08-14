import { Color, MathUtils, type ColorRepresentation } from 'three'

/**
 * Generate N points on a sphere and return a Float32Array of xyz triples.
 * - Uniform on surface by default (uses the Marsaglia method / spherical transform).
 *
 * @param count   Number of points to generate (default 7,000,000)
 * @param radius  Sphere radius (default 1)
 */
export function generateSpherePoints(count: number = 7_000_000, radius: number = 1): Float32Array {
  // 3 floats per point
  const out = new Float32Array(count * 3)

  // Generate points uniformly on the sphere:
  // u ~ U[0,1), v ~ U[0,1)
  // theta = 2πu, z = 1 - 2v, r_xy = sqrt(1 - z^2)
  // x = r_xy * cos(theta), y = r_xy * sin(theta)
  // (Multiply by radius and add center offset.)
  for (let i = 0, j = 0; i < count; i++, j += 3) {
    const u = Math.random()
    const v = Math.random()

    const theta = Math.PI * 2 * u // 2πu
    const z = 1 - 2 * v // cos(phi) distributed in [-1,1]
    const rxy = Math.sqrt(Math.max(0, 1 - z * z))

    // For points *inside* the sphere (uniform volume), uncomment:
    // const scale = Math.cbrt(rng()); // radius scaling for volume-uniform
    // const R = radius * scale;

    const R = radius

    out[j] = R * rxy * Math.cos(theta)
    out[j + 1] = R * rxy * Math.sin(theta)
    out[j + 2] = R * z
  }

  return out
}

/**
 * Generate per-vertex RGB colors for a top→bottom gradient along +Y→-Y.
 * colorTop is used at +radius (top), colorBottom at -radius (bottom).
 *
 * @param positions  Float32Array of xyz triples
 * @param radius     Sphere radius (used to normalize Y)
 * @param colorTop   THREE color for the top (default: white)
 * @param colorBottom THREE color for the bottom (default: black)
 */
export function generateVertexColors(
  positions: Float32Array,
  radius: number,
  colorTop: ColorRepresentation = 0xffffff,
  colorBottom: ColorRepresentation = 0x000000
): Float32Array {
  const count = Math.floor(positions.length / 3)
  const colors = new Float32Array(count * 3)
  const cTop = new Color(colorTop)
  const cBot = new Color(colorBottom)

  for (let i = 0, j = 0; i < count; i++, j += 3) {
    const y = positions[j + 1] ?? 0

    // Normalize Y to [-1,1] relative to radius
    const ny = MathUtils.clamp(y / radius, -1, 1)
    // weight w: 0 at top (+1), 1 at bottom (-1)
    const w = (1 - ny) * 0.5 // equivalent to (ny -> [top=1,bottom=-1] → [0,1])

    // Lerp per channel (avoid per-vertex Color allocations)
    colors[j] = cTop.r + (cBot.r - cTop.r) * w
    colors[j + 1] = cTop.g + (cBot.g - cTop.g) * w
    colors[j + 2] = cTop.b + (cBot.b - cTop.b) * w
  }

  return colors
}
