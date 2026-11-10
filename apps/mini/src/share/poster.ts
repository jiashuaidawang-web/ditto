import QRCode from 'qrcode'

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

/** Friday UI calls this with 1:1 only. 3:4 stays available for internal export. */
export async function renderSharePng(fields: PosterFields, ratio: ShareRatio = '1:1'): Promise<string> {
  const { width, height } = SIZES[ratio]
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas unavailable')

  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, '#7EB6FF')
  gradient.addColorStop(0.45, '#2F6FE4')
  gradient.addColorStop(1, '#0B1D55')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.16)'
  ctx.beginPath()
  ctx.arc(width * 0.82, height * 0.18, 180, 0, Math.PI * 2)
  ctx.fill()

  const pad = 72
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '700 54px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText('不如见一面', pad, 120)
  ctx.fillStyle = 'rgba(255,255,255,0.74)'
  ctx.font = '400 28px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText('Better meet IRL', pad, 164)
  ctx.fillStyle = '#E40089'
  ctx.font = '600 36px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText('本周见面方案', pad, 230)

  ctx.fillStyle = '#FFFFFF'
  ctx.font = '700 64px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText(fields.peerName, pad, 380)
  ctx.fillStyle = '#D7E6FF'
  ctx.font = '500 32px "PingFang SC", "Microsoft YaHei", sans-serif'
  wrapText(ctx, `${fields.schoolName} · ${fields.gradeLabel}`, pad, 440, width - pad * 2, 44)

  ctx.fillStyle = '#FFFFFF'
  ctx.font = '600 40px "PingFang SC", "Microsoft YaHei", sans-serif'
  wrapText(ctx, fields.reason, pad, 580, width - pad * 2, 56, 2)

  ctx.fillStyle = 'rgba(255,255,255,0.78)'
  ctx.font = '400 32px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText(fields.suggestion, pad, height - 280)

  const qrUrl = await QRCode.toDataURL(fields.url, {
    margin: 0,
    width: 216,
    color: { dark: '#0B1D55', light: '#FFFFFF' },
  })
  const qr = await loadImage(qrUrl)
  const qrSize = 216
  const qrX = width - pad - qrSize
  const qrY = height - pad - qrSize
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32)
  ctx.drawImage(qr, qrX, qrY, qrSize, qrSize)
  ctx.fillStyle = 'rgba(255,255,255,0.78)'
  ctx.font = '400 24px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText('打开方案', pad, qrY + 48)
  ctx.fillText('不如见一面', pad, qrY + 88)

  return canvas.toDataURL('image/png')
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
