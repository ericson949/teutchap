/**
 * generateQRFlyer.ts
 * Generates a branded poster image from a QR code canvas element.
 * Shared between Dashboard and EventOverview — single source of truth.
 */

interface QRFlyerOptions {
  eventName: string
  qrSelector?: string
}

export function generateQRFlyer({ eventName, qrSelector = '#overview-qr canvas' }: QRFlyerOptions): void {
  const qrCanvas = document.querySelector(qrSelector) as HTMLCanvasElement
  if (!qrCanvas) return

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // High-res portrait (poster / chevalet)
  canvas.width = 800
  canvas.height = 1200

  // ── Background gradient ──
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height)
  grad.addColorStop(0, '#0c0a17')
  grad.addColorStop(0.5, '#0e0b1f')
  grad.addColorStop(1, '#050409')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // ── Decorative glow blobs ──
  drawGlow(ctx, 100, 200, 300, 'rgba(139, 92, 246, 0.15)')
  drawGlow(ctx, 700, 900, 350, 'rgba(6, 182, 212, 0.12)')

  // ── Poster borders ──
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'
  ctx.lineWidth = 2
  ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60)

  ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)'
  ctx.lineWidth = 1
  ctx.strokeRect(42, 42, canvas.width - 84, canvas.height - 84)

  // ── Header chip ──
  ctx.fillStyle = 'rgba(99, 102, 241, 0.08)'
  ctx.beginPath()
  ctx.roundRect(canvas.width / 2 - 140, 80, 280, 36, 18)
  ctx.fill()
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)'
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.fillStyle = '#a5b4fc'
  ctx.font = 'bold 10px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.letterSpacing = '2px'
  ctx.fillText('✨ PARTAGE EN DIRECT', canvas.width / 2, 98)
  ctx.letterSpacing = 'normal'

  // ── Event Name ──
  ctx.fillStyle = '#ffffff'
  ctx.font = '800 24px Playfair Display, Georgia, serif'
  ctx.textBaseline = 'middle'
  ctx.fillText(eventName, canvas.width / 2, 170)

  // ── Accent line ──
  const lineGrad = ctx.createLinearGradient(canvas.width / 2 - 100, 0, canvas.width / 2 + 100, 0)
  lineGrad.addColorStop(0, 'rgba(99, 102, 241, 0)')
  lineGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.6)')
  lineGrad.addColorStop(1, 'rgba(99, 102, 241, 0)')
  ctx.fillStyle = lineGrad
  ctx.fillRect(canvas.width / 2 - 100, 192, 200, 2)

  // ── Call to action ──
  ctx.fillStyle = '#ffffff'
  ctx.font = '900 40px Inter, sans-serif'
  ctx.textBaseline = 'middle'
  ctx.fillText("PARTICIPEZ À L'ALBUM !", canvas.width / 2, 250)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'
  ctx.font = '500 16px Inter, sans-serif'
  ctx.fillText("Scannez pour ajouter vos photos à l'album Teutchap en direct.", canvas.width / 2, 290)

  // ── QR Code ──
  const qrSize = 320
  const qrX = canvas.width / 2 - qrSize / 2
  const qrY = 360

  // Shadow behind
  const qrShadow = ctx.createRadialGradient(canvas.width / 2, qrY + qrSize / 2, 30, canvas.width / 2, qrY + qrSize / 2, 240)
  qrShadow.addColorStop(0, 'rgba(99, 102, 241, 0.12)')
  qrShadow.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = qrShadow
  ctx.fillRect(qrX - 80, qrY - 80, qrSize + 160, qrSize + 160)

  // Glass frame
  ctx.fillStyle = 'rgba(255, 255, 255, 0.02)'
  ctx.beginPath()
  ctx.roundRect(qrX - 25, qrY - 25, qrSize + 50, qrSize + 50, 32)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Draw inverted QR
  drawInvertedQR(ctx, qrCanvas, qrX, qrY, qrSize)

  // Logo badge center
  const logoW = 90, logoH = 36
  const logoX = canvas.width / 2 - logoW / 2
  const logoY = qrY + qrSize / 2 - logoH / 2

  ctx.fillStyle = '#0c0a17'
  ctx.beginPath()
  ctx.roundRect(logoX, logoY, logoW, logoH, 10)
  ctx.fill()
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 12px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('teutchap', canvas.width / 2, logoY + logoH / 2)
  ctx.textBaseline = 'alphabetic'

  // ── Steps ──
  const steps = [
    { icon: '📱', title: '1. SCANNEZ', desc: 'Ouvrez votre appareil photo et flashez le QR code.' },
    { icon: '📤', title: '2. PARTAGEZ', desc: 'Sélectionnez vos photos (aucune application à installer).' },
    { icon: '✨', title: '3. ADMIREZ', desc: "Regardez l'album se remplir en temps réel !" },
  ]

  const stepsY = 780
  const colW = 220
  const spacing = 20
  const startX = canvas.width / 2 - (colW * 3 + spacing * 2) / 2

  steps.forEach((step, i) => {
    const x = startX + i * (colW + spacing)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.015)'
    ctx.beginPath()
    ctx.roundRect(x, stepsY, colW, 240, 20)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)'
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.font = '32px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(step.icon, x + colW / 2, stepsY + 50)

    ctx.fillStyle = '#ffffff'
    ctx.font = '900 13px Inter, sans-serif'
    ctx.fillText(step.title, x + colW / 2, stepsY + 105)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'
    ctx.font = '500 11px Inter, sans-serif'
    wrapText(ctx, step.desc, x + 15, stepsY + 135, colW - 30, 16)
  })

  // ── Footer ──
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
  ctx.font = '600 10px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Créé avec amour par Teutchap • teutchap.fr', canvas.width / 2, canvas.height - 70)

  // ── Download ──
  const url = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.download = `Teutchap_${eventName.replace(/\s+/g, '_')}_Flyer.png`
  link.href = url
  link.click()
}

// ── Helpers ──────────────────────────────────────

function drawGlow(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  const g = ctx.createRadialGradient(cx, cy, 50, cx, cy, r)
  g.addColorStop(0, color)
  g.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}

function drawInvertedQR(ctx: CanvasRenderingContext2D, src: HTMLCanvasElement, x: number, y: number, size: number) {
  const offscreen = document.createElement('canvas')
  offscreen.width = src.width
  offscreen.height = src.height
  const oCtx = offscreen.getContext('2d')
  if (!oCtx) return

  oCtx.drawImage(src, 0, 0)
  const imgData = oCtx.getImageData(0, 0, offscreen.width, offscreen.height)
  const d = imgData.data
  for (let i = 0; i < d.length; i += 4) {
    const brightness = (d[i] + d[i + 1] + d[i + 2]) / 3
    if (brightness < 120) {
      d[i] = d[i + 1] = d[i + 2] = d[i + 3] = 255
    } else {
      d[i + 3] = 0
    }
  }
  oCtx.putImageData(imgData, 0, 0)
  ctx.drawImage(offscreen, x, y, size, size)
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number) {
  const words = text.split(' ')
  let line = ''
  let curY = y
  for (const word of words) {
    const test = line + word + ' '
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x + maxW / 2, curY)
      line = word + ' '
      curY += lineH
    } else {
      line = test
    }
  }
  ctx.fillText(line, x + maxW / 2, curY)
}
