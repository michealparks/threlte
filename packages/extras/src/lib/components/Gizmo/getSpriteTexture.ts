import { Color, CanvasTexture, type ColorRepresentation } from 'three'

/**
 * Keep track of the textures to be able to dispose them when they are no
 * longer needed.
 */
const textures: Record<string, CanvasTexture> = {}

const color = new Color()

export const getSpriteTexture = (
  size: number,
  colorRepresentation: ColorRepresentation,
  text = ''
) => {
  color.set(colorRepresentation)
  const key = `${color.getHexString()}-${text}`

  if (textures[key]) {
    textures[key].dispose()
  }

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const context = canvas.getContext('2d')!
  context.beginPath()
  context.arc(size / 2, size / 2, size / 4, 0, 2 * Math.PI)
  context.closePath()
  context.fillStyle = color.convertSRGBToLinear().getStyle()
  context.fill()

  if (text) {
    const textSize = Math.abs(size * (24 / 64))
    context.font = `${textSize}px Arial`
    context.textAlign = 'center'
    context.fillStyle = '#000000'
    const textY = size * (41 / 64)
    context.fillText(text, size / 2, textY)
  }

  const texture = new CanvasTexture(canvas)
  textures[key] = texture
  return texture
}
