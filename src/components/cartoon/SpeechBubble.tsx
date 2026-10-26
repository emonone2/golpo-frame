import type {
  BubbleFontSize,
  BubblePosition,
  BubbleStyle,
  CaptionPosition,
  TailDirection,
} from '../../types'

interface SpeechBubbleProps {
  text: string
  speaker?: string
  bubbleStyle?: BubbleStyle
  position?: BubblePosition
  tailDirection?: TailDirection
  x?: number
  y?: number
  width?: number
  fontSize?: BubbleFontSize
  charX?: number
  charY?: number
  onClick?: () => void
}

const BENGALI_FONT_STACK =
  '"Noto Sans Bengali", "Plus Jakarta Sans", "SolaimanLipi", "Kalpurush", system-ui, sans-serif'

const FONT_SIZES: Record<BubbleFontSize, { font: string; line: string; heightFactor: number }> = {
  sm: { font: '11.5px', line: '1.3', heightFactor: 16 },
  base: { font: '13.5px', line: '1.38', heightFactor: 20 },
  lg: { font: '15.5px', line: '1.42', heightFactor: 24 },
}

export function SpeechBubble({
  text,
  speaker,
  bubbleStyle = 'speech',
  position,
  tailDirection,
  x: propX,
  y: propY,
  width: propWidth,
  fontSize = 'base',
  charX = 200,
  charY: _charY,
  onClick,
}: SpeechBubbleProps) {
  if (!text || !text.trim()) return null

  const fontConfig = FONT_SIZES[fontSize] || FONT_SIZES.base

  // Default coordinate calculation based on preset position
  let x = propX
  let y = propY
  let width = propWidth ?? 260

  if (x === undefined || y === undefined) {
    switch (position) {
      case 'top-left':
        x = 24
        y = 28
        width = 230
        break
      case 'top-center':
        x = 75
        y = 28
        width = 250
        break
      case 'top-right':
        x = 145
        y = 28
        width = 230
        break
      case 'bottom-left':
        x = 24
        y = 260
        width = 230
        break
      case 'bottom-center':
        x = 75
        y = 260
        width = 250
        break
      case 'bottom-right':
        x = 145
        y = 260
        width = 230
        break
      default:
        // Position on opposite side of character to prevent obscuring face
        if (charX > 200) {
          x = 30
          y = 35
          width = 240
        } else {
          x = 130
          y = 35
          width = 240
        }
        break
    }
  }

  // Calculate bubble height dynamically based on character count and font size
  const charsPerLine = Math.max(16, Math.floor(width / (fontSize === 'lg' ? 10 : 8.5)))
  const estimatedLines = Math.max(1, Math.ceil(text.length / charsPerLine))
  const speakerPadding = speaker ? 20 : 0
  const height = Math.max(54, 26 + estimatedLines * fontConfig.heightFactor + speakerPadding)

  // Auto-detect tail direction if not provided
  let effectiveTail = tailDirection
  if (!effectiveTail) {
    if (bubbleStyle === 'thought') {
      effectiveTail = x < charX ? 'bottom-right' : 'bottom-left'
    } else {
      effectiveTail = x + width / 2 < charX ? 'bottom-right' : 'bottom-left'
    }
  }

  return (
    <g
      transform={`translate(${x}, ${y})`}
      className="cursor-pointer select-none transition-transform hover:scale-[1.01]"
      onClick={onClick}
    >
      {/* Soft Drop Shadow for high contrast above any illustration */}
      <rect
        x="3"
        y="4"
        width={width}
        height={height}
        rx={bubbleStyle === 'thought' ? 24 : bubbleStyle === 'shout' ? 6 : 14}
        fill="#000000"
        opacity="0.28"
      />

      {/* Bubble Shell based on Style */}
      {bubbleStyle === 'thought' ? (
        /* Thought Cloud Bubble */
        <g fill="#ffffff" stroke="#111111" strokeWidth="2.8" strokeLinejoin="round">
          <rect x="0" y="0" width={width} height={height} rx="22" />
          {/* Cloud bulges */}
          <circle cx="15" cy="15" r="16" />
          <circle cx={width / 2} cy="-4" r="15" />
          <circle cx={width - 15} cy="15" r="16" />
          <circle cx={width + 2} cy={height / 2} r="14" />
          <circle cx={width - 18} cy={height - 2} r="16" />
          <circle cx="20" cy={height - 2} r="15" />
          <circle cx="-2" cy={height / 2} r="14" />
          {/* Thought trail circles */}
          <circle
            cx={effectiveTail === 'bottom-left' ? 30 : width - 30}
            cy={height + 12}
            r="7"
          />
          <circle
            cx={effectiveTail === 'bottom-left' ? 20 : width - 20}
            cy={height + 26}
            r="4.5"
          />
          <circle
            cx={effectiveTail === 'bottom-left' ? 12 : width - 12}
            cy={height + 36}
            r="3"
          />
        </g>
      ) : bubbleStyle === 'shout' ? (
        /* Jagged Action / Shout Bubble (for screaming, excitement, explosions) */
        <g fill="#ffffff" stroke="#111111" strokeWidth="3" strokeLinejoin="miter">
          <polygon
            points={`
              0,${height * 0.4} -12,${height * 0.2} 10,0 ${width * 0.25},-10 ${width * 0.35},0
              ${width * 0.5},-12 ${width * 0.65},0 ${width * 0.75},-10 ${width * 0.9},0
              ${width + 10},${height * 0.25} ${width},${height * 0.5} ${width + 12},${height * 0.75}
              ${width * 0.85},${height} ${width * 0.7},${height + 10} ${width * 0.55},${height}
              ${width * 0.4},${height + 12} ${width * 0.25},${height} 0,${height + 8} -10,${height * 0.7}
            `}
          />
          {effectiveTail !== 'none' && (
            <polygon
              points={
                effectiveTail === 'bottom-left'
                  ? `25,${height} 45,${height} 10,${height + 30}`
                  : `${width - 45},${height} ${width - 25},${height} ${width - 10},${height + 30}`
              }
              fill="#ffffff"
              stroke="#111111"
              strokeWidth="3"
            />
          )}
        </g>
      ) : (
        /* Classic Speech Bubble */
        <g>
          <rect
            x="0"
            y="0"
            width={width}
            height={height}
            rx="14"
            fill="#ffffff"
            stroke="#111111"
            strokeWidth="2.8"
          />
          {effectiveTail === 'bottom-left' && (
            <polygon
              points={`30,${height - 1} 48,${height - 1} 24,${height + 22}`}
              fill="#ffffff"
              stroke="#111111"
              strokeWidth="2.8"
              strokeLinejoin="round"
            />
          )}
          {effectiveTail === 'bottom-right' && (
            <polygon
              points={`${width - 48},${height - 1} ${width - 30},${height - 1} ${width - 24},${height + 22}`}
              fill="#ffffff"
              stroke="#111111"
              strokeWidth="2.8"
              strokeLinejoin="round"
            />
          )}
          {effectiveTail === 'left' && (
            <polygon
              points={`1,${height * 0.3} 1,${height * 0.6} -18,${height * 0.45}`}
              fill="#ffffff"
              stroke="#111111"
              strokeWidth="2.8"
              strokeLinejoin="round"
            />
          )}
          {effectiveTail === 'right' && (
            <polygon
              points={`${width - 1},${height * 0.3} ${width - 1},${height * 0.6} ${width + 18},${height * 0.45}`}
              fill="#ffffff"
              stroke="#111111"
              strokeWidth="2.8"
              strokeLinejoin="round"
            />
          )}
          {/* Cover seams */}
          {effectiveTail === 'bottom-left' && (
            <line x1="31" y1={height} x2="47" y2={height} stroke="#ffffff" strokeWidth="3.5" />
          )}
          {effectiveTail === 'bottom-right' && (
            <line
              x1={width - 47}
              y1={height}
              x2={width - 31}
              y2={height}
              stroke="#ffffff"
              strokeWidth="3.5"
            />
          )}
        </g>
      )}

      {/* Speaker Name Tag */}
      {speaker && (
        <g transform="translate(14, 16)">
          <rect
            x="-4"
            y="-11"
            width={Math.min(width - 20, speaker.length * 10 + 12)}
            height="16"
            rx="4"
            fill="#ffea00"
            stroke="#111111"
            strokeWidth="1.2"
          />
          <text
            x="2"
            y="1"
            fill="#111111"
            fontSize="10.5"
            fontWeight="800"
            fontFamily={BENGALI_FONT_STACK}
          >
            {speaker}
          </text>
        </g>
      )}

      {/* Bengali & English text container with robust wrapping & Unicode support */}
      <foreignObject
        x="12"
        y={speaker ? 22 : 10}
        width={width - 24}
        height={height - (speaker ? 26 : 16)}
      >
        <div
          style={{
            fontFamily: BENGALI_FONT_STACK,
            fontSize: fontConfig.font,
            fontWeight: 700,
            lineHeight: fontConfig.line,
            color: '#111827',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            height: '100%',
            overflow: 'hidden',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
            whiteSpace: 'pre-wrap',
          }}
        >
          {text}
        </div>
      </foreignObject>
    </g>
  )
}

export function ComicCaptionBox({
  text,
  position = 'bottom',
  y: propY,
  fontSize = 'base',
  onClick,
}: {
  text: string
  position?: CaptionPosition
  y?: number
  fontSize?: BubbleFontSize
  onClick?: () => void
}) {
  if (!text || !text.trim()) return null

  const fontConfig = FONT_SIZES[fontSize] || FONT_SIZES.base
  const y = propY !== undefined ? propY : position === 'top' ? 12 : 442

  return (
    <g
      transform={`translate(15, ${y})`}
      className="cursor-pointer select-none transition-transform hover:scale-[1.01]"
      onClick={onClick}
    >
      {/* Shadow */}
      <rect x="2.5" y="3" width="370" height="44" rx="5" fill="#000000" opacity="0.32" />
      {/* Box */}
      <rect
        x="0"
        y="0"
        width="370"
        height="44"
        rx="5"
        fill="#ffea00"
        stroke="#111111"
        strokeWidth="2.8"
      />
      <foreignObject x="8" y="4" width="354" height="36">
        <div
          style={{
            fontFamily: BENGALI_FONT_STACK,
            fontSize: fontConfig.font === '15.5px' ? '13px' : '11.8px',
            fontWeight: 700,
            lineHeight: '1.32',
            color: '#111111',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            height: '100%',
            overflow: 'hidden',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}
        >
          {text}
        </div>
      </foreignObject>
    </g>
  )
}

export function ComicSFXBadge({
  sfx,
  x = 310,
  y = 140,
}: {
  sfx?: string
  x?: number
  y?: number
}) {
  if (!sfx || !sfx.trim()) return null

  const textLen = sfx.length
  const scale = textLen > 5 ? 1.25 : 1

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale}) rotate(-12)`} className="select-none">
      {/* Starburst badge */}
      <polygon
        points="0,-25 12,-12 28,-18 20,-2 32,10 16,14 16,30 2,20 -12,28 -12,12 -28,8 -18,-6 -25,-20 -8,-14"
        fill="#ff0054"
        stroke="#ffffff"
        strokeWidth="2.8"
      />
      <text
        x="0"
        y="5"
        fill="#ffffff"
        fontSize="12.5"
        fontWeight="900"
        fontFamily={BENGALI_FONT_STACK}
        textAnchor="middle"
        stroke="#111111"
        strokeWidth="0.9"
      >
        {sfx}
      </text>
    </g>
  )
}
