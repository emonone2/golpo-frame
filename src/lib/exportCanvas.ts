/**
 * Canvas and PNG export engine for GolpoFrame.
 * Reliably renders SVG comic panels (including procedural characters,
 * backgrounds, speech bubbles, and Bengali Unicode typography) onto
 * HTML5 Canvas and exports high-DPI PNGs.
 */

export interface ComicExportOptions {
  title?: string
  summary?: string
  genre?: string
  scale?: number
  onProgress?: (msg: string) => void
}

const BENGALI_FONT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
  * {
    box-sizing: border-box;
  }
  text, div, span, p {
    font-family: "Noto Sans Bengali", "Plus Jakarta Sans", "SolaimanLipi", "Kalpurush", system-ui, sans-serif !important;
  }
`

/**
 * Trigger browser file download from a Blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

/**
 * Sanitize and prepare an SVG element for standalone rasterization.
 * Inlines necessary namespaces, font definitions, and fixes foreignObject XHTML tags.
 */
async function prepareSvgClone(originalSvg: SVGSVGElement, width: number, height: number): Promise<SVGSVGElement> {
  const clone = originalSvg.cloneNode(true) as SVGSVGElement

  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
  clone.setAttribute('width', String(width))
  clone.setAttribute('height', String(height))
  clone.setAttribute('viewBox', `0 0 ${width} ${height}`)

  // Ensure all foreignObject child nodes have explicit XHTML namespace
  const foreignObjects = clone.querySelectorAll('foreignObject')
  foreignObjects.forEach((fo) => {
    Array.from(fo.children).forEach((child) => {
      child.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml')
    })
  })

  // Ensure defs exists and inject web fonts / text styles
  let defs = clone.querySelector('defs')
  if (!defs) {
    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    clone.insertBefore(defs, clone.firstChild)
  }

  const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style')
  styleEl.textContent = BENGALI_FONT_CSS
  defs.appendChild(styleEl)

  // Handle external <image> tags: inline them as data URLs if possible or keep safe
  const images = clone.querySelectorAll('image')
  for (const imgEl of Array.from(images)) {
    const href = imgEl.getAttribute('href') || imgEl.getAttribute('xlink:href')
    if (href && href.startsWith('http')) {
      try {
        const response = await fetch(href, { mode: 'cors' })
        if (response.ok) {
          const blob = await response.blob()
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(blob)
          })
          imgEl.setAttribute('href', dataUrl)
        }
      } catch {
        // If external image fails to fetch due to CORS, continue gracefully
      }
    }
  }

  return clone
}

/**
 * Converts an SVGSVGElement to an HTMLImageElement
 */
export async function svgToImage(svgElement: SVGSVGElement, width = 400, height = 500): Promise<HTMLImageElement> {
  if (document.fonts) {
    try {
      await document.fonts.ready
    } catch {
      // Continue even if fonts check rejected
    }
  }

  const clone = await prepareSvgClone(svgElement, width, height)
  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(clone)

  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    const timeout = setTimeout(() => {
      URL.revokeObjectURL(url)
      reject(new Error('Image rasterization timed out.'))
    }, 12000)

    img.onload = () => {
      clearTimeout(timeout)
      URL.revokeObjectURL(url)
      resolve(img)
    }

    img.onerror = () => {
      clearTimeout(timeout)
      URL.revokeObjectURL(url)
      reject(new Error('Failed to rasterize SVG to image.'))
    }

    img.src = url
  })
}

/**
 * Export a single comic panel as a crisp PNG
 */
export async function exportSinglePanelToPng(
  svgElement: SVGSVGElement,
  filename: string,
  scale = 2
): Promise<void> {
  const baseW = 400
  const baseH = 500
  const w = baseW * scale
  const h = baseH * scale

  const img = await svgToImage(svgElement, baseW, baseH)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Canvas 2D context not available')
  }

  // Draw background
  ctx.fillStyle = '#1a1423'
  ctx.fillRect(0, 0, w, h)

  // Draw scaled image
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, w, h)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to generate PNG blob from canvas'))
        return
      }
      downloadBlob(blob, filename.endsWith('.png') ? filename : `${filename}.png`)
      resolve()
    }, 'image/png')
  })
}

/**
 * Export the complete vertical webtoon strip as a high-resolution PNG
 */
export async function exportComicStripToPng(
  svgElements: SVGSVGElement[],
  filename: string,
  options: ComicExportOptions = {}
): Promise<void> {
  if (svgElements.length === 0) {
    throw new Error('No panels found to export.')
  }

  const { title = 'GolpoFrame Comic', summary = '', genre = '', scale = 2, onProgress } = options

  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready
    } catch {
      // Continue gracefully
    }
  }

  onProgress?.('Preparing panels...')

  const panelBaseW = 400
  const panelBaseH = 500
  const padX = 24
  const gap = 20
  const padY = 24
  const headerH = title ? 100 : 40
  const footerH = 46

  const contentH = svgElements.length * panelBaseH + (svgElements.length - 1) * gap
  const baseWidth = panelBaseW + padX * 2
  const baseHeight = padY + headerH + contentH + footerH + padY

  const totalW = baseWidth * scale
  const totalH = baseHeight * scale

  const canvas = document.createElement('canvas')
  canvas.width = totalW
  canvas.height = totalH
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Canvas 2D context unavailable.')
  }

  ctx.scale(scale, scale)

  // Background
  ctx.fillStyle = '#0d0a1f'
  ctx.fillRect(0, 0, baseWidth, baseHeight)

  // Draw Header
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  if (title) {
    ctx.font = 'bold 22px "Noto Sans Bengali", "Plus Jakarta Sans", system-ui, sans-serif'
    ctx.fillText(title, baseWidth / 2, padY + 28)

    if (summary) {
      ctx.fillStyle = '#cbd5e1'
      ctx.font = '12px "Noto Sans Bengali", "Plus Jakarta Sans", system-ui, sans-serif'
      const truncated = summary.length > 70 ? `${summary.slice(0, 68)}…` : summary
      ctx.fillText(truncated, baseWidth / 2, padY + 54)
    }

    ctx.fillStyle = '#f59e0b'
    ctx.font = 'bold 11px system-ui, sans-serif'
    ctx.fillText(
      `GOLPOFRAME ${genre.toUpperCase()} • WEBTOON EDITION`,
      baseWidth / 2,
      padY + (summary ? 76 : 58)
    )
  }

  // Draw dividing header line
  ctx.strokeStyle = '#2a2058'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(padX, padY + headerH - 8)
  ctx.lineTo(baseWidth - padX, padY + headerH - 8)
  ctx.stroke()

  // Draw Panels sequentially
  for (let i = 0; i < svgElements.length; i++) {
    onProgress?.(`Rendering panel ${i + 1} of ${svgElements.length}...`)
    const svgEl = svgElements[i]
    const panelImg = await svgToImage(svgEl, panelBaseW, panelBaseH)

    const posX = padX
    const posY = padY + headerH + i * (panelBaseH + gap)

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)'
    ctx.beginPath()
    ctx.roundRect(posX + 4, posY + 4, panelBaseW, panelBaseH, 16)
    ctx.fill()

    // Draw Panel Image
    ctx.drawImage(panelImg, posX, posY, panelBaseW, panelBaseH)
  }

  // Draw Footer
  onProgress?.('Finalizing webtoon strip...')
  const footerY = padY + headerH + contentH + 16
  ctx.strokeStyle = '#2a2058'
  ctx.beginPath()
  ctx.moveTo(padX, footerY)
  ctx.lineTo(baseWidth - padX, footerY)
  ctx.stroke()

  ctx.fillStyle = '#64748b'
  ctx.font = '11px "Noto Sans Bengali", system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('গল্পফ্রেম • GolpoFrame AI Comic Studio • Dhaka, Bangladesh', baseWidth / 2, footerY + 22)

  // Download Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to create PNG blob for webtoon strip.'))
        return
      }
      downloadBlob(blob, filename.endsWith('.png') ? filename : `${filename}.png`)
      resolve()
    }, 'image/png')
  })
}

/**
 * Fallback: Generate full SVG strip string for direct vector download
 */
export function exportSvgStrip(
  svgElements: SVGSVGElement[],
  filename: string,
  options: ComicExportOptions = {}
): void {
  const { title = 'GolpoFrame Comic' } = options
  const panelWidth = 400
  const panelHeight = 500
  const gap = 16
  const totalHeight = svgElements.length * panelHeight + (svgElements.length - 1) * gap

  let stripInner = ''
  svgElements.forEach((svg, idx) => {
    const yOffset = idx * (panelHeight + gap)
    stripInner += `<g transform="translate(0, ${yOffset})">${svg.innerHTML}</g>`
  })

  const fullSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${panelWidth} ${totalHeight}" width="${panelWidth}" height="${totalHeight}">
      <defs>
        <style>${BENGALI_FONT_CSS}</style>
      </defs>
      <rect width="${panelWidth}" height="${totalHeight}" fill="#0d0a1f"/>
      ${stripInner}
    </svg>
  `

  const blob = new Blob([fullSvg], { type: 'image/svg+xml;charset=utf-8' })
  const finalName = filename
    ? (filename.endsWith('.svg') ? filename : `${filename}.svg`)
    : `${(title || 'golpoframe-comic').replace(/\s+/g, '-')}-strip.svg`
  downloadBlob(blob, finalName)
}
