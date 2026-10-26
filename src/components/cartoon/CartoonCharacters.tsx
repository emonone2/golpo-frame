import type { CharacterPose, CharacterPresetId, CharacterVisualPreset } from '../../types'

interface CharacterProps {
  presetId?: CharacterPresetId
  name?: string
  pose?: CharacterPose
  x?: number
  y?: number
  scale?: number
  colors?: Partial<CharacterVisualPreset>
}

// Preset visual defaults with authentic Bangladeshi color palettes & styles
export const DEFAULT_PRESETS: Record<CharacterPresetId, CharacterVisualPreset> = {
  rafi: {
    id: 'rafi',
    name: 'Rafi',
    skinColor: '#f1b582',
    hairColor: '#18181b',
    primaryColor: '#2563eb', // College denim jacket
    secondaryColor: '#f59e0b', // Warm yellow inner tee
    hasGlasses: false,
    hasBackpack: true,
    hasBeard: false,
    presetType: 'rafi',
  },
  nusrat: {
    id: 'nusrat',
    name: 'Nusrat',
    skinColor: '#e8bc92',
    hairColor: '#1c1917',
    primaryColor: '#e11d48', // Vibrant crimson kurti
    secondaryColor: '#fb923c', // Warm peach dupatta / orna
    hasGlasses: true, // Signature round comic glasses
    hasBackpack: true,
    hasBeard: false,
    presetType: 'nusrat',
  },
  tamim: {
    id: 'tamim',
    name: 'Tamim',
    skinColor: '#d99b66',
    hairColor: '#18181b',
    primaryColor: '#0d9488', // Casual teal hoodie
    secondaryColor: '#f8fafc', // Clean white inner tee
    hasGlasses: false,
    hasBackpack: true,
    hasBeard: true, // Cool friend goatee stubble
    presetType: 'tamim',
  },
  teacher: {
    id: 'teacher',
    name: 'Mr. Karim',
    skinColor: '#dfa87a',
    hairColor: '#4b5563', // Distinguished graying hair
    primaryColor: '#0284c7', // Formal crisp striped blue shirt
    secondaryColor: '#1e293b', // Formal charcoal trousers
    hasGlasses: true, // Teacher reading spectacles
    hasBackpack: false,
    hasBeard: true, // Dignified Bengali uncle mustache
    presetType: 'teacher',
  },
  khala: {
    id: 'khala',
    name: 'Khala',
    skinColor: '#c68b59',
    hairColor: '#1c1917',
    primaryColor: '#b91c1c', // Traditional red cotton saree
    secondaryColor: '#f59e0b', // Rich golden-yellow temple border
    hasGlasses: false,
    hasBackpack: false,
    hasBeard: false,
    presetType: 'khala',
  },
  guard: {
    id: 'guard',
    name: 'Guard Uncle',
    skinColor: '#be8254',
    hairColor: '#374151',
    primaryColor: '#b45309', // Khaki security uniform
    secondaryColor: '#1e293b', // Deep navy cap & accents
    hasGlasses: false,
    hasBackpack: false,
    hasBeard: true, // Majestic curved mustache
    presetType: 'guard',
  },
  rickshaw_mama: {
    id: 'rickshaw_mama',
    name: 'Rickshaw Mama',
    skinColor: '#b4794e', // Weathered sun-kissed tone
    hairColor: '#18181b',
    primaryColor: '#dc2626', // Red & white checked gamchha
    secondaryColor: '#059669', // Emerald green collared shirt
    hasGlasses: false,
    hasBackpack: false,
    hasBeard: true,
    presetType: 'rickshaw_mama',
  },
  cha_mama: {
    id: 'cha_mama',
    name: 'Tong Mama',
    skinColor: '#bf8558',
    hairColor: '#262626',
    primaryColor: '#ea580c', // Warm orange bistro apron
    secondaryColor: '#0284c7', // Signature blue tea towel
    hasGlasses: false,
    hasBackpack: false,
    hasBeard: true,
    presetType: 'cha_mama',
  },
  ananya: {
    id: 'ananya',
    name: 'Ananya',
    skinColor: '#e8bc92',
    hairColor: '#18181b',
    primaryColor: '#10b981', // Elegant emerald/mint hijab
    secondaryColor: '#0284c7', // Sky-blue university kurti
    hasGlasses: true, // Chic smart spectacles
    hasBackpack: true,
    hasBeard: false,
    presetType: 'ananya',
  },
  guitarist: {
    id: 'guitarist',
    name: 'Fahim',
    skinColor: '#dda16f',
    hairColor: '#18181b',
    primaryColor: '#312e81', // Bohemian indigo denim vest
    secondaryColor: '#dc2626', // Red rocker headband & tee
    hasGlasses: false,
    hasBackpack: true,
    hasBeard: true,
    presetType: 'guitarist',
  },
  policeman: {
    id: 'policeman',
    name: 'Traffic Police',
    skinColor: '#c68b59',
    hairColor: '#1f2937',
    primaryColor: '#38bdf8', // Bangladesh police sky-blue shirt
    secondaryColor: '#1e3a8a', // Deep navy trousers & beret
    hasGlasses: true,
    hasBackpack: false,
    hasBeard: true,
    presetType: 'policeman',
  },
  dadi: {
    id: 'dadi',
    name: 'Dadi',
    skinColor: '#cfa47e',
    hairColor: '#e2e8f0', // Beautiful silver grandmother hair
    primaryColor: '#f8fafc', // Classic white cotton saree
    secondaryColor: '#dc2626', // Traditional broad red border
    hasGlasses: true, // Round reading glasses on neck chain
    hasBackpack: false,
    hasBeard: false,
    presetType: 'dadi',
  },
  custom: {
    id: 'custom',
    name: 'Student',
    skinColor: '#f1b582',
    hairColor: '#18181b',
    primaryColor: '#2563eb',
    secondaryColor: '#f59e0b',
    hasGlasses: false,
    hasBackpack: true,
    hasBeard: false,
    presetType: 'custom',
  },
}

export function detectPresetFromName(name: string = ''): CharacterPresetId {
  const n = name.toLowerCase()
  if (/রিকশা|rickshaw/.test(n)) return 'rickshaw_mama'
  if (/চা|টং|cha|tong|tea/.test(n)) return 'cha_mama'
  if (/অনন্যা|ananya|মেধাবী|পড়ুয়া/.test(n)) return 'ananya'
  if (/ফাহিম|fahim|গিটার|guitar|গায়ক|শিল্পী/.test(n)) return 'guitarist'
  if (/পুলিশ|ট্রাফিক|police|traffic/.test(n)) return 'policeman'
  if (/দাদি|নানী|খালাম্মা|dadi|nani|grandma/.test(n)) return 'dadi'
  if (/নুসরাত|আফা|আপু|মেয়ে|nusrat|apu|girl|sister/.test(n)) return 'nusrat'
  if (/তামিম|দোস্ত|বন্ধু|tamim|bro|shuvo|tanvir/.test(n)) return 'tamim'
  if (/স্যার|ম্যাডাম|শিক্ষক|মাস্টার|karim|teacher|sir|ma'am|invigilator/.test(n)) return 'teacher'
  if (/খালা|বুয়া|কাকি|khala|buya|auntie/.test(n)) return 'khala'
  if (/দারোয়ান|কাকু|গার্ড|guard|uncle|mama/.test(n)) return 'guard'
  return 'rafi'
}

export function CartoonCharacter({
  presetId,
  name,
  pose = 'idle',
  x = 200,
  y = 350,
  scale = 1,
  colors,
}: CharacterProps) {
  const detected = presetId || detectPresetFromName(name)
  const base = DEFAULT_PRESETS[detected] || DEFAULT_PRESETS.rafi
  const final = { ...base, ...colors }
  const uid = `${final.id}-${pose}`

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} id={`char-${final.id}`}>
      {/* ── Internal Character Defs: Cel-shading gradients & glossy shines ── */}
      <defs>
        {/* Soft ground contact shadow */}
        <radialGradient id={`shadow-grad-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.35" />
          <stop offset="70%" stopColor="#0f172a" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>

        {/* Glossy hair highlight streak */}
        <linearGradient id={`hair-shine-${uid}`} x1="0%" y1="0%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Eyeball specular gloss */}
        <radialGradient id={`eye-lens-${uid}`} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="80%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </radialGradient>

        {/* Gold accessory glow */}
        <linearGradient id={`gold-shine-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>

      {/* ── Realistic Ground Contact Shadow ── */}
      <ellipse
        cx="0"
        cy="116"
        rx={pose === 'running' ? '58' : pose === 'collapsed' ? '70' : pose === 'dancing' ? '48' : '42'}
        ry={pose === 'collapsed' ? '14' : '10'}
        fill={`url(#shadow-grad-${uid})`}
      />

      {/* ── Puddle for Crying Pose ── */}
      {pose === 'crying' && (
        <g id="tear-puddle">
          <ellipse cx="0" cy="116" rx="42" ry="9" fill="#38bdf8" opacity="0.5" />
          <ellipse cx="0" cy="116" rx="32" ry="6" fill="#7dd3fc" opacity="0.6" />
          {/* Ripples */}
          <ellipse cx="0" cy="116" rx="22" ry="4" fill="none" stroke="#e0f2fe" strokeWidth="1.5" />
          <ellipse cx="0" cy="116" rx="12" ry="2.5" fill="none" stroke="#ffffff" strokeWidth="1.2" />
        </g>
      )}

      {/* ── Student Backpack (Behind body) ── */}
      {final.hasBackpack && pose !== 'collapsed' && (
        <g id="backpack">
          {/* Backpack bulk */}
          <path
            d="M -35 -14 Q -48 25 -30 74 Q -14 78 -8 66 Z"
            fill="#b91c1c"
            stroke="#111827"
            strokeWidth="3.5"
          />
          {/* Backpack shaded contour */}
          <path d="M -32 8 Q -42 35 -28 52" stroke="#7f1d1d" strokeWidth="3" fill="none" />
          {/* Front zippered utility pouch */}
          <rect x="-38" y="28" width="12" height="26" rx="4" fill="#dc2626" stroke="#111827" strokeWidth="2" />
          <line x1="-38" y1="38" x2="-26" y2="38" stroke="#fef08a" strokeWidth="1.5" />
          {/* Water bottle in mesh side pocket */}
          <rect x="-42" y="14" width="7" height="18" rx="2" fill="#38bdf8" stroke="#111827" strokeWidth="1.5" />
          <rect x="-41" y="10" width="5" height="5" rx="1" fill="#0284c7" stroke="#111827" strokeWidth="1" />
        </g>
      )}

      {/* ── Acoustic Guitar for Fahim (Behind body) ── */}
      {final.id === 'guitarist' && pose !== 'collapsed' && (
        <g id="guitar-back" transform="rotate(-26, 32, 18)">
          {/* Wooden guitar body with Sunburst shading */}
          <ellipse cx="34" cy="46" rx="22" ry="28" fill="#92400e" stroke="#111827" strokeWidth="3.5" />
          <ellipse cx="34" cy="46" rx="16" ry="22" fill="#d97706" />
          <ellipse cx="34" cy="22" rx="16" ry="19" fill="#92400e" stroke="#111827" strokeWidth="3" />
          <ellipse cx="34" cy="22" rx="11" ry="14" fill="#d97706" />
          {/* Soundhole with Rosette ring */}
          <circle cx="34" cy="30" r="8" fill="#18181b" stroke="#fef08a" strokeWidth="1.5" />
          <circle cx="34" cy="30" r="5" fill="#0f172a" />
          {/* Bridge & Saddle */}
          <rect x="25" y="52" width="18" height="5" rx="1.5" fill="#451a03" stroke="#111827" strokeWidth="1.5" />
          {/* Guitar neck & Fretboard */}
          <rect x="31" y="-30" width="6" height="52" fill="#451a03" stroke="#111827" strokeWidth="2" />
          {/* Fret wire marks */}
          <line x1="31" y1="-20" x2="37" y2="-20" stroke="#cbd5e1" strokeWidth="1" />
          <line x1="31" y1="-10" x2="37" y2="-10" stroke="#cbd5e1" strokeWidth="1" />
          <line x1="31" y1="0" x2="37" y2="0" stroke="#cbd5e1" strokeWidth="1" />
          <line x1="31" y1="10" x2="37" y2="10" stroke="#cbd5e1" strokeWidth="1" />
          {/* Headstock */}
          <polygon points="29,-42 39,-42 37,-30 31,-30" fill="#b45309" stroke="#111827" strokeWidth="2" />
          {/* Golden tuning pegs */}
          <circle cx="27" cy="-38" r="2.5" fill="#fde047" stroke="#111827" strokeWidth="1.2" />
          <circle cx="41" cy="-38" r="2.5" fill="#fde047" stroke="#111827" strokeWidth="1.2" />
          <circle cx="27" cy="-33" r="2.5" fill="#fde047" stroke="#111827" strokeWidth="1.2" />
          <circle cx="41" cy="-33" r="2.5" fill="#fde047" stroke="#111827" strokeWidth="1.2" />
          {/* Woven shoulder strap */}
          <path d="M 12 18 Q 30 2 34 -30" stroke="#18181b" strokeWidth="4" fill="none" strokeDasharray="4 2" />
        </g>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* ── LEGS & FOOTWEAR (Dynamic comic stylings per pose) ──     */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {pose === 'running' ? (
        <g id="legs-running" stroke="#111827" strokeWidth="3">
          {/* Dynamic athletic sprint legs with knee folds */}
          <path d="M -16 58 L -54 86 L -76 78" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" fill="none" stroke="#1e293b" />
          <path d="M 14 58 L 46 82 L 76 106" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" fill="none" stroke="#1e293b" />
          {/* Denim jeans crease marks */}
          <path d="M -34 72 L -28 78" stroke="#334155" strokeWidth="2" fill="none" />
          <path d="M 32 70 L 38 76" stroke="#334155" strokeWidth="2" fill="none" />
          {/* Modern high-top sneakers with tread & colored side-swish */}
          <ellipse cx="-80" cy="78" rx="17" ry="10" fill="#ffffff" stroke="#111827" strokeWidth="2.5" />
          <path d="M -88 80 L -72 80" stroke="#e11d48" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="-80" cy="85" rx="15" ry="3" fill="#cbd5e1" stroke="none" />
          <ellipse cx="80" cy="108" rx="17" ry="10" fill="#ffffff" stroke="#111827" strokeWidth="2.5" />
          <path d="M 72 110 L 88 110" stroke="#e11d48" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="80" cy="115" rx="15" ry="3" fill="#cbd5e1" stroke="none" />
          {/* Speed puff trail (💨) */}
          <g fill="#f8fafc" stroke="#111827" strokeWidth="2" opacity="0.9">
            <ellipse cx="-94" cy="98" rx="14" ry="8" />
            <circle cx="-106" cy="92" r="9" />
            <circle cx="-116" cy="98" r="7" />
            <line x1="-72" y1="92" x2="-120" y2="92" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="-68" y1="102" x2="-105" y2="102" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          </g>
        </g>
      ) : pose === 'collapsed' ? (
        <g id="legs-collapsed" stroke="#111827" strokeWidth="3">
          {/* Sprawled flat legs with cloth folds */}
          <rect x="-88" y="32" width="118" height="26" rx="10" fill="#1e293b" stroke="#111827" strokeWidth="3.5" />
          <line x1="-30" y1="36" x2="-30" y2="54" stroke="#334155" strokeWidth="2" />
          {/* Limp shoes turned sideways with white rubber soles */}
          <ellipse cx="-96" cy="44" rx="15" ry="10" fill="#ffffff" stroke="#111827" strokeWidth="2.5" />
          <path d="M -102 44 L -90 44" stroke="#e11d48" strokeWidth="2.5" />
          <ellipse cx="-86" cy="54" rx="13" ry="8" fill="#ffffff" stroke="#111827" strokeWidth="2" />
        </g>
      ) : pose === 'dancing' ? (
        <g id="legs-dancing" stroke="#111827" strokeWidth="3">
          {/* Groovy energetic Bhangra step: one foot kicked up, one supporting */}
          <path d="M -16 58 L -38 84 L -20 106" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" fill="none" stroke="#1e293b" />
          <path d="M 16 58 L 22 84 L 28 110" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" fill="none" stroke="#1e293b" />
          {/* Kicked dancing shoe */}
          <ellipse cx="-16" cy="106" rx="16" ry="9" fill="#ffffff" stroke="#111827" strokeWidth="2.5" transform="rotate(-18 -16 106)" />
          <path d="M -22 106 L -10 106" stroke="#e11d48" strokeWidth="2.5" transform="rotate(-18 -16 106)" />
          {/* Supporting shoe */}
          <ellipse cx="30" cy="112" rx="16" ry="9" fill="#ffffff" stroke="#111827" strokeWidth="2.5" />
          <path d="M 24 112 L 36 112" stroke="#e11d48" strokeWidth="2.5" />
          {/* Dance floor rhythm sparkles */}
          <text x="-24" y="118" fontSize="12" fill="#f59e0b" stroke="none">✦</text>
          <text x="36" y="122" fontSize="12" fill="#ec4899" stroke="none">✦</text>
        </g>
      ) : pose === 'celebrating' ? (
        <g id="legs-celebrating" stroke="#111827" strokeWidth="3">
          {/* Mid-air celebratory jump legs bent outwards */}
          <path d="M -16 58 L -36 82 L -22 102" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" fill="none" stroke="#1e293b" />
          <path d="M 16 58 L 36 82 L 22 102" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" fill="none" stroke="#1e293b" />
          <ellipse cx="-20" cy="104" rx="15" ry="9" fill="#ffffff" stroke="#111827" strokeWidth="2.5" />
          <ellipse cx="20" cy="104" rx="15" ry="9" fill="#ffffff" stroke="#111827" strokeWidth="2.5" />
          {/* Jump action starburst beneath */}
          <text x="-4" y="122" fontSize="16" fill="#f59e0b" stroke="none" textAnchor="middle">✦</text>
        </g>
      ) : pose === 'shocked' ? (
        <g id="legs-shocked" stroke="#111827" strokeWidth="3">
          {/* Knock-kneed trembling legs (>< shape) */}
          <path d="M -18 58 Q -5 85 -15 110" strokeWidth="18" strokeLinecap="round" fill="none" stroke="#1e293b" />
          <path d="M 18 58 Q 5 85 15 110" strokeWidth="18" strokeLinecap="round" fill="none" stroke="#1e293b" />
          {/* Quiver tremor ticks */}
          <line x1="-12" y1="84" x2="-7" y2="84" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="7" y1="84" x2="12" y2="84" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="-16" cy="112" rx="15" ry="8" fill="#ffffff" stroke="#111827" strokeWidth="2.5" />
          <ellipse cx="16" cy="112" rx="15" ry="8" fill="#ffffff" stroke="#111827" strokeWidth="2.5" />
        </g>
      ) : (
        <g id="legs-standard" stroke="#111827" strokeWidth="3">
          {/* Sturdy upright cartoon stance with natural fabric crease */}
          <path d="M -16 58 L -18 110" strokeWidth="18" strokeLinecap="round" fill="none" stroke="#1e293b" />
          <path d="M 16 58 L 18 110" strokeWidth="18" strokeLinecap="round" fill="none" stroke="#1e293b" />
          {/* Crease lines on trousers */}
          <line x1="-16" y1="78" x2="-14" y2="88" stroke="#334155" strokeWidth="2" />
          <line x1="16" y1="78" x2="14" y2="88" stroke="#334155" strokeWidth="2" />
          {/* Shoes with colored toe cap and rubber soles */}
          <ellipse cx="-20" cy="114" rx="15" ry="8" fill="#ffffff" stroke="#111827" strokeWidth="2.5" />
          <path d="M -27 114 Q -20 110 -13 114" stroke="#e11d48" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <ellipse cx="-20" cy="118" rx="13" ry="2.5" fill="#cbd5e1" stroke="none" />
          <ellipse cx="20" cy="114" rx="15" ry="8" fill="#ffffff" stroke="#111827" strokeWidth="2.5" />
          <path d="M 13 114 Q 20 110 27 114" stroke="#e11d48" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <ellipse cx="20" cy="118" rx="13" ry="2.5" fill="#cbd5e1" stroke="none" />
        </g>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* ── TORSO & CLOTHING (Authentic Bangladeshi Comic Attire) ── */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {pose === 'collapsed' ? (
        <g id="torso-collapsed">
          {/* Slumped torso flat on ground */}
          <ellipse cx="10" cy="20" rx="48" ry="26" fill={final.primaryColor} stroke="#111827" strokeWidth="3.5" />
          <path d="M 25 25 Q 40 50 45 76 Q 43 86 35 90" stroke="#111827" strokeWidth="10" fill="none" strokeLinecap="round" />
          <circle cx="35" cy="90" r="6.5" fill={final.skinColor} stroke="#111827" strokeWidth="2.5" />
        </g>
      ) : (
        <g id="torso-upright">
          {/* Base Inner Shirt / Top */}
          <path
            d="M -26 0 L 26 0 L 21 62 L -21 62 Z"
            fill={final.secondaryColor}
            stroke="#111827"
            strokeWidth="3.5"
          />

          {/* ── Saree Drape for Khala or Dadi ── */}
          {final.id === 'khala' || final.id === 'dadi' ? (
            <g id="saree-drape">
              {/* Saree main body pleats */}
              <path
                d="M -26 5 Q 0 35 23 60 L -21 62 Z M -16 -5 Q 10 20 25 5"
                fill={final.primaryColor}
                stroke="#111827"
                strokeWidth="3"
              />
              {/* Saree iconic red/gold temple border accent */}
              <path
                d="M -26 5 Q 0 35 23 60"
                stroke={final.secondaryColor}
                strokeWidth="5"
                fill="none"
              />
              <path
                d="M -26 5 Q 0 35 23 60"
                stroke="#b45309"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                fill="none"
              />
              {/* Traditional bundle of household brass keys (চাবির গোছা) for Khala */}
              {final.id === 'khala' && (
                <g transform="translate(19, 54)">
                  <circle cx="0" cy="0" r="5" fill="#fef08a" stroke="#111827" strokeWidth="2" />
                  <circle cx="0" cy="0" r="2.5" fill="#ca8a04" />
                  {/* Detailed hanging keys */}
                  <line x1="1" y1="4" x2="4" y2="15" stroke="#f59e0b" strokeWidth="2.5" />
                  <rect x="2" y="11" width="4" height="2" fill="#ca8a04" />
                  <line x1="-2" y1="3" x2="-5" y2="13" stroke="#f59e0b" strokeWidth="2" />
                  <line x1="3" y1="3" x2="6" y2="11" stroke="#f59e0b" strokeWidth="1.8" />
                </g>
              )}
              {/* Grandmother's Tasbih / Prayer beads (তসবিহ) for Dadi */}
              {final.id === 'dadi' && (
                <g transform="translate(-16, 42)">
                  <ellipse cx="0" cy="8" rx="8" ry="12" fill="none" stroke="#92400e" strokeWidth="2" strokeDasharray="3 3" />
                  <circle cx="0" cy="20" r="2.5" fill="#f59e0b" stroke="#111827" strokeWidth="1" />
                  <line x1="0" y1="22" x2="0" y2="28" stroke="#16a34a" strokeWidth="2" />
                </g>
              )}
            </g>
          ) : final.id === 'guard' || final.id === 'policeman' ? (
            /* ── Official Uniform (Guard Uncle / Traffic Police) ── */
            <g id="uniform-details">
              <path d="M -26 -2 L 26 -2 L 22 62 L -22 62 Z" fill={final.primaryColor} stroke="#111827" strokeWidth="3.5" />
              {/* Shoulder Epaulettes */}
              <polygon points="-28,-2 -16,-2 -18,8 -29,6" fill={final.secondaryColor} stroke="#111827" strokeWidth="1.5" />
              <polygon points="28,-2 16,-2 18,8 29,6" fill={final.secondaryColor} stroke="#111827" strokeWidth="1.5" />
              <circle cx="-23" cy="2" r="1.5" fill="#fef08a" />
              <circle cx="23" cy="2" r="1.5" fill="#fef08a" />
              {/* Center button placket with brass buttons */}
              <line x1="0" y1="2" x2="0" y2="60" stroke="#111827" strokeWidth="2" />
              <circle cx="0" cy="14" r="2.5" fill="#fef08a" stroke="#111827" strokeWidth="1" />
              <circle cx="0" cy="28" r="2.5" fill="#fef08a" stroke="#111827" strokeWidth="1" />
              <circle cx="0" cy="42" r="2.5" fill="#fef08a" stroke="#111827" strokeWidth="1" />
              {/* Flap chest pockets */}
              <rect x="-19" y="16" width="13" height="13" rx="2" fill="#111827" opacity="0.16" />
              <rect x="6" y="16" width="13" height="13" rx="2" fill="#111827" opacity="0.16" />
              {/* Brass security / police star shield badge */}
              <polygon points="12,12 16,7 20,12 18,17 14,17" fill="#fef08a" stroke="#111827" strokeWidth="1.5" />
              {/* Traffic Police Neon-Yellow Reflector Sash */}
              {final.id === 'policeman' && (
                <g id="police-sash">
                  <path d="M -24 0 L 22 58 L 16 62 L -28 6 Z" fill="#eab308" stroke="#111827" strokeWidth="1.5" />
                  <path d="M -23 2 L 20 56" stroke="#ffffff" strokeWidth="2.5" />
                </g>
              )}
              {/* Silver whistle on braided cord */}
              <path d="M -8 8 Q -14 24 -9 32" stroke="#f1faee" strokeWidth="2" fill="none" />
              <rect x="-11" y="32" width="4" height="8" rx="1.5" fill="#e2e8f0" stroke="#111827" strokeWidth="1.2" />
            </g>
          ) : final.id === 'teacher' ? (
            /* ── Teacher (Mr. Karim Sir): Formal Striped Shirt with Pocket Pens ── */
            <g id="teacher-shirt">
              <path d="M -26 -2 L 26 -2 L 22 62 L -22 62 Z" fill={final.primaryColor} stroke="#111827" strokeWidth="3.5" />
              {/* Subtle formal shirt stripes */}
              <g stroke="#ffffff" strokeWidth="1" opacity="0.35">
                <line x1="-18" y1="0" x2="-16" y2="60" />
                <line x1="-9" y1="0" x2="-8" y2="60" />
                <line x1="9" y1="0" x2="8" y2="60" />
                <line x1="18" y1="0" x2="16" y2="60" />
              </g>
              {/* Button placket */}
              <line x1="0" y1="0" x2="0" y2="60" stroke="#111827" strokeWidth="2" />
              <circle cx="0" cy="14" r="2" fill="#ffffff" stroke="#111827" strokeWidth="1" />
              <circle cx="0" cy="28" r="2" fill="#ffffff" stroke="#111827" strokeWidth="1" />
              <circle cx="0" cy="42" r="2" fill="#ffffff" stroke="#111827" strokeWidth="1" />
              {/* Shirt pocket with classic Red & Blue Parker Pens sticking out */}
              <rect x="6" y="16" width="13" height="15" rx="2" fill="#0284c7" stroke="#111827" strokeWidth="1.5" />
              <line x1="10" y1="11" x2="10" y2="18" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="14" y1="9" x2="14" y2="18" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round" />
              {/* Leather belt */}
              <rect x="-21" y="58" width="42" height="6" fill="#451a03" />
              <rect x="-4" y="56" width="8" height="10" rx="1" fill="#fef08a" stroke="#111827" strokeWidth="1" />
            </g>
          ) : final.id === 'rickshaw_mama' ? (
            /* ── Rickshaw Mama: Rolled shirt, gamchha drape & lungi fold ── */
            <g id="mama-torso">
              <path d="M -26 -2 L 26 -2 L 21 60 L -21 60 Z" fill={final.secondaryColor} stroke="#111827" strokeWidth="3.5" />
              {/* Red-white checked gamchha draped over shoulder */}
              <path d="M -17 -4 Q -6 20 -9 60 L -17 60 Q -15 25 -23 -4 Z" fill={final.primaryColor} stroke="#111827" strokeWidth="2" />
              <line x1="-18" y1="18" x2="-8" y2="18" stroke="#ffffff" strokeWidth="1.5" />
              <line x1="-17" y1="36" x2="-8" y2="36" stroke="#ffffff" strokeWidth="1.5" />
              {/* Lungi waistband fold */}
              <path d="M -21 54 Q 0 60 21 54 L 21 62 L -21 62 Z" fill="#065f46" stroke="#111827" strokeWidth="2" />
            </g>
          ) : final.id === 'cha_mama' ? (
            /* ── Tong Mama: Apron with tea glasses & signature blue towel ── */
            <g id="cha-mama-torso">
              <path d="M -26 -2 L 26 -2 L 21 60 L -21 60 Z" fill="#334155" stroke="#111827" strokeWidth="3.5" />
              {/* Bistro apron */}
              <path d="M -18 8 L 18 8 L 16 60 L -16 60 Z" fill={final.primaryColor} stroke="#111827" strokeWidth="2.5" />
              <rect x="-11" y="30" width="22" height="16" rx="3" fill="#c2410c" stroke="#111827" strokeWidth="1.5" />
              {/* Signature checkered tea cloth over shoulder */}
              <path d="M 16 -6 Q 30 18 24 44 Q 18 36 14 12 Z" fill="#0284c7" stroke="#111827" strokeWidth="2" />
              <line x1="16" y1="12" x2="26" y2="12" stroke="#ffffff" strokeWidth="1.5" />
              <line x1="17" y1="26" x2="25" y2="26" stroke="#ffffff" strokeWidth="1.5" />
            </g>
          ) : final.id === 'ananya' || final.id === 'nusrat' ? (
            /* ── Kurti with Dupatta Drape & Pattern Details (Ananya / Nusrat) ── */
            <g id="kurti-torso">
              <path d="M -26 -2 L 26 -2 L 22 62 L -22 62 Z" fill={final.primaryColor} stroke="#111827" strokeWidth="3.5" />
              {/* Elegant embroidered neck pattern */}
              <path d="M -10 -2 Q 0 16 10 -2" stroke="#fef08a" strokeWidth="2" fill="none" />
              <circle cx="0" cy="18" r="1.5" fill="#fef08a" />
              <circle cx="0" cy="26" r="1.5" fill="#fef08a" />
              {/* Elegant Dupatta / Orna Drape across shoulder */}
              <path
                d="M -25 0 Q -5 24 16 62 L 22 62 Q 5 20 -18 0 Z"
                fill={final.secondaryColor}
                stroke="#111827"
                strokeWidth="2.5"
                opacity="0.95"
              />
            </g>
          ) : (
            /* ── College Denim Jacket / Hoodie (Rafi / Tamim / Students) ── */
            <g id="jacket-details">
              {/* Open jacket flaps */}
              <path d="M -28 -2 L -11 -2 L -9 62 L -23 62 Z" fill={final.primaryColor} stroke="#111827" strokeWidth="3.5" />
              <path d="M 28 -2 L 11 -2 L 9 62 L 23 62 Z" fill={final.primaryColor} stroke="#111827" strokeWidth="3.5" />
              {/* Cool collar lapels */}
              <polygon points="-27,-2 -11,-2 -19,15" fill={final.primaryColor} stroke="#111827" strokeWidth="2" />
              <polygon points="27,-2 11,-2 18,15" fill={final.primaryColor} stroke="#111827" strokeWidth="2" />
              {/* Inner T-shirt cool graphic logo (⚡) */}
              <polygon points="0,18 -3,26 1,26 -1,34 4,25 0,25" fill="#f59e0b" stroke="#111827" strokeWidth="1" />
              {/* Leather belt with brass buckle */}
              <rect x="-21" y="58" width="42" height="6" fill="#111827" />
              <rect x="-4" y="56" width="8" height="10" rx="1.5" fill="#fef08a" stroke="#111827" strokeWidth="1" />
            </g>
          )}

          {/* ═════════════════════════════════════════════════════════ */}
          {/* ── ARMS & HANDS (Full Expressive Bengali Cartoon Poses) ── */}
          {/* ═════════════════════════════════════════════════════════ */}
          {pose === 'celebrating' ? (
            /* Both fists pumped triumphant high ("ইয়াাহু!"), victory sparkles */
            <g id="arms-celebrating" stroke="#111827" strokeWidth="8" fill="none" strokeLinecap="round">
              <path d="M -24 6 L -40 -35 L -48 -66" />
              <circle cx="-48" cy="-68" r="6.5" fill={final.skinColor} stroke="#111827" strokeWidth="2.5" />
              <path d="M 24 6 L 40 -35 L 48 -66" />
              <circle cx="48" cy="-68" r="6.5" fill={final.skinColor} stroke="#111827" strokeWidth="2.5" />
              {/* Confetti & victory stars (✨🎉) */}
              <g stroke="none">
                <text x="-66" y="-72" fontSize="18" fill="#f59e0b">✦</text>
                <text x="58" y="-72" fontSize="18" fill="#ec4899">✦</text>
                <text x="0" y="-84" fontSize="16" fill="#38bdf8">★</text>
                <circle cx="-56" cy="-45" r="3.5" fill="#10b981" />
                <circle cx="56" cy="-45" r="3.5" fill="#f43f5e" />
              </g>
            </g>
          ) : pose === 'shocked' ? (
            /* Hands clutching cheeks/jaw in absolute horror, sweat drops bursting! */
            <g id="arms-shocked" stroke="#111827" strokeWidth="8" fill="none" strokeLinecap="round">
              <path d="M -24 16 Q -44 -5 -22 -26" />
              <circle cx="-21" cy="-26" r="7" fill={final.skinColor} stroke="#111827" strokeWidth="2.5" />
              <path d="M 24 16 Q 44 -5 22 -26" />
              <circle cx="21" cy="-26" r="7" fill={final.skinColor} stroke="#111827" strokeWidth="2.5" />
              {/* Panicked cartoon sweat drops (💦) */}
              <g stroke="#111827" strokeWidth="1.5" fill="#38bdf8">
                <path d="M 38 -48 Q 43 -56 38 -62 Q 33 -56 38 -48 Z" />
                <path d="M -38 -48 Q -43 -56 -38 -62 Q -33 -56 -38 -48 Z" />
              </g>
              {/* Comic shock tremor lines around head */}
              <g stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round">
                <line x1="-44" y1="-38" x2="-58" y2="-46" />
                <line x1="44" y1="-38" x2="58" y2="-46" />
                <line x1="0" y1="-76" x2="0" y2="-90" />
                <line x1="-30" y1="-66" x2="-40" y2="-76" />
                <line x1="30" y1="-66" x2="40" y2="-76" />
              </g>
            </g>
          ) : pose === 'confident' ? (
            /* Hands on hips with elbows winged out proudly (swagger pose) */
            <g id="arms-confident" stroke="#111827" strokeWidth="8" fill="none" strokeLinecap="round">
              <path d="M -24 8 Q -48 22 -26 46" />
              <circle cx="-26" cy="46" r="6.5" fill={final.skinColor} stroke="#111827" strokeWidth="2.5" />
              <path d="M 24 8 Q 48 22 26 46" />
              <circle cx="26" cy="46" r="6.5" fill={final.skinColor} stroke="#111827" strokeWidth="2.5" />
              {/* Cool sparkle glint */}
              <text x="34" y="8" fontSize="16" fill="#f59e0b" stroke="none">✦</text>
            </g>
          ) : pose === 'talking' ? (
            /* Animated storytelling hand gesture (open palm & pointing) */
            <g id="arms-talking" stroke="#111827" strokeWidth="8" fill="none" strokeLinecap="round">
              <path d="M -24 10 L -28 42" />
              <circle cx="-28" cy="44" r="6" fill={final.skinColor} stroke="#111827" strokeWidth="2.5" />
              {/* Expressive gesturing right arm */}
              <path d="M 24 10 Q 44 22 54 8" />
              <circle cx="54" cy="7" r="7" fill={final.skinColor} stroke="#111827" strokeWidth="2.5" />
              {/* Accent speech gesture lines */}
              <path d="M 60 2 Q 68 6 60 10" stroke="#f59e0b" strokeWidth="2.5" fill="none" />
              <path d="M 64 -4 Q 74 6 64 16" stroke="#f59e0b" strokeWidth="2" fill="none" />
            </g>
          ) : pose === 'thinking' ? (
            /* One hand under chin, other arm supporting elbow, question mark floating */
            <g id="arms-thinking" stroke="#111827" strokeWidth="8" fill="none" strokeLinecap="round">
              {/* Left arm crossed under elbow */}
              <path d="M -24 12 Q -6 28 14 20" />
              <circle cx="16" cy="20" r="6" fill={final.skinColor} stroke="#111827" strokeWidth="2.5" />
              {/* Right arm bent up with finger on chin */}
              <path d="M 24 12 L 16 20 L 10 -14" />
              <circle cx="9" cy="-16" r="6.5" fill={final.skinColor} stroke="#111827" strokeWidth="2.5" />
              {/* Glowing Cartoon Idea / Question Mark Bubble (🤔) */}
              <g stroke="none" transform="translate(32, -58)">
                <circle cx="6" cy="6" r="15" fill="#fef08a" opacity="0.9" />
                <circle cx="6" cy="6" r="18" fill="#fef08a" opacity="0.4" />
                <text x="6" y="13" fontSize="22" fill="#b45309" fontWeight="black" textAnchor="middle">?</text>
              </g>
            </g>
          ) : pose === 'angry' ? (
            /* Shaking clenched fists with steam clouds popping from ears! */
            <g id="arms-angry" stroke="#111827" strokeWidth="8" fill="none" strokeLinecap="round">
              <path d="M -24 10 L -40 28 L -36 44" />
              <circle cx="-36" cy="44" r="7" fill={final.skinColor} stroke="#111827" strokeWidth="2.5" />
              <path d="M 24 10 L 40 28 L 34 44" />
              <circle cx="34" cy="44" r="7" fill={final.skinColor} stroke="#111827" strokeWidth="2.5" />
              {/* Angry cross-vein pop on forehead (💢) */}
              <g stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round">
                <path d="M 28 -52 L 40 -52 M 34 -58 L 34 -46" />
                <path d="M 29 -56 L 39 -48 M 29 -48 L 39 -56" strokeWidth="2" />
              </g>
              {/* Steam puffing out of ears (💨) */}
              <g fill="#f8fafc" stroke="#111827" strokeWidth="1.5">
                <circle cx="-38" cy="-32" r="5.5" />
                <circle cx="-47" cy="-30" r="7" />
                <circle cx="38" cy="-32" r="5.5" />
                <circle cx="47" cy="-30" r="7" />
              </g>
            </g>
          ) : pose === 'crying' ? (
            /* Hands rubbing eyes with handkerchief, twin gushing fountains of tears! */
            <g id="arms-crying" stroke="#111827" strokeWidth="8" fill="none" strokeLinecap="round">
              <path d="M -24 12 L -14 -18" />
              <circle cx="-14" cy="-20" r="6.5" fill={final.skinColor} stroke="#111827" strokeWidth="2.5" />
              <path d="M 24 12 L 14 -18" />
              <circle cx="14" cy="-20" r="6.5" fill={final.skinColor} stroke="#111827" strokeWidth="2.5" />
              {/* White handkerchief */}
              <rect x="-9" y="-23" width="18" height="14" rx="3.5" fill="#ffffff" stroke="#111827" strokeWidth="2" />
              {/* Massive anime waterfall tears streaming sideways (🌊) */}
              <g stroke="#0284c7" strokeWidth="4.5" fill="none" strokeLinecap="round">
                <path d="M -18 -20 Q -40 -10 -48 24 Q -44 48 -50 74" />
                <path d="M 18 -20 Q 40 -10 48 24 Q 44 48 50 74" />
                <path d="M -14 -16 Q -30 0 -34 32" strokeWidth="2.5" opacity="0.75" />
                <path d="M 14 -16 Q 30 0 34 32" strokeWidth="2.5" opacity="0.75" />
              </g>
            </g>
          ) : pose === 'whispering' ? (
            /* Right hand cupped around mouth, conspiratorial lean, hush sound dots */
            <g id="arms-whispering" stroke="#111827" strokeWidth="8" fill="none" strokeLinecap="round">
              <path d="M -24 10 L -28 44" />
              <circle cx="-28" cy="46" r="6" fill={final.skinColor} stroke="#111827" strokeWidth="2.5" />
              {/* Cupped hand at mouth */}
              <path d="M 24 10 L 18 0 L 10 -16" />
              <circle cx="9" cy="-18" r="7" fill={final.skinColor} stroke="#111827" strokeWidth="2.5" />
              {/* Floating secret whisper dots (shh...) */}
              <g stroke="none" fill="#64748b">
                <circle cx="26" cy="-20" r="2.5" />
                <circle cx="36" cy="-25" r="3.2" />
                <circle cx="48" cy="-30" r="4" />
              </g>
            </g>
          ) : pose === 'dancing' ? (
            /* Groovy raised arms with snapping fingers and floating musical notes */
            <g id="arms-dancing" stroke="#111827" strokeWidth="8" fill="none" strokeLinecap="round">
              <path d="M -24 6 L -44 -22 L -34 -58" />
              <circle cx="-34" cy="-60" r="6.5" fill={final.skinColor} stroke="#111827" strokeWidth="2.5" />
              <path d="M 24 6 L 44 24 L 54 8" />
              <circle cx="54" cy="8" r="6.5" fill={final.skinColor} stroke="#111827" strokeWidth="2.5" />
              {/* Floating musical notes (♪ ♫ ♬) */}
              <g stroke="none">
                <text x="-56" y="-58" fontSize="20" fill="#f59e0b" fontWeight="bold">♪</text>
                <text x="46" y="-26" fontSize="22" fill="#ec4899" fontWeight="bold">♫</text>
                <text x="-16" y="-72" fontSize="18" fill="#38bdf8" fontWeight="bold">♬</text>
              </g>
            </g>
          ) : (
            /* Idle standing natural arms with iconic accessory in hand */
            <g id="arms-idle" stroke="#111827" strokeWidth="8" fill="none" strokeLinecap="round">
              <path d="M -24 10 L -26 48" />
              <circle cx="-26" cy="50" r="6" fill={final.skinColor} stroke="#111827" strokeWidth="2.5" />
              <path d="M 24 10 L 26 48" />
              <circle cx="26" cy="50" r="6" fill={final.skinColor} stroke="#111827" strokeWidth="2.5" />

              {/* ── Iconic Accessories in Hand ── */}
              {final.id === 'cha_mama' ? (
                /* Steaming cup of tea (ধোঁয়া ওঠা মালাই চা) in right hand */
                <g id="tea-cup" stroke="none" transform="translate(24, 38)">
                  <polygon points="-5,0 5,0 4,14 -4,14" fill="#cbd5e1" stroke="#111827" strokeWidth="1.5" />
                  <polygon points="-4,2 4,2 3,12 -3,12" fill="#d97706" />
                  {/* Rising steam curls */}
                  <path d="M -2 -2 Q -4 -8 -1 -12" stroke="#ffffff" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8" />
                  <path d="M 2 -3 Q 4 -9 1 -14" stroke="#ffffff" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8" />
                </g>
              ) : final.id === 'nusrat' || final.id === 'ananya' ? (
                /* University Study Book / Binder hugged in left hand */
                <g id="hand-book" stroke="none" transform="translate(-32, 34)">
                  <rect x="-8" y="0" width="16" height="22" rx="3" fill="#ec4899" stroke="#111827" strokeWidth="1.5" />
                  <rect x="-6" y="2" width="12" height="18" fill="#f8fafc" />
                  <line x1="-8" y1="4" x2="8" y2="4" stroke="#be185d" strokeWidth="1.5" />
                  <line x1="2" y1="20" x2="6" y2="26" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                </g>
              ) : final.id === 'guard' ? (
                /* Guard Uncle's Sturdy Bamboo Lathi / Flashlight */
                <g id="guard-lathi" stroke="none" transform="translate(26, 20)">
                  <line x1="0" y1="-10" x2="0" y2="80" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" />
                  <line x1="-3" y1="10" x2="3" y2="10" stroke="#b45309" strokeWidth="1.5" />
                  <line x1="-3" y1="30" x2="3" y2="30" stroke="#b45309" strokeWidth="1.5" />
                </g>
              ) : final.id === 'tamim' ? (
                /* Tamim's Smartphone with Glowing Screen */
                <g id="tamim-phone" stroke="none" transform="translate(26, 42)">
                  <rect x="-4" y="-2" width="10" height="18" rx="2" fill="#18181b" stroke="#111827" strokeWidth="1.5" />
                  <rect x="-2" y="0" width="6" height="12" fill="#38bdf8" />
                </g>
              ) : final.id === 'rafi' ? (
                /* Rafi's Sports Digital Watch on wrist */
                <g id="rafi-watch" stroke="none" transform="translate(-26, 42)">
                  <rect x="-4" y="-3" width="8" height="6" rx="2" fill="#18181b" stroke="#111827" strokeWidth="1" />
                  <circle cx="0" cy="0" r="1.5" fill="#22c55e" />
                </g>
              ) : null}
            </g>
          )}

          {/* Neck with collar & jaw cel-shadow */}
          <rect x="-9" y="-14" width="18" height="17" fill={final.skinColor} stroke="#111827" strokeWidth="2.5" />
          <path d="M -9 -14 Q 0 -6 9 -14" fill="#000000" opacity="0.18" />
        </g>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* ── HEAD & EXPRESSIVE BENGALI COMIC FACE ──                 */}
      {/* ═════════════════════════════════════════════════════════════ */}
      <g id="head" transform={pose === 'collapsed' ? 'translate(45, -5) rotate(70)' : ''}>
        {/* Ears with inner detail */}
        <g id="ears" stroke="#111827" strokeWidth="2.5">
          <circle cx="-25" cy="-30" r="7.5" fill={final.skinColor} />
          <path d="M -26 -33 Q -22 -30 -26 -27" stroke="#b45309" strokeWidth="1.5" fill="none" />
          <circle cx="25" cy="-30" r="7.5" fill={final.skinColor} />
          <path d="M 26 -33 Q 22 -30 26 -27" stroke="#b45309" strokeWidth="1.5" fill="none" />
        </g>

        {/* Head Base Silhouette with smooth comic curves */}
        <path
          d="M -24 -36 C -24 -64 24 -64 24 -36 C 24 -14 16 -6 0 -4 C -16 -6 -24 -14 -24 -36 Z"
          fill={final.skinColor}
          stroke="#111827"
          strokeWidth="3.5"
        />

        {/* Rosy blush cheeks (warm and lively) */}
        <ellipse cx="-15" cy="-24" rx="6" ry="3.5" fill="#f43f5e" opacity="0.32" />
        <ellipse cx="15" cy="-24" rx="6" ry="3.5" fill="#f43f5e" opacity="0.32" />

        {/* Nose with authentic Bengali comic cartoon shape */}
        <path d="M 0 -33 Q 5 -24 0 -22" stroke="#111827" strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* Nose Pin / Ring (নাকফুল / নোলক) for Khala */}
        {final.id === 'khala' && (
          <circle cx="6" cy="-23" r="2.5" fill="#fef08a" stroke="#111827" strokeWidth="1" />
        )}

        {/* Mustache / Beard for Uncle / Mamas / Tamim */}
        {final.hasBeard && (
          final.id === 'teacher' || final.id === 'guard' || final.id === 'rickshaw_mama' || final.id === 'cha_mama' ? (
            /* Thick classic Bengali uncle mustache (গোঁফ) with curved ends */
            <path
              d="M -16 -21 Q -8 -26 0 -22 Q 8 -26 16 -21 Q 9 -17 0 -18 Q -9 -17 -16 -21 Z"
              fill="#18181b"
              stroke="#111827"
              strokeWidth="2"
            />
          ) : (
            /* Cool youthful goatee stubble for Tamim & Fahim */
            <path
              d="M -16 -18 Q 0 -4 16 -18"
              stroke="#18181b"
              strokeWidth="3"
              strokeDasharray="2 3"
              fill="none"
            />
          )
        )}

        {/* ═════════════════════════════════════════════════════════ */}
        {/* ── EYES & EYEBROWS (Extreme Bengali Comic Expressions) ── */}
        {/* ═════════════════════════════════════════════════════════ */}
        {pose === 'shocked' ? (
          /* Giant popped-out saucer eyes with tiny pupils! */
          <g id="eyes-shocked">
            <ellipse cx="-10" cy="-33" rx="9.5" ry="10.5" fill="#ffffff" stroke="#111827" strokeWidth="3" />
            <ellipse cx="10" cy="-33" rx="9.5" ry="10.5" fill="#ffffff" stroke="#111827" strokeWidth="3" />
            {/* Tiny terrified pupils */}
            <circle cx="-10" cy="-33" r="2.8" fill="#111827" />
            <circle cx="10" cy="-33" r="2.8" fill="#111827" />
            {/* High raised terrified eyebrows */}
            <path d="M -19 -48 Q -10 -58 -2 -48" stroke="#111827" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 2 -48 Q 10 -58 19 -48" stroke="#111827" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        ) : pose === 'celebrating' ? (
          /* Cheerful curved closed happy eyes crinkling with pure joy (^ ^) */
          <g id="eyes-celebrating" stroke="#111827" strokeWidth="3.5" fill="none" strokeLinecap="round">
            <path d="M -18 -32 Q -10 -43 -2 -32" />
            <path d="M 2 -32 Q 10 -43 18 -32" />
          </g>
        ) : pose === 'dancing' ? (
          /* Playful winking eye with cheeky wink sparkle! */
          <g id="eyes-dancing">
            {/* Left eye winking closed */}
            <path d="M -18 -32 Q -10 -40 -2 -32" stroke="#111827" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            {/* Right eye wide open & sparkling */}
            <ellipse cx="10" cy="-33" rx="8" ry="9" fill="#ffffff" stroke="#111827" strokeWidth="2.5" />
            <circle cx="11" cy="-33" r="4.5" fill="#111827" />
            <circle cx="13" cy="-35" r="1.8" fill="#ffffff" />
            {/* Wink sparkle star */}
            <text x="-25" y="-35" fontSize="14" fill="#f59e0b" stroke="none">✦</text>
            <path d="M -18 -45 Q -10 -50 -2 -45" stroke="#111827" strokeWidth="2.5" fill="none" />
            <path d="M 2 -45 Q 10 -50 18 -45" stroke="#111827" strokeWidth="2.5" fill="none" />
          </g>
        ) : pose === 'thinking' ? (
          /* Eyes rolled up thoughtfully in calculation, one raised brow */
          <g id="eyes-thinking">
            <ellipse cx="-10" cy="-33" rx="7.5" ry="8.5" fill="#ffffff" stroke="#111827" strokeWidth="2.5" />
            <ellipse cx="10" cy="-33" rx="7.5" ry="8.5" fill="#ffffff" stroke="#111827" strokeWidth="2.5" />
            {/* Pupils looking up & right */}
            <circle cx="-8" cy="-36" r="3.8" fill="#111827" />
            <circle cx="12" cy="-36" r="3.8" fill="#111827" />
            <circle cx="-7" cy="-37" r="1.4" fill="#ffffff" />
            <circle cx="13" cy="-37" r="1.4" fill="#ffffff" />
            {/* Asymmetrical quizzical brows */}
            <path d="M -18 -43 L -2 -42" stroke="#111827" strokeWidth="3" strokeLinecap="round" />
            <path d="M 2 -42 Q 11 -52 19 -45" stroke="#111827" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        ) : pose === 'angry' ? (
          /* Fierce slanted anime rage eyes with sharp V-brows */
          <g id="eyes-angry">
            <ellipse cx="-10" cy="-32" rx="7" ry="7" fill="#ffffff" stroke="#111827" strokeWidth="2.5" />
            <ellipse cx="10" cy="-32" rx="7" ry="7" fill="#ffffff" stroke="#111827" strokeWidth="2.5" />
            {/* Intense pinpoint glare pupils */}
            <circle cx="-8" cy="-32" r="3.2" fill="#111827" />
            <circle cx="8" cy="-32" r="3.2" fill="#111827" />
            {/* Heavy aggressive downward V-eyebrows */}
            <path d="M -20 -40 L -2 -48" stroke="#111827" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 2 -48 L 20 -40" stroke="#111827" strokeWidth="4.5" strokeLinecap="round" />
          </g>
        ) : pose === 'crying' ? (
          /* Tightly shut streaming eyes (> < shape) */
          <g id="eyes-crying" stroke="#111827" strokeWidth="3.5" strokeLinecap="round" fill="none">
            <path d="M -18 -34 L -4 -30 L -18 -26" />
            <path d="M 18 -34 L 4 -30 L 18 -26" />
            {/* Worried arched brows */}
            <path d="M -18 -45 Q -10 -40 -2 -44" strokeWidth="2.5" />
            <path d="M 2 -44 Q 10 -40 18 -45" strokeWidth="2.5" />
          </g>
        ) : pose === 'whispering' ? (
          /* Sneaky side-glance pupils looking out of corner */
          <g id="eyes-whispering">
            <ellipse cx="-10" cy="-33" rx="7.5" ry="8" fill="#ffffff" stroke="#111827" strokeWidth="2.5" />
            <ellipse cx="10" cy="-33" rx="7.5" ry="8" fill="#ffffff" stroke="#111827" strokeWidth="2.5" />
            {/* Sneaky pupils */}
            <circle cx="-5" cy="-33" r="3.5" fill="#111827" />
            <circle cx="15" cy="-33" r="3.5" fill="#111827" />
            <circle cx="-4" cy="-34" r="1.2" fill="#ffffff" />
            <circle cx="16" cy="-34" r="1.2" fill="#ffffff" />
            <path d="M -18 -44 Q -10 -47 -2 -44" stroke="#111827" strokeWidth="2.5" fill="none" />
            <path d="M 2 -44 Q 10 -48 18 -44" stroke="#111827" strokeWidth="2.5" fill="none" />
          </g>
        ) : pose === 'collapsed' ? (
          /* Comical dizzy spiral eyes (@ @) */
          <g id="eyes-collapsed" stroke="#111827" strokeWidth="2.5" fill="none" strokeLinecap="round">
            <path d="M -12 -33 A 3 3 0 0 1 -7 -33 A 5 5 0 0 1 -12 -30" />
            <path d="M 8 -33 A 3 3 0 0 1 13 -33 A 5 5 0 0 1 8 -30" />
            {/* Dizzy stars circling head */}
            <text x="-14" y="-56" fontSize="16" fill="#f59e0b" stroke="none">★</text>
            <text x="12" y="-60" fontSize="14" fill="#f59e0b" stroke="none">✦</text>
          </g>
        ) : (
          /* Classic Expressive Bengali Comic Eyes with Multi-layer Shines */
          <g id="eyes-standard">
            <ellipse cx="-10" cy="-33" rx="8" ry="9" fill="#ffffff" stroke="#111827" strokeWidth="2.5" />
            <ellipse cx="10" cy="-33" rx="8" ry="9" fill="#ffffff" stroke="#111827" strokeWidth="2.5" />
            {/* Colored Iris ring */}
            <circle cx="-8" cy="-33" r="4.2" fill="#1e293b" />
            <circle cx="12" cy="-33" r="4.2" fill="#1e293b" />
            {/* Black pupil */}
            <circle cx="-8" cy="-33" r="2.8" fill="#000000" />
            <circle cx="12" cy="-33" r="2.8" fill="#000000" />
            {/* Specular Catchlight Highlights (Double sparkle) */}
            <circle cx="-7" cy="-35" r="1.6" fill="#ffffff" />
            <circle cx="13" cy="-35" r="1.6" fill="#ffffff" />
            <circle cx="-9" cy="-31" r="0.9" fill="#ffffff" />
            <circle cx="11" cy="-31" r="0.9" fill="#ffffff" />
            {/* Eyelash flick for female characters (Nusrat / Ananya / Khala / Dadi) */}
            {(final.id === 'nusrat' || final.id === 'ananya' || final.id === 'khala') && (
              <g stroke="#111827" strokeWidth="2" strokeLinecap="round">
                <line x1="-18" y1="-36" x2="-21" y2="-38" />
                <line x1="18" y1="-36" x2="21" y2="-38" />
              </g>
            )}
            {/* Eyebrows with natural arch */}
            <path d="M -19 -45 Q -10 -49 -2 -44" stroke="#111827" strokeWidth="3.2" fill="none" strokeLinecap="round" />
            <path d="M 2 -44 Q 10 -49 19 -45" stroke="#111827" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          </g>
        )}

        {/* ═════════════════════════════════════════════════════════ */}
        {/* ── GLASSES (Signature Round Glasses for Nusrat/Ananya) ─── */}
        {/* ═════════════════════════════════════════════════════════ */}
        {final.hasGlasses && (
          <g id="glasses" stroke="#111827" strokeWidth="3" fill="none">
            <circle cx="-10" cy="-33" r="11.5" />
            <circle cx="10" cy="-33" r="11.5" />
            <line x1="1.5" y1="-33" x2="-1.5" y2="-33" strokeWidth="4" />
            <line x1="-21.5" y1="-33" x2="-25" y2="-31" strokeWidth="2.5" />
            <line x1="21.5" y1="-33" x2="25" y2="-31" strokeWidth="2.5" />
            {/* Lens light reflection glint (✦) */}
            <path d="M -14 -39 L -7 -39" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 6 -39 L 13 -39" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            {/* Glasses strap for Dadi */}
            {final.id === 'dadi' && (
              <path d="M -22 -30 Q -28 -10 -20 0 M 22 -30 Q 28 -10 20 0" stroke="#cbd5e1" strokeWidth="1.5" fill="none" />
            )}
          </g>
        )}

        {/* ═════════════════════════════════════════════════════════ */}
        {/* ── MOUTH (Dynamic Comic Expressions) ──                  */}
        {/* ═════════════════════════════════════════════════════════ */}
        {pose === 'shocked' ? (
          /* Comical dropped jaw screaming mouth showing throat & tongue */
          <g id="mouth-shocked">
            <ellipse cx="0" cy="-12" rx="8.5" ry="13" fill="#450a0a" stroke="#111827" strokeWidth="3" />
            <path d="M -7 -6 Q 0 1 7 -6 Z" fill="#fb7185" />
          </g>
        ) : pose === 'celebrating' || pose === 'dancing' ? (
          /* Wide joyful laughing toothy grin */
          <g id="mouth-happy">
            <path d="M -14 -18 Q 0 -3 14 -18 Z" fill="#b91c1c" stroke="#111827" strokeWidth="3" />
            <path d="M -12 -18 Q 0 -11 12 -18" fill="#ffffff" stroke="#111827" strokeWidth="1" />
            <ellipse cx="0" cy="-8" rx="6" ry="3.5" fill="#fb7185" />
          </g>
        ) : pose === 'thinking' ? (
          /* Small puckered mouth tilted sideways in deep puzzling thought */
          <path d="M -5 -16 Q 3 -19 10 -15" stroke="#111827" strokeWidth="3" fill="none" strokeLinecap="round" />
        ) : pose === 'angry' ? (
          /* Clenched teeth rectangular growl mouth */
          <g id="mouth-angry">
            <rect x="-10" y="-20" width="20" height="9" rx="2.5" fill="#ffffff" stroke="#111827" strokeWidth="2.5" />
            <line x1="-10" y1="-15.5" x2="10" y2="-15.5" stroke="#111827" strokeWidth="1.5" />
            <line x1="-4" y1="-20" x2="-4" y2="-11" stroke="#111827" strokeWidth="1.5" />
            <line x1="4" y1="-20" x2="4" y2="-11" stroke="#111827" strokeWidth="1.5" />
          </g>
        ) : pose === 'crying' ? (
          /* Wide trembling wavering crying mouth */
          <g id="mouth-crying">
            <path d="M -13 -12 Q 0 -24 13 -12 Q 0 -5 -13 -12 Z" fill="#450a0a" stroke="#111827" strokeWidth="2.5" />
            <path d="M -7 -11 Q 0 -8 7 -11" stroke="#fb7185" strokeWidth="2" fill="none" />
          </g>
        ) : pose === 'whispering' ? (
          /* Secretive small circular whisper mouth */
          <ellipse cx="4" cy="-16" rx="4" ry="5" fill="#450a0a" stroke="#111827" strokeWidth="2" />
        ) : pose === 'confident' ? (
          /* Confident lopsided cartoon smirk */
          <path d="M -4 -16 Q 4 -12 15 -18" stroke="#111827" strokeWidth="3" fill="none" strokeLinecap="round" />
        ) : pose === 'talking' ? (
          /* Open talking mouth showing teeth & tongue */
          <g id="mouth-talking">
            <path d="M -11 -18 Q 0 -9 11 -18 Q 0 -7 -11 -18 Z" fill="#450a0a" stroke="#111827" strokeWidth="2.5" />
            <path d="M -8 -17 Q 0 -13 8 -17" stroke="#ffffff" strokeWidth="2" fill="none" />
          </g>
        ) : pose === 'collapsed' ? (
          /* Comical squiggly limp mouth */
          <path d="M -9 -16 Q -4 -14 0 -16 Q 5 -18 9 -16" stroke="#111827" strokeWidth="2.5" fill="none" />
        ) : (
          /* Warm friendly cartoon smile with dimple tick */
          <g id="mouth-idle">
            <path d="M -10 -17 Q 0 -9 10 -17" stroke="#111827" strokeWidth="3" fill="none" strokeLinecap="round" />
            <line x1="10" y1="-19" x2="12" y2="-16" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {/* ═════════════════════════════════════════════════════════ */}
        {/* ── HAIRSTYLES & HEADWEAR (Authentic Bangladeshi Icons) ─── */}
        {/* ═════════════════════════════════════════════════════════ */}
        {final.id === 'nusrat' ? (
          /* Nusrat: Voluminous wavy dark hair, cute hair-clip, jhumka earrings */
          <g id="hair-nusrat" fill={final.hairColor} stroke="#111827" strokeWidth="3">
            {/* Cascading side locks */}
            <path d="M -30 -25 C -44 -10 -40 20 -26 40 C -19 22 -26 0 -22 -20 Z" />
            <path d="M 30 -25 C 44 -10 40 20 26 40 C 19 22 26 0 22 -20 Z" />
            {/* Top voluminous hair crown */}
            <path d="M -28 -40 C -36 -70 0 -78 28 -40 C 32 -56 10 -74 -6 -72 C -24 -70 -32 -56 -28 -40 Z" />
            {/* Hair glossy shine streak */}
            <path d="M -16 -64 Q 0 -70 16 -64" stroke={`url(#hair-shine-${uid})`} strokeWidth="4" fill="none" />
            {/* Front bangs */}
            <path d="M -25 -46 Q -10 -37 0 -46 Q 14 -41 25 -46 Q 16 -60 0 -60 Q -16 -60 -25 -46 Z" />
            {/* Colorful hair-clip */}
            <rect x="15" y="-50" width="11" height="5" rx="2" fill="#e11d48" stroke="#111827" strokeWidth="1.5" />
            {/* Golden Jhumka earrings (ঝুমকা) */}
            <g stroke="#111827" strokeWidth="1">
              <circle cx="-25" cy="-23" r="2.5" fill="#fef08a" />
              <polygon points="-27,-20 -23,-20 -25,-16" fill="#f59e0b" />
              <circle cx="25" cy="-23" r="2.5" fill="#fef08a" />
              <polygon points="23,-20 27,-20 25,-16" fill="#f59e0b" />
            </g>
          </g>
        ) : final.id === 'khala' ? (
          /* Khala: Traditional hair bun covered gracefully by saree pallu */
          <g id="hair-khala" fill={final.hairColor} stroke="#111827" strokeWidth="3">
            <circle cx="-18" cy="-45" r="12" />
            {/* Saree pallu drape gracefully framing head */}
            <path
              d="M -29 -35 Q 0 -70 29 -35 L 33 20 Q 16 24 0 20 Q -16 24 -33 20 Z"
              fill={final.primaryColor}
              stroke="#111827"
              strokeWidth="3.5"
              opacity="0.96"
            />
            {/* Saree golden border on head */}
            <path d="M -29 -35 Q 0 -70 29 -35" stroke={final.secondaryColor} strokeWidth="5" fill="none" />
            <path d="M -29 -35 Q 0 -70 29 -35" stroke="#b45309" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
            {/* Red bindi (টিপ) on forehead */}
            <circle cx="0" cy="-38" r="3.2" fill="#b91c1c" stroke="none" />
          </g>
        ) : final.id === 'guard' ? (
          /* Guard Uncle: Official peaked security cap with brass insignia */
          <g id="hair-guard" stroke="#111827" strokeWidth="3">
            <ellipse cx="0" cy="-48" rx="28" ry="12" fill="#1e293b" />
            <path d="M -26 -48 Q 0 -74 26 -48 Z" fill="#b45309" />
            {/* Shiny black visor / peak with gleam */}
            <path d="M -24 -46 Q 0 -40 24 -46 L 26 -42 Q 0 -36 -26 -42 Z" fill="#0f172a" />
            <line x1="-14" y1="-42" x2="14" y2="-42" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
            {/* Brass emblem badge */}
            <polygon points="0,-62 -5,-55 5,-55" fill="#fef08a" stroke="#111827" strokeWidth="1.5" />
            <path d="M -18 -42 Q 0 -35 18 -42" stroke="#fef08a" strokeWidth="3.5" fill="none" />
          </g>
        ) : final.id === 'rickshaw_mama' ? (
          /* Rickshaw Mama: Red & white checked gamchha knotted around forehead */
          <g id="hair-rickshaw-mama" stroke="#111827" strokeWidth="3">
            {/* Gamchha band wrapped around head */}
            <path d="M -28 -42 Q 0 -66 28 -42 Q 22 -32 0 -34 Q -22 -32 -28 -42 Z" fill="#dc2626" />
            {/* White check lines */}
            <line x1="-18" y1="-48" x2="-16" y2="-36" stroke="#ffffff" strokeWidth="2.5" />
            <line x1="-2" y1="-51" x2="-2" y2="-34" stroke="#ffffff" strokeWidth="2.5" />
            <line x1="14" y1="-48" x2="16" y2="-36" stroke="#ffffff" strokeWidth="2.5" />
            {/* Dynamic fluttering knot tail on side */}
            <path d="M 24 -40 Q 36 -28 32 -6 Q 24 -14 18 -32 Z" fill="#b91c1c" stroke="#111827" strokeWidth="2" />
          </g>
        ) : final.id === 'cha_mama' ? (
          /* Tong Mama: Short neat parted hair */
          <g id="hair-cha-mama" fill={final.hairColor} stroke="#111827" strokeWidth="3">
            <path d="M -26 -36 Q 0 -64 26 -36 Q 16 -50 0 -50 Q -16 -50 -26 -36 Z" />
            <path d="M -12 -58 Q 0 -64 12 -58" stroke={`url(#hair-shine-${uid})`} strokeWidth="3" fill="none" />
          </g>
        ) : final.id === 'ananya' ? (
          /* Ananya: Graceful modern Hijab with gentle folds and golden brooch */
          <g id="hair-ananya" stroke="#111827" strokeWidth="3">
            {/* Outer Hijab wrap */}
            <path
              d="M -30 -30 C -38 -70 38 -70 30 -30 C 28 8 23 30 0 32 C -23 30 -28 8 -30 -30 Z"
              fill={final.primaryColor}
              opacity="0.98"
            />
            {/* Inner face opening contour */}
            <ellipse cx="0" cy="-28" rx="22" ry="26" fill={final.skinColor} stroke="#111827" strokeWidth="2.5" />
            {/* Golden decorative brooch pin (ফুল পিন) */}
            <circle cx="17" cy="-14" r="4" fill="#fef08a" stroke="#111827" strokeWidth="1.5" />
            <circle cx="17" cy="-14" r="2" fill="#ef4444" stroke="none" />
          </g>
        ) : final.id === 'guitarist' ? (
          /* Fahim: Rocker shoulder-length wavy hair & red headband */
          <g id="hair-guitarist" fill={final.hairColor} stroke="#111827" strokeWidth="3">
            <path d="M -28 -35 Q -38 -70 0 -74 Q 38 -70 28 -35 Q 36 14 26 32 Q 18 0 20 -22 Q -20 -22 -18 0 Q -26 32 -36 14 Z" />
            {/* Red rocker bandana */}
            <path d="M -27 -44 Q 0 -53 27 -44" stroke="#dc2626" strokeWidth="5.5" fill="none" />
          </g>
        ) : final.id === 'policeman' ? (
          /* Traffic Police: Crisp official beret cap with police star */
          <g id="hair-police" stroke="#111827" strokeWidth="3">
            <ellipse cx="0" cy="-48" rx="28" ry="13" fill="#1e3a8a" />
            <path d="M -26 -48 Q 0 -74 26 -48 Z" fill="#0284c7" />
            <circle cx="0" cy="-46" r="5" fill="#fef08a" stroke="#111827" strokeWidth="1.5" />
          </g>
        ) : final.id === 'dadi' ? (
          /* Traditional silver grandmother bun with large red bindi */
          <g id="hair-dadi" stroke="#111827" strokeWidth="3">
            <circle cx="0" cy="-54" r="17" fill={final.hairColor} />
            {/* Saree pallu drape around silver hair */}
            <path d="M -26 -35 Q 0 -68 26 -35" stroke={final.secondaryColor} strokeWidth="4" fill="none" />
            {/* Large red bindi on forehead */}
            <circle cx="0" cy="-38" r="4" fill="#dc2626" stroke="none" />
          </g>
        ) : (
          /* Rafi / Tamim / Students: Spiky anime-bangla college hair with glossy highlights! */
          <g id="hair-student" fill={final.hairColor} stroke="#111827" strokeWidth="3">
            {/* Main hair volume */}
            <path d="M -26 -35 Q -36 -60 -18 -67 Q 0 -76 22 -64 Q 36 -56 26 -35 Q 18 -47 5 -44 Q -8 -47 -20 -42 Z" />
            {/* Stylized comic hair spikes */}
            <polygon points="-18,-47 -10,-62 -8,-48" />
            <polygon points="-6,-48 7,-67 10,-50" />
            <polygon points="12,-50 24,-60 18,-44" />
            {/* Glossy shine across spikes */}
            <path d="M -14 -56 Q 0 -66 14 -56" stroke={`url(#hair-shine-${uid})`} strokeWidth="3.5" fill="none" />
            {/* Sideburns */}
            <path d="M -25 -35 L -27 -21 L -22 -24 Z" />
            <path d="M 25 -35 L 27 -21 L 22 -24 Z" />
          </g>
        )}
      </g>
    </g>
  )
}
