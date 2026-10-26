import ComicRenderer from './ComicRenderer'
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
  TailDirection,
} from '../types'

interface Props {
  genre: GenreId
  index: number
  caption: string
  dialogue: string
  scene?: string
  speaker?: string
  setting?: ComicSetting
  pose?: CharacterPose
  characterPreset?: CharacterPresetId
  colors?: Partial<CharacterVisualPreset>
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
  className?: string
  onBubbleClick?: () => void
  onCaptionClick?: () => void
}

export default function PanelArt({
  genre,
  index,
  caption,
  dialogue,
  scene,
  speaker,
  setting,
  pose,
  characterPreset,
  colors,
  sfx,
  imageUrl,
  bubbleStyle,
  bubblePosition,
  tailDirection,
  bubbleX,
  bubbleY,
  bubbleWidth,
  fontSize,
  captionPosition,
  className = '',
  onBubbleClick,
  onCaptionClick,
}: Props) {
  return (
    <ComicRenderer
      index={index}
      genre={genre}
      caption={caption}
      dialogue={dialogue}
      scene={scene}
      speaker={speaker}
      setting={setting}
      pose={pose}
      characterPreset={characterPreset}
      colors={colors}
      sfx={sfx}
      imageUrl={imageUrl}
      bubbleStyle={bubbleStyle}
      bubblePosition={bubblePosition}
      tailDirection={tailDirection}
      bubbleX={bubbleX}
      bubbleY={bubbleY}
      bubbleWidth={bubbleWidth}
      fontSize={fontSize}
      captionPosition={captionPosition}
      className={className}
      onBubbleClick={onBubbleClick}
      onCaptionClick={onCaptionClick}
    />
  )
}
