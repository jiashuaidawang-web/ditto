import QRCode from 'qrcode'
import { tokenColor } from '../styles/palette'

export type ShareRatio = '1:1' | '3:4'

const SIZES: Record<ShareRatio, { width: number; height: number }> = {
  '1:1': { width: 1080, height: 1080 },
  '3:4': { width: 1080, height: 1440 },
}

export interface PosterFields {
  peerName: string
  schoolName: string
  gradeLabel: string
  reason: string
  suggestion: string
  url: string
}

const FONT = '"Noto Sans SC", sans-serif'

/** Friday UI calls this with 1:1 only. 3:4 stays available for internal export. */
export async function renderSharePng(fields: PosterFields, ratio: ShareRatio = '1:1'): Promise<string> {
  const { width, height } = SIZES[ratio]
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas unavailable')

  if (document.fonts?.load) {
    await document.fonts.load(`700 64px ${FONT}`)
    await document.fonts.load(`400 32px ${FONT}`)
  }

  const paper = tokenColor('paper')
  const wax = tokenColor('wax')
  const ink = tokenColor('ink')
  const track = tokenColor('track')

  ctx.fillStyle = paper
  ctx.fillRect(0, 0, width, height)

  const pad = 72
  drawSeal(ctx, width - pad - 36, 108, 36, wax, paper)

  ctx.fillStyle = ink
  ctx.font = `700 54px ${FONT}`
  ctx.fillText('不如见一面', pad, 120)
  ctx.fillStyle = ink
  ctx.globalAlpha = 0.62
  ctx.font = `400 28px ${FONT}`
  ctx.fillText('Better meet IRL', pad, 168)
  ctx.globalAlpha = 1
  ctx.fillStyle = wax
  ctx.font = `700 36px ${FONT}`
  ctx.fillText('本周见面方案', pad, 236)

  ctx.fillStyle = ink
  ctx.font = `700 64px ${FONT}`
  ctx.fillText(fields.peerName, pad, 390)
  ctx.globalAlpha = 0.62
  ctx.font = `500 32px ${FONT}`
  wrapText(ctx, `${fields.schoolName} · ${fields.gradeLabel}`, pad, 450, width - pad * 2, 44)
  ctx.globalAlpha = 1

  ctx.fillStyle = wax
  ctx.font = `700 40px ${FONT}`
  ctx.fillText('“', pad, 560)
  ctx.fillStyle = ink
  ctx.font = `700 40px ${FONT}`
  wrapText(ctx, fields.reason, pad + 36, 560, width - pad * 2 - 36, 56, 3)

  ctx.globalAlpha = 0.72
  ctx.font = `400 32px ${FONT}`
  ctx.fillText(fields.suggestion, pad, height - 280)
  ctx.globalAlpha = 1

  const qrUrl = await QRCode.toDataURL(fields.url, {
    margin: 0,
    width: 216,
    color: { dark: ink, light: paper },
  })
  const qr = await loadImage(qrUrl)
  const qrSize = 216
  const qrX = width - pad - qrSize
  const qrY = height - pad - qrSize
  ctx.fillStyle = paper
  ctx.strokeStyle = track
  ctx.lineWidth = 2
  ctx.fillRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32)
  ctx.strokeRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32)
  ctx.drawImage(qr, qrX, qrY, qrSize, qrSize)
  ctx.fillStyle = ink
  ctx.globalAlpha = 0.72
  ctx.font = `400 24px ${FONT}`
  ctx.fillText('打开方案', pad, qrY + 48)
  ctx.fillText('不如见一面', pad, qrY + 88)
  ctx.globalAlpha = 1

  return canvas.toDataURL('image/png')
}

function drawSeal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  wax: string,
  paper: string,
) {
  ctx.fillStyle = wax
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = paper
  ctx.globalAlpha = 0.7
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(x, y, radius * 0.62, 0, Math.PI * 2)
  ctx.stroke()
  ctx.globalAlpha = 1
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 3,
) {
  const chars = Array.from(text)
  let line = ''
  let lineCount = 0
  for (const char of chars) {
    const next = line + char
    if (ctx.measureText(next).width > maxWidth && line) {
      ctx.fillText(line, x, y)
      line = char
      y += lineHeight
      lineCount += 1
      if (lineCount >= maxLines - 1) break
    } else {
      line = next
    }
  }
  if (line) ctx.fillText(line, x, y)
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('qr image failed'))
    image.src = src
  })
}
