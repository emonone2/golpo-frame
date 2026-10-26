export type SkyTheme =
  | 'golden_sunset'
  | 'monsoon_storm'
  | 'sunny_dhaka'
  | 'starry_night'
  | 'neon_evening'
  | 'pastel_morning'
  | 'dramatic_action'
  | 'cozy_indoor'

export type BanglaEnvironment =
  | 'curzon_campus'
  | 'dhaka_rooftop'
  | 'tong_tea_stall'
  | 'rainy_street'
  | 'rickshaw_ride'
  | 'classroom_exam'
  | 'bedroom_lazy'
  | 'hostel_night'
  | 'library_study'
  | 'tsc_bottola'
  | 'cricket_field'
  | 'dhaka_bus'
  | 'fuchka_cart'
  | 'river_nouka'
  | 'village_courtyard'
  | 'college_gate'

export type WeatherEffect =
  | 'sunbeams'
  | 'heavy_rain'
  | 'golden_fireflies'
  | 'breeze_leaves'
  | 'action_speedlines'
  | 'romance_petals'
  | 'sparkles'
  | 'none'

export type HeldProp =
  | 'tea_cup'
  | 'umbrella'
  | 'book'
  | 'phone'
  | 'fuchka_plate'
  | 'guitar'
  | 'cricket_bat'
  | 'rose'
  | 'exam_paper'
  | 'lantern'
  | 'biryani_plate'
  | 'microphone'
  | 'none'

export type EmotionEffect =
  | 'sweat_drops'
  | 'anger_vein'
  | 'hearts'
  | 'idea_bulb'
  | 'question_marks'
  | 'music_notes'
  | 'shock_bolts'
  | 'sparkles'
  | 'tears_fountain'
  | 'none'

export type ForegroundPropId =
  | 'tea_table'
  | 'biryani_table'
  | 'exam_desk'
  | 'laptop_study_desk'
  | 'stray_cat'
  | 'potted_flowers'
  | 'fairy_lights'
  | 'flying_birds'
  | 'stack_of_books'
  | 'rain_puddles'
  | 'clay_lanterns'
  | 'rooftop_kites'
  | 'village_pitha'

export type CharacterStyleId =
  | 'rafi'
  | 'nusrat'
  | 'tamim'
  | 'teacher'
  | 'khala'
  | 'guard'
  | 'rickshaw_mama'
  | 'cha_mama'
  | 'ananya'
  | 'guitarist'
  | 'policeman'
  | 'dadi'

export type CartoonPoseId =
  | 'idle'
  | 'talking'
  | 'shocked'
  | 'running'
  | 'celebrating'
  | 'collapsed'
  | 'confident'
  | 'thinking'
  | 'angry'
  | 'crying'
  | 'whispering'
  | 'dancing'

export interface CartoonCharacterSpec {
  preset: CharacterStyleId
  pose: CartoonPoseId
  x: number
  y: number
  scale: number
  flipHorizontal?: boolean
  skinColor: string
  hairColor: string
  primaryColor: string
  secondaryColor: string
  hasGlasses?: boolean
  hasBeard?: boolean
  hasBackpack?: boolean
  attireStyle?: 'panjabi' | 'jacket' | 'kurti_dupatta' | 'saree' | 'uniform' | 'gamchha_shirt' | 'apron'
  heldProp?: HeldProp
  emotionEffect?: EmotionEffect
}

export interface BanglaCartoonBlueprint {
  skyTheme: SkyTheme
  environment: BanglaEnvironment
  weatherEffect: WeatherEffect
  signboardText?: string
  primaryCharacter: CartoonCharacterSpec
  secondaryCharacter?: CartoonCharacterSpec & { enabled: boolean }
  foregroundProps: ForegroundPropId[]
  customSvgElements?: string
}

function escapeXml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderSkyAndDefs(skyTheme: SkyTheme): string {
  const palettes: Record<SkyTheme, [string, string, string, string]> = {
    golden_sunset: ['#2e1065', '#9d174d', '#ea580c', '#fde047'],
    monsoon_storm: ['#090d16', '#1e293b', '#334155', '#64748b'],
    sunny_dhaka: ['#0369a1', '#0ea5e9', '#7dd3fc', '#fef9c3'],
    starry_night: ['#020617', '#0f172a', '#1e1b4b', '#312e81'],
    neon_evening: ['#1e1b4b', '#4a044e', '#86198f', '#f59e0b'],
    pastel_morning: ['#9d174d', '#f472b6', '#fdba74', '#fef3c7'],
    dramatic_action: ['#450a0a', '#b91c1c', '#f97316', '#fef08a'],
    cozy_indoor: ['#431407', '#7c2d12', '#b45309', '#fde68a'],
  }
  const [c1, c2, c3, c4] = palettes[skyTheme] || palettes.golden_sunset

  return `
    <defs>
      <linearGradient id="bg-sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${c1}" />
        <stop offset="36%" stop-color="${c2}" />
        <stop offset="72%" stop-color="${c3}" />
        <stop offset="100%" stop-color="${c4}" />
      </linearGradient>
      <radialGradient id="sun-halo" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
        <stop offset="28%" stop-color="#fef08a" stop-opacity="0.92" />
        <stop offset="65%" stop-color="#f97316" stop-opacity="0.4" />
        <stop offset="100%" stop-color="#ea580c" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="warm-lamp" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fef9c3" stop-opacity="0.95" />
        <stop offset="50%" stop-color="#fbbf24" stop-opacity="0.42" />
        <stop offset="100%" stop-color="#f59e0b" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="foliage-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#4ade80" />
        <stop offset="50%" stop-color="#16a34a" />
        <stop offset="100%" stop-color="#052e16" />
      </linearGradient>
      <linearGradient id="krishnachura-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fde047" />
        <stop offset="38%" stop-color="#f97316" />
        <stop offset="100%" stop-color="#dc2626" />
      </linearGradient>
      <linearGradient id="brick-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#dc2626" />
        <stop offset="50%" stop-color="#b91c1c" />
        <stop offset="100%" stop-color="#7f1d1d" />
      </linearGradient>
      <linearGradient id="water-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0ea5e9" />
        <stop offset="45%" stop-color="#0284c7" />
        <stop offset="100%" stop-color="#0c4a6e" />
      </linearGradient>
      <linearGradient id="cel-shade-overlay" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.22" />
        <stop offset="45%" stop-color="#ffffff" stop-opacity="0" />
        <stop offset="100%" stop-color="#0f172a" stop-opacity="0.28" />
      </linearGradient>
      <linearGradient id="hair-gloss" x1="0%" y1="0%" x2="100%" y2="40%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0" />
        <stop offset="48%" stop-color="#ffffff" stop-opacity="0.48" />
        <stop offset="56%" stop-color="#ffffff" stop-opacity="0.65" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>
      <filter id="cartoon-drop-shadow" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#090d16" flood-opacity="0.42" />
      </filter>
      <pattern id="comic-halftone" width="8" height="8" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.15" fill="#0f172a" opacity="0.10" />
      </pattern>
      <pattern id="brick-tex" width="22" height="11" patternUnits="userSpaceOnUse">
        <rect width="22" height="11" fill="none" stroke="#450a0a" stroke-width="0.9" opacity="0.38" />
        <line x1="11" y1="0" x2="11" y2="5.5" stroke="#450a0a" stroke-width="0.9" opacity="0.38" />
        <line x1="0" y1="5.5" x2="22" y2="5.5" stroke="#450a0a" stroke-width="0.9" opacity="0.38" />
      </pattern>
    </defs>
    <rect width="400" height="500" fill="url(#bg-sky)" />
  `
}

function renderSkyCelestial(skyTheme: SkyTheme): string {
  if (skyTheme === 'starry_night' || skyTheme === 'neon_evening') {
    return `
      <g id="night-sky-details">
        <g fill="#fef9c3" opacity="0.9">
          <circle cx="38" cy="34" r="2" />
          <circle cx="92" cy="20" r="1.5" />
          <circle cx="148" cy="46" r="2.2" />
          <circle cx="220" cy="24" r="1.6" />
          <circle cx="280" cy="40" r="2" />
          <circle cx="358" cy="26" r="1.7" />
          <circle cx="68" cy="76" r="1.5" />
          <circle cx="312" cy="72" r="1.8" />
          <text x="178" y="34" font-size="14" fill="#fef08a">✦</text>
          <text x="52" y="58" font-size="12" fill="#fef08a">✦</text>
        </g>
        <!-- Glowing Crescent Moon & Soft Night Clouds -->
        <circle cx="326" cy="66" r="54" fill="url(#warm-lamp)" opacity="0.65" />
        <path d="M 314 38 A 28 28 0 1 0 348 84 A 22 22 0 1 1 314 38 Z" fill="#fef9c3" stroke="#fde047" stroke-width="1.8" />
        <path d="M 20 82 Q 65 66 115 80 Q 155 70 190 84 Z" fill="#312e81" opacity="0.55" />
      </g>
    `
  }

  if (skyTheme === 'monsoon_storm') {
    return `
      <g id="storm-clouds">
        <path d="M -20 92 Q 35 38 100 68 Q 160 22 230 60 Q 295 22 360 64 Q 395 45 420 85 L 420 0 L -20 0 Z" fill="#0f172a" opacity="0.94" />
        <ellipse cx="75" cy="68" rx="72" ry="34" fill="#1e293b" stroke="#0f172a" stroke-width="2" />
        <ellipse cx="198" cy="58" rx="86" ry="38" fill="#1e293b" stroke="#0f172a" stroke-width="2" />
        <ellipse cx="328" cy="66" rx="76" ry="35" fill="#1e293b" stroke="#0f172a" stroke-width="2" />
        <ellipse cx="136" cy="80" rx="64" ry="26" fill="#334155" opacity="0.88" />
        <ellipse cx="268" cy="78" rx="68" ry="28" fill="#334155" opacity="0.88" />
        <!-- Dramatic Forked Lightning Bolt -->
        <polyline points="288,58 268,104 286,108 258,165" fill="none" stroke="#fef08a" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
        <polyline points="268,104 245,135" fill="none" stroke="#fef08a" stroke-width="2.2" stroke-linecap="round" />
      </g>
    `
  }

  if (skyTheme === 'dramatic_action') {
    return `
      <g id="action-burst">
        <g opacity="0.38" stroke="#fef08a" stroke-width="3">
          <line x1="200" y1="240" x2="0" y2="0" />
          <line x1="200" y1="240" x2="70" y2="0" />
          <line x1="200" y1="240" x2="140" y2="0" />
          <line x1="200" y1="240" x2="200" y2="0" />
          <line x1="200" y1="240" x2="260" y2="0" />
          <line x1="200" y1="240" x2="330" y2="0" />
          <line x1="200" y1="240" x2="400" y2="0" />
          <line x1="200" y1="240" x2="400" y2="90" />
          <line x1="200" y1="240" x2="400" y2="180" />
          <line x1="200" y1="240" x2="0" y2="90" />
          <line x1="200" y1="240" x2="0" y2="180" />
        </g>
        <circle cx="200" cy="240" r="145" fill="url(#sun-halo)" opacity="0.45" />
      </g>
    `
  }

  const sunX = skyTheme === 'golden_sunset' ? 295 : 322
  const sunY = skyTheme === 'golden_sunset' ? 128 : 76
  const cloudColor = skyTheme === 'golden_sunset' ? '#fed7aa' : '#ffffff'
  const cloudOutline = skyTheme === 'golden_sunset' ? '#9a3412' : '#1e293b'
  const cloudShadow = skyTheme === 'golden_sunset' ? '#fb923c' : '#cbd5e1'

  return `
    <g id="sun-and-clouds">
      <circle cx="${sunX}" cy="${sunY}" r="96" fill="url(#sun-halo)" />
      <circle cx="${sunX}" cy="${sunY}" r="38" fill="#fef08a" stroke="#f59e0b" stroke-width="2.5" />
      <circle cx="${sunX}" cy="${sunY}" r="28" fill="#ffffff" opacity="0.7" />
      <!-- Cel-Shaded Cartoon Cumulus Clouds with Bold Comic Outlines -->
      <g stroke="${cloudOutline}" stroke-width="2.2" stroke-linejoin="round">
        <path d="M 32 84 Q 22 68 42 60 Q 52 40 78 46 Q 102 38 116 58 Q 134 62 128 84 Z" fill="${cloudColor}" />
        <path d="M 36 84 Q 80 76 124 84" fill="none" stroke="${cloudShadow}" stroke-width="4" />

        <path d="M 178 62 Q 170 48 188 42 Q 198 24 222 30 Q 244 24 256 42 Q 272 46 266 62 Z" fill="${cloudColor}" />
        <path d="M 182 62 Q 222 55 262 62" fill="none" stroke="${cloudShadow}" stroke-width="3.5" />
      </g>
    </g>
  `
}

function renderEnvironment(env: BanglaEnvironment, signboardText?: string): string {
  const sign = escapeXml(signboardText || '')

  switch (env) {
    case 'dhaka_rooftop':
      return `
        <g id="env-dhaka-rooftop">
          <!-- Distant Dhaka Skyline Silhouette with Water Tanks, Cranes & Glowing Windows -->
          <g fill="#1e1b4b" stroke="#0f172a" stroke-width="2.5">
            <rect x="6" y="142" width="58" height="165" rx="2" />
            <rect x="70" y="112" width="70" height="195" rx="2" />
            <rect x="146" y="150" width="54" height="157" rx="2" />
            <rect x="206" y="122" width="68" height="185" rx="2" />
            <rect x="280" y="144" width="58" height="163" rx="2" />
            <rect x="344" y="126" width="50" height="181" rx="2" />
            <!-- Rooftop Antennae & Mosque Dome Silhouette in Distance -->
            <path d="M 155 150 Q 173 115 191 150 Z" fill="#312e81" />
            <line x1="173" y1="115" x2="173" y2="98" stroke="#fef08a" stroke-width="2" />
          </g>
          <!-- Glowing Apartment Windows -->
          <g fill="#fef08a" opacity="0.82">
            <rect x="18" y="158" width="11" height="13" rx="1.5" />
            <rect x="38" y="178" width="11" height="13" rx="1.5" />
            <rect x="84" y="128" width="13" height="15" rx="1.5" />
            <rect x="110" y="128" width="13" height="15" rx="1.5" />
            <rect x="84" y="156" width="13" height="15" rx="1.5" />
            <rect x="110" y="184" width="13" height="15" rx="1.5" />
            <rect x="220" y="140" width="12" height="14" rx="1.5" />
            <rect x="244" y="164" width="12" height="14" rx="1.5" />
            <rect x="296" y="160" width="11" height="13" rx="1.5" />
            <rect x="358" y="146" width="11" height="13" rx="1.5" />
          </g>
          <!-- Overhead String Lights / Clothesline across Rooftop -->
          <path d="M 0 92 Q 200 135 400 84" fill="none" stroke="#1a1423" stroke-width="2" />
          <g>
            <circle cx="72" cy="104" r="16" fill="url(#warm-lamp)" />
            <circle cx="72" cy="104" r="5" fill="#fef08a" stroke="#1a1423" stroke-width="1.5" />
            <circle cx="155" cy="112" r="16" fill="url(#warm-lamp)" />
            <circle cx="155" cy="112" r="5" fill="#f472b6" stroke="#1a1423" stroke-width="1.5" />
            <circle cx="245" cy="110" r="16" fill="url(#warm-lamp)" />
            <circle cx="245" cy="110" r="5" fill="#fef08a" stroke="#1a1423" stroke-width="1.5" />
            <circle cx="330" cy="98" r="16" fill="url(#warm-lamp)" />
            <circle cx="330" cy="98" r="5" fill="#38bdf8" stroke="#1a1423" stroke-width="1.5" />
          </g>
          <!-- Rooftop Parapet Brick Wall (ছাদের রেলিং ও দেয়াল) -->
          <rect x="0" y="264" width="400" height="86" fill="url(#brick-grad)" stroke="#1a1423" stroke-width="3.5" />
          <rect x="0" y="264" width="400" height="86" fill="url(#brick-tex)" />
          <!-- Decorative Iron Grille Railing Above Parapet -->
          <line x1="0" y1="238" x2="400" y2="238" stroke="#1a1423" stroke-width="4" />
          <g stroke="#1a1423" stroke-width="2.5">
            <line x1="35" y1="238" x2="35" y2="256" />
            <line x1="75" y1="238" x2="75" y2="256" />
            <line x1="115" y1="238" x2="115" y2="256" />
            <line x1="155" y1="238" x2="155" y2="256" />
            <line x1="195" y1="238" x2="195" y2="256" />
            <line x1="235" y1="238" x2="235" y2="256" />
            <line x1="275" y1="238" x2="275" y2="256" />
          </g>
          <!-- Concrete Coping Ledge -->
          <rect x="0" y="254" width="400" height="14" fill="#f1f5f9" stroke="#1a1423" stroke-width="3" />
          <rect x="0" y="263" width="400" height="5" fill="#94a3b8" />
          <!-- Rooftop Tiled Floor with Perspective Lines -->
          <path d="M 0 348 L 400 348 L 400 500 L 0 500 Z" fill="#64748b" stroke="#1a1423" stroke-width="3.5" />
          <g stroke="#334155" stroke-width="1.8" opacity="0.65">
            <line x1="0" y1="382" x2="400" y2="382" />
            <line x1="0" y1="420" x2="400" y2="420" />
            <line x1="0" y1="462" x2="400" y2="462" />
            <line x1="80" y1="348" x2="15" y2="500" />
            <line x1="160" y1="348" x2="135" y2="500" />
            <line x1="240" y1="348" x2="265" y2="500" />
            <line x1="320" y1="348" x2="385" y2="500" />
          </g>
          <!-- Classic Gazi Green Water Tank on Roof Corner -->
          <g transform="translate(308, 176)" stroke="#1a1423" stroke-width="3">
            <rect x="0" y="12" width="76" height="68" rx="10" fill="#059669" />
            <path d="M 10 12 L 10 80" stroke="#34d399" stroke-width="4" opacity="0.5" />
            <rect x="18" y="2" width="40" height="12" rx="3" fill="#047857" />
            <line x1="0" y1="34" x2="76" y2="34" stroke="#064e3b" stroke-width="3" />
            <line x1="0" y1="56" x2="76" y2="56" stroke="#064e3b" stroke-width="3" />
          </g>
          <!-- Terracotta Pots with Lush Bougainvillea (বাগানবিলাস) & Marigolds -->
          <g transform="translate(12, 206)" stroke="#1a1423" stroke-width="2.8">
            <polygon points="8,40 48,40 42,72 14,72" fill="#c2410c" />
            <rect x="4" y="34" width="48" height="9" rx="3" fill="#ea580c" />
            <circle cx="16" cy="18" r="20" fill="#15803d" />
            <circle cx="38" cy="16" r="22" fill="#16a34a" />
            <circle cx="28" cy="2" r="18" fill="#22c55e" />
            <circle cx="12" cy="12" r="5.5" fill="#ec4899" stroke="#1a1423" stroke-width="1.5" />
            <circle cx="28" cy="0" r="6" fill="#f43f5e" stroke="#1a1423" stroke-width="1.5" />
            <circle cx="40" cy="14" r="5.5" fill="#ec4899" stroke="#1a1423" stroke-width="1.5" />
            <circle cx="24" cy="22" r="5" fill="#facc15" stroke="#1a1423" stroke-width="1.5" />
          </g>
        </g>
      `

    case 'tong_tea_stall':
      return `
        <g id="env-tong-tea-stall">
          <!-- Warm Street Backdrop & Krishnachura Tree -->
          <circle cx="352" cy="108" r="78" fill="url(#krishnachura-grad)" stroke="#1a1423" stroke-width="3" />
          <circle cx="56" cy="116" r="68" fill="url(#foliage-grad)" stroke="#1a1423" stroke-width="3" />
          <!-- Ground Earthy Road -->
          <rect x="0" y="328" width="400" height="172" fill="#78350f" stroke="#1a1423" stroke-width="3.5" />
          <ellipse cx="200" cy="395" rx="185" ry="48" fill="#92400e" opacity="0.65" />
          <!-- Wooden & Bamboo Tong Tea Stall Structure (বাংলার টং দোকান) -->
          <rect x="24" y="132" width="352" height="208" fill="#451a03" stroke="#1a1423" stroke-width="3.5" rx="4" />
          <rect x="34" y="142" width="332" height="116" fill="#78350f" stroke="#1a1423" stroke-width="2.5" />
          <!-- Corrugated Tin Shed Roof (টিনের চালা) -->
          <polygon points="8,138 392,138 370,92 30,92" fill="#94a3b8" stroke="#1a1423" stroke-width="3.5" />
          <g stroke="#475569" stroke-width="2.2">
            <line x1="60" y1="92" x2="45" y2="138" />
            <line x1="110" y1="92" x2="100" y2="138" />
            <line x1="160" y1="92" x2="155" y2="138" />
            <line x1="215" y1="92" x2="215" y2="138" />
            <line x1="265" y1="92" x2="272" y2="138" />
            <line x1="320" y1="92" x2="332" y2="138" />
          </g>
          <!-- Colorful Bangla Signboard on Roof -->
          <rect x="76" y="58" width="248" height="38" rx="7" fill="#dc2626" stroke="#fef08a" stroke-width="3.2" />
          <text x="200" y="83" text-anchor="middle" fill="#fef08a" font-family="Noto Sans Bengali, sans-serif" font-size="16" font-weight="bold">
            ${sign || 'মামা স্পেশাল মালাই চা • টং ঘর'}
          </text>
          <!-- Hanging Bunches of Bananas (কলার ছড়ি) & Chips Packets -->
          <g transform="translate(50, 148)" stroke="#1a1423" stroke-width="2.2">
            <path d="M 0 0 Q 14 20 4 40 Q -6 24 0 0 Z" fill="#facc15" />
            <path d="M 9 2 Q 24 20 14 42 Q 4 24 9 2 Z" fill="#fde047" />
            <path d="M 18 0 Q 32 18 24 38 Q 12 22 18 0 Z" fill="#eab308" />
          </g>
          <g transform="translate(320, 144)" stroke="#1a1423" stroke-width="2">
            <rect x="0" y="0" width="20" height="26" rx="2" fill="#ef4444" />
            <rect x="2" y="28" width="20" height="26" rx="2" fill="#22c55e" />
            <rect x="-18" y="4" width="18" height="24" rx="2" fill="#f59e0b" />
          </g>
          <!-- Glass Biscuit, Cake & Condensed Milk Jars on Counter -->
          <g transform="translate(98, 202)" stroke="#1a1423" stroke-width="2.2">
            <rect x="0" y="0" width="34" height="48" rx="6" fill="#bae6fd" opacity="0.9" />
            <rect x="4" y="-6" width="26" height="8" rx="2" fill="#dc2626" />
            <circle cx="12" cy="30" r="6.5" fill="#d97706" />
            <circle cx="22" cy="32" r="6.5" fill="#b45309" />
            <circle cx="17" cy="18" r="6.5" fill="#f59e0b" />

            <rect x="42" y="4" width="32" height="44" rx="6" fill="#bae6fd" opacity="0.9" />
            <rect x="46" y="-2" width="24" height="8" rx="2" fill="#2563eb" />
            <rect x="47" y="18" width="22" height="24" fill="#fde047" />
          </g>
          <!-- Steaming Aluminum Tea Kettle (ধোঁয়া ওঠা চায়ের কেটলি) -->
          <g transform="translate(268, 200)" stroke="#1a1423" stroke-width="2.8">
            <ellipse cx="28" cy="34" rx="28" ry="21" fill="#e2e8f0" />
            <ellipse cx="28" cy="14" rx="15" ry="6" fill="#94a3b8" />
            <path d="M 54 28 Q 70 14 66 2" fill="none" stroke="#e2e8f0" stroke-width="6.5" stroke-linecap="round" />
            <path d="M 10 14 Q 28 -12 46 14" fill="none" stroke="#1e293b" stroke-width="4.5" />
            <path d="M 10 54 Q 20 40 28 54 Q 36 40 46 54 Z" fill="#f97316" stroke="#dc2626" stroke-width="1.8" />
            <path d="M 68 -4 Q 76 -18 64 -32 Q 54 -44 70 -56" fill="none" stroke="#ffffff" stroke-width="3" stroke-dasharray="4 3" opacity="0.9" />
          </g>
          <!-- Warm Hanging Tungsten Bulb -->
          <line x1="200" y1="138" x2="200" y2="170" stroke="#1a1423" stroke-width="2.5" />
          <circle cx="200" cy="176" r="46" fill="url(#warm-lamp)" />
          <circle cx="200" cy="176" r="9.5" fill="#fef9c3" stroke="#f59e0b" stroke-width="2" />
          <!-- Front Stall Counter -->
          <rect x="20" y="252" width="360" height="86" fill="#b45309" stroke="#1a1423" stroke-width="3.5" rx="3" />
          <rect x="16" y="248" width="368" height="15" fill="#d97706" stroke="#1a1423" stroke-width="3" rx="3" />
        </g>
      `

    case 'rainy_street':
      return `
        <g id="env-rainy-street">
          <!-- Dhaka Buildings & Shopfronts in Monsoon Mist -->
          <g fill="#1e293b" stroke="#0f172a" stroke-width="2.8">
            <rect x="6" y="102" width="80" height="208" />
            <rect x="92" y="78" width="90" height="232" />
            <rect x="188" y="112" width="78" height="198" />
            <rect x="272" y="86" width="122" height="224" />
          </g>
          <!-- Glowing Warm Shop Windows & Neon Bangla Sign -->
          <rect x="98" y="220" width="78" height="28" rx="5" fill="#ec4899" stroke="#fef08a" stroke-width="2.5" />
          <text x="137" y="239" text-anchor="middle" fill="#ffffff" font-family="Noto Sans Bengali, sans-serif" font-size="12" font-weight="bold">
            ${sign || 'বৃষ্টি ভেজা ঢাকা'}
          </text>
          <g fill="#fef08a" opacity="0.78">
            <rect x="20" y="124" width="16" height="20" rx="2" />
            <rect x="52" y="124" width="16" height="20" rx="2" />
            <rect x="108" y="106" width="18" height="22" rx="2" />
            <rect x="142" y="106" width="18" height="22" rx="2" />
            <rect x="292" y="114" width="20" height="22" rx="2" />
            <rect x="332" y="114" width="20" height="22" rx="2" />
          </g>
          <!-- Wet Monsoon Asphalt Street -->
          <rect x="0" y="308" width="400" height="192" fill="#0f172a" stroke="#1a1423" stroke-width="3.5" />
          <!-- Neon & Lamp Puddle Reflections on Wet Road + Paper Boat -->
          <ellipse cx="120" cy="390" rx="90" ry="22" fill="#1e3a8a" opacity="0.7" />
          <ellipse cx="120" cy="390" rx="58" ry="12" fill="#f472b6" opacity="0.4" />
          <ellipse cx="298" cy="430" rx="82" ry="20" fill="#1e3a8a" opacity="0.7" />
          <ellipse cx="298" cy="430" rx="50" ry="11" fill="#fef08a" opacity="0.45" />
          <!-- Nostalgic White Paper Boat (কাগজের নৌকা) Floating in Rain Puddle -->
          <g transform="translate(72, 382)" stroke="#1a1423" stroke-width="2">
            <polygon points="0,8 34,8 26,18 8,18" fill="#f8fafc" />
            <polygon points="8,8 17,-6 26,8" fill="#e2e8f0" />
          </g>
          <!-- Classic Dhaka Street Lamp Post -->
          <line x1="348" y1="112" x2="348" y2="330" stroke="#334155" stroke-width="8" stroke-linecap="round" />
          <path d="M 348 118 Q 320 100 302 116" fill="none" stroke="#334155" stroke-width="6" stroke-linecap="round" />
          <circle cx="300" cy="122" r="56" fill="url(#warm-lamp)" />
          <circle cx="300" cy="122" r="11" fill="#fef9c3" stroke="#f59e0b" stroke-width="2" />
        </g>
      `

    case 'rickshaw_ride':
      return `
        <g id="env-rickshaw-ride">
          <!-- Lively Dhaka Street Buildings & Krishnachura Tree -->
          <rect x="8" y="88" width="88" height="205" fill="#fed7aa" stroke="#1a1423" stroke-width="2.8" />
          <rect x="104" y="108" width="96" height="185" fill="#fde68a" stroke="#1a1423" stroke-width="2.8" />
          <circle cx="332" cy="132" r="82" fill="url(#krishnachura-grad)" stroke="#1a1423" stroke-width="3" />
          <!-- Road -->
          <rect x="0" y="290" width="400" height="210" fill="#334155" stroke="#1a1423" stroke-width="3.5" />
          <line x1="0" y1="368" x2="400" y2="368" stroke="#facc15" stroke-width="6" stroke-dasharray="28 18" />
          <!-- Authentic Colorful Bangladeshi Painted Rickshaw (রঙিন রিকশা) -->
          <g id="bangla-rickshaw" transform="translate(32, 102)">
            <path d="M 135 35 Q 235 -18 322 45 L 332 165 Q 235 145 135 165 Z" fill="#10b981" stroke="#1a1423" stroke-width="4" />
            <path d="M 148 52 Q 235 12 315 58" fill="none" stroke="#fde047" stroke-width="6" />
            <path d="M 152 76 Q 235 38 318 82" fill="none" stroke="#f43f5e" stroke-width="5" />
            <!-- Floral Folk Medallion on Rickshaw Hood -->
            <circle cx="235" cy="95" r="28" fill="#fde047" stroke="#1a1423" stroke-width="2.8" />
            <circle cx="235" cy="95" r="18" fill="#e11d48" stroke="#1a1423" stroke-width="2" />
            <circle cx="235" cy="95" r="7" fill="#fef08a" />
            <!-- Cushioned Passenger Seat -->
            <rect x="140" y="160" width="188" height="74" rx="10" fill="#dc2626" stroke="#1a1423" stroke-width="3.5" />
            <rect x="148" y="168" width="172" height="28" rx="6" fill="#fb7185" stroke="#1a1423" stroke-width="2" />
            <!-- Rear & Front Spoked Wheels -->
            <circle cx="255" cy="285" r="62" fill="none" stroke="#0f172a" stroke-width="10" />
            <circle cx="255" cy="285" r="52" fill="none" stroke="#fef08a" stroke-width="3" />
            <circle cx="255" cy="285" r="14" fill="#f59e0b" stroke="#0f172a" stroke-width="3" />
            <line x1="255" y1="223" x2="255" y2="347" stroke="#cbd5e1" stroke-width="2.2" />
            <line x1="193" y1="285" x2="317" y2="285" stroke="#cbd5e1" stroke-width="2.2" />
            <line x1="211" y1="241" x2="299" y2="329" stroke="#cbd5e1" stroke-width="2.2" />
            <line x1="299" y1="241" x2="211" y2="329" stroke="#cbd5e1" stroke-width="2.2" />
            <line x1="140" y1="195" x2="72" y2="275" stroke="#1e293b" stroke-width="8" stroke-linecap="round" />
            <circle cx="68" cy="285" r="46" fill="none" stroke="#0f172a" stroke-width="9" />
            <circle cx="68" cy="285" r="11" fill="#f59e0b" stroke="#0f172a" stroke-width="2.5" />
          </g>
        </g>
      `

    case 'river_nouka':
      return `
        <g id="env-river-nouka">
          <!-- Far Green Gram Bangla Shoreline & Palm Trees -->
          <path d="M 0 205 Q 85 186 185 202 Q 295 184 400 204 L 400 225 L 0 225 Z" fill="#064e3b" stroke="#1a1423" stroke-width="2.5" />
          <!-- Shimmering Bengal River Water (পদ্মা/মেঘনা নদী) -->
          <rect x="0" y="220" width="400" height="280" fill="url(#water-grad)" stroke="#1a1423" stroke-width="3" />
          <g stroke="#fde047" stroke-width="3" stroke-linecap="round" opacity="0.8">
            <line x1="185" y1="238" x2="295" y2="238" />
            <line x1="160" y1="258" x2="310" y2="258" />
            <line x1="195" y1="280" x2="285" y2="280" />
            <line x1="75" y1="310" x2="175" y2="310" />
            <line x1="220" y1="335" x2="345" y2="335" />
          </g>
          <!-- Traditional Wooden Country Boat (পালতোলা নৌকা) -->
          <g id="nouka-boat" transform="translate(152, 206)">
            <line x1="95" y1="130" x2="95" y2="-16" stroke="#1a1423" stroke-width="5" stroke-linecap="round" />
            <path d="M 95 -10 Q 182 20 170 106 L 95 106 Z" fill="#f97316" stroke="#1a1423" stroke-width="3" />
            <rect x="112" y="28" width="30" height="26" fill="#fde047" stroke="#1a1423" stroke-width="2" />
            <path d="M 36 128 Q 85 74 140 128 Z" fill="#b45309" stroke="#1a1423" stroke-width="3" />
            <path d="M -12 122 Q 95 164 218 118 Q 165 180 -12 122 Z" fill="#451a03" stroke="#1a1423" stroke-width="4" />
          </g>
          <!-- Foreground Riverbank with White Kashful (কাশফুল) -->
          <path d="M 0 352 Q 140 338 280 374 L 400 388 L 400 500 L 0 500 Z" fill="#15803d" stroke="#1a1423" stroke-width="3.5" />
          <g stroke="#166534" stroke-width="2.5" fill="none">
            <line x1="28" y1="485" x2="42" y2="362" />
            <line x1="58" y1="490" x2="72" y2="348" />
            <line x1="88" y1="495" x2="98" y2="365" />
            <line x1="335" y1="490" x2="348" y2="372" />
            <line x1="365" y1="495" x2="378" y2="358" />
          </g>
          <g fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5">
            <ellipse cx="42" cy="355" rx="11" ry="24" transform="rotate(12 42 355)" />
            <ellipse cx="72" cy="342" rx="12" ry="26" transform="rotate(8 72 342)" />
            <ellipse cx="98" cy="358" rx="10" ry="22" transform="rotate(15 98 358)" />
            <ellipse cx="348" cy="366" rx="11" ry="24" transform="rotate(-12 348 366)" />
            <ellipse cx="378" cy="352" rx="12" ry="26" transform="rotate(-8 378 352)" />
          </g>
        </g>
      `

    case 'fuchka_cart':
      return `
        <g id="env-fuchka-cart">
          <path d="M 0 42 Q 100 76 200 52 Q 300 78 400 44" fill="none" stroke="#1a1423" stroke-width="2.5" />
          <g>
            <circle cx="55" cy="56" r="24" fill="url(#warm-lamp)" />
            <circle cx="55" cy="56" r="7.5" fill="#fef08a" stroke="#1a1423" stroke-width="1.5" />
            <circle cx="135" cy="64" r="24" fill="url(#warm-lamp)" />
            <circle cx="135" cy="64" r="7.5" fill="#f472b6" stroke="#1a1423" stroke-width="1.5" />
            <circle cx="215" cy="56" r="24" fill="url(#warm-lamp)" />
            <circle cx="215" cy="56" r="7.5" fill="#fef08a" stroke="#1a1423" stroke-width="1.5" />
            <circle cx="305" cy="66" r="24" fill="url(#warm-lamp)" />
            <circle cx="305" cy="66" r="7.5" fill="#38bdf8" stroke="#1a1423" stroke-width="1.5" />
          </g>
          <rect x="0" y="345" width="400" height="155" fill="#1e293b" stroke="#1a1423" stroke-width="3.5" />
          <g transform="translate(26, 106)">
            <polygon points="0,36 348,36 328,0 20,0" fill="#e11d48" stroke="#1a1423" stroke-width="3.5" />
            <rect x="44" y="4" width="260" height="28" rx="5" fill="#fef08a" stroke="#1a1423" stroke-width="2.2" />
            <text x="174" y="23" text-anchor="middle" fill="#be123c" font-family="Noto Sans Bengali, sans-serif" font-size="14" font-weight="bold">
              ${sign || 'মামা ফুচকা ও চটপটি হাউস'}
            </text>
            <rect x="24" y="58" width="94" height="86" rx="10" fill="#e0f2fe" stroke="#0284c7" stroke-width="3" opacity="0.92" />
            <g fill="#f59e0b" stroke="#78350f" stroke-width="1.8">
              <circle cx="46" cy="122" r="11" />
              <circle cx="70" cy="120" r="12" />
              <circle cx="94" cy="122" r="11" />
              <circle cx="56" cy="100" r="11" />
              <circle cx="82" cy="98" r="12" />
              <circle cx="68" cy="80" r="11" />
            </g>
            <ellipse cx="178" cy="135" rx="38" ry="15" fill="#78350f" stroke="#1a1423" stroke-width="2.5" />
            <rect x="12" y="144" width="324" height="92" rx="6" fill="#dc2626" stroke="#1a1423" stroke-width="3.5" />
            <rect x="24" y="156" width="300" height="68" rx="4" fill="#facc15" stroke="#1a1423" stroke-width="2.5" />
            <circle cx="78" cy="245" r="28" fill="none" stroke="#0f172a" stroke-width="6.5" />
            <circle cx="268" cy="245" r="28" fill="none" stroke="#0f172a" stroke-width="6.5" />
          </g>
        </g>
      `

    case 'classroom_exam':
      return `
        <g id="env-classroom">
          <rect width="400" height="320" fill="#fef3c7" stroke="#1a1423" stroke-width="3" />
          <rect x="18" y="42" width="76" height="128" rx="4" fill="#7dd3fc" stroke="#1a1423" stroke-width="3.5" />
          <circle cx="48" cy="125" r="28" fill="#22c55e" />
          <line x1="56" y1="42" x2="56" y2="170" stroke="#1a1423" stroke-width="3" />
          <line x1="18" y1="106" x2="94" y2="106" stroke="#1a1423" stroke-width="3" />
          <rect x="110" y="42" width="218" height="132" rx="5" fill="#14532d" stroke="#78350f" stroke-width="7" />
          <text x="219" y="78" text-anchor="middle" fill="#fef9c3" font-family="Noto Sans Bengali, sans-serif" font-size="15" font-weight="bold">
            ${sign || 'বাংলা ক্লাস ও পরীক্ষা'}
          </text>
          <line x1="136" y1="98" x2="298" y2="98" stroke="#bbf7d0" stroke-width="2" stroke-dasharray="10 6" />
          <line x1="136" y1="122" x2="265" y2="122" stroke="#bbf7d0" stroke-width="2" stroke-dasharray="14 6" />
          <circle cx="362" cy="68" r="22" fill="#ffffff" stroke="#1a1423" stroke-width="3" />
          <line x1="362" y1="68" x2="362" y2="54" stroke="#dc2626" stroke-width="2.5" />
          <line x1="362" y1="68" x2="374" y2="68" stroke="#1a1423" stroke-width="2.5" />
          <rect x="0" y="315" width="400" height="185" fill="#d97706" stroke="#1a1423" stroke-width="3.5" />
          <rect x="24" y="275" width="160" height="58" rx="4" fill="#92400e" stroke="#1a1423" stroke-width="3" />
          <rect x="220" y="275" width="160" height="58" rx="4" fill="#92400e" stroke="#1a1423" stroke-width="3" />
        </g>
      `

    case 'bedroom_lazy':
    case 'hostel_night':
      return `
        <g id="env-bangla-room">
          <rect width="400" height="325" fill="${env === 'hostel_night' ? '#1e293b' : '#fde68a'}" stroke="#1a1423" stroke-width="3" />
          <rect x="235" y="38" width="128" height="118" rx="4" fill="${env === 'hostel_night' ? '#0f172a' : '#38bdf8'}" stroke="#1a1423" stroke-width="3.5" />
          <circle cx="298" cy="78" r="18" fill="#fef08a" />
          <path d="M 235 38 Q 260 95 242 156 L 230 156 L 230 38 Z" fill="#f43f5e" stroke="#1a1423" stroke-width="2.5" />
          <path d="M 363 38 Q 338 95 356 156 L 368 156 L 368 38 Z" fill="#f43f5e" stroke="#1a1423" stroke-width="2.5" />
          <rect x="24" y="52" width="145" height="82" rx="4" fill="#78350f" stroke="#1a1423" stroke-width="3" />
          <g stroke="#1a1423" stroke-width="2">
            <rect x="34" y="64" width="16" height="58" fill="#ef4444" />
            <rect x="52" y="70" width="18" height="52" fill="#3b82f6" />
            <rect x="72" y="62" width="15" height="60" fill="#10b981" />
            <rect x="90" y="68" width="20" height="54" fill="#f59e0b" />
            <rect x="114" y="64" width="16" height="58" fill="#8b5cf6" />
          </g>
          <rect x="0" y="320" width="400" height="180" fill="#b45309" stroke="#1a1423" stroke-width="3.5" />
          <rect x="16" y="242" width="225" height="105" rx="6" fill="#78350f" stroke="#1a1423" stroke-width="3.5" />
          <rect x="22" y="252" width="212" height="75" rx="6" fill="#f8fafc" stroke="#1a1423" stroke-width="2.5" />
          <rect x="85" y="262" width="145" height="65" rx="6" fill="#e11d48" stroke="#1a1423" stroke-width="2.5" />
          <ellipse cx="56" cy="276" rx="28" ry="15" fill="#fef08a" stroke="#1a1423" stroke-width="2.5" />
          <rect x="262" y="248" width="124" height="98" rx="4" fill="#92400e" stroke="#1a1423" stroke-width="3" />
          <polygon points="282,248 338,248 332,212 288,212" fill="#cbd5e1" stroke="#1a1423" stroke-width="2.5" />
          <circle cx="358" cy="205" r="38" fill="url(#warm-lamp)" />
        </g>
      `

    case 'village_courtyard':
      return `
        <g id="env-village-courtyard">
          <path d="M 35 280 Q 10 180 -20 140 Q 30 160 55 260 Z" fill="#16a34a" stroke="#1a1423" stroke-width="2.5" />
          <path d="M 45 280 Q 85 170 130 145 Q 85 200 60 280 Z" fill="#22c55e" stroke="#1a1423" stroke-width="2.5" />
          <circle cx="345" cy="155" r="72" fill="url(#foliage-grad)" stroke="#1a1423" stroke-width="3" />
          <g transform="translate(88, 122)" stroke="#1a1423" stroke-width="3.5">
            <rect x="16" y="68" width="205" height="125" fill="#d97706" />
            <polygon points="0,72 238,72 195,12 42,12" fill="#94a3b8" />
            <rect x="92" y="102" width="48" height="90" fill="#78350f" />
            <rect x="36" y="105" width="36" height="38" fill="#fef08a" />
            <rect x="162" y="105" width="36" height="38" fill="#fef08a" />
          </g>
          <path d="M 12 315 Q 48 210 84 315 Z" fill="#facc15" stroke="#1a1423" stroke-width="3" />
          <rect x="0" y="312" width="400" height="188" fill="#d6b48a" stroke="#1a1423" stroke-width="3.5" />
        </g>
      `

    case 'library_study':
      return `
        <g id="env-library-study">
          <rect width="400" height="325" fill="#1c1917" stroke="#1a1423" stroke-width="3" />
          <rect x="14" y="24" width="172" height="278" rx="4" fill="#5c2d0e" stroke="#1a1423" stroke-width="3.5" />
          <rect x="214" y="24" width="172" height="278" rx="4" fill="#5c2d0e" stroke="#1a1423" stroke-width="3.5" />
          <g stroke="#1a1423" stroke-width="1.8">
            <rect x="24" y="38" width="18" height="58" fill="#e11d48" />
            <rect x="44" y="44" width="20" height="52" fill="#2563eb" />
            <rect x="66" y="34" width="22" height="62" fill="#10b981" />
            <rect x="90" y="40" width="18" height="56" fill="#f59e0b" />
            <rect x="110" y="36" width="24" height="60" fill="#8b5cf6" />
            <rect x="136" y="42" width="20" height="54" fill="#06b6d4" />
            <rect x="224" y="38" width="22" height="58" fill="#f97316" />
            <rect x="248" y="34" width="18" height="62" fill="#ec4899" />
            <rect x="268" y="42" width="24" height="54" fill="#14b8a6" />
            <rect x="294" y="36" width="20" height="60" fill="#eab308" />
            <rect x="316" y="40" width="22" height="56" fill="#3b82f6" />
            <rect x="340" y="38" width="20" height="58" fill="#ef4444" />
          </g>
          <line x1="14" y1="100" x2="186" y2="100" stroke="#2a0f02" stroke-width="6" />
          <line x1="214" y1="100" x2="386" y2="100" stroke="#2a0f02" stroke-width="6" />
          <rect x="0" y="302" width="400" height="198" fill="#78350f" stroke="#1a1423" stroke-width="3.5" />
          <circle cx="65" cy="256" r="46" fill="url(#warm-lamp)" />
          <path d="M 38 258 Q 65 232 92 258 Z" fill="#15803d" stroke="#1a1423" stroke-width="2.5" />
        </g>
      `

    case 'cricket_field':
      return `
        <g id="env-cricket-field">
          <circle cx="55" cy="195" r="46" fill="url(#foliage-grad)" stroke="#1a1423" stroke-width="2.5" />
          <circle cx="135" cy="190" r="52" fill="url(#foliage-grad)" stroke="#1a1423" stroke-width="2.5" />
          <circle cx="285" cy="192" r="48" fill="url(#krishnachura-grad)" stroke="#1a1423" stroke-width="2.5" />
          <circle cx="355" cy="195" r="45" fill="url(#foliage-grad)" stroke="#1a1423" stroke-width="2.5" />
          <rect x="0" y="218" width="400" height="282" fill="#16a34a" stroke="#1a1423" stroke-width="3.5" />
          <ellipse cx="200" cy="365" rx="185" ry="95" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.8" />
          <polygon points="155,235 245,235 285,485 115,485" fill="#d6b48a" stroke="#92400e" stroke-width="2.5" />
          <g stroke="#451a03" stroke-width="4" stroke-linecap="round">
            <line x1="188" y1="222" x2="188" y2="262" />
            <line x1="200" y1="222" x2="200" y2="262" />
            <line x1="212" y1="222" x2="212" y2="262" />
            <line x1="185" y1="222" x2="215" y2="222" stroke-width="3" />
          </g>
          <circle cx="105" cy="415" r="10" fill="#dc2626" stroke="#1a1423" stroke-width="2.5" />
        </g>
      `

    case 'dhaka_bus':
      return `
        <g id="env-dhaka-bus">
          <rect width="400" height="500" fill="#fde68a" />
          <rect x="0" y="0" width="400" height="88" fill="#1e293b" stroke="#1a1423" stroke-width="3" />
          <line x1="0" y1="74" x2="400" y2="74" stroke="#cbd5e1" stroke-width="8" />
          <g stroke="#f59e0b" stroke-width="5">
            <line x1="75" y1="74" x2="75" y2="118" />
            <line x1="185" y1="74" x2="185" y2="118" />
            <line x1="295" y1="74" x2="295" y2="118" />
          </g>
          <rect x="16" y="96" width="110" height="135" rx="6" fill="#7dd3fc" stroke="#1a1423" stroke-width="5" />
          <rect x="145" y="96" width="110" height="135" rx="6" fill="#7dd3fc" stroke="#1a1423" stroke-width="5" />
          <rect x="274" y="96" width="110" height="135" rx="6" fill="#7dd3fc" stroke="#1a1423" stroke-width="5" />
          <rect x="110" y="242" width="180" height="28" rx="4" fill="#dc2626" stroke="#fef08a" stroke-width="2" />
          <text x="200" y="261" text-anchor="middle" fill="#fef08a" font-family="Noto Sans Bengali, sans-serif" font-size="12" font-weight="bold">
            ${sign || 'ঢাকা মেট্রো বাস • টিকিট কাটুন'}
          </text>
          <rect x="0" y="280" width="400" height="220" fill="#475569" stroke="#1a1423" stroke-width="3.5" />
          <rect x="12" y="295" width="115" height="175" rx="8" fill="#e11d48" stroke="#1a1423" stroke-width="3.5" />
          <rect x="273" y="295" width="115" height="175" rx="8" fill="#e11d48" stroke="#1a1423" stroke-width="3.5" />
        </g>
      `

    case 'tsc_bottola':
      return `
        <g id="env-tsc-bottola">
          <circle cx="295" cy="88" r="95" fill="url(#foliage-grad)" stroke="#1a1423" stroke-width="3.5" />
          <circle cx="175" cy="95" r="78" fill="url(#foliage-grad)" stroke="#1a1423" stroke-width="3" />
          <path d="M 275 310 Q 285 200 295 130 Q 315 200 330 310 Z" fill="#451a03" stroke="#1a1423" stroke-width="3.5" />
          <rect x="12" y="115" width="155" height="175" fill="#e2e8f0" stroke="#1a1423" stroke-width="3" />
          <rect x="22" y="132" width="135" height="22" fill="#64748b" />
          <rect x="22" y="168" width="135" height="22" fill="#64748b" />
          <rect x="22" y="204" width="135" height="22" fill="#64748b" />
          <rect x="0" y="290" width="400" height="210" fill="#b45309" stroke="#1a1423" stroke-width="3.5" />
          <ellipse cx="295" cy="312" rx="92" ry="30" fill="#dc2626" stroke="#1a1423" stroke-width="3.5" />
          <ellipse cx="295" cy="304" rx="82" ry="22" fill="#ef4444" stroke="#1a1423" stroke-width="2.5" />
        </g>
      `

    case 'curzon_campus':
    case 'college_gate':
    default:
      return `
        <g id="env-curzon-campus">
          <circle cx="42" cy="118" r="80" fill="url(#krishnachura-grad)" stroke="#1a1423" stroke-width="3" />
          <circle cx="362" cy="112" r="78" fill="url(#foliage-grad)" stroke="#1a1423" stroke-width="3" />
          <g transform="translate(46, 72)" stroke="#1a1423" stroke-width="3">
            <rect x="0" y="48" width="308" height="196" fill="url(#brick-grad)" />
            <rect x="0" y="48" width="308" height="196" fill="url(#brick-tex)" />
            <path d="M 104 48 Q 154 -28 204 48 Z" fill="#f8fafc" stroke-width="3.5" />
            <line x1="154" y1="-28" x2="154" y2="-48" stroke="#f59e0b" stroke-width="3.5" />
            <circle cx="154" cy="-50" r="5" fill="#fef08a" stroke-width="2" />
            <rect x="-6" y="42" width="320" height="14" fill="#fde68a" />
            <g fill="#2e1065">
              <path d="M 24 244 L 24 148 Q 54 112 84 148 L 84 244 Z" />
              <path d="M 114 244 L 114 138 Q 154 96 194 138 L 194 244 Z" />
              <path d="M 224 244 L 224 148 Q 254 112 284 148 L 284 244 Z" />
            </g>
            <rect x="74" y="64" width="160" height="28" rx="5" fill="#1e293b" stroke="#fef08a" stroke-width="2" />
            <text x="154" y="83" text-anchor="middle" fill="#fef08a" font-family="Noto Sans Bengali, sans-serif" font-size="13" font-weight="bold">
              ${sign || 'ঢাকা বিশ্ববিদ্যালয় ক্যাম্পাস'}
            </text>
          </g>
          <rect x="0" y="314" width="400" height="186" fill="#d6b48a" stroke="#1a1423" stroke-width="3.5" />
          <path d="M 0 314 L 115 314 L 35 500 L 0 500 Z" fill="#16a34a" stroke="#1a1423" stroke-width="2.5" />
          <path d="M 285 314 L 400 314 L 400 500 L 365 500 Z" fill="#16a34a" stroke="#1a1423" stroke-width="2.5" />
          <line x1="200" y1="318" x2="200" y2="500" stroke="#92400e" stroke-width="2.5" stroke-dasharray="12 10" opacity="0.55" />
        </g>
      `
  }
}

function renderHeldProp(prop: HeldProp | undefined): string {
  switch (prop) {
    case 'tea_cup':
      return `
        <g id="prop-tea-cup" transform="translate(46, 16)">
          <polygon points="-10,0 10,0 7,23 -7,23" fill="#d97706" stroke="#1a1423" stroke-width="2.5" />
          <ellipse cx="0" cy="0" rx="10" ry="3.8" fill="#fef3c7" stroke="#1a1423" stroke-width="2" />
          <path d="M -3 -5 Q -7 -15 -1 -25" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" opacity="0.9" />
          <path d="M 3 -6 Q 8 -16 2 -27" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" opacity="0.9" />
        </g>
      `
    case 'umbrella':
      return `
        <g id="prop-umbrella" transform="translate(38, -94)">
          <line x1="0" y1="0" x2="0" y2="116" stroke="#1a1423" stroke-width="4" stroke-linecap="round" />
          <path d="M 0 116 Q 0 129 12 129" fill="none" stroke="#b45309" stroke-width="4.5" stroke-linecap="round" />
          <path d="M -86 18 Q 0 -58 86 18 Q 44 8 0 18 Q -44 8 -86 18 Z" fill="#e11d48" stroke="#1a1423" stroke-width="3.5" />
          <path d="M -44 14 Q 0 -50 44 14" fill="#facc15" stroke="#1a1423" stroke-width="2.5" />
        </g>
      `
    case 'book':
    case 'exam_paper':
      return `
        <g id="prop-book" transform="translate(44, 14) rotate(-10)">
          <rect x="-15" y="-12" width="30" height="38" rx="3" fill="#2563eb" stroke="#1a1423" stroke-width="2.5" />
          <rect x="-11" y="-8" width="22" height="30" fill="#f8fafc" />
          <line x1="-6" y1="0" x2="6" y2="0" stroke="#94a3b8" stroke-width="2" />
          <line x1="-6" y1="7" x2="6" y2="7" stroke="#94a3b8" stroke-width="2" />
        </g>
      `
    case 'fuchka_plate':
    case 'biryani_plate':
      return `
        <g id="prop-fuchka" transform="translate(48, 20)">
          <ellipse cx="0" cy="4" rx="24" ry="10" fill="#e2e8f0" stroke="#1a1423" stroke-width="2.5" />
          <circle cx="-8" cy="1" r="6" fill="#f59e0b" stroke="#78350f" stroke-width="1.5" />
          <circle cx="4" cy="-1" r="6" fill="#f59e0b" stroke="#78350f" stroke-width="1.5" />
          <circle cx="10" cy="4" r="6" fill="#f59e0b" stroke="#78350f" stroke-width="1.5" />
        </g>
      `
    case 'rose':
      return `
        <g id="prop-rose" transform="translate(46, 8) rotate(15)">
          <line x1="0" y1="0" x2="0" y2="34" stroke="#15803d" stroke-width="3.5" stroke-linecap="round" />
          <circle cx="0" cy="-4" r="9.5" fill="#e11d48" stroke="#1a1423" stroke-width="2.2" />
          <circle cx="-2" cy="-5" r="4.5" fill="#fb7185" />
        </g>
      `
    case 'phone':
      return `
        <g id="prop-phone" transform="translate(45, 14) rotate(-12)">
          <rect x="-8" y="-14" width="16" height="28" rx="3" fill="#0f172a" stroke="#1a1423" stroke-width="2.2" />
          <rect x="-6" y="-11" width="12" height="22" rx="1" fill="#38bdf8" />
        </g>
      `
    case 'guitar':
      return `
        <g id="prop-guitar" transform="translate(26, 22) rotate(-28)">
          <ellipse cx="0" cy="14" rx="22" ry="26" fill="#d97706" stroke="#1a1423" stroke-width="3" />
          <circle cx="0" cy="8" r="7" fill="#1a1423" stroke="#fef08a" stroke-width="1.5" />
          <rect x="-4" y="-44" width="8" height="42" fill="#451a03" stroke="#1a1423" stroke-width="2.5" />
        </g>
      `
    case 'cricket_bat':
      return `
        <g id="prop-bat" transform="translate(46, 10) rotate(20)">
          <rect x="-4" y="-26" width="8" height="24" rx="2" fill="#f8fafc" stroke="#1a1423" stroke-width="2" />
          <rect x="-8" y="-2" width="16" height="54" rx="3" fill="#d97706" stroke="#1a1423" stroke-width="2.5" />
        </g>
      `
    case 'lantern':
      return `
        <g id="prop-lantern" transform="translate(46, 20)">
          <circle cx="0" cy="16" r="28" fill="url(#warm-lamp)" />
          <rect x="-9" y="4" width="18" height="24" rx="4" fill="#fef08a" stroke="#1a1423" stroke-width="2.5" />
          <polygon points="-12,4 12,4 8,-4 -8,-4" fill="#b45309" stroke="#1a1423" stroke-width="2" />
        </g>
      `
    default:
      return ''
  }
}

function renderEmotionEffect(effect: EmotionEffect | undefined, pose: CartoonPoseId): string {
  const active =
    effect && effect !== 'none'
      ? effect
      : pose === 'shocked'
        ? 'shock_bolts'
        : pose === 'angry'
          ? 'anger_vein'
          : pose === 'thinking'
            ? 'question_marks'
            : pose === 'dancing'
              ? 'music_notes'
              : pose === 'celebrating'
                ? 'sparkles'
                : pose === 'crying'
                  ? 'tears_fountain'
                  : 'none'

  switch (active) {
    case 'sweat_drops':
    case 'shock_bolts':
      return `
        <g id="fx-shock">
          <path d="M 38 -52 Q 44 -62 38 -70 Q 32 -62 38 -52 Z" fill="#38bdf8" stroke="#111827" stroke-width="1.8" />
          <path d="M -38 -48 Q -44 -58 -38 -66 Q -32 -58 -38 -48 Z" fill="#38bdf8" stroke="#111827" stroke-width="1.8" />
          <g stroke="#fde047" stroke-width="3" stroke-linecap="round">
            <line x1="-42" y1="-64" x2="-56" y2="-76" />
            <line x1="42" y1="-64" x2="56" y2="-76" />
            <line x1="0" y1="-82" x2="0" y2="-98" />
          </g>
        </g>
      `
    case 'anger_vein':
      return `
        <g id="fx-anger" transform="translate(28, -58)" stroke="#dc2626" stroke-width="3.2" fill="none" stroke-linecap="round">
          <path d="M -8 -2 Q -2 -2 -2 -8 M 2 -8 Q 2 -2 8 -2 M 8 2 Q 2 2 2 8 M -2 8 Q -2 2 -8 2" />
        </g>
      `
    case 'hearts':
      return `
        <g id="fx-hearts">
          <path d="M 36 -66 C 32 -74 20 -72 24 -60 C 26 -54 36 -48 36 -48 C 36 -48 46 -54 48 -60 C 52 -72 40 -74 36 -66 Z" fill="#f43f5e" stroke="#111827" stroke-width="2" />
          <circle cx="-36" cy="-64" r="4" fill="#fb7185" />
        </g>
      `
    case 'idea_bulb':
    case 'question_marks':
      return `
        <g id="fx-idea" transform="translate(36, -68)">
          <circle cx="0" cy="0" r="16" fill="#fef08a" stroke="#111827" stroke-width="2.2" />
          <text x="0" y="7" text-anchor="middle" font-size="20" font-weight="900" fill="#b45309">?</text>
        </g>
      `
    case 'music_notes':
      return `
        <g id="fx-music" font-weight="bold">
          <text x="-48" y="-58" font-size="22" fill="#fde047" stroke="#111827" stroke-width="0.8">♪</text>
          <text x="38" y="-62" font-size="24" fill="#f472b6" stroke="#111827" stroke-width="0.8">♫</text>
        </g>
      `
    case 'sparkles':
      return `
        <g id="fx-char-sparkles">
          <text x="-46" y="-62" font-size="18" fill="#fde047">✦</text>
          <text x="38" y="-64" font-size="20" fill="#fde047">★</text>
          <text x="0" y="-82" font-size="16" fill="#38bdf8">✦</text>
        </g>
      `
    default:
      return ''
  }
}

export function renderDetailedBanglaCharacter(spec: CartoonCharacterSpec, uidSuffix: string): string {
  const {
    preset,
    pose,
    x,
    y,
    scale = 1,
    flipHorizontal = false,
    skinColor = '#f1b582',
    hairColor = '#18181b',
    primaryColor = '#2563eb',
    secondaryColor = '#f59e0b',
    hasGlasses = preset === 'nusrat' || preset === 'ananya' || preset === 'teacher' || preset === 'dadi',
    hasBeard = preset === 'tamim' || preset === 'teacher' || preset === 'guard' || preset === 'rickshaw_mama' || preset === 'cha_mama',
    hasBackpack = preset === 'rafi' || preset === 'nusrat' || preset === 'tamim' || preset === 'ananya',
    heldProp = 'none',
    emotionEffect,
  } = spec

  const isFemale = preset === 'nusrat' || preset === 'ananya' || preset === 'khala' || preset === 'dadi'
  const isSaree = preset === 'khala' || preset === 'dadi' || spec.attireStyle === 'saree'
  const isHijab = preset === 'ananya'
  const scaleTransform = flipHorizontal ? `scale(-${scale}, ${scale})` : `scale(${scale}, ${scale})`

  // Dynamic Eyes & Eyebrows by Pose
  let eyesSvg = `
    <ellipse cx="-10" cy="-34" rx="8.2" ry="9.2" fill="#ffffff" stroke="#111827" stroke-width="2.6" />
    <ellipse cx="10" cy="-34" rx="8.2" ry="9.2" fill="#ffffff" stroke="#111827" stroke-width="2.6" />
    <circle cx="-8" cy="-34" r="4.8" fill="#1e293b" />
    <circle cx="12" cy="-34" r="4.8" fill="#1e293b" />
    <circle cx="-8" cy="-34" r="2.8" fill="#000000" />
    <circle cx="12" cy="-34" r="2.8" fill="#000000" />
    <!-- Double Anime Catchlights -->
    <circle cx="-6.2" cy="-36.5" r="2" fill="#ffffff" />
    <circle cx="13.8" cy="-36.5" r="2" fill="#ffffff" />
    <circle cx="-9.5" cy="-32" r="1" fill="#ffffff" />
    <circle cx="10.5" cy="-32" r="1" fill="#ffffff" />
    ${
      isFemale
        ? `<line x1="-18" y1="-37" x2="-22" y2="-40" stroke="#111827" stroke-width="2.4" stroke-linecap="round" />
           <line x1="18" y1="-37" x2="22" y2="-40" stroke="#111827" stroke-width="2.4" stroke-linecap="round" />`
        : ''
    }
    <path d="M -19 -46 Q -10 -51 -2 -45" stroke="#111827" stroke-width="3.4" fill="none" stroke-linecap="round" />
    <path d="M 2 -45 Q 10 -51 19 -46" stroke="#111827" stroke-width="3.4" fill="none" stroke-linecap="round" />
  `
  if (pose === 'shocked') {
    eyesSvg = `
      <ellipse cx="-10" cy="-34" rx="10" ry="12" fill="#ffffff" stroke="#111827" stroke-width="3" />
      <ellipse cx="10" cy="-34" rx="10" ry="12" fill="#ffffff" stroke="#111827" stroke-width="3" />
      <circle cx="-10" cy="-34" r="3" fill="#111827" />
      <circle cx="10" cy="-34" r="3" fill="#111827" />
      <circle cx="-9" cy="-36" r="1.4" fill="#ffffff" />
      <circle cx="11" cy="-36" r="1.4" fill="#ffffff" />
      <path d="M -20 -51 Q -10 -61 -2 -51" stroke="#111827" stroke-width="3.4" fill="none" stroke-linecap="round" />
      <path d="M 2 -51 Q 10 -61 20 -51" stroke="#111827" stroke-width="3.4" fill="none" stroke-linecap="round" />
    `
  } else if (pose === 'celebrating' || pose === 'dancing') {
    eyesSvg = `
      <path d="M -18 -33 Q -10 -45 -2 -33" stroke="#111827" stroke-width="3.8" fill="none" stroke-linecap="round" />
      <path d="M 2 -33 Q 10 -45 18 -33" stroke="#111827" stroke-width="3.8" fill="none" stroke-linecap="round" />
      <path d="M -19 -46 Q -10 -52 -2 -46" stroke="#111827" stroke-width="3" fill="none" stroke-linecap="round" />
      <path d="M 2 -46 Q 10 -52 19 -46" stroke="#111827" stroke-width="3" fill="none" stroke-linecap="round" />
    `
  } else if (pose === 'angry') {
    eyesSvg = `
      <ellipse cx="-10" cy="-33" rx="7.8" ry="7.8" fill="#ffffff" stroke="#111827" stroke-width="2.6" />
      <ellipse cx="10" cy="-33" rx="7.8" ry="7.8" fill="#ffffff" stroke="#111827" stroke-width="2.6" />
      <circle cx="-8" cy="-33" r="3.4" fill="#111827" />
      <circle cx="8" cy="-33" r="3.4" fill="#111827" />
      <path d="M -21 -41 L -2 -49" stroke="#111827" stroke-width="4.5" stroke-linecap="round" />
      <path d="M 2 -49 L 21 -41" stroke="#111827" stroke-width="4.5" stroke-linecap="round" />
    `
  } else if (pose === 'thinking') {
    eyesSvg = `
      <ellipse cx="-10" cy="-34" rx="8" ry="9" fill="#ffffff" stroke="#111827" stroke-width="2.6" />
      <ellipse cx="10" cy="-34" rx="8" ry="9" fill="#ffffff" stroke="#111827" stroke-width="2.6" />
      <circle cx="-7" cy="-37" r="4" fill="#111827" />
      <circle cx="13" cy="-37" r="4" fill="#111827" />
      <circle cx="-6" cy="-38.5" r="1.5" fill="#ffffff" />
      <circle cx="14" cy="-38.5" r="1.5" fill="#ffffff" />
      <path d="M -19 -44 L -2 -44" stroke="#111827" stroke-width="3.2" stroke-linecap="round" />
      <path d="M 2 -44 Q 11 -54 19 -46" stroke="#111827" stroke-width="3.6" fill="none" stroke-linecap="round" />
    `
  }

  let mouthSvg = `<path d="M -10 -16 Q 0 -7 10 -16" stroke="#111827" stroke-width="3.2" fill="none" stroke-linecap="round" />`
  if (pose === 'talking' || pose === 'celebrating' || pose === 'dancing') {
    mouthSvg = `
      <path d="M -13 -18 Q 0 -2 13 -18 Z" fill="#991b1b" stroke="#111827" stroke-width="2.8" />
      <path d="M -10 -18 Q 0 -12 10 -18" fill="#ffffff" />
      <ellipse cx="0" cy="-9" rx="6" ry="3.2" fill="#fb7185" />
    `
  } else if (pose === 'shocked') {
    mouthSvg = `
      <ellipse cx="0" cy="-13" rx="8.5" ry="11.5" fill="#450a0a" stroke="#111827" stroke-width="3" />
      <ellipse cx="0" cy="-7" rx="5.5" ry="3.5" fill="#fb7185" />
    `
  } else if (pose === 'angry') {
    mouthSvg = `
      <rect x="-11" y="-20" width="22" height="9" rx="2.5" fill="#ffffff" stroke="#111827" stroke-width="2.6" />
      <line x1="-11" y1="-15.5" x2="11" y2="-15.5" stroke="#111827" stroke-width="1.8" />
    `
  } else if (pose === 'crying') {
    mouthSvg = `
      <path d="M -12 -11 Q 0 -23 12 -11" stroke="#111827" stroke-width="3.2" fill="none" stroke-linecap="round" />
      <path d="M -14 -28 Q -34 -12 -40 36" stroke="#38bdf8" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M 14 -28 Q 34 -12 40 36" stroke="#38bdf8" stroke-width="5" fill="none" stroke-linecap="round" />
    `
  }

  // Detailed Hairstyle & Headwear with Glossy Highlights
  let hairSvg = ''
  if (isHijab) {
    hairSvg = `
      <path d="M -31 -30 C -40 -74 40 -74 31 -30 C 29 10 24 34 0 36 C -24 34 -29 10 -31 -30 Z" fill="${primaryColor}" stroke="#111827" stroke-width="3.2" />
      <path d="M -22 -56 Q 0 -66 22 -56" stroke="url(#hair-gloss)" stroke-width="4" fill="none" />
      <ellipse cx="0" cy="-29" rx="22" ry="26" fill="${skinColor}" stroke="#111827" stroke-width="2.8" />
      <circle cx="18" cy="-14" r="4.8" fill="#fef08a" stroke="#111827" stroke-width="1.5" />
      <circle cx="18" cy="-14" r="2" fill="#e11d48" />
    `
  } else if (isSaree) {
    hairSvg = `
      <circle cx="0" cy="-55" r="18" fill="${hairColor}" stroke="#111827" stroke-width="3" />
      <path d="M -30 -35 Q 0 -74 30 -35 L 34 24 Q 0 30 -34 24 Z" fill="${primaryColor}" stroke="#111827" stroke-width="3.2" />
      <path d="M -30 -35 Q 0 -74 30 -35" stroke="${secondaryColor}" stroke-width="5.5" fill="none" />
      <circle cx="0" cy="-41" r="3.8" fill="#dc2626" />
    `
  } else if (isFemale) {
    hairSvg = `
      <path d="M -30 -25 C -46 -8 -42 28 -26 46 C -18 26 -25 0 -22 -20 Z" fill="${hairColor}" stroke="#111827" stroke-width="3" />
      <path d="M 30 -25 C 46 -8 42 28 26 46 C 18 26 25 0 22 -20 Z" fill="${hairColor}" stroke="#111827" stroke-width="3" />
      <path d="M -28 -40 C -36 -74 0 -82 28 -40 C 32 -58 10 -76 -6 -74 C -24 -72 -32 -58 -28 -40 Z" fill="${hairColor}" stroke="#111827" stroke-width="3" />
      <path d="M -25 -46 Q -10 -36 0 -46 Q 14 -40 25 -46 Q 16 -63 0 -63 Q -16 -63 -25 -46 Z" fill="${hairColor}" stroke="#111827" stroke-width="3" />
      <path d="M -16 -62 Q 0 -70 16 -62" stroke="url(#hair-gloss)" stroke-width="4.5" fill="none" />
      <rect x="15" y="-51" width="12" height="5.5" rx="2" fill="#f43f5e" stroke="#111827" stroke-width="1.5" />
      <circle cx="0" cy="-41" r="2.8" fill="#e11d48" />
      <!-- Golden Jhumka Earrings -->
      <circle cx="-26" cy="-22" r="3" fill="#fef08a" stroke="#111827" stroke-width="1.2" />
      <polygon points="-29,-18 -23,-18 -26,-12" fill="#f59e0b" stroke="#111827" stroke-width="1.2" />
      <circle cx="26" cy="-22" r="3" fill="#fef08a" stroke="#111827" stroke-width="1.2" />
      <polygon points="23,-18 29,-18 26,-12" fill="#f59e0b" stroke="#111827" stroke-width="1.2" />
    `
  } else if (preset === 'rickshaw_mama') {
    hairSvg = `
      <path d="M -28 -42 Q 0 -68 28 -42 Q 22 -32 0 -34 Q -22 -32 -28 -42 Z" fill="#dc2626" stroke="#111827" stroke-width="3" />
      <line x1="-16" y1="-49" x2="-14" y2="-36" stroke="#ffffff" stroke-width="2.5" />
      <line x1="0" y1="-52" x2="0" y2="-35" stroke="#ffffff" stroke-width="2.5" />
      <line x1="16" y1="-49" x2="14" y2="-36" stroke="#ffffff" stroke-width="2.5" />
      <path d="M 24 -40 Q 38 -28 34 -8 Q 24 -16 18 -32 Z" fill="#b91c1c" stroke="#111827" stroke-width="2.2" />
    `
  } else if (preset === 'guard' || preset === 'policeman') {
    hairSvg = `
      <ellipse cx="0" cy="-48" rx="29" ry="12" fill="#1e293b" stroke="#111827" stroke-width="3" />
      <path d="M -26 -48 Q 0 -75 26 -48 Z" fill="${preset === 'policeman' ? '#0284c7' : '#b45309'}" stroke="#111827" stroke-width="3" />
      <circle cx="0" cy="-56" r="4.5" fill="#fef08a" stroke="#111827" stroke-width="1.5" />
    `
  } else {
    hairSvg = `
      <g fill="${hairColor}" stroke="#111827" stroke-width="3">
        <path d="M -26 -35 Q -36 -63 -18 -70 Q 0 -80 22 -67 Q 36 -58 26 -35 Q 18 -48 5 -45 Q -8 -48 -20 -42 Z" />
        <polygon points="-18,-48 -10,-66 -7,-49" />
        <polygon points="-5,-49 8,-71 11,-51" />
        <polygon points="12,-51 25,-63 18,-45" />
        <path d="M -15 -58 Q 0 -67 15 -58" stroke="url(#hair-gloss)" stroke-width="4" fill="none" />
      </g>
    `
  }

  // Dynamic Arms & Gestures by Pose
  let rightArmPath = `M 25 8 Q 42 24 46 18`
  let rightHandPos = { x: 47, y: 18 }
  let leftArmPath = `M -25 8 Q -42 28 -28 48`
  let leftHandPos = { x: -28, y: 50 }

  if (pose === 'celebrating' || pose === 'dancing') {
    leftArmPath = `M -25 8 Q -45 -22 -44 -56`
    leftHandPos = { x: -44, y: -58 }
    rightArmPath = `M 25 8 Q 45 -22 44 -56`
    rightHandPos = { x: 44, y: -58 }
  } else if (pose === 'shocked') {
    leftArmPath = `M -25 12 Q -44 -6 -22 -24`
    leftHandPos = { x: -21, y: -24 }
    rightArmPath = `M 25 12 Q 44 -6 22 -24`
    rightHandPos = { x: 21, y: -24 }
  } else if (pose === 'thinking') {
    leftArmPath = `M -25 10 Q -8 30 14 22`
    leftHandPos = { x: 16, y: 22 }
    rightArmPath = `M 25 10 Q 22 -2 10 -15`
    rightHandPos = { x: 9, y: -16 }
  } else if (pose === 'confident') {
    leftArmPath = `M -25 8 Q -48 24 -26 46`
    leftHandPos = { x: -26, y: 46 }
    rightArmPath = `M 25 8 Q 48 24 26 46`
    rightHandPos = { x: 26, y: 46 }
  }

  return `
    <g id="char-${uidSuffix}" transform="translate(${x}, ${y}) ${scaleTransform}" filter="url(#cartoon-drop-shadow)">
      <!-- Ground Shadow -->
      <ellipse cx="0" cy="116" rx="46" ry="11" fill="#0f172a" opacity="0.4" />

      <!-- Backpack -->
      ${
        hasBackpack
          ? `<g id="bag-${uidSuffix}">
               <path d="M -34 -12 Q -50 25 -30 72 Q -14 76 -8 64 Z" fill="#b91c1c" stroke="#111827" stroke-width="3.2" />
               <rect x="-39" y="26" width="12" height="24" rx="4" fill="#ef4444" stroke="#111827" stroke-width="2" />
             </g>`
          : ''
      }

      <!-- Legs & Detailed Footwear -->
      ${
        pose === 'running'
          ? `
            <path d="M -16 58 L -52 86 L -74 78" stroke="#1e293b" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" fill="none" />
            <path d="M 14 58 L 46 82 L 74 106" stroke="#1e293b" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" fill="none" />
            <ellipse cx="-78" cy="78" rx="16" ry="9" fill="#ffffff" stroke="#111827" stroke-width="2.6" />
            <ellipse cx="78" cy="108" rx="16" ry="9" fill="#ffffff" stroke="#111827" stroke-width="2.6" />
          `
          : `
            <path d="M -16 58 L -18 110" stroke="#1e293b" stroke-width="18" stroke-linecap="round" fill="none" />
            <path d="M 16 58 L 18 110" stroke="#1e293b" stroke-width="18" stroke-linecap="round" fill="none" />
            <ellipse cx="-20" cy="114" rx="15.5" ry="8" fill="#ffffff" stroke="#111827" stroke-width="2.6" />
            <path d="M -27 114 Q -20 110 -13 114" stroke="#e11d48" stroke-width="2.5" fill="none" />
            <ellipse cx="20" cy="114" rx="15.5" ry="8" fill="#ffffff" stroke="#111827" stroke-width="2.6" />
            <path d="M 13 114 Q 20 110 27 114" stroke="#e11d48" stroke-width="2.5" fill="none" />
          `
      }

      <!-- Torso & Cel-Shaded Authentic Bangladeshi Attire -->
      <path d="M -28 -2 L 28 -2 L 24 62 L -24 62 Z" fill="${primaryColor}" stroke="#111827" stroke-width="3.5" />
      <path d="M -28 -2 L 28 -2 L 24 62 L -24 62 Z" fill="url(#cel-shade-overlay)" />
      ${
        isFemale || isSaree
          ? `
            <!-- Embroidered Neckline & Flowing Dupatta / Saree Aanchal with Zari Border -->
            <path d="M -11 -2 Q 0 16 11 -2" stroke="#fef08a" stroke-width="2.6" fill="none" />
            <circle cx="0" cy="18" r="2" fill="#fef08a" />
            <circle cx="0" cy="27" r="2" fill="#fef08a" />
            <path d="M -27 0 Q -4 26 18 62 L 24 62 Q 6 20 -18 0 Z" fill="${secondaryColor}" stroke="#111827" stroke-width="2.6" />
            <path d="M -25 3 Q -3 28 19 62" stroke="#fef08a" stroke-width="1.8" stroke-dasharray="4 3" fill="none" />
          `
          : `
            <!-- Stylish Open Jacket / Panjabi Placket & Collar -->
            <path d="M -12 -2 L 12 -2 L 10 62 L -10 62 Z" fill="${secondaryColor}" stroke="#111827" stroke-width="2.5" />
            <polygon points="-26,-2 -11,-2 -18,14" fill="${primaryColor}" stroke="#111827" stroke-width="2.2" />
            <polygon points="26,-2 11,-2 18,14" fill="${primaryColor}" stroke="#111827" stroke-width="2.2" />
            <line x1="0" y1="0" x2="0" y2="34" stroke="#fef08a" stroke-width="2.5" />
          `
      }

      <!-- Expressive Left & Right Arms + Held Prop -->
      <path d="${leftArmPath}" stroke="#111827" stroke-width="14" stroke-linecap="round" fill="none" />
      <path d="${leftArmPath}" stroke="${primaryColor}" stroke-width="9" stroke-linecap="round" fill="none" />
      <circle cx="${leftHandPos.x}" cy="${leftHandPos.y}" r="6.8" fill="${skinColor}" stroke="#111827" stroke-width="2.6" />

      <path d="${rightArmPath}" stroke="#111827" stroke-width="14" stroke-linecap="round" fill="none" />
      <path d="${rightArmPath}" stroke="${primaryColor}" stroke-width="9" stroke-linecap="round" fill="none" />
      <circle cx="${rightHandPos.x}" cy="${rightHandPos.y}" r="6.8" fill="${skinColor}" stroke="#111827" stroke-width="2.6" />
      ${renderHeldProp(heldProp)}

      <!-- Neck with Chin Cel-Shadow -->
      <rect x="-9" y="-14" width="18" height="16" fill="${skinColor}" stroke="#111827" stroke-width="2.6" />
      <path d="M -9 -13 Q 0 -5 9 -13 Z" fill="#0f172a" opacity="0.22" />

      <!-- Head & Expressive Face -->
      <g id="head-${uidSuffix}">
        <circle cx="-25" cy="-30" r="7.5" fill="${skinColor}" stroke="#111827" stroke-width="2.6" />
        <circle cx="25" cy="-30" r="7.5" fill="${skinColor}" stroke="#111827" stroke-width="2.6" />
        <path d="M -24 -36 C -24 -64 24 -64 24 -36 C 24 -14 16 -5 0 -4 C -16 -5 -24 -14 -24 -36 Z" fill="${skinColor}" stroke="#111827" stroke-width="3.5" />
        ${isHijab ? hairSvg : ''}
        <!-- Rosy Blush Cheeks -->
        <ellipse cx="-15" cy="-24" rx="6.2" ry="3.6" fill="#f43f5e" opacity="0.36" />
        <ellipse cx="15" cy="-24" rx="6.2" ry="3.6" fill="#f43f5e" opacity="0.36" />
        <!-- Nose -->
        <path d="M 0 -33 Q 5 -24 0 -22" stroke="#111827" stroke-width="2.8" fill="none" stroke-linecap="round" />
        <!-- Beard / Mustache -->
        ${
          hasBeard && !isFemale
            ? `<path d="M -15 -20 Q -7 -25 0 -21 Q 7 -25 15 -20 Q 8 -16 0 -17 Q -8 -16 -15 -20 Z" fill="#18181b" stroke="#111827" stroke-width="1.8" />`
            : ''
        }
        ${eyesSvg}
        ${
          hasGlasses
            ? `
              <g stroke="#111827" stroke-width="2.8" fill="none">
                <circle cx="-10" cy="-34" r="11.2" />
                <circle cx="10" cy="-34" r="11.2" />
                <line x1="-1" y1="-34" x2="1" y2="-34" stroke-width="3.5" />
                <line x1="-15" y1="-40" x2="-9" y2="-40" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
                <line x1="5" y1="-40" x2="11" y2="-40" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
              </g>
            `
            : ''
        }
        ${mouthSvg}
        ${!isHijab ? hairSvg : ''}
        ${renderEmotionEffect(emotionEffect, pose)}
      </g>
    </g>
  `
}

function renderForegroundProps(propsList: ForegroundPropId[]): string {
  const unique = Array.from(new Set(propsList || []))
  return unique
    .map((p) => {
      switch (p) {
        case 'tea_table':
          return `
            <g id="fg-tea-table" transform="translate(248, 396)" stroke="#1a1423" stroke-width="2.8" filter="url(#cartoon-drop-shadow)">
              <rect x="0" y="18" width="114" height="14" rx="3" fill="#92400e" />
              <line x1="14" y1="32" x2="10" y2="86" stroke-width="5" />
              <line x1="100" y1="32" x2="104" y2="86" stroke-width="5" />
              <!-- Plate of Golden Singaras & Two Steaming Clay Tea Cups -->
              <ellipse cx="57" cy="14" rx="28" ry="7.5" fill="#e2e8f0" />
              <polygon points="44,14 55,0 66,14" fill="#d97706" />
              <polygon points="56,15 66,2 76,15" fill="#b45309" />
              <polygon points="18,4 30,4 28,18 20,18" fill="#c2410c" />
              <polygon points="84,4 96,4 94,18 86,18" fill="#c2410c" />
              <path d="M 24 0 Q 20 -10 26 -16" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.85" />
              <path d="M 90 0 Q 86 -10 92 -16" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.85" />
            </g>
          `
        case 'biryani_table':
          return `
            <g id="fg-biryani-table" transform="translate(242, 396)" stroke="#1a1423" stroke-width="2.8" filter="url(#cartoon-drop-shadow)">
              <rect x="0" y="18" width="122" height="14" rx="3" fill="#78350f" />
              <line x1="16" y1="32" x2="12" y2="86" stroke-width="5" />
              <line x1="106" y1="32" x2="110" y2="86" stroke-width="5" />
              <!-- Kacchi Biryani Plate with Boiled Egg & Chicken Leg -->
              <ellipse cx="58" cy="12" rx="36" ry="10" fill="#f8fafc" />
              <path d="M 28 12 Q 58 -8 88 12 Z" fill="#facc15" />
              <circle cx="48" cy="8" r="6" fill="#ffffff" />
              <circle cx="48" cy="8" r="3" fill="#f97316" />
              <ellipse cx="68" cy="7" rx="10" ry="5" fill="#b45309" />
              <rect x="100" y="-4" width="14" height="22" rx="3" fill="#16a34a" />
            </g>
          `
        case 'exam_desk':
        case 'laptop_study_desk':
          return `
            <g id="fg-study-desk" transform="translate(244, 392)" stroke="#1a1423" stroke-width="2.8" filter="url(#cartoon-drop-shadow)">
              <rect x="0" y="22" width="120" height="16" rx="3" fill="#78350f" />
              <line x1="14" y1="38" x2="10" y2="90" stroke-width="5" />
              <line x1="106" y1="38" x2="110" y2="90" stroke-width="5" />
              <!-- Stack of Books & Open Notebook / Laptop -->
              <rect x="14" y="8" width="38" height="14" rx="2" fill="#e11d48" />
              <rect x="18" y="-4" width="34" height="12" rx="2" fill="#2563eb" />
              <polygon points="62,22 106,22 100,-6 68,-6" fill="#cbd5e1" />
            </g>
          `
        case 'rooftop_kites':
          return `
            <g id="fg-kites" stroke="#1a1423" stroke-width="2">
              <polygon points="75,45 92,62 75,84 58,62" fill="#f43f5e" />
              <line x1="58" y1="62" x2="92" y2="62" />
              <path d="M 75 84 Q 65 105 82 122" fill="none" stroke="#fef08a" stroke-width="2" />
              <polygon points="165,32 178,45 165,62 152,45" fill="#facc15" />
            </g>
          `
        case 'village_pitha':
          return `
            <g id="fg-village-pitha" transform="translate(252, 410)" stroke="#1a1423" stroke-width="2.5" filter="url(#cartoon-drop-shadow)">
              <path d="M 18 32 Q 48 8 78 32 L 72 58 L 24 58 Z" fill="#b45309" />
              <ellipse cx="48" cy="24" rx="24" ry="9" fill="#78350f" />
              <circle cx="42" cy="22" r="7" fill="#f8fafc" />
              <circle cx="55" cy="22" r="7" fill="#f8fafc" />
              <path d="M 48 12 Q 42 -2 50 -14" fill="none" stroke="#ffffff" stroke-width="2.5" opacity="0.85" />
            </g>
          `
        case 'stray_cat':
          return `
            <g id="fg-bangla-cat" transform="translate(54, 434)" stroke="#1a1423" stroke-width="2.5" filter="url(#cartoon-drop-shadow)">
              <ellipse cx="0" cy="14" rx="19" ry="11.5" fill="#f97316" />
              <circle cx="-14" cy="4" r="10.5" fill="#f97316" />
              <polygon points="-22,-2 -18,-12 -12,-3" fill="#f97316" />
              <polygon points="-12,-3 -7,-12 -4,-2" fill="#f97316" />
              <circle cx="-17" cy="3" r="1.8" fill="#1a1423" />
              <circle cx="-11" cy="3" r="1.8" fill="#1a1423" />
              <path d="M 16 14 Q 32 2 28 -10" fill="none" stroke="#f97316" stroke-width="5" stroke-linecap="round" />
            </g>
          `
        case 'flying_birds':
          return `
            <g id="fg-birds" stroke="#1e1b4b" stroke-width="2.5" fill="none" stroke-linecap="round">
              <path d="M 65 48 Q 73 38 81 48 Q 89 38 97 48" />
              <path d="M 105 34 Q 112 26 119 34 Q 126 26 133 34" />
              <path d="M 142 52 Q 148 44 154 52 Q 160 44 166 52" />
            </g>
          `
        case 'potted_flowers':
          return `
            <g id="fg-flowers" transform="translate(332, 424)" stroke="#1a1423" stroke-width="2.5" filter="url(#cartoon-drop-shadow)">
              <polygon points="6,20 44,20 38,54 12,54" fill="#c2410c" />
              <circle cx="25" cy="8" r="19" fill="#15803d" />
              <circle cx="16" cy="4" r="6" fill="#facc15" stroke="#1a1423" stroke-width="1.5" />
              <circle cx="32" cy="2" r="6" fill="#f97316" stroke="#1a1423" stroke-width="1.5" />
              <circle cx="25" cy="14" r="6" fill="#ec4899" stroke="#1a1423" stroke-width="1.5" />
            </g>
          `
        default:
          return ''
      }
    })
    .join('\n')
}

function renderWeatherOverlay(effect: WeatherEffect): string {
  switch (effect) {
    case 'heavy_rain':
      return `
        <g id="fx-rain" stroke="#bae6fd" stroke-width="1.8" stroke-linecap="round" opacity="0.68">
          <line x1="35" y1="10" x2="12" y2="85" />
          <line x1="95" y1="25" x2="72" y2="100" />
          <line x1="165" y1="5" x2="142" y2="80" />
          <line x1="235" y1="30" x2="212" y2="105" />
          <line x1="315" y1="15" x2="292" y2="90" />
          <line x1="375" y1="20" x2="352" y2="95" />
          <line x1="55" y1="145" x2="32" y2="220" />
          <line x1="135" y1="165" x2="112" y2="240" />
          <line x1="215" y1="150" x2="192" y2="225" />
          <line x1="295" y1="175" x2="272" y2="250" />
          <line x1="365" y1="155" x2="342" y2="230" />
          <line x1="75" y1="295" x2="52" y2="370" />
          <line x1="185" y1="310" x2="162" y2="385" />
          <line x1="285" y1="295" x2="262" y2="370" />
          <line x1="355" y1="320" x2="332" y2="395" />
        </g>
      `
    case 'sunbeams':
      return `
        <g id="fx-sunbeams" opacity="0.18" fill="#fef08a">
          <polygon points="300,0 385,0 145,500 25,500" />
          <polygon points="215,0 275,0 40,500 -20,500" />
        </g>
      `
    case 'golden_fireflies':
    case 'sparkles':
      return `
        <g id="fx-sparkles" fill="#fef08a">
          <circle cx="48" cy="195" r="4" opacity="0.9" />
          <circle cx="48" cy="195" r="12" fill="url(#warm-lamp)" />
          <circle cx="342" cy="185" r="4.5" opacity="0.9" />
          <circle cx="342" cy="185" r="14" fill="url(#warm-lamp)" />
          <circle cx="115" cy="135" r="3.5" opacity="0.85" />
          <circle cx="285" cy="140" r="3.5" opacity="0.85" />
          <circle cx="72" cy="310" r="4" opacity="0.85" />
          <circle cx="330" cy="295" r="4" opacity="0.85" />
        </g>
      `
    case 'romance_petals':
    case 'breeze_leaves':
      return `
        <g id="fx-petals" fill="${effect === 'romance_petals' ? '#fb7185' : '#22c55e'}" stroke="#1a1423" stroke-width="1.2">
          <ellipse cx="55" cy="140" rx="7.5" ry="3.8" transform="rotate(25 55 140)" />
          <ellipse cx="145" cy="95" rx="6.5" ry="3.2" transform="rotate(-18 145 95)" />
          <ellipse cx="275" cy="125" rx="7.5" ry="3.8" transform="rotate(35 275 125)" />
          <ellipse cx="345" cy="180" rx="7" ry="3.5" transform="rotate(-28 345 180)" />
          <ellipse cx="85" cy="260" rx="7.5" ry="3.8" transform="rotate(15 85 260)" />
        </g>
      `
    default:
      return ''
  }
}

export function composeBanglaCartoonSvg(blueprint: BanglaCartoonBlueprint): string {
  const hasTwoChars = Boolean(blueprint.secondaryCharacter?.enabled)
  const primarySpec: CartoonCharacterSpec = {
    ...blueprint.primaryCharacter,
    x: hasTwoChars ? 128 : blueprint.primaryCharacter.x || 195,
    y: blueprint.primaryCharacter.y || 355,
    scale: hasTwoChars ? 0.98 : blueprint.primaryCharacter.scale || 1.06,
  }

  const secondarySpec: CartoonCharacterSpec | null =
    hasTwoChars && blueprint.secondaryCharacter
      ? {
          ...blueprint.secondaryCharacter,
          x: blueprint.secondaryCharacter.x || 278,
          y: blueprint.secondaryCharacter.y || 358,
          scale: blueprint.secondaryCharacter.scale || 0.96,
          flipHorizontal: true,
        }
      : null

  const safeCustomSvg = (blueprint.customSvgElements || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<\/?svg[^>]*>/gi, '')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
    ${renderSkyAndDefs(blueprint.skyTheme)}
    ${renderSkyCelestial(blueprint.skyTheme)}
    ${renderEnvironment(blueprint.environment, blueprint.signboardText)}
    ${safeCustomSvg ? `<g id="gemini-custom-midground">${safeCustomSvg}</g>` : ''}
    <rect width="400" height="500" fill="url(#comic-halftone)" pointer-events="none" />
    ${secondarySpec ? renderDetailedBanglaCharacter(secondarySpec, 'secondary') : ''}
    ${renderDetailedBanglaCharacter(primarySpec, 'primary')}
    ${renderForegroundProps(blueprint.foregroundProps)}
    ${renderWeatherOverlay(blueprint.weatherEffect)}
  </svg>`
}
