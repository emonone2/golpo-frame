import type { ComicSetting, GenreId } from '../../types'

interface BackgroundProps {
  setting: ComicSetting
  genre: GenreId
}

export function CartoonBackground({ setting, genre }: BackgroundProps) {
  switch (setting) {
    case 'campus':
      return (
        <g id="bg-campus">
          {/* Warm Campus Sky */}
          <rect width="400" height="500" fill="url(#sky-campus)" />
          
          {/* Curzon Hall / DU Neoclassical Architecture */}
          {/* Main Hall Facade */}
          <rect x="50" y="70" width="300" height="230" fill="#c46244" stroke="#22181c" strokeWidth="3" />
          <rect x="65" y="80" width="270" height="20" fill="#e89874" stroke="#22181c" strokeWidth="2" />
          
          {/* Central Dome / Cupola */}
          <path
            d="M 160 80 Q 200 -10 240 80 Z"
            fill="#ede6d6"
            stroke="#22181c"
            strokeWidth="3.5"
          />
          <path d="M 198 -10 L 198 -30 L 202 -30 L 202 -10 Z" fill="#e2c044" stroke="#22181c" strokeWidth="1.5" />
          <circle cx="200" cy="-32" r="4" fill="#e2c044" stroke="#22181c" strokeWidth="1.5" />
          {/* Arched Windows on dome */}
          <path d="M 180 65 Q 185 50 190 65 Z M 195 62 Q 200 47 205 62 Z M 210 65 Q 215 50 220 65 Z" fill="#44323c" />

          {/* Arched Veranda Windows */}
          <g fill="#43282f" stroke="#22181c" strokeWidth="2">
            <path d="M 85 170 Q 105 130 125 170 L 125 240 L 85 240 Z" />
            <path d="M 145 160 Q 170 115 195 160 L 195 240 L 145 240 Z" />
            <path d="M 210 160 Q 235 115 260 160 L 260 240 L 210 240 Z" />
            <path d="M 275 170 Q 295 130 315 170 L 315 240 L 275 240 Z" />
          </g>

          {/* Upper Windows */}
          <g fill="#2e1f27" stroke="#22181c" strokeWidth="1.5">
            <rect x="90" y="110" width="25" height="35" rx="3" />
            <rect x="135" y="105" width="25" height="35" rx="3" />
            <rect x="180" y="100" width="40" height="35" rx="3" />
            <rect x="240" y="105" width="25" height="35" rx="3" />
            <rect x="285" y="110" width="25" height="35" rx="3" />
          </g>

          {/* Ground Cobblestone Walkway */}
          <path d="M 0 300 L 400 300 L 400 500 L 0 500 Z" fill="#d9c5b2" stroke="#22181c" strokeWidth="3" />
          <path d="M 0 300 L 130 500 M 400 300 L 270 500 M 200 300 L 200 500" stroke="#bba188" strokeWidth="2" strokeDasharray="6 8" />

          {/* Flanking Trees */}
          <g fill="#588157" stroke="#22181c" strokeWidth="3">
            <path d="M -30 240 Q 20 180 0 120 Q -40 80 -80 150 Z" />
            <path d="M -10 160 Q 40 100 20 50 Q -30 20 -60 80 Z" fill="#3a5a40" />
            <path d="M 430 240 Q 380 180 400 120 Q 440 80 480 150 Z" />
            <path d="M 410 160 Q 360 100 380 50 Q 430 20 460 80 Z" fill="#3a5a40" />
          </g>

          {/* Flying exam sheets in breeze */}
          <g fill="#ffffff" stroke="#22181c" strokeWidth="1.5" opacity="0.9">
            <rect x="110" y="45" width="16" height="20" rx="1" transform="rotate(22 110 45)" />
            <rect x="270" y="35" width="14" height="18" rx="1" transform="rotate(-15 270 35)" />
            <rect x="330" y="70" width="15" height="20" rx="1" transform="rotate(38 330 70)" />
          </g>
        </g>
      )

    case 'classroom':
      return (
        <g id="bg-classroom">
          {/* Wall */}
          <rect width="400" height="500" fill="#fdf0d5" />
          
          {/* Window */}
          <rect x="20" y="40" width="70" height="120" fill="#bde0fe" stroke="#333" strokeWidth="3" rx="4" />
          <line x1="55" y1="40" x2="55" y2="160" stroke="#333" strokeWidth="2" />
          <line x1="20" y1="100" x2="90" y2="100" stroke="#333" strokeWidth="2" />
          
          {/* Wall Clock */}
          <circle cx="340" cy="70" r="24" fill="#ffffff" stroke="#222" strokeWidth="3" />
          <circle cx="340" cy="70" r="2" fill="#222" />
          <line x1="340" y1="70" x2="340" y2="54" stroke="#c1121f" strokeWidth="2.5" />
          <line x1="340" y1="70" x2="352" y2="70" stroke="#222" strokeWidth="2" />

          {/* Blackboard */}
          <rect x="110" y="40" width="195" height="130" fill="#283618" stroke="#603808" strokeWidth="6" rx="4" />
          <text x="125" y="70" fill="#fefae0" fontFamily="monospace" fontSize="13" fontWeight="bold">
            EXAM / QUIZ - 1
          </text>
          <text x="125" y="95" fill="#e9d8a6" fontFamily="monospace" fontSize="10">
            Q1: Solve 2x + 5 = 19
          </text>
          <text x="125" y="115" fill="#e9d8a6" fontFamily="monospace" fontSize="10">
            Q2: Explain why you are late
          </text>
          <text x="125" y="145" fill="#e63946" fontFamily="monospace" fontSize="11" fontWeight="bold">
            TIME: 00:08 MINS!
          </text>

          {/* Floor & Desks */}
          <path d="M 0 260 L 400 260 L 400 500 L 0 500 Z" fill="#bc6c25" stroke="#22181c" strokeWidth="3" />
          
          {/* Teacher podium & student bench */}
          <rect x="260" y="220" width="120" height="90" fill="#7f4f24" stroke="#22181c" strokeWidth="3" rx="3" />
          <rect x="20" y="270" width="180" height="60" fill="#936639" stroke="#22181c" strokeWidth="3" rx="2" />
          <path d="M 35 330 L 35 390 M 185 330 L 185 390" stroke="#22181c" strokeWidth="4" />
        </g>
      )

    case 'bedroom':
      return (
        <g id="bg-bedroom">
          {/* Wall (lime-warm cartoon like image 2) */}
          <rect width="400" height="500" fill="#d9ed92" />
          
          {/* Window or Poster */}
          <rect x="250" y="30" width="110" height="75" fill="#f8f9fa" stroke="#22181c" strokeWidth="3" rx="3" />
          <path d="M 285 55 Q 305 45 325 55 L 325 75 Q 305 65 285 75 Z" fill="#ffb703" stroke="#22181c" strokeWidth="1.5" />

          {/* TV on corner cabinet (directly inspired by Rehnuma's cartoon!) */}
          <rect x="290" y="125" width="85" height="60" fill="#495057" stroke="#22181c" strokeWidth="3" rx="3" />
          <rect x="297" y="132" width="71" height="42" fill="#212529" stroke="#22181c" strokeWidth="1.5" />
          <text x="312" y="157" fill="#f8f9fa" fontFamily="sans-serif" fontSize="11" fontWeight="extrabold">
            MOVIE
          </text>
          {/* TV Antenna */}
          <line x1="332" y1="125" x2="318" y2="105" stroke="#22181c" strokeWidth="2.5" />
          <line x1="332" y1="125" x2="346" y2="105" stroke="#22181c" strokeWidth="2.5" />
          {/* TV Table */}
          <rect x="275" y="185" width="115" height="110" fill="#6f4e37" stroke="#22181c" strokeWidth="3" />

          {/* Wooden Floor */}
          <path d="M 0 280 L 400 280 L 400 500 L 0 500 Z" fill="#e9c46a" stroke="#22181c" strokeWidth="3" />

          {/* Bed with blanket and pillow (just like image 2 panel 1 & 2!) */}
          <g id="bed">
            <rect x="15" y="240" width="240" height="120" fill="#ffffff" stroke="#22181c" strokeWidth="3.5" rx="6" />
            <path d="M 20 285 L 250 285 L 250 360 L 20 360 Z" fill="#e76f51" stroke="#22181c" strokeWidth="2" />
            {/* Blanket Pattern */}
            <path d="M 30 305 Q 40 295 50 305 M 70 305 Q 80 295 90 305 M 120 305 Q 130 295 140 305" stroke="#f4a261" strokeWidth="2" fill="none" />
            {/* Pillow */}
            <rect x="25" y="248" width="60" height="35" rx="8" fill="#f8f9fa" stroke="#22181c" strokeWidth="2" />
          </g>

          {/* Slippers & notebook on floor */}
          <ellipse cx="65" cy="420" rx="14" ry="7" fill="#457b9d" stroke="#22181c" strokeWidth="2" />
          <ellipse cx="95" cy="415" rx="14" ry="7" fill="#457b9d" stroke="#22181c" strokeWidth="2" />
          <rect x="260" y="390" width="28" height="36" rx="2" fill="#f1faee" stroke="#22181c" strokeWidth="1.5" transform="rotate(15 260 390)" />
        </g>
      )

    case 'hostel':
      return (
        <g id="bg-hostel">
          <rect width="400" height="500" fill="#2b2d42" />
          
          {/* Hostel Brick wall window */}
          <rect x="140" y="30" width="120" height="100" fill="#1b1c28" stroke="#8d99ae" strokeWidth="3" rx="3" />
          <circle cx="210" cy="70" r="18" fill="#ffea00" opacity="0.8" />
          <path d="M 140 80 L 260 80 M 200 30 L 200 130" stroke="#8d99ae" strokeWidth="2" />

          {/* Bunk Bed */}
          <g stroke="#edf2f4" strokeWidth="3">
            <line x1="30" y1="40" x2="30" y2="400" />
            <line x1="120" y1="40" x2="120" y2="400" />
            <rect x="30" y="110" width="90" height="20" fill="#3a86ff" stroke="#edf2f4" strokeWidth="2" />
            <rect x="30" y="260" width="90" height="20" fill="#ff006e" stroke="#edf2f4" strokeWidth="2" />
            <line x1="75" y1="130" x2="75" y2="260" />
          </g>

          {/* Study Table */}
          <rect x="230" y="240" width="150" height="140" fill="#4a4e69" stroke="#222" strokeWidth="3" rx="4" />
          
          {/* Laptop with 1% battery alert */}
          <path d="M 265 240 L 325 240 L 320 205 L 270 205 Z" fill="#ced4da" stroke="#222" strokeWidth="2" />
          <rect x="273" y="209" width="44" height="27" fill="#111827" />
          <rect x="283" y="217" width="24" height="10" fill="#ef233c" rx="1" />
          <text x="286" y="225" fill="#ffffff" fontSize="8" fontWeight="bold">1%</text>

          {/* Desk Lamp */}
          <path d="M 355 240 L 355 200 L 335 200" stroke="#e0a96d" strokeWidth="3" fill="none" />
          <polygon points="325,195 345,195 350,210 320,210" fill="#ffb703" stroke="#222" strokeWidth="1.5" />
          <polygon points="320,210 350,210 365,245 305,245" fill="#ffb703" opacity="0.25" />
        </g>
      )

    case 'canteen':
      return (
        <g id="bg-canteen">
          <rect width="400" height="500" fill="#faedcd" />
          
          {/* Canteen Banner */}
          <rect x="40" y="25" width="320" height="60" fill="#d4a373" stroke="#22181c" strokeWidth="3.5" rx="6" />
          <text x="65" y="52" fill="#2b2d42" fontFamily="sans-serif" fontSize="16" fontWeight="extrabold">
            ঢাকা ক্যাফে · BIRYANI SPECIAL
          </text>
          <text x="130" y="72" fill="#8d0801" fontFamily="sans-serif" fontSize="11" fontWeight="bold">
            গরম চা ও নাস্তা · শেষ প্লেট!
          </text>

          {/* Stainless Steel Canteen Counter */}
          <rect x="0" y="250" width="400" height="120" fill="#adb5bd" stroke="#22181c" strokeWidth="3" />
          <rect x="0" y="250" width="400" height="15" fill="#ced4da" stroke="#22181c" strokeWidth="2" />

          {/* Big Tea Kettle with curling steam */}
          <ellipse cx="80" cy="235" rx="30" ry="22" fill="#6c757d" stroke="#22181c" strokeWidth="3" />
          <rect x="70" y="200" width="20" height="15" fill="#495057" stroke="#22181c" strokeWidth="2" rx="2" />
          <path d="M 108 230 Q 125 215 120 205" stroke="#22181c" strokeWidth="4" fill="none" strokeLinecap="round" />
          
          {/* Steam curls */}
          <path d="M 120 195 Q 125 180 115 165 Q 120 150 128 140" stroke="#adb5bd" strokeWidth="2.5" fill="none" strokeDasharray="3 3" />
          <path d="M 128 190 Q 135 175 125 160" stroke="#adb5bd" strokeWidth="2" fill="none" strokeDasharray="3 3" />

          {/* Steel Biryani Plates Stack */}
          <g fill="#dee2e6" stroke="#22181c" strokeWidth="2">
            <ellipse cx="320" cy="245" rx="35" ry="8" />
            <ellipse cx="320" cy="239" rx="35" ry="8" />
            <ellipse cx="320" cy="233" rx="35" ry="8" />
            <ellipse cx="320" cy="227" rx="35" ry="8" fill="#ffd166" />
          </g>
        </g>
      )

    case 'gate':
      return (
        <g id="bg-gate">
          {/* Morning / Rush sky */}
          <rect width="400" height="500" fill="#ffddd2" />

          {/* Distant college silhouette */}
          <polygon points="120,240 160,200 200,240" fill="#e29578" />
          <rect x="140" y="220" width="120" height="60" fill="#e29578" />

          {/* Iron College Gate Pillars */}
          <rect x="20" y="100" width="60" height="280" fill="#b08968" stroke="#22181c" strokeWidth="3.5" rx="3" />
          <circle cx="50" cy="85" r="16" fill="#ddb892" stroke="#22181c" strokeWidth="3" />
          <rect x="320" y="100" width="60" height="280" fill="#b08968" stroke="#22181c" strokeWidth="3.5" rx="3" />
          <circle cx="350" cy="85" r="16" fill="#ddb892" stroke="#22181c" strokeWidth="3" />

          {/* Clock on Gate Pillar */}
          <circle cx="50" cy="140" r="18" fill="#fff" stroke="#222" strokeWidth="2" />
          <line x1="50" y1="140" x2="50" y2="128" stroke="#c1121f" strokeWidth="2" />
          <line x1="50" y1="140" x2="60" y2="140" stroke="#222" strokeWidth="2" />

          {/* Heavy Iron Gate Bars */}
          <g stroke="#22181c" strokeWidth="3.5">
            <line x1="80" y1="170" x2="200" y2="170" />
            <line x1="80" y1="300" x2="200" y2="300" />
            <line x1="100" y1="150" x2="100" y2="360" />
            <line x1="130" y1="150" x2="130" y2="360" />
            <line x1="160" y1="150" x2="160" y2="360" />
            <line x1="190" y1="150" x2="190" y2="360" />
          </g>

          {/* Road */}
          <path d="M 0 360 L 400 360 L 400 500 L 0 500 Z" fill="#6c757d" stroke="#22181c" strokeWidth="3" />
        </g>
      )

    case 'rooftop':
      return (
        <g id="bg-rooftop">
          {/* Action / Drama Sunset Sky */}
          <rect width="400" height="500" fill="url(#sky-rooftop)" />

          {/* Lightning bolt if action */}
          {genre === 'action' && (
            <polygon
              points="190,10 230,90 205,100 245,180 185,115 205,105"
              fill="#ffe600"
              stroke="#ffffff"
              strokeWidth="2"
            />
          )}

          {/* Dhaka Skyline Silhouette */}
          <g fill="#2b2d42" opacity="0.95">
            <rect x="20" y="160" width="55" height="140" />
            <rect x="85" y="130" width="70" height="170" />
            <rect x="165" y="180" width="50" height="120" />
            <rect x="225" y="140" width="65" height="160" />
            <rect x="300" y="170" width="80" height="130" />
            {/* TV Antenna towers */}
            <line x1="120" y1="130" x2="120" y2="90" stroke="#2b2d42" strokeWidth="2" />
            <line x1="250" y1="140" x2="250" y2="100" stroke="#2b2d42" strokeWidth="2" />
          </g>

          {/* Concrete Rooftop Parapet Wall */}
          <rect x="0" y="270" width="400" height="230" fill="#8d99ae" stroke="#22181c" strokeWidth="3.5" />
          <rect x="0" y="270" width="400" height="20" fill="#adb5bd" stroke="#22181c" strokeWidth="2" />

          {/* Green Water Tank */}
          <rect x="300" y="210" width="75" height="70" fill="#2d6a4f" stroke="#22181c" strokeWidth="3" rx="4" />
          <line x1="300" y1="235" x2="375" y2="235" stroke="#1b4332" strokeWidth="2" />
          <line x1="300" y1="255" x2="375" y2="255" stroke="#1b4332" strokeWidth="2" />
        </g>
      )

    case 'rain':
      return (
        <g id="bg-rain">
          {/* Deep Monsoon Sky */}
          <rect width="400" height="500" fill="url(#sky-rain)" />

          {/* Heavy Layered Storm Clouds */}
          <ellipse cx="80"  cy="55"  rx="75" ry="38" fill="#1e293b" />
          <ellipse cx="60"  cy="42"  rx="52" ry="30" fill="#263547" />
          <ellipse cx="115" cy="48"  rx="55" ry="32" fill="#1e293b" />
          <ellipse cx="220" cy="60"  rx="80" ry="40" fill="#172032" />
          <ellipse cx="200" cy="44"  rx="60" ry="28" fill="#263547" />
          <ellipse cx="260" cy="50"  rx="55" ry="30" fill="#1e293b" />
          <ellipse cx="350" cy="52"  rx="68" ry="36" fill="#172032" />
          <ellipse cx="340" cy="38"  rx="50" ry="26" fill="#263547" />
          <ellipse cx="395" cy="58"  rx="45" ry="28" fill="#1e293b" />
          {/* Lower cloud layer */}
          <path d="M 0 95 Q 50 75 120 90 Q 190 65 270 88 Q 330 70 400 85 L 400 110 L 0 110 Z" fill="#0f172a" opacity="0.85" />

          {/* Distant Dhaka Skyline */}
          <g fill="#1a2535" opacity="0.75">
            <rect x="10"  y="145" width="35" height="170" />
            <rect x="50"  y="125" width="50" height="190" />
            <rect x="108" y="155" width="38" height="160" />
            <rect x="155" y="135" width="55" height="180" />
            <rect x="220" y="148" width="42" height="167" />
            <rect x="270" y="120" width="60" height="195" />
            <rect x="338" y="150" width="48" height="165" />
            {/* TV antenna */}
            <line x1="72"  y1="125" x2="72"  y2="95"  stroke="#1a2535" strokeWidth="2" />
            <line x1="182" y1="135" x2="182" y2="100" stroke="#1a2535" strokeWidth="2" />
            <line x1="298" y1="120" x2="298" y2="88"  stroke="#1a2535" strokeWidth="2" />
            {/* Window lights */}
            <rect x="58"  y="145" width="8" height="5" fill="#fef08a" opacity="0.5" />
            <rect x="72"  y="160" width="8" height="5" fill="#fef08a" opacity="0.4" />
            <rect x="163" y="150" width="8" height="5" fill="#93c5fd" opacity="0.5" />
            <rect x="278" y="140" width="8" height="5" fill="#fef08a" opacity="0.45" />
          </g>

          {/* Wet Asphalt Road */}
          <rect x="0" y="305" width="400" height="195" fill="#151d2b" />
          <line x1="200" y1="305" x2="200" y2="500" stroke="#374151" strokeWidth="3" strokeDasharray="18 14" opacity="0.5" />
          <line x1="0" y1="315" x2="400" y2="315" stroke="#374151" strokeWidth="2" opacity="0.4" />

          {/* Reflective puddles */}
          <ellipse cx="110" cy="375" rx="80" ry="16" fill="#253349" opacity="0.9" />
          <ellipse cx="110" cy="373" rx="70" ry="10" fill="url(#puddle-glow)" opacity="0.6" />
          <ellipse cx="290" cy="420" rx="65" ry="13" fill="#253349" opacity="0.85" />
          <ellipse cx="290" cy="418" rx="56" ry="8"  fill="url(#puddle-glow)" opacity="0.5" />

          {/* Street Lamp Post */}
          <line x1="330" y1="125" x2="330" y2="320" stroke="#1f2937" strokeWidth="7" />
          <path d="M 330 145 Q 350 130 360 140" fill="none" stroke="#1f2937" strokeWidth="6" />
          <rect x="350" y="138" width="28" height="14" rx="4" fill="#374151" stroke="#1f2937" strokeWidth="2" />
          <circle cx="364" cy="145" r="32" fill="url(#lamp-glow)" opacity="0.7" />
          <circle cx="364" cy="145" r="10" fill="#fef08a" opacity="0.95" />
          <ellipse cx="335" cy="360" rx="22" ry="8" fill="#fef08a" opacity="0.18" />

          {/* Colourful Umbrella */}
          <path d="M 55 345 Q 95 295 140 345 Z" fill="#ef4444" stroke="#1f2937" strokeWidth="2.5" />
          <g stroke="#b91c1c" strokeWidth="1.5" fill="none">
            <line x1="95" y1="296" x2="55"  y2="345" />
            <line x1="95" y1="296" x2="75"  y2="345" />
            <line x1="95" y1="296" x2="95"  y2="345" />
            <line x1="95" y1="296" x2="115" y2="345" />
            <line x1="95" y1="296" x2="140" y2="345" />
          </g>
          <circle cx="95" cy="297" r="3" fill="#fca5a5" />
          <path d="M 95 345 L 95 378 Q 95 392 108 392" fill="none" stroke="#92400e" strokeWidth="4" strokeLinecap="round" />

          {/* Rain streaks */}
          <g stroke="#bfdbfe" strokeWidth="1.8" opacity="0.55" strokeLinecap="round">
            <line x1="18"  y1="0"   x2="0"   y2="60" />
            <line x1="75"  y1="10"  x2="57"  y2="70" />
            <line x1="140" y1="0"   x2="122" y2="60" />
            <line x1="200" y1="15"  x2="182" y2="75" />
            <line x1="265" y1="5"   x2="247" y2="65" />
            <line x1="330" y1="12"  x2="312" y2="72" />
          </g>
          <g stroke="#93c5fd" strokeWidth="1.4" opacity="0.5" strokeLinecap="round">
            <line x1="38"  y1="80"  x2="20"  y2="145" />
            <line x1="100" y1="90"  x2="82"  y2="155" />
            <line x1="165" y1="75"  x2="147" y2="140" />
            <line x1="230" y1="85"  x2="212" y2="150" />
            <line x1="295" y1="70"  x2="277" y2="135" />
          </g>
          <g stroke="#93c5fd" strokeWidth="1.2" opacity="0.45" strokeLinecap="round">
            <line x1="22"  y1="175" x2="4"   y2="240" />
            <line x1="88"  y1="185" x2="70"  y2="250" />
            <line x1="155" y1="170" x2="137" y2="235" />
            <line x1="220" y1="180" x2="202" y2="245" />
            <line x1="285" y1="165" x2="267" y2="230" />
            <line x1="55"  y1="260" x2="37"  y2="325" />
            <line x1="120" y1="270" x2="102" y2="335" />
            <line x1="185" y1="255" x2="167" y2="320" />
            <line x1="250" y1="265" x2="232" y2="330" />
          </g>

          {/* Splash impacts on road */}
          <g stroke="#bfdbfe" strokeWidth="1.3" fill="none" opacity="0.8">
            <path d="M 55  330 Q 60  322 65  330 M 60  326 L 60  321" />
            <path d="M 150 355 Q 155 347 160 355 M 155 351 L 155 346" />
            <path d="M 230 338 Q 235 330 240 338 M 235 334 L 235 329" />
            <path d="M 315 370 Q 320 362 325 370 M 320 366 L 320 361" />
            <path d="M 90  410 Q 96  402 102 410 M 96  406 L 96  400" />
          </g>
        </g>
      )

    case 'rickshaw':
      return (
        <g id="bg-rickshaw">
          {/* Warm Morning Dhaka Haze Sky */}
          <rect width="400" height="500" fill="url(#sky-rickshaw)" />

          {/* Sun disc low in sky */}
          <circle cx="60" cy="80" r="36" fill="url(#sun-glow)" opacity="0.85" />
          <circle cx="60" cy="80" r="22" fill="#fbbf24" opacity="0.95" />

          {/* City Buildings */}
          <g fill="#b45309" opacity="0.5">
            <rect x="0"   y="55"  width="55" height="190" />
            <rect x="62"  y="30"  width="70" height="215" />
            <rect x="140" y="65"  width="58" height="180" />
            <rect x="205" y="38"  width="80" height="207" />
            <rect x="292" y="58"  width="65" height="187" />
          </g>
          {/* Building windows */}
          <g fill="#fef3c7" opacity="0.35">
            <rect x="10"  y="70"  width="10" height="8" />
            <rect x="25"  y="70"  width="10" height="8" />
            <rect x="75"  y="48"  width="10" height="8" />
            <rect x="92"  y="48"  width="10" height="8" />
            <rect x="215" y="55"  width="10" height="8" />
            <rect x="230" y="55"  width="10" height="8" />
          </g>
          {/* Overhead electric wires */}
          <g stroke="#1c1917" fill="none">
            <path d="M 0 58 Q 120 80 250 62 Q 350 75 400 60"  strokeWidth="1.8" />
            <path d="M 0 75 Q 130 95 260 78 Q 355 90 400 76"  strokeWidth="1.5" />
            <path d="M 0 92 Q 140 108 270 94 Q 360 105 400 91" strokeWidth="1.3" />
            <line x1="68"  y1="0"  x2="68"  y2="245" strokeWidth="3.5" />
            <line x1="210" y1="0"  x2="210" y2="245" strokeWidth="3.5" />
            <line x1="355" y1="0"  x2="355" y2="245" strokeWidth="3.5" />
          </g>

          {/* Asphalt Road */}
          <rect x="0" y="240" width="400" height="260" fill="#292524" />
          <line x1="35"  y1="350" x2="125" y2="350" stroke="#ca8a04" strokeWidth="7" strokeDasharray="22 16" opacity="0.8" />
          <line x1="175" y1="350" x2="265" y2="350" stroke="#ca8a04" strokeWidth="7" strokeDasharray="22 16" opacity="0.8" />
          <line x1="315" y1="350" x2="400" y2="350" stroke="#ca8a04" strokeWidth="7" strokeDasharray="22 16" opacity="0.8" />
          <line x1="0" y1="250" x2="400" y2="250" stroke="#44403c" strokeWidth="2.5" />

          {/* Rickshaw Canopy */}
          <path d="M 185 100 Q 210 50 310 55 Q 390 60 400 120 L 400 240 Q 330 225 185 240 Z"
            fill="#10b981" stroke="#1f2937" strokeWidth="3.5" />
          <path d="M 195 125 Q 290 85 395 130" fill="none" stroke="#fde047" strokeWidth="5" />
          <path d="M 200 148 Q 292 110 395 152" fill="none" stroke="#ef4444" strokeWidth="4" />
          <circle cx="308" cy="90" r="18" fill="#fde047" stroke="#1f2937" strokeWidth="2" opacity="0.9" />
          <circle cx="308" cy="90" r="9"  fill="#ef4444" />
          {/* Rickshaw seat */}
          <rect x="185" y="235" width="215" height="90" rx="6" fill="#dc2626" stroke="#1f2937" strokeWidth="3" />
          <rect x="190" y="240" width="205" height="30" rx="3" fill="#ef4444" />
          <line x1="185" y1="275" x2="400" y2="275" stroke="#9f1239" strokeWidth="2.5" />

          {/* Big rear wheel with spokes */}
          <circle cx="290" cy="390" r="72" fill="none" stroke="#111827" strokeWidth="10" />
          <circle cx="290" cy="390" r="60" fill="none" stroke="#6b7280" strokeWidth="2.5" />
          <circle cx="290" cy="390" r="14" fill="#f59e0b" stroke="#111827" strokeWidth="3" />
          <g stroke="#9ca3af" strokeWidth="2">
            <line x1="290" y1="318" x2="290" y2="462" />
            <line x1="218" y1="390" x2="362" y2="390" />
            <line x1="239" y1="339" x2="341" y2="441" />
            <line x1="341" y1="339" x2="239" y2="441" />
          </g>

          {/* Front steering & wheel */}
          <line x1="185" y1="245" x2="152" y2="300" stroke="#374151" strokeWidth="8" strokeLinecap="round" />
          <circle cx="145" cy="320" r="42" fill="none" stroke="#111827" strokeWidth="8" />
          <circle cx="145" cy="320" r="9"  fill="#f59e0b" stroke="#111827" strokeWidth="2.5" />
          <g stroke="#9ca3af" strokeWidth="1.8">
            <line x1="145" y1="278" x2="145" y2="362" />
            <line x1="103" y1="320" x2="187" y2="320" />
          </g>
          <circle cx="175" cy="250" r="7" fill="#d97706" stroke="#1f2937" strokeWidth="1.5" />
        </g>
      )

    case 'library':
      return (
        <g id="bg-library">
          {/* Deep Ambient Library Wall */}
          <rect width="400" height="500" fill="url(#bg-grad-library)" />
          <rect x="0" y="0" width="400" height="300" fill="#1c0f08" />

          {/* Tall Wooden Bookshelves */}
          <rect x="10"  y="20" width="180" height="275" fill="#5c2d0e" stroke="#2a0f02" strokeWidth="4" rx="3" />
          <rect x="210" y="20" width="180" height="275" fill="#5c2d0e" stroke="#2a0f02" strokeWidth="4" rx="3" />

          {/* Shelf dividers */}
          <line x1="10"  y1="90"  x2="190" y2="90"  stroke="#2a0f02" strokeWidth="5" />
          <line x1="10"  y1="162" x2="190" y2="162" stroke="#2a0f02" strokeWidth="5" />
          <line x1="10"  y1="232" x2="190" y2="232" stroke="#2a0f02" strokeWidth="5" />
          <line x1="210" y1="90"  x2="390" y2="90"  stroke="#2a0f02" strokeWidth="5" />
          <line x1="210" y1="162" x2="390" y2="162" stroke="#2a0f02" strokeWidth="5" />
          <line x1="210" y1="232" x2="390" y2="232" stroke="#2a0f02" strokeWidth="5" />

          {/* Books Row 1 Left */}
          <g stroke="#1b0a02" strokeWidth="1.5">
            <rect x="18"  y="32" width="14" height="58" fill="#e63946" />
            <rect x="32"  y="38" width="16" height="52" fill="#457b9d" />
            <rect x="48"  y="30" width="20" height="60" fill="#2a9d8f" />
            <rect x="68"  y="36" width="13" height="54" fill="#e76f51" />
            <rect x="81"  y="32" width="18" height="58" fill="#f4a261" />
            <rect x="99"  y="28" width="22" height="62" fill="#1d3557" />
            <rect x="121" y="35" width="16" height="55" fill="#c1121f" />
            <rect x="137" y="30" width="20" height="60" fill="#023e8a" />
            <rect x="157" y="38" width="14" height="52" fill="#0077b6" />
            <rect x="171" y="32" width="17" height="58" fill="#9d4edd" />
          </g>

          {/* Books Row 2 Left */}
          <g stroke="#1b0a02" strokeWidth="1.5">
            <rect x="18"  y="100" width="20" height="62" fill="#0077b6" />
            <rect x="38"  y="106" width="16" height="56" fill="#f77f00" />
            <rect x="54"  y="98"  width="22" height="64" fill="#003049" />
            <rect x="76"  y="104" width="14" height="58" fill="#d62828" />
            <rect x="90"  y="100" width="21" height="62" fill="#2a9d8f" />
            <rect x="111" y="108" width="18" height="54" fill="#e76f51" />
            <rect x="129" y="100" width="24" height="62" fill="#1d3557" />
            <rect x="153" y="96"  width="20" height="66" fill="#7209b7" />
          </g>

          {/* Books Row 1 Right */}
          <g stroke="#1b0a02" strokeWidth="1.5">
            <rect x="218" y="32" width="16" height="58" fill="#e63946" />
            <rect x="234" y="38" width="20" height="52" fill="#1d3557" />
            <rect x="254" y="30" width="14" height="60" fill="#f4a261" />
            <rect x="268" y="35" width="22" height="55" fill="#2a9d8f" />
            <rect x="290" y="28" width="16" height="62" fill="#457b9d" />
            <rect x="306" y="34" width="18" height="56" fill="#9d4edd" />
            <rect x="324" y="30" width="21" height="60" fill="#c1121f" />
            <rect x="345" y="38" width="14" height="52" fill="#38b000" />
          </g>

          {/* Books Row 2 Right */}
          <g stroke="#1b0a02" strokeWidth="1.5">
            <rect x="218" y="100" width="22" height="62" fill="#7209b7" />
            <rect x="240" y="106" width="18" height="56" fill="#f3722c" />
            <rect x="258" y="98"  width="24" height="64" fill="#40916c" />
            <rect x="282" y="104" width="16" height="58" fill="#b5179e" />
            <rect x="298" y="100" width="20" height="62" fill="#0077b6" />
            <rect x="318" y="108" width="18" height="54" fill="#e63946" />
          </g>

          {/* Warm Study Desk in Foreground */}
          <rect x="0" y="295" width="400" height="205" fill="#6f4e37" stroke="#2b1704" strokeWidth="4" />
          <rect x="0" y="295" width="400" height="28" fill="#936639" stroke="#2b1704" strokeWidth="2" />

          {/* Banker's Lamp */}
          <line x1="58" y1="295" x2="58" y2="260" stroke="#b45309" strokeWidth="5" />
          <ellipse cx="30" cy="250" rx="28" ry="11" fill="#166534" stroke="#14532d" strokeWidth="2.5" />
          <ellipse cx="30" cy="252" rx="22" ry="8" fill="#fef08a" opacity="0.5" />

          {/* Open hardback book */}
          <path d="M 155 320 L 200 313 L 245 320 L 240 360 L 200 353 L 160 360 Z" fill="#f8fafc" stroke="#334155" strokeWidth="2.5" />
          <line x1="200" y1="313" x2="200" y2="353" stroke="#94a3b8" strokeWidth="2" />
          <g stroke="#cbd5e1" strokeWidth="1">
            <line x1="165" y1="330" x2="196" y2="328" />
            <line x1="165" y1="338" x2="196" y2="336" />
            <line x1="204" y1="328" x2="236" y2="330" />
            <line x1="204" y1="336" x2="236" y2="338" />
          </g>

          {/* Sticky notes */}
          <rect x="280" y="310" width="55" height="42" rx="2" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" transform="rotate(4 280 310)" />
        </g>
      )

    case 'tsc':
      return (
        <g id="bg-tsc">
          {/* TSC Clear Afternoon Sky */}
          <rect width="400" height="500" fill="url(#sky-tsc)" />
          {/* Clouds */}
          <g fill="#ffffff" opacity="0.8">
            <ellipse cx="60"  cy="55" rx="42" ry="18" />
            <circle  cx="50"  cy="46" r="22" />
            <circle  cx="75"  cy="44" r="18" />
            <ellipse cx="330" cy="48" rx="50" ry="20" />
            <circle  cx="318" cy="38" r="28" />
          </g>
          {/* DU TSC Modernist Building */}
          <rect x="15"  y="90" width="165" height="155" fill="#b0bec5" stroke="#546e7a" strokeWidth="2.5" />
          <g fill="#78909c" stroke="#455a64" strokeWidth="1">
            <rect x="22"  y="100" width="151" height="18" rx="1" />
            <rect x="22"  y="126" width="151" height="18" rx="1" />
            <rect x="22"  y="152" width="151" height="18" rx="1" />
            <rect x="22"  y="178" width="151" height="18" rx="1" />
          </g>
          {/* Red Brick Paved Ground */}
          <rect x="0" y="245" width="400" height="255" fill="#8d4b2a" stroke="#5c2c16" strokeWidth="3" />
          <g stroke="#6b3520" strokeWidth="0.8" opacity="0.6">
            <line x1="0" y1="265" x2="400" y2="265" />
            <line x1="0" y1="285" x2="400" y2="285" />
            <line x1="0" y1="305" x2="400" y2="305" />
            <line x1="0" y1="325" x2="400" y2="325" />
          </g>
          {/* Banyan Tree (বটগাছ) */}
          <path d="M 295 245 Q 300 180 312 95 Q 322 165 340 245 Z" fill="#4a2c0a" stroke="#2a0f02" strokeWidth="4" />
          <circle cx="260" cy="75"  r="55" fill="#1b4332" stroke="#0a2116" strokeWidth="3" />
          <circle cx="315" cy="48"  r="65" fill="#2d6a4f" stroke="#1b4332" strokeWidth="3" />
          <circle cx="375" cy="70"  r="58" fill="#1b4332" stroke="#0a2116" strokeWidth="3" />
          <circle cx="290" cy="88"  r="48" fill="#40916c" stroke="#1b4332" strokeWidth="2.5" />
          {/* Bottola platform */}
          <ellipse cx="310" cy="280" rx="90" ry="34" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="4" />
          <ellipse cx="310" cy="270" rx="84" ry="28" fill="#dc2626" stroke="#7f1d1d" strokeWidth="2.5" />
          {/* Tea Stall */}
          <rect x="20" y="240" width="80" height="60" fill="#92400e" stroke="#1f2937" strokeWidth="2.5" rx="2" />
          <rect x="14" y="235" width="92" height="12" fill="#78350f" stroke="#1f2937" strokeWidth="2" rx="2" />
          <ellipse cx="74" cy="268" rx="11" ry="8" fill="#6b7280" stroke="#374151" strokeWidth="1.5" />
          <path d="M 60 262 Q 58 252 62 244" stroke="#d1d5db" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7" />
          {/* Pigeons */}
          <path d="M 55  70 Q 63  62 71  70 Q 79  62 87  70" fill="none" stroke="#334155" strokeWidth="2.2" />
          <ellipse cx="140" cy="330" rx="9" ry="6" fill="#64748b" />
          <circle  cx="148" cy="326" r="4" fill="#94a3b8" />
        </g>
      )

    case 'field':
      return (
        <g id="bg-field">
          {/* Bright Sunny Sky */}
          <rect width="400" height="500" fill="url(#sky-field)" />
          {/* Sun disc */}
          <circle cx="355" cy="55" r="38" fill="url(#sun-glow)" opacity="0.9" />
          <circle cx="355" cy="55" r="24" fill="#fde68a" opacity="0.95" />
          <g stroke="#fbbf24" strokeWidth="2.5" opacity="0.6" strokeLinecap="round">
            <line x1="355" y1="10" x2="355" y2="0" />
            <line x1="385" y1="22" x2="395" y2="13" />
            <line x1="325" y1="22" x2="315" y2="13" />
          </g>
          {/* Fluffy Clouds */}
          <g fill="#ffffff" opacity="0.95">
            <ellipse cx="90"  cy="70" rx="40" ry="20" />
            <circle  cx="75"  cy="58" r="26" />
            <circle  cx="108" cy="58" r="22" />
            <ellipse cx="220" cy="85" rx="35" ry="16" />
            <circle  cx="208" cy="75" r="20" />
          </g>
          {/* Distant Treeline */}
          <g fill="#1b4332" opacity="0.85">
            <circle cx="30"  cy="210" r="38" />
            <circle cx="80"  cy="205" r="44" />
            <circle cx="140" cy="210" r="38" />
            <circle cx="195" cy="207" r="42" />
            <circle cx="255" cy="210" r="36" />
            <circle cx="308" cy="206" r="42" />
            <circle cx="370" cy="210" r="38" />
          </g>
          {/* Lush Turf with mowing stripes */}
          <rect x="0" y="215" width="400" height="285" fill="#38b000" stroke="#1f6f00" strokeWidth="3" />
          <g fill="#2d9200" opacity="0.5">
            <rect x="0"   y="215" width="50" height="285" />
            <rect x="100" y="215" width="50" height="285" />
            <rect x="200" y="215" width="50" height="285" />
            <rect x="300" y="215" width="50" height="285" />
          </g>
          {/* Field markings */}
          <path d="M 0 345 Q 200 312 400 345" fill="none" stroke="#ffffff" strokeWidth="4" opacity="0.9" />
          <line x1="200" y1="215" x2="200" y2="500" stroke="#ffffff" strokeWidth="3" opacity="0.55" strokeDasharray="14 11" />
          <ellipse cx="200" cy="365" rx="55" ry="28" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.5" />
          {/* Cricket Pitch */}
          <rect x="238" y="252" width="132" height="200" fill="#cc8b52" stroke="#8b4513" strokeWidth="2.5" rx="4" />
          <line x1="240" y1="292" x2="368" y2="292" stroke="#f8fafc" strokeWidth="2.5" opacity="0.8" />
          <line x1="240" y1="412" x2="368" y2="412" stroke="#f8fafc" strokeWidth="2.5" opacity="0.8" />
          {/* Near stumps */}
          <g stroke="#582f0e" strokeWidth="4" strokeLinecap="round">
            <line x1="288" y1="272" x2="288" y2="325" />
            <line x1="298" y1="272" x2="298" y2="325" />
            <line x1="308" y1="272" x2="308" y2="325" />
          </g>
          <line x1="285" y1="272" x2="311" y2="272" stroke="#582f0e" strokeWidth="2.5" />
          {/* Cricket ball */}
          <circle cx="175" cy="390" r="11" fill="#dc2626" stroke="#1e293b" strokeWidth="2.5" />
          <path d="M 168 388 Q 175 391 182 388" fill="none" stroke="#f8fafc" strokeWidth="1.5" strokeDasharray="2 2" />
        </g>
      )

    case 'bus':
      return (
        <g id="bg-bus">
          {/* Bus ceiling */}
          <rect width="400" height="500" fill="#e8e0d0" />
          <rect x="0" y="0" width="400" height="95" fill="#2d3748" stroke="#0f172a" strokeWidth="3" />
          <g stroke="#374151" strokeWidth="2" opacity="0.6">
            <line x1="50"  y1="0" x2="50"  y2="95" />
            <line x1="100" y1="0" x2="100" y2="95" />
            <line x1="150" y1="0" x2="150" y2="95" />
            <line x1="200" y1="0" x2="200" y2="95" />
            <line x1="250" y1="0" x2="250" y2="95" />
            <line x1="300" y1="0" x2="300" y2="95" />
          </g>
          {/* Handrail */}
          <rect x="0" y="76" width="400" height="10" rx="5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
          {/* Grip straps */}
          <line x1="68"  y1="76" x2="68"  y2="122" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
          <rect x="58"  y="122" width="20" height="14" rx="4" fill="#1e293b" stroke="#94a3b8" strokeWidth="2.5" />
          <line x1="168" y1="76" x2="168" y2="118" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
          <rect x="158" y="118" width="20" height="14" rx="4" fill="#1e293b" stroke="#94a3b8" strokeWidth="2.5" />
          <line x1="268" y1="76" x2="268" y2="122" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
          <rect x="258" y="122" width="20" height="14" rx="4" fill="#1e293b" stroke="#94a3b8" strokeWidth="2.5" />
          <line x1="355" y1="76" x2="355" y2="115" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
          <rect x="345" y="115" width="20" height="14" rx="4" fill="#1e293b" stroke="#94a3b8" strokeWidth="2.5" />
          {/* Window 1 */}
          <rect x="10"  y="95" width="110" height="148" fill="#93c5fd" stroke="#1e293b" strokeWidth="9" rx="5" />
          <g fill="#1e3a5f" opacity="0.7">
            <rect x="18"  y="100" width="22" height="90" />
            <rect x="44"  y="108" width="28" height="82" />
          </g>
          <rect x="20"  y="165" width="55" height="32" rx="4" fill="#ef4444" stroke="#1e293b" strokeWidth="2" />
          {/* Window 2 */}
          <rect x="140" y="95" width="115" height="148" fill="#7dd3fc" stroke="#1e293b" strokeWidth="9" rx="5" />
          <rect x="150" y="162" width="48" height="30" rx="4" fill="#10b981" stroke="#1e293b" strokeWidth="2" />
          {/* Window 3 */}
          <rect x="272" y="95" width="110" height="148" fill="#93c5fd" stroke="#1e293b" strokeWidth="9" rx="5" />
          {/* Lower bus wall */}
          <rect x="0" y="243" width="400" height="257" fill="#c8b8a2" stroke="#0f172a" strokeWidth="3" />
          {/* Seats */}
          <rect x="10"  y="275" width="105" height="180" rx="8" fill="#e11d48" stroke="#0f172a" strokeWidth="3" />
          <rect x="15"  y="280" width="95"  height="48"  rx="4" fill="#fb7185" />
          <rect x="285" y="275" width="105" height="180" rx="8" fill="#e11d48" stroke="#0f172a" strokeWidth="3" />
          <rect x="290" y="280" width="95"  height="48"  rx="4" fill="#fb7185" />
          {/* Notice board */}
          <rect x="130" y="258" width="140" height="30" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" rx="4" />
          <text x="200" y="277" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#713f12">উঠে দাঁড়ান • টিকিট কাটুন</text>
        </g>
      )

    case 'fuchka':
      return (
        <g id="bg-fuchka">
          {/* Deep evening sky */}
          <rect width="400" height="500" fill="url(#sky-fuchka)" />
          {/* String lights wire */}
          <path d="M 0 38 Q 100 62 200 48 Q 300 65 400 42" fill="none" stroke="#4338ca" strokeWidth="2.5" />
          {/* Bulbs with glow */}
          <circle cx="60"  cy="62" r="8"  fill="#fde047" />
          <circle cx="60"  cy="62" r="22" fill="url(#bulb-glow)" />
          <circle cx="145" cy="70" r="8"  fill="#fde047" />
          <circle cx="145" cy="70" r="22" fill="url(#bulb-glow)" />
          <circle cx="230" cy="68" r="8"  fill="#fde047" />
          <circle cx="230" cy="68" r="22" fill="url(#bulb-glow)" />
          <circle cx="318" cy="72" r="8"  fill="#fde047" />
          <circle cx="318" cy="72" r="22" fill="url(#bulb-glow)" />
          {/* Stars */}
          <g fill="#fef9c3" opacity="0.6">
            <circle cx="22"  cy="18" r="1.5" />
            <circle cx="88"  cy="25" r="1.2" />
            <circle cx="175" cy="14" r="1.5" />
            <circle cx="260" cy="22" r="1.2" />
          </g>
          {/* Striped canopy */}
          <path d="M 20 118 L 380 118 L 380 148 Q 362 160 344 148 Q 326 160 308 148 Q 290 160 272 148 Q 254 160 236 148 Q 218 160 200 148 Q 182 160 164 148 Q 146 160 128 148 Q 110 160 92 148 Q 74 160 56 148 Q 38 158 20 148 Z" fill="#dc2626" stroke="#1f2937" strokeWidth="3" />
          <g fill="#fde047" opacity="0.7">
            <path d="M 340 118 L 380 118 L 380 148 Q 362 160 344 148 Z" />
            <path d="M 270 118 L 310 118 L 308 148 Q 290 160 272 148 Z" />
            <path d="M 200 118 L 240 118 L 236 148 Q 218 160 200 148 Z" />
            <path d="M 130 118 L 170 118 L 164 148 Q 146 160 128 148 Z" />
            <path d="M 60  118 L 100 118 L 92  148 Q 74  160 56  148 Z" />
          </g>
          <line x1="30"  y1="118" x2="30"  y2="208" stroke="#f8fafc" strokeWidth="4" />
          <line x1="370" y1="118" x2="370" y2="208" stroke="#f8fafc" strokeWidth="4" />
          {/* Cart */}
          <rect x="30"  y="198" width="340" height="12"  rx="3" fill="#b45309" stroke="#1f2937" strokeWidth="2.5" />
          <rect x="40"  y="210" width="320" height="170" rx="6" fill="#78350f" stroke="#1f2937" strokeWidth="3.5" />
          {/* Wheels */}
          <circle cx="100" cy="380" r="30" fill="none" stroke="#4a2c0a" strokeWidth="6" />
          <circle cx="100" cy="380" r="6"  fill="#b45309" stroke="#4a2c0a" strokeWidth="2" />
          <circle cx="300" cy="380" r="30" fill="none" stroke="#4a2c0a" strokeWidth="6" />
          <circle cx="300" cy="380" r="6"  fill="#b45309" stroke="#4a2c0a" strokeWidth="2" />
          {/* Glass Jar with crispy fuchkas */}
          <rect x="48"  y="90"  width="98" height="108" rx="8" fill="#dbeafe" stroke="#38bdf8" strokeWidth="3" opacity="0.9" />
          <ellipse cx="97" cy="90"  rx="49" ry="12" fill="#93c5fd" opacity="0.8" />
          <ellipse cx="97" cy="198" rx="49" ry="12" fill="#60a5fa" opacity="0.5" />
          <g fill="#f59e0b" stroke="#b45309" strokeWidth="1.3">
            <circle cx="70"  cy="125" r="11" />
            <circle cx="96"  cy="120" r="12" />
            <circle cx="122" cy="125" r="11" />
            <circle cx="82"  cy="143" r="12" />
            <circle cx="112" cy="142" r="11" />
            <circle cx="68"  cy="162" r="11" />
            <circle cx="96"  cy="165" r="12" />
            <circle cx="124" cy="162" r="11" />
          </g>
          {/* Tamarind water bowl */}
          <ellipse cx="210" cy="196" rx="38" ry="15" fill="#92400e" stroke="#e2e8f0" strokeWidth="3" />
          <ellipse cx="210" cy="193" rx="32" ry="10" fill="#451a03" />
          <circle  cx="202" cy="191" r="5"  fill="#84cc16" />
          {/* Condiment plate */}
          <ellipse cx="300" cy="196" rx="40" ry="16" fill="#d1d5db" stroke="#475569" strokeWidth="2.5" />
          <ellipse cx="285" cy="193" rx="10" ry="6"  fill="#fef08a" stroke="#ca8a04" strokeWidth="1.2" />
          <ellipse cx="308" cy="193" rx="9"  ry="5"  fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
          <path d="M 323 190 Q 330 185 334 193" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
          {/* Night street */}
          <rect x="0" y="380" width="400" height="120" fill="#1e293b" />
          <ellipse cx="100" cy="420" rx="45" ry="10" fill="#fde047" opacity="0.12" />
          <ellipse cx="230" cy="430" rx="40" ry="9"  fill="#fde047" opacity="0.10" />
        </g>
      )

    case 'river':
      return (
        <g id="bg-river">
          {/* Golden Sunset Sky */}
          <rect width="400" height="500" fill="url(#sky-river)" />
          {/* Sun disc — large and glowing */}
          <circle cx="200" cy="178" r="55" fill="url(#sun-glow)" opacity="0.7" />
          <circle cx="200" cy="178" r="35" fill="#fbbf24" opacity="0.95" />
          <circle cx="200" cy="178" r="22" fill="#fde68a" />
          {/* Horizon mist */}
          <rect x="0" y="198" width="400" height="16" fill="#fcbf49" opacity="0.5" />
          {/* Far shoreline silhouette */}
          <path d="M 0 195 Q 60 185 130 193 Q 200 183 270 192 Q 340 185 400 195 L 400 215 L 0 215 Z" fill="#1b4332" opacity="0.85" />
          {/* Palm trees on far shore */}
          <line x1="68"  y1="213" x2="68"  y2="173" stroke="#374151" strokeWidth="3" />
          <path d="M 68 173 Q 52 166 46 178 M 68 173 Q 84 166 90 178 M 68 173 Q 60 158 64 168" fill="none" stroke="#166534" strokeWidth="3.5" />
          <line x1="168" y1="213" x2="165" y2="170" stroke="#374151" strokeWidth="3" />
          <path d="M 165 170 Q 149 163 143 175 M 165 170 Q 181 163 187 175 M 165 170 Q 157 155 161 165" fill="none" stroke="#166534" strokeWidth="3.5" />
          <line x1="310" y1="213" x2="312" y2="172" stroke="#374151" strokeWidth="3" />
          <path d="M 312 172 Q 296 165 290 177 M 312 172 Q 328 165 334 177 M 312 172 Q 304 157 308 167" fill="none" stroke="#166534" strokeWidth="3.5" />
          {/* Birds in V-formation */}
          <g stroke="#7f1d1d" strokeWidth="2" fill="none">
            <path d="M 108 68 Q 114 61 120 68 Q 126 61 132 68" />
            <path d="M 136 55 Q 141 49 146 55 Q 151 49 156 55" />
            <path d="M 160 66 Q 165 60 170 66 Q 175 60 180 66" />
            <path d="M 182 52 Q 186 47 190 52 Q 194 47 198 52" />
          </g>
          {/* River water */}
          <rect x="0" y="213" width="400" height="287" fill="#0369a1" />
          <rect x="0" y="213" width="400" height="40" fill="#0284c7" opacity="0.8" />
          <rect x="0" y="350" width="400" height="150" fill="#075985" opacity="0.7" />
          {/* Sun path reflection */}
          <path d="M 130 220 Q 200 240 270 220" fill="none" stroke="#fbbf24" strokeWidth="18" opacity="0.18" />
          <path d="M 148 240 Q 200 252 252 240" fill="none" stroke="#fbbf24" strokeWidth="12" opacity="0.22" />
          <path d="M 160 258 Q 200 266 240 258" fill="none" stroke="#fde68a" strokeWidth="8" opacity="0.28" />
          {/* Water ripples */}
          <g stroke="#fde047" strokeWidth="2.2" opacity="0.7" strokeLinecap="round">
            <line x1="35"  y1="250" x2="108" y2="250" />
            <line x1="155" y1="268" x2="240" y2="268" />
            <line x1="82"  y1="290" x2="165" y2="290" />
            <line x1="218" y1="308" x2="328" y2="308" />
            <line x1="42"  y1="338" x2="162" y2="338" />
            <line x1="238" y1="360" x2="362" y2="360" />
            <line x1="60"  y1="395" x2="175" y2="395" />
            <line x1="220" y1="415" x2="360" y2="415" />
          </g>
          {/* Sailboat hull */}
          <path d="M 155 348 Q 195 370 310 358 Q 355 345 370 330 Q 278 388 155 348 Z" fill="#451a03" stroke="#1f2937" strokeWidth="4" />
          <path d="M 170 348 Q 240 362 330 348" fill="none" stroke="#78350f" strokeWidth="2" opacity="0.6" />
          {/* Mast and sail */}
          <line x1="248" y1="338" x2="248" y2="215" stroke="#1f2937" strokeWidth="5" strokeLinecap="round" />
          <path d="M 248 220 Q 315 238 312 318 L 248 318 Z" fill="#f8fafc" stroke="#0f172a" strokeWidth="2.5" />
          <line x1="248" y1="268" x2="310" y2="268" stroke="#e2e8f0" strokeWidth="1.2" opacity="0.7" />
          <path d="M 248 215 L 270 223 L 248 230 Z" fill="#dc2626" stroke="#1f2937" strokeWidth="1.5" />
          {/* Kashful — LEFT bank */}
          <path d="M 0 390 Q 60 375 100 500 L 0 500 Z" fill="#14532d" stroke="#052e16" strokeWidth="3" />
          <g stroke="#166534" strokeWidth="2.5" fill="none">
            <line x1="18" y1="500" x2="32"  y2="398" />
            <line x1="36" y1="500" x2="48"  y2="385" />
            <line x1="55" y1="500" x2="65"  y2="395" />
            <line x1="75" y1="500" x2="82"  y2="378" />
          </g>
          <g stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M 32 398 Q 42 383 38 368 M 32 398 Q 22 383 26 368" />
            <path d="M 48 385 Q 58 370 54 354 M 48 385 Q 38 370 42 354" />
            <path d="M 65 395 Q 76 380 72 364 M 65 395 Q 54 380 58 364" />
            <path d="M 82 378 Q 94 363 90 346 M 82 378 Q 70 363 74 346" />
          </g>
          {/* Kashful — RIGHT bank edge */}
          <path d="M 370 420 Q 400 405 400 500 L 370 500 Z" fill="#14532d" opacity="0.8" />
          <g stroke="#166534" strokeWidth="2" fill="none">
            <line x1="378" y1="500" x2="385" y2="435" />
            <line x1="392" y1="500" x2="398" y2="425" />
          </g>
          <g stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round" fill="none">
            <path d="M 385 435 Q 393 422 390 410 M 385 435 Q 377 422 380 410" />
          </g>
        </g>
      )

    default:
      return (
        <g id="bg-general">
          <rect width="400" height="500" fill="url(#sky-general)" />
          {/* Halftone / Comic burst circles */}
          <circle cx="200" cy="200" r="180" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="6 8" opacity="0.4" />
          <circle cx="200" cy="200" r="130" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="4 6" opacity="0.3" />
          <path d="M 0 350 L 400 350 L 400 500 L 0 500 Z" fill="#2a2058" stroke="#ffffff" strokeWidth="1.5" opacity="0.7" />
        </g>
      )
  }
}
