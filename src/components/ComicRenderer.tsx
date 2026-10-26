import { useMemo } from 'react'
import { genreById } from '../data/genres'
import { detectPose, detectSetting } from '../lib/image/imageAdapter'
import type {
  BubbleFontSize,
  BubblePosition,
  BubbleStyle,
  CaptionPosition,
  CharacterPose,
  CharacterPresetId,
  CharacterVisualPreset,
  ComicSetting,
  GenreId,
  Panel,
  TailDirection,
} from '../types'
import { CartoonBackground } from './cartoon/CartoonBackgrounds'
import { CartoonCharacter, detectPresetFromName } from './cartoon/CartoonCharacters'
import { ComicCaptionBox, ComicSFXBadge, SpeechBubble } from './cartoon/SpeechBubble'

interface ComicRendererProps {
  panel?: Partial<Panel>
  index: number
  genre: GenreId
  caption?: string
  dialogue?: string
  scene?: string
  speaker?: string
  setting?: ComicSetting
  pose?: CharacterPose
  characterPreset?: CharacterPresetId
  sfx?: string
  imageUrl?: string
  bubbleStyle?: BubbleStyle
  bubblePosition?: BubblePosition
  tailDirection?: TailDirection
  bubbleX?: number
  bubbleY?: number
  bubbleWidth?: number
  fontSize?: BubbleFontSize
  captionPosition?: CaptionPosition
  colors?: Partial<CharacterVisualPreset>
  characterPresets?: Record<string, CharacterVisualPreset>
  className?: string
  onBubbleClick?: () => void
  onCaptionClick?: () => void
}

export default function ComicRenderer({
  panel,
  index,
  genre = 'action',
  caption: propCaption,
  dialogue: propDialogue,
  scene: propScene,
  speaker: propSpeaker,
  setting: propSetting,
  pose: propPose,
  characterPreset: propPreset,
  colors: propColors,
  sfx: propSfx,
  imageUrl: propImageUrl,
  bubbleStyle: propBubbleStyle,
  bubblePosition: propBubblePosition,
  tailDirection: propTailDirection,
  bubbleX: propBubbleX,
  bubbleY: propBubbleY,
  bubbleWidth: propBubbleWidth,
  fontSize: propFontSize,
  captionPosition: propCaptionPosition,
  characterPresets,
  className = '',
  onBubbleClick,
  onCaptionClick,
}: ComicRendererProps) {
  // Resolve values from direct props or panel object
  const caption = propCaption ?? panel?.caption ?? ''
  let dialogue = propDialogue ?? panel?.dialogue ?? ''
  let speaker = propSpeaker ?? panel?.speaker ?? ''
  const scene = propScene ?? panel?.scene ?? ''
  const imageUrl = propImageUrl ?? panel?.imageUrl

  const bubbleStyle = propBubbleStyle ?? panel?.bubbleStyle ?? 'speech'
  const bubblePosition = propBubblePosition ?? panel?.bubblePosition
  const tailDirection = propTailDirection ?? panel?.tailDirection
  const bubbleX = propBubbleX ?? panel?.bubbleX
  const bubbleY = propBubbleY ?? panel?.bubbleY
  const bubbleWidth = propBubbleWidth ?? panel?.bubbleWidth
  const fontSize = propFontSize ?? panel?.fontSize ?? 'base'
  const captionPosition = propCaptionPosition ?? panel?.captionPosition ?? 'bottom'

  // If dialogue contains "Name: text", parse out the speaker cleanly
  if (!speaker && dialogue.includes(':')) {
    const parts = dialogue.split(':')
    if (parts.length === 2 && parts[0].trim().length < 30) {
      speaker = parts[0].trim()
      dialogue = parts[1].trim()
    }
  }

  // Detect setting, pose, and preset if not specified
  const effectiveSetting = useMemo<ComicSetting>(() => {
    if (propSetting) return propSetting
    if (panel?.setting) return panel.setting
    return detectSetting(scene, dialogue)
  }, [propSetting, panel?.setting, scene, dialogue])

  const effectivePose = useMemo<CharacterPose>(() => {
    if (propPose) return propPose
    if (panel?.pose) return panel.pose
    return detectPose(scene, dialogue)
  }, [propPose, panel?.pose, scene, dialogue])

  const effectivePreset = useMemo<CharacterPresetId>(() => {
    if (propPreset) return propPreset
    if (panel?.characterPreset) return panel.characterPreset
    return detectPresetFromName(speaker || scene)
  }, [propPreset, panel?.characterPreset, speaker, scene])

  // Custom colors if user configured them
  const customColors = propColors ?? panel?.colors ?? (speaker && characterPresets ? characterPresets[speaker] : undefined)

  // Compute SFX badge text
  const effectiveSfx = useMemo(() => {
    if (propSfx) return propSfx
    if (panel?.sfx) return panel.sfx
    if (effectivePose === 'shocked') return 'OMG!'
    if (effectivePose === 'running') return 'ZOOM!'
    if (effectivePose === 'collapsed') return 'ধপাস!'
    if (effectivePose === 'celebrating') return 'ইয়াাহু!'
    if (effectivePose === 'thinking') return 'হুমম...'
    if (effectivePose === 'angry') return 'গ্ররর!'
    if (effectivePose === 'crying') return 'উহুহু!'
    if (effectivePose === 'whispering') return 'শুশশ...'
    if (effectivePose === 'dancing') return 'ধিনতানা!'
    return undefined
  }, [propSfx, panel?.sfx, effectivePose])

  const g = genreById[genre] || genreById.action

  // Layout positioning
  const charX = effectivePose === 'running' ? 180 : effectiveSetting === 'bedroom' ? 150 : 200
  const charY = effectiveSetting === 'bedroom' && effectivePose === 'collapsed' ? 320 : 360

  return (
    <figure
      className={`group relative aspect-[4/5] w-full overflow-hidden rounded-2xl border-4 border-[#22181c] bg-[#1a1423] shadow-2xl transition duration-200 hover:shadow-fuchsia-500/20 ${className}`}
    >
      <svg
        viewBox="0 0 400 500"
        className="h-full w-full select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Sky Gradient for Campus */}
          <linearGradient id="sky-campus" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f4a261" />
            <stop offset="60%" stopColor="#fde28e" />
            <stop offset="100%" stopColor="#e9c46a" />
          </linearGradient>

          {/* Sunset Rooftop Gradient */}
          <linearGradient id="sky-rooftop" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#540b0e" />
            <stop offset="50%" stopColor="#9e2a2b" />
            <stop offset="100%" stopColor="#e09f3e" />
          </linearGradient>

          {/* General Manga Gradient */}
          <linearGradient id="sky-general" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2b1055" />
            <stop offset="100%" stopColor="#7597de" />
          </linearGradient>

          {/* Halftone Pattern */}
          <pattern id="halftone-pattern" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="#000000" opacity="0.14" />
          </pattern>

          {/* Rainy Monsoon Sky */}
          <linearGradient id="sky-rain" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1c2541" />
            <stop offset="60%" stopColor="#3a506b" />
            <stop offset="100%" stopColor="#5bc0be" />
          </linearGradient>

          {/* Sunny Field Sky */}
          <linearGradient id="sky-field" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0077b6" />
            <stop offset="65%" stopColor="#90e0ef" />
            <stop offset="100%" stopColor="#e0fae5" />
          </linearGradient>

          {/* Bengal River Sunrise / Sunset */}
          <linearGradient id="sky-river" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d90429" />
            <stop offset="40%" stopColor="#f77f00" />
            <stop offset="70%" stopColor="#fcbf49" />
            <stop offset="100%" stopColor="#eae2b7" />
          </linearGradient>

          {/* Library Ambient Glow */}
          <linearGradient id="bg-grad-library" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#14213d" />
            <stop offset="100%" stopColor="#0b090a" />
          </linearGradient>

          {/* TSC / Bottola Afternoon Sky */}
          <linearGradient id="sky-tsc" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#457b9d" />
            <stop offset="60%" stopColor="#a8dadc" />
            <stop offset="100%" stopColor="#f1faee" />
          </linearGradient>

          {/* Rickshaw City Street Glow */}
          <linearGradient id="sky-rickshaw" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f3722c" />
            <stop offset="50%" stopColor="#f8961e" />
            <stop offset="100%" stopColor="#f9c74f" />
          </linearGradient>

          {/* Fuchka Evening Street Gradient */}
          <linearGradient id="sky-fuchka" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f0c29" />
            <stop offset="60%" stopColor="#302b63" />
            <stop offset="100%" stopColor="#24243e" />
          </linearGradient>

          {/* Bus Interior Gradient */}
          <linearGradient id="sky-bus" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          {/* Rain Puddle Shimmer */}
          <radialGradient id="puddle-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#1e3a5f" stopOpacity="0.1" />
          </radialGradient>

          {/* Street Lamp Glow */}
          <radialGradient id="lamp-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
          </radialGradient>

          {/* Fuchka Bulb Glow */}
          <radialGradient id="bulb-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fde68a" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
          </radialGradient>

          {/* River Sunset Sun Glow */}
          <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
            <stop offset="60%" stopColor="#f97316" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* LAYER 1: ILLUSTRATION LAYER (Procedural or AI Image) */}
        {imageUrl ? (
          <image href={imageUrl} x="0" y="0" width="400" height="500" preserveAspectRatio="xMidYMid slice" />
        ) : (
          /* Real procedural cartoon illustration */
          <>
            <CartoonBackground setting={effectiveSetting} genre={genre} />
            <rect width="400" height="500" fill="url(#halftone-pattern)" pointerEvents="none" />
            <CartoonCharacter
              presetId={effectivePreset}
              name={speaker}
              pose={effectivePose}
              x={charX}
              y={charY}
              scale={effectiveSetting === 'bedroom' && effectivePose === 'collapsed' ? 1.05 : 1}
              colors={customColors}
            />
          </>
        )}

        {/* LAYER 2: COMIC SOUND EFFECT (SFX) BADGE */}
        {effectiveSfx && (
          <ComicSFXBadge
            sfx={effectiveSfx}
            x={bubblePosition === 'top-right' ? 70 : 315}
            y={bubblePosition === 'top-right' ? 190 : 150}
          />
        )}

        {/* LAYER 3: COMIC TEXT-OVERLAY SYSTEM (SPEECH BUBBLE & CAPTION) */}
        {/* Dialogue Speech Bubble */}
        {dialogue && (
          <SpeechBubble
            text={dialogue}
            speaker={speaker}
            bubbleStyle={bubbleStyle}
            position={bubblePosition}
            tailDirection={tailDirection}
            x={bubbleX}
            y={bubbleY}
            width={bubbleWidth}
            fontSize={fontSize}
            charX={charX}
            charY={charY}
            onClick={onBubbleClick}
          />
        )}

        {/* Empty state placeholder when neither caption nor dialogue */}
        {!caption && !dialogue && scene && (
          <g transform="translate(40, 180)">
            <rect width="320" height="70" rx="10" fill="#ffffff" stroke="#111" strokeWidth="2" opacity="0.95" />
            <text x="160" y="32" fill="#333" fontSize="12" fontWeight="bold" textAnchor="middle">
              {scene.slice(0, 45)}...
            </text>
            <text x="160" y="52" fill="#888" fontSize="10" fontStyle="italic" textAnchor="middle">
              (Procedural cartoon preview)
            </text>
          </g>
        )}

        {/* Narrative Caption Box (Top or Bottom) */}
        {caption && (
          <ComicCaptionBox
            text={caption}
            position={captionPosition}
            fontSize={fontSize}
            onClick={onCaptionClick}
          />
        )}

        {/* LAYER 4: PANEL BADGES & FRAME */}
        {/* Panel Number Badge */}
        <g transform="translate(12, 12)">
          <rect
            width="32"
            height="26"
            rx="6"
            fill="#111111"
            stroke="#ffea00"
            strokeWidth="2"
          />
          <text
            x="16"
            y="18"
            fill="#ffffff"
            fontSize="14"
            fontWeight="900"
            fontFamily="system-ui, sans-serif"
            textAnchor="middle"
          >
            {index + 1}
          </text>
        </g>

        {/* Genre Mood Indicator Pill */}
        <g transform="translate(345, 12)">
          <circle cx="16" cy="13" r="14" fill="#ffffff" stroke="#111111" strokeWidth="2" />
          <text x="16" y="18" fontSize="14" textAnchor="middle">
            {g.emoji}
          </text>
        </g>

        {/* Comic Outer Frame Inner Stroke */}
        <rect
          x="0"
          y="0"
          width="400"
          height="500"
          fill="none"
          stroke="#22181c"
          strokeWidth="6"
        />
      </svg>
    </figure>
  )
}
