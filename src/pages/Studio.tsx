import { useRef, useState } from 'react'
import { Button, ButtonLink } from '../components/Button'
import { DEFAULT_PRESETS } from '../components/cartoon/CartoonCharacters'
import PanelArt from '../components/PanelArt'
import { EmptyState, ErrorState } from '../components/States'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { drafts } from '../data/drafts'
import { genreById, genres } from '../data/genres'
import { exportComicStripToPng, exportSinglePanelToPng, exportSvgStrip } from '../lib/exportCanvas'
import { detectPose, detectSetting, LocalModelImageAdapter } from '../lib/image/imageAdapter'
import type { GenerationStage } from '../lib/image/imageAdapter'
import type { Route } from '../lib/router'
import { loadAllStoredProjects, uid } from '../lib/storage'
import { publishProject } from '../lib/cloud'
import { errKey, useCT } from '../lib/communityI18n'
import { saveStoryToSupabase } from '../lib/supabase/stories'
import type {
  BubbleFontSize,
  BubblePosition,
  BubbleStyle,
  CharacterPose,
  CharacterPresetId,
  CharacterVisualPreset,
  ComicSetting,
  GenreId,
  Panel,
  Project,
  TailDirection,
} from '../types'

type LoadError = 'storage' | 'notfound' | null

const blankPanel = (): Panel => ({
  id: uid(),
  scene: '',
  caption: '',
  dialogue: '',
  speaker: 'রাফি',
  setting: 'campus',
  pose: 'idle',
  characterPreset: 'rafi',
  bubbleStyle: 'speech',
  bubblePosition: 'top-left',
  tailDirection: 'bottom-right',
  fontSize: 'base',
  captionPosition: 'bottom',
})

const SETTINGS: { id: ComicSetting; labelKey: string; icon: string }[] = [
  { id: 'campus', labelKey: 'setting_campus', icon: '🏛️' },
  { id: 'classroom', labelKey: 'setting_classroom', icon: '🏫' },
  { id: 'bedroom', labelKey: 'setting_bedroom', icon: '🛏️' },
  { id: 'hostel', labelKey: 'setting_hostel', icon: '🏢' },
  { id: 'canteen', labelKey: 'setting_canteen', icon: '☕' },
  { id: 'gate', labelKey: 'setting_gate', icon: '🚪' },
  { id: 'rooftop', labelKey: 'setting_rooftop', icon: '🌇' },
  { id: 'rain', labelKey: 'setting_rain', icon: '🌧️' },
  { id: 'rickshaw', labelKey: 'setting_rickshaw', icon: '🛺' },
  { id: 'library', labelKey: 'setting_library', icon: '📚' },
  { id: 'tsc', labelKey: 'setting_tsc', icon: '🌳' },
  { id: 'field', labelKey: 'setting_field', icon: '🏏' },
  { id: 'bus', labelKey: 'setting_bus', icon: '🚌' },
  { id: 'fuchka', labelKey: 'setting_fuchka', icon: '🍜' },
  { id: 'river', labelKey: 'setting_river', icon: '⛵' },
  { id: 'general', labelKey: 'setting_general', icon: '🌌' },
]

const POSES: { id: CharacterPose; labelKey: string; icon: string }[] = [
  { id: 'idle', labelKey: 'pose_idle', icon: '🧍' },
  { id: 'confident', labelKey: 'pose_confident', icon: '😎' },
  { id: 'talking', labelKey: 'pose_talking', icon: '🗣️' },
  { id: 'shocked', labelKey: 'pose_shocked', icon: '😱' },
  { id: 'running', labelKey: 'pose_running', icon: '🏃' },
  { id: 'collapsed', labelKey: 'pose_collapsed', icon: '🛌' },
  { id: 'celebrating', labelKey: 'pose_celebrating', icon: '🎉' },
  { id: 'thinking', labelKey: 'pose_thinking', icon: '🤔' },
  { id: 'angry', labelKey: 'pose_angry', icon: '😠' },
  { id: 'crying', labelKey: 'pose_crying', icon: '😭' },
  { id: 'whispering', labelKey: 'pose_whispering', icon: '🤫' },
  { id: 'dancing', labelKey: 'pose_dancing', icon: '💃' },
]

const PRESETS: { id: CharacterPresetId; labelKey: string }[] = [
  { id: 'rafi', labelKey: 'preset_rafi' },
  { id: 'nusrat', labelKey: 'preset_nusrat' },
  { id: 'tamim', labelKey: 'preset_tamim' },
  { id: 'teacher', labelKey: 'preset_teacher' },
  { id: 'khala', labelKey: 'preset_khala' },
  { id: 'guard', labelKey: 'preset_guard' },
  { id: 'rickshaw_mama', labelKey: 'preset_rickshaw_mama' },
  { id: 'cha_mama', labelKey: 'preset_cha_mama' },
  { id: 'ananya', labelKey: 'preset_ananya' },
  { id: 'guitarist', labelKey: 'preset_guitarist' },
  { id: 'policeman', labelKey: 'preset_policeman' },
  { id: 'dadi', labelKey: 'preset_dadi' },
  { id: 'custom', labelKey: 'preset_custom' },
]

const BUBBLE_STYLES: { id: BubbleStyle; labelKey: string; icon: string }[] = [
  { id: 'speech', labelKey: 'bubble_speech', icon: '💬' },
  { id: 'thought', labelKey: 'bubble_thought', icon: '💭' },
  { id: 'shout', labelKey: 'bubble_shout', icon: '💥' },
]

const BUBBLE_POSITIONS: { id: BubblePosition; labelKey: string }[] = [
  { id: 'top-left', labelKey: 'pos_top_left' },
  { id: 'top-center', labelKey: 'pos_top_center' },
  { id: 'top-right', labelKey: 'pos_top_right' },
  { id: 'bottom-left', labelKey: 'pos_bottom_left' },
  { id: 'bottom-center', labelKey: 'pos_bottom_center' },
  { id: 'bottom-right', labelKey: 'pos_bottom_right' },
]

const TAIL_DIRECTIONS: { id: TailDirection; labelKey: string }[] = [
  { id: 'bottom-left', labelKey: 'tail_bottom_left' },
  { id: 'bottom-right', labelKey: 'tail_bottom_right' },
  { id: 'left', labelKey: 'tail_left' },
  { id: 'right', labelKey: 'tail_right' },
  { id: 'none', labelKey: 'tail_none' },
]

const FONT_SIZES: { id: BubbleFontSize; labelKey: string }[] = [
  { id: 'sm', labelKey: 'font_sm' },
  { id: 'base', labelKey: 'font_base' },
  { id: 'lg', labelKey: 'font_lg' },
]

const QUICK_SPEAKERS = ['রাফি', 'আপু', 'নুসরাত', 'তামিম', 'খালা', 'করিম স্যার']

const SKIN_SWATCHES = ['#e0a96d', '#deb887', '#c68b59', '#b07d62', '#8d5b4c']
const PRIMARY_SWATCHES = ['#8ecae6', '#f77f00', '#588157', '#c1121f', '#4361ee', '#7209b7', '#2b2d42']
const SECONDARY_SWATCHES = ['#ffb703', '#d62828', '#f8f9fa', '#1d3557', '#0077b6', '#343a40']
const HAIR_SWATCHES = ['#1a181b', '#2b2d42', '#4a2810', '#6a040f', '#b08968']

function init(route: Route): { project: Project | null; error: LoadError } {
  if (!route.id) {
    return {
      project: {
        id: uid(),
        title: '',
        summary: '',
        genre: route.genre ?? 'action',
        panels: [blankPanel()],
        updatedAt: Date.now(),
      },
      error: null,
    }
  }

  try {
    const found = loadAllStoredProjects().find((p) => p.id === route.id)
    return found ? { project: found, error: null } : { project: null, error: 'notfound' }
  } catch {
    return { project: null, error: 'storage' }
  }
}

export default function Studio({ route }: { route: Route }) {
  const { t, pick, lang } = useLang()
  const tc = useCT()
  const { user } = useAuth()
  const [{ project: initial, error }] = useState(() => init(route))
  const [project, setProject] = useState<Project | null>(initial)
  const [dirty, setDirty] = useState(false)
  const [notice, setNotice] = useState<{ text: string; bad: boolean } | null>(null)
  const [drafting, setDrafting] = useState<string | null>(null)
  const [generatingImg, setGeneratingImg] = useState<string | null>(null)
  const [genProgress, setGenProgress] = useState<{
    panelId: string
    percent: number
    stage: GenerationStage
  } | null>(null)
  const [needsScene, setNeedsScene] = useState<string | null>(null)
  const [layout, setLayout] = useState<'strip' | 'grid'>('strip')
  const [activePanelId, setActivePanelId] = useState<string | null>(initial?.panels[0]?.id ?? null)
  const [isExporting, setIsExporting] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [exportingPanelId, setExportingPanelId] = useState<string | null>(null)
  const [exportProgress, setExportProgress] = useState<string | null>(null)
  const [showMetadata, setShowMetadata] = useState(false)

  const previewContainerRef = useRef<HTMLDivElement | null>(null)

  if (error || !project) {
    return (
      <div className="px-4 py-16">
        <ErrorState
          title={t('error_title')}
          message={error === 'storage' ? t('error_storage') : t('error_notfound')}
          action={<ButtonLink href="#/dashboard">{t('back_dashboard')}</ButtonLink>}
        />
      </div>
    )
  }

  const patch = (fn: (p: Project) => Project) => {
    setProject((p) => (p ? fn(p) : p))
    setDirty(true)
    setNotice(null)
  }

  const patchPanel = (id: string, changes: Partial<Panel>) =>
    patch((p) => ({
      ...p,
      panels: p.panels.map((x) => (x.id === id ? { ...x, ...changes } : x)),
    }))

  const patchPanelColors = (panelId: string, colorChanges: Partial<CharacterVisualPreset>) => {
    patch((p) => ({
      ...p,
      panels: p.panels.map((panel) => {
        if (panel.id !== panelId) return panel
        const existingPreset = DEFAULT_PRESETS[panel.characterPreset || 'rafi']
        const currentColors = panel.colors || {}
        return {
          ...panel,
          colors: {
            ...existingPreset,
            ...currentColors,
            ...colorChanges,
          },
        }
      }),
    }))
  }

  const resetPanelColors = (panelId: string) => {
    patchPanel(panelId, { colors: undefined })
  }

  const move = (i: number, dir: -1 | 1) =>
    patch((p) => {
      const j = i + dir
      if (j < 0 || j >= p.panels.length) return p
      const panels = [...p.panels]
      ;[panels[i], panels[j]] = [panels[j], panels[i]]
      return { ...p, panels }
    })

  const duplicatePanel = (panel: Panel, index: number) => {
    const duplicated: Panel = {
      ...panel,
      id: uid(),
      caption: panel.caption ? `${panel.caption} (copy)` : '',
    }
    patch((p) => {
      const panels = [...p.panels]
      panels.splice(index + 1, 0, duplicated)
      return { ...p, panels }
    })
    setActivePanelId(duplicated.id)
    setNotice({ text: `${t('panel_n')} ${index + 1} duplicated!`, bad: false })
  }

  const setGenre = (genre: GenreId) => patch((p) => ({ ...p, genre }))

  const draft = (panel: Panel, index: number) => {
    if (!panel.scene.trim()) {
      setNeedsScene(panel.id)
      return
    }
    setNeedsScene(null)
    setDrafting(panel.id)
    const pool = drafts[project.genre]
    const pickDraft = pool[(panel.scene.length + index) % pool.length]
    window.setTimeout(() => {
      patchPanel(panel.id, {
        caption: pickDraft.caption[lang],
        dialogue: pickDraft.dialogue[lang],
      })
      setDrafting(null)
    }, 800)
  }

  const insertBengaliTestText = (panelId: string) => {
    patchPanel(panelId, {
      dialogue: '“ইয়াাহু! পরীক্ষা তো শেষ হলো; কিন্তু খালা কী বললেন? সর্বনাশ!”',
      caption: 'বিকেলে কার্জন হলের সামনে দাঁড়িয়ে এক অদ্ভুত দৃশ্য চোখে পড়ল।',
      sfx: 'ধপাস!',
      bubbleStyle: 'shout',
      fontSize: 'base',
    })
    setNotice({ text: 'Bengali punctuation and typography test inserted!', bad: false })
  }

  const getStageLabel = (stage: GenerationStage) => {
    if (lang === 'bn') {
      switch (stage) {
        case 'scene':
          return 'দৃশ্য ও চরিত্র বিশ্লেষণ করা হচ্ছে...'
        case 'background':
          return 'পটভূমি ও পরিবেশ আঁকা হচ্ছে...'
        case 'character':
          return 'কার্টুন চরিত্র ও রঙ যুক্ত করা হচ্ছে...'
        case 'finishing':
          return 'চূড়ান্ত কার্টুন প্যানেল প্রস্তুত হচ্ছে...'
      }
    }
    switch (stage) {
      case 'scene':
        return 'Analyzing scene & character...'
      case 'background':
        return 'Drawing background & setting...'
      case 'character':
        return 'Illustrating cartoon character & colors...'
      case 'finishing':
        return 'Finalizing cartoon panel...'
    }
  }

  const handleGenerateAiImage = async (panel: Panel) => {
    setGeneratingImg(panel.id)
    setGenProgress({ panelId: panel.id, percent: 6, stage: 'scene' })
    setNotice({
      text:
        lang === 'bn'
          ? '✨ Google Gemini AI দিয়ে হাই-ডিটেইল বাংলা কার্টুন ছবি তৈরি হচ্ছে (আনুমানিক সময়: ৫–৮ সেকেন্ড)...'
          : '✨ Generating high-detail Bangla cartoon illustration with Google Gemini AI (Est. time: 5–8 seconds)...',
      bad: false,
    })

    const combinedSceneText = [panel.scene, panel.caption, panel.dialogue]
      .map((s) => (s || '').trim())
      .filter(Boolean)
      .join(' । ')
    const textSetting = detectSetting(`${panel.scene || ''} ${panel.caption || ''}`, panel.dialogue || '')
    const inferredSetting =
      combinedSceneText && textSetting !== 'campus'
        ? textSetting
        : panel.setting || textSetting
    const textPose = detectPose(`${panel.scene || ''} ${panel.caption || ''}`, panel.dialogue || '')
    const inferredPose =
      combinedSceneText && textPose !== 'idle'
        ? textPose
        : panel.pose || textPose

    const adapter = new LocalModelImageAdapter()
    try {
      const url = await adapter.generatePanelIllustration({
        prompt: combinedSceneText || 'Bangladeshi student life scene',
        setting: inferredSetting,
        pose: inferredPose,
        genre: project.genre,
        characterName: panel.speaker,
        characterPreset: panel.characterPreset,
        dialogue: panel.dialogue,
        caption: panel.caption,
        colors: panel.colors as Record<string, unknown> | undefined,
        onProgress: ({ percent, stage }) => {
          setGenProgress({ panelId: panel.id, percent, stage })
        },
      })
      setGenProgress({ panelId: panel.id, percent: 100, stage: 'finishing' })
      patchPanel(panel.id, {
        imageUrl: url,
        setting: inferredSetting,
        pose: inferredPose,
      })
      setNotice({
        text:
          lang === 'bn'
            ? '🎨 ১০০% সম্পন্ন! Google Gemini AI দিয়ে হাই-ডিটেইল বাংলা কার্টুন ছবি সফলভাবে তৈরি ও যুক্ত হয়েছে!'
            : '🎨 100% Complete! Google Gemini AI high-detail Bangla cartoon illustration created and applied!',
        bad: false,
      })
    } catch (err) {
      console.error('AI image generation error:', err)
      const detail = err instanceof Error ? err.message : String(err)
      setNotice({
        text:
          lang === 'bn'
            ? `ছবি তৈরি করতে সমস্যা হয়েছে (${detail})। প্রসিডিউরাল কার্টুন বজায় রাখা হলো।`
            : `Could not generate AI illustration (${detail}). Preserving procedural cartoon.`,
        bad: true,
      })
    } finally {
      setGeneratingImg(null)
      setTimeout(() => setGenProgress(null), 600)
    }
  }

  const save = async () => {
    const toSave: Project = {
      ...project,
      title: project.title.trim() || t('untitled'),
      summary: project.summary?.trim() || project.story?.summary || '',
      isPublic: project.isPublic ?? false,
      updatedAt: Date.now(),
    }
    try {
      const saved = await saveStoryToSupabase(toSave, { isPublic: toSave.isPublic })
      setProject(saved)
      setDirty(false)
      setNotice({
        text: user ? `${t('saved')} · ${t('auth_saved_cloud')}` : t('saved'),
        bad: false,
      })
      if (!route.id) window.history.replaceState(null, '', `#/studio/${saved.id}`)
    } catch {
      setNotice({ text: t('save_failed'), bad: true })
    }
  }

  const handlePublish = async () => {
    if (!project) return
    if (!user) {
      window.location.hash = '#/login'
      return
    }
    if (project.panels.length < 1) {
      setNotice({
        text:
          lang === 'bn'
            ? 'গল্প প্রকাশ করতে কমপক্ষে ১টি প্যানেল থাকা আবশ্যক।'
            : 'You need at least 1 panel to publish a comic story.',
        bad: true,
      })
      return
    }
    setIsPublishing(true)
    setNotice(null)
    try {
      const toPublish: Project = {
        ...project,
        title: project.title.trim() || t('untitled'),
        summary: project.summary?.trim() || project.story?.summary || '',
        isPublic: true,
        updatedAt: Date.now(),
      }
      const publishedStory = await publishProject(toPublish)
      const saved = await saveStoryToSupabase(
        { ...toPublish, id: publishedStory.id, isPublic: true },
        { isPublic: true }
      )
      setProject(saved)
      setDirty(false)
      setNotice({
        text:
          lang === 'bn'
            ? '🎉 ছবিসহ গল্পটি সফলভাবে হোম পেজে প্রকাশিত হয়েছে! হোম পেজে নিয়ে যাওয়া হচ্ছে...'
            : '🎉 Story with pictures published to Home page! Redirecting...',
        bad: false,
      })
      setTimeout(() => {
        window.location.hash = '#/'
      }, 900)
    } catch (err) {
      console.error('Failed to publish story:', err)
      setNotice({
        text: tc(errKey(err)),
        bad: true,
      })
      setIsPublishing(false)
    }
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(project.title || 'golpoframe-comic').replace(/\s+/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportFullComicPng = async () => {
    if (!previewContainerRef.current) return
    const svgs = Array.from(previewContainerRef.current.querySelectorAll('svg'))
    if (svgs.length === 0) {
      setNotice({ text: 'No panels found to export.', bad: true })
      return
    }

    try {
      setIsExporting(true)
      setExportProgress(t('downloading_png'))
      await exportComicStripToPng(
        svgs,
        `${(project.title || 'golpoframe-comic').replace(/\s+/g, '-')}-webtoon.png`,
        {
          title: project.title || t('untitled'),
          summary: project.summary || project.story?.summary,
          genre: project.genre,
          onProgress: (p) => setExportProgress(p),
        }
      )
      setNotice({ text: t('download_complete'), bad: false })
    } catch (err) {
      console.warn('PNG export failed, falling back to SVG:', err)
      exportSvgStrip(svgs, project.title || 'golpoframe-comic', {
        title: project.title || t('untitled'),
      })
      setNotice({ text: t('download_error'), bad: false })
    } finally {
      setIsExporting(false)
      setExportProgress(null)
    }
  }

  const handleExportSinglePanelPng = async (panel: Panel, index: number) => {
    if (!previewContainerRef.current) return
    const svgs = Array.from(previewContainerRef.current.querySelectorAll('svg'))
    const targetSvg = svgs[index]
    if (!targetSvg) {
      setNotice({ text: `Panel ${index + 1} SVG not ready.`, bad: true })
      return
    }

    try {
      setExportingPanelId(panel.id)
      const filename = `${(project.title || 'golpoframe').replace(/\s+/g, '-')}-panel-${index + 1}.png`
      await exportSinglePanelToPng(targetSvg, filename, 2)
      setNotice({ text: `Panel ${index + 1} PNG downloaded!`, bad: false })
    } catch (err) {
      console.error('Failed to export single panel PNG:', err)
      setNotice({ text: 'Could not export panel PNG. Try browser print/screenshot.', bad: true })
    } finally {
      setExportingPanelId(null)
    }
  }

  const handleExportSvgStrip = () => {
    if (!previewContainerRef.current) return
    const svgs = Array.from(previewContainerRef.current.querySelectorAll('svg'))
    if (svgs.length === 0) return
    exportSvgStrip(svgs, project.title || 'golpoframe-comic', {
      title: project.title || t('untitled'),
    })
    setNotice({ text: 'SVG strip downloaded!', bad: false })
  }

  const scrollToPanelEditor = (panelId: string) => {
    setActivePanelId(panelId)
    const el = document.getElementById(`panel-editor-${panelId}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* HEADER SECTION: TITLE, ACTIONS & EXPORT */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-ink-900/60 p-4 sm:p-6 backdrop-blur">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-[16rem] flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">
                {t('studio_title')} · {t('project_title')}
              </span>
              <button
                type="button"
                onClick={() => setShowMetadata(!showMetadata)}
                className="text-xs text-amber-400 hover:underline"
              >
                {showMetadata ? '▲ Hide Details' : '▼ Summary & Details'}
              </button>
            </div>
            <input
              id="title"
              value={project.title}
              placeholder={t('untitled')}
              onChange={(e) => patch((p) => ({ ...p, title: e.target.value }))}
              className="!text-lg sm:!text-xl !font-extrabold"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {user && (
              <button
                type="button"
                onClick={() => patch((p) => ({ ...p, isPublic: !p.isPublic }))}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                  project.isPublic
                    ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200 shadow-sm'
                    : 'border-white/20 bg-black/40 text-slate-300 hover:bg-white/10'
                }`}
                title="Toggle public visibility"
              >
                {project.isPublic ? `🌐 ${t('auth_public_comic')}` : `🔒 ${t('auth_private_comic')}`}
              </button>
            )}
            {dirty && (
              <span className="flex items-center gap-1 rounded-full bg-amber-400/10 px-2.5 py-1 text-xs font-bold text-amber-300 border border-amber-400/20">
                ● {t('unsaved')}
              </span>
            )}
            <Button
              onClick={handlePublish}
              disabled={isPublishing || project.panels.length === 0}
              className="!bg-gradient-to-r !from-emerald-500 !to-teal-500 hover:!from-emerald-600 hover:!to-teal-600 text-white font-bold shadow-md shadow-emerald-500/25"
            >
              🚀 {isPublishing ? (lang === 'bn' ? 'প্রকাশ হচ্ছে...' : 'Publishing...') : (lang === 'bn' ? 'হোম পেজে প্রকাশ করুন' : 'Publish Story')}
            </Button>
            <Button onClick={save}>💾 {t('save')}</Button>

            {/* FULL PNG EXPORT BUTTON */}
            <Button
              variant="secondary"
              onClick={handleExportFullComicPng}
              disabled={isExporting || project.panels.length === 0}
            >
              {isExporting ? `⏳ ${exportProgress || t('downloading_png')}` : `⬇️ ${t('download_png')}`}
            </Button>

            <Button variant="ghost" onClick={handleExportSvgStrip}>
              🖼️ {t('download_svg')}
            </Button>

            <Button variant="ghost" onClick={exportJson}>
              📄 {t('export_json')}
            </Button>
          </div>
        </div>

        {/* EXPANDABLE STORY SUMMARY & METADATA SECTION */}
        {showMetadata && (
          <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4 space-y-3">
            <div>
              <label htmlFor="story-summary" className="mb-1 block text-xs font-semibold text-slate-300">
                📝 {t('story_summary_label')}
              </label>
              <textarea
                id="story-summary"
                rows={2}
                value={project.summary ?? project.story?.summary ?? ''}
                placeholder={t('story_summary_ph')}
                onChange={(e) =>
                  patch((p) => ({
                    ...p,
                    summary: e.target.value,
                    story: p.story ? { ...p.story, summary: e.target.value } : undefined,
                  }))
                }
                className="text-sm font-medium"
              />
            </div>
            {project.story?.punchline && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-400">
                  🎯 {t('story_punchline_label')}
                </label>
                <input
                  value={project.story.punchline}
                  onChange={(e) =>
                    patch((p) => ({
                      ...p,
                      story: p.story ? { ...p.story, punchline: e.target.value } : undefined,
                    }))
                  }
                  className="!py-1 !text-xs text-amber-300"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {notice && (
        <p
          role={notice.bad ? 'alert' : 'status'}
          className={`mb-5 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            notice.bad ? 'bg-rose-500/15 text-rose-200 border border-rose-500/30' : 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/30'
          }`}
        >
          {notice.text}
        </p>
      )}

      {/* GENRE SELECTOR CHIPS */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-400 mr-1">{t('genre')}:</span>
        {genres.map((g) => (
          <button
            key={g.id}
            type="button"
            aria-pressed={project.genre === g.id}
            onClick={() => setGenre(g.id)}
            className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
              project.genre === g.id
                ? 'border-fuchsia-400 bg-fuchsia-500/25 text-white shadow-lg shadow-fuchsia-500/20'
                : 'border-white/15 text-slate-300 hover:bg-white/10'
            }`}
          >
            {g.emoji} {pick(g.name)}
          </button>
        ))}
      </div>

      {/* PANEL SELECTOR STRIP / REORDER SHORTCUT BAR */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-400 mr-1">{t('select_panel')}:</span>
          {project.panels.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              onClick={() => scrollToPanelEditor(p.id)}
              className={`grid h-7 min-w-[28px] px-2 place-items-center rounded-lg text-xs font-extrabold transition ${
                activePanelId === p.id
                  ? 'bg-amber-400 text-ink-950 shadow-md shadow-amber-400/20'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          onClick={() => {
            const newP = blankPanel()
            patch((p) => ({ ...p, panels: [...p.panels, newP] }))
            setActivePanelId(newP.id)
          }}
        >
          + {t('add_panel')}
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* LEFT COLUMN: PANEL EDITORS */}
        <section aria-label={t('panels')} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>{t('panels')}</span>
              <span className="rounded-full bg-fuchsia-500/20 px-2.5 py-0.5 text-xs text-fuchsia-300">
                {project.panels.length}
              </span>
            </h2>
          </div>

          <p className="text-xs text-slate-400">{t('drafter_note')}</p>

          {project.panels.length === 0 && (
            <EmptyState
              emoji="🖼️"
              title={t('no_panels_title')}
              message={t('no_panels_desc')}
              action={
                <Button onClick={() => patch((p) => ({ ...p, panels: [blankPanel()] }))}>
                  + {t('add_panel')}
                </Button>
              }
            />
          )}

          {project.panels.map((panel, i) => {
            const isSelected = activePanelId === panel.id
            const currentPreset = DEFAULT_PRESETS[panel.characterPreset || 'rafi']
            const effectiveColors = { ...currentPreset, ...panel.colors }

            return (
              <div
                key={panel.id}
                id={`panel-editor-${panel.id}`}
                className={`card space-y-5 transition duration-200 ${
                  isSelected ? 'border-amber-400 ring-2 ring-amber-400/25 bg-ink-900/90' : ''
                }`}
                onClick={() => setActivePanelId(panel.id)}
              >
                {/* Panel Card Top Bar with Reordering & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-400 text-xs font-black text-ink-950">
                      {i + 1}
                    </span>
                    <h3 className="font-extrabold text-white">
                      {t('panel_n')} {i + 1}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Individual Panel PNG Download Button */}
                    <button
                      type="button"
                      onClick={() => handleExportSinglePanelPng(panel, i)}
                      disabled={exportingPanelId === panel.id}
                      className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition disabled:opacity-50"
                      title={t('download_panel_png')}
                    >
                      {exportingPanelId === panel.id ? '⏳ ...' : `⬇️ ${t('download_panel_png')}`}
                    </button>

                    {/* Duplicate Panel Button */}
                    <button
                      type="button"
                      onClick={() => duplicatePanel(panel, i)}
                      aria-label={t('duplicate_panel')}
                      title={t('duplicate_panel')}
                      className="rounded-lg border border-white/15 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:bg-white/10"
                    >
                      ⎘ {t('duplicate_panel')}
                    </button>

                    {/* Reorder Buttons */}
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label={t('move_up')}
                      title={t('move_up')}
                      className="rounded-lg border border-white/15 px-2 py-1 text-xs font-bold hover:bg-white/10 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === project.panels.length - 1}
                      aria-label={t('move_down')}
                      title={t('move_down')}
                      className="rounded-lg border border-white/15 px-2 py-1 text-xs font-bold hover:bg-white/10 disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        patch((p) => ({
                          ...p,
                          panels: p.panels.filter((x) => x.id !== panel.id),
                        }))
                      }
                      aria-label={t('remove')}
                      title={t('remove')}
                      className="rounded-lg border border-rose-400/40 px-2.5 py-1 text-xs font-bold text-rose-300 hover:bg-rose-500/10"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* 1. TEXT OVERLAY & SPEECH BUBBLE INSPECTOR */}
                <div className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-950/20 p-4 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-fuchsia-300 flex items-center gap-1.5">
                      💬 {t('overlay_title')}
                    </span>
                    <button
                      type="button"
                      onClick={() => insertBengaliTestText(panel.id)}
                      className="text-xs text-fuchsia-300 hover:underline"
                    >
                      🧪 {t('test_bengali')}
                    </button>
                  </div>

                  {/* Speaker Label with Quick Suggestions */}
                  <div>
                    <label
                      htmlFor={`spk-${panel.id}`}
                      className="mb-1 block text-xs font-semibold text-slate-300"
                    >
                      {t('speaker')}
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        id={`spk-${panel.id}`}
                        value={panel.speaker || ''}
                        placeholder="e.g. Rafi / রাফি"
                        onChange={(e) => patchPanel(panel.id, { speaker: e.target.value })}
                        className="!w-44 !py-1 !text-xs font-bold"
                      />
                      <div className="flex flex-wrap gap-1">
                        {QUICK_SPEAKERS.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => patchPanel(panel.id, { speaker: s })}
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition ${
                              panel.speaker === s
                                ? 'bg-amber-400 text-ink-950 font-bold'
                                : 'bg-white/10 text-slate-300 hover:bg-white/20'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bubble Style, Placement, Tail & Font Size Controls */}
                  <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label
                        htmlFor={`bstyle-${panel.id}`}
                        className="mb-1 block text-[11px] font-semibold text-slate-400"
                      >
                        {t('bubble_style_label')}
                      </label>
                      <select
                        id={`bstyle-${panel.id}`}
                        value={panel.bubbleStyle || 'speech'}
                        onChange={(e) =>
                          patchPanel(panel.id, { bubbleStyle: e.target.value as BubbleStyle })
                        }
                        className="w-full rounded-lg border border-white/15 bg-ink-900 px-2.5 py-1 text-xs text-slate-100"
                      >
                        {BUBBLE_STYLES.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.icon} {t(b.labelKey as any)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor={`bpos-${panel.id}`}
                        className="mb-1 block text-[11px] font-semibold text-slate-400"
                      >
                        {t('bubble_pos_label')}
                      </label>
                      <select
                        id={`bpos-${panel.id}`}
                        value={panel.bubblePosition || 'top-left'}
                        onChange={(e) =>
                          patchPanel(panel.id, { bubblePosition: e.target.value as BubblePosition })
                        }
                        className="w-full rounded-lg border border-white/15 bg-ink-900 px-2.5 py-1 text-xs text-slate-100"
                      >
                        {BUBBLE_POSITIONS.map((pos) => (
                          <option key={pos.id} value={pos.id}>
                            {t(pos.labelKey as any)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor={`tail-${panel.id}`}
                        className="mb-1 block text-[11px] font-semibold text-slate-400"
                      >
                        {t('tail_dir_label')}
                      </label>
                      <select
                        id={`tail-${panel.id}`}
                        value={panel.tailDirection || 'bottom-left'}
                        onChange={(e) =>
                          patchPanel(panel.id, { tailDirection: e.target.value as TailDirection })
                        }
                        className="w-full rounded-lg border border-white/15 bg-ink-900 px-2.5 py-1 text-xs text-slate-100"
                      >
                        {TAIL_DIRECTIONS.map((td) => (
                          <option key={td.id} value={td.id}>
                            {t(td.labelKey as any)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor={`fsize-${panel.id}`}
                        className="mb-1 block text-[11px] font-semibold text-slate-400"
                      >
                        {t('font_size_label')}
                      </label>
                      <select
                        id={`fsize-${panel.id}`}
                        value={panel.fontSize || 'base'}
                        onChange={(e) =>
                          patchPanel(panel.id, { fontSize: e.target.value as BubbleFontSize })
                        }
                        className="w-full rounded-lg border border-white/15 bg-ink-900 px-2.5 py-1 text-xs text-slate-100"
                      >
                        {FONT_SIZES.map((f) => (
                          <option key={f.id} value={f.id}>
                            {t(f.labelKey as any)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Caption Position Radio */}
                  <div className="flex items-center gap-4 text-xs pt-1">
                    <span className="font-semibold text-slate-400">{t('caption_pos_label')}:</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name={`cap-pos-${panel.id}`}
                        checked={(panel.captionPosition || 'bottom') === 'bottom'}
                        onChange={() => patchPanel(panel.id, { captionPosition: 'bottom' })}
                      />
                      <span>{t('caption_bottom')}</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name={`cap-pos-${panel.id}`}
                        checked={panel.captionPosition === 'top'}
                        onChange={() => patchPanel(panel.id, { captionPosition: 'top' })}
                      />
                      <span>{t('caption_top')}</span>
                    </label>
                  </div>
                </div>

                {/* 2. TEXT EDITING: DIALOGUE & CAPTION */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor={`dia-${panel.id}`}
                      className="mb-1 block text-xs font-semibold text-slate-300"
                    >
                      {t('dialogue')} (Speech Bubble)
                    </label>
                    <textarea
                      id={`dia-${panel.id}`}
                      rows={3}
                      value={panel.dialogue}
                      placeholder="e.g. ইয়াাহু! পরীক্ষা তো শেষ হলো!"
                      onChange={(e) => patchPanel(panel.id, { dialogue: e.target.value })}
                      className="font-medium text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`cap-${panel.id}`}
                      className="mb-1 block text-xs font-semibold text-slate-300"
                    >
                      {t('caption')} (Narration Box)
                    </label>
                    <textarea
                      id={`cap-${panel.id}`}
                      rows={3}
                      value={panel.caption}
                      placeholder="e.g. বিকেলে কার্জন হলের সামনে দাঁড়িয়ে এক অদ্ভুত দৃশ্য চোখে পড়ল।"
                      onChange={(e) => patchPanel(panel.id, { caption: e.target.value })}
                      className="font-medium text-sm"
                    />
                  </div>
                </div>

                {/* 3. VISUAL SETTING, POSE & SFX */}
                <div className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label
                      htmlFor={`setting-${panel.id}`}
                      className="mb-1 block text-[11px] font-semibold text-slate-300"
                    >
                      🏛️ {t('setting_label')}
                    </label>
                    <select
                      id={`setting-${panel.id}`}
                      value={panel.setting || 'campus'}
                      onChange={(e) =>
                        patchPanel(panel.id, { setting: e.target.value as ComicSetting })
                      }
                      className="w-full rounded-lg border border-white/15 bg-ink-900 px-2.5 py-1.5 text-xs text-slate-100"
                    >
                      {SETTINGS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.icon} {t(s.labelKey as any)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor={`pose-${panel.id}`}
                      className="mb-1 block text-[11px] font-semibold text-slate-300"
                    >
                      🎭 {t('pose_label')}
                    </label>
                    <select
                      id={`pose-${panel.id}`}
                      value={panel.pose || 'idle'}
                      onChange={(e) =>
                        patchPanel(panel.id, { pose: e.target.value as CharacterPose })
                      }
                      className="w-full rounded-lg border border-white/15 bg-ink-900 px-2.5 py-1.5 text-xs text-slate-100"
                    >
                      {POSES.map((pose) => (
                        <option key={pose.id} value={pose.id}>
                          {pose.icon} {t(pose.labelKey as any)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor={`preset-${panel.id}`}
                      className="mb-1 block text-[11px] font-semibold text-slate-300"
                    >
                      👤 {t('preset_label')}
                    </label>
                    <select
                      id={`preset-${panel.id}`}
                      value={panel.characterPreset || 'rafi'}
                      onChange={(e) =>
                        patchPanel(panel.id, {
                          characterPreset: e.target.value as CharacterPresetId,
                        })
                      }
                      className="w-full rounded-lg border border-white/15 bg-ink-900 px-2.5 py-1.5 text-xs text-slate-100"
                    >
                      {PRESETS.map((pr) => (
                        <option key={pr.id} value={pr.id}>
                          {t(pr.labelKey as any)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor={`sfx-${panel.id}`}
                      className="mb-1 block text-[11px] font-semibold text-slate-300"
                    >
                      💥 {t('sfx_label')}
                    </label>
                    <input
                      id={`sfx-${panel.id}`}
                      value={panel.sfx || ''}
                      placeholder={t('sfx_ph')}
                      onChange={(e) => patchPanel(panel.id, { sfx: e.target.value })}
                      className="!py-1.5 !text-xs font-bold"
                    />
                  </div>
                </div>

                {/* 4. CHARACTER COLOR CUSTOMIZATION PALETTE */}
                <div className="rounded-xl border border-amber-500/25 bg-amber-950/15 p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
                      🎨 {t('color_customize')}
                    </span>
                    {panel.colors && (
                      <button
                        type="button"
                        onClick={() => resetPanelColors(panel.id)}
                        className="text-[11px] text-amber-300 hover:underline"
                      >
                        ↺ {t('reset_colors')}
                      </button>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Skin Color */}
                    <div>
                      <span className="mb-1 block text-[11px] font-semibold text-slate-300">
                        {t('color_skin')}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {SKIN_SWATCHES.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => patchPanelColors(panel.id, { skinColor: color })}
                            style={{ backgroundColor: color }}
                            className={`h-5 w-5 rounded-full border transition ${
                              effectiveColors.skinColor === color
                                ? 'scale-125 border-white ring-2 ring-amber-400'
                                : 'border-black/50 hover:scale-110'
                            }`}
                            title={color}
                          />
                        ))}
                        <input
                          type="color"
                          value={effectiveColors.skinColor}
                          onChange={(e) => patchPanelColors(panel.id, { skinColor: e.target.value })}
                          className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
                          title="Custom Color"
                        />
                      </div>
                    </div>

                    {/* Primary Outfit */}
                    <div>
                      <span className="mb-1 block text-[11px] font-semibold text-slate-300">
                        {t('color_primary')}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {PRIMARY_SWATCHES.slice(0, 5).map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => patchPanelColors(panel.id, { primaryColor: color })}
                            style={{ backgroundColor: color }}
                            className={`h-5 w-5 rounded-full border transition ${
                              effectiveColors.primaryColor === color
                                ? 'scale-125 border-white ring-2 ring-amber-400'
                                : 'border-black/50 hover:scale-110'
                            }`}
                            title={color}
                          />
                        ))}
                        <input
                          type="color"
                          value={effectiveColors.primaryColor}
                          onChange={(e) => patchPanelColors(panel.id, { primaryColor: e.target.value })}
                          className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
                          title="Custom Color"
                        />
                      </div>
                    </div>

                    {/* Secondary Outfit */}
                    <div>
                      <span className="mb-1 block text-[11px] font-semibold text-slate-300">
                        {t('color_secondary')}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {SECONDARY_SWATCHES.slice(0, 5).map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => patchPanelColors(panel.id, { secondaryColor: color })}
                            style={{ backgroundColor: color }}
                            className={`h-5 w-5 rounded-full border transition ${
                              effectiveColors.secondaryColor === color
                                ? 'scale-125 border-white ring-2 ring-amber-400'
                                : 'border-black/50 hover:scale-110'
                            }`}
                            title={color}
                          />
                        ))}
                        <input
                          type="color"
                          value={effectiveColors.secondaryColor}
                          onChange={(e) => patchPanelColors(panel.id, { secondaryColor: e.target.value })}
                          className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
                          title="Custom Color"
                        />
                      </div>
                    </div>

                    {/* Hair Color */}
                    <div>
                      <span className="mb-1 block text-[11px] font-semibold text-slate-300">
                        {t('color_hair')}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {HAIR_SWATCHES.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => patchPanelColors(panel.id, { hairColor: color })}
                            style={{ backgroundColor: color }}
                            className={`h-5 w-5 rounded-full border transition ${
                              effectiveColors.hairColor === color
                                ? 'scale-125 border-white ring-2 ring-amber-400'
                                : 'border-black/50 hover:scale-110'
                            }`}
                            title={color}
                          />
                        ))}
                        <input
                          type="color"
                          value={effectiveColors.hairColor}
                          onChange={(e) => patchPanelColors(panel.id, { hairColor: e.target.value })}
                          className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
                          title="Custom Color"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. SCENE DESCRIPTION */}
                <div>
                  <label
                    htmlFor={`scene-${panel.id}`}
                    className="mb-1 block text-xs font-semibold text-slate-400"
                  >
                    {t('scene')}
                  </label>
                  <textarea
                    id={`scene-${panel.id}`}
                    rows={2}
                    value={panel.scene}
                    placeholder={t('scene_ph')}
                    onChange={(e) => patchPanel(panel.id, { scene: e.target.value })}
                  />
                  {needsScene === panel.id && (
                    <p role="alert" className="mt-1 text-xs text-rose-300">
                      {t('scene_required')}
                    </p>
                  )}
                </div>

                {/* 6. SAMPLE DRAFTER & GOOGLE GEMINI AI BUTTONS */}
                <div className="space-y-3 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="ghost"
                      disabled={drafting === panel.id}
                      onClick={() => draft(panel, i)}
                    >
                      ✨ {drafting === panel.id ? t('drafting') : t('draft')}
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={generatingImg === panel.id}
                      onClick={() => handleGenerateAiImage(panel)}
                    >
                      🎨{' '}
                      {generatingImg === panel.id && genProgress?.panelId === panel.id
                        ? `${t('generating_image')} (${genProgress.percent}%)`
                        : t('generate_image')}
                    </Button>
                    {panel.imageUrl && (
                      <Button
                        variant="danger"
                        onClick={() => patchPanel(panel.id, { imageUrl: undefined })}
                      >
                        {lang === 'bn' ? '🔄 কার্টুন ড্রয়িংয়ে ফিরুন' : '🔄 Reset to Procedural'}
                      </Button>
                    )}
                  </div>

                  {/* LIVE PERCENTAGE PROGRESS BAR & ESTIMATED TIME */}
                  {generatingImg === panel.id && genProgress?.panelId === panel.id && (
                    <div className="rounded-xl border border-fuchsia-500/40 bg-fuchsia-950/30 p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-fuchsia-200 flex items-center gap-1.5">
                          <span className="inline-block h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                          {getStageLabel(genProgress.stage)}
                        </span>
                        <span className="rounded-full bg-amber-400/20 border border-amber-400/40 px-2.5 py-0.5 text-amber-300 font-extrabold">
                          {genProgress.percent}%
                        </span>
                      </div>

                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink-950/90 border border-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-amber-400 to-emerald-400 transition-all duration-200"
                          style={{ width: `${genProgress.percent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-300">
                        <span>
                          {lang === 'bn'
                            ? '⚡ Google Gemini AI (ফ্রি কার্টুন ইঞ্জিন)'
                            : '⚡ Google Gemini AI (Free Cartoon Engine)'}
                        </span>
                        <span>
                          {lang === 'bn'
                            ? `আনুমানিক সময়: ~${Math.max(1, Math.ceil(((100 - genProgress.percent) / 100) * 6))} সেকেন্ড বাকি`
                            : `Est. ~${Math.max(1, Math.ceil(((100 - genProgress.percent) / 100) * 6))}s remaining`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* ── Prominent Bottom Publish Bar in Studio ── */}
          <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-300">
                  ✨ {lang === 'bn' ? 'হোম পেজে লাইভ শেয়ারিং' : 'Publish to Community'}
                </span>
                <h4 className="mt-2 text-lg font-extrabold text-white">
                  🚀 {lang === 'bn' ? 'কমিকটি কি সবার সাথে শেয়ার করতে প্রস্তুত?' : 'Ready to share your comic with everyone?'}
                </h4>
                <p className="mt-1 max-w-lg text-xs text-slate-300">
                  {lang === 'bn'
                    ? 'নিচে "হোম পেজে প্রকাশ করুন" চাপলে এই গল্পটি সরাসরি প্ল্যাটফর্মের হোম পেজে চলে যাবে এবং ওয়েবসাইটের সব ইউজার এটি তাদের হোম পেজে পড়তে ও লাইক দিতে পারবেন।'
                    : 'Publishing will immediately feature your comic on the home page community feed for all users to read.'}
                </p>
              </div>
              <Button
                onClick={handlePublish}
                disabled={isPublishing || project.panels.length === 0}
                className="!bg-emerald-500 hover:!bg-emerald-600 text-white font-extrabold px-6 py-3 text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-105"
              >
                🚀 {isPublishing ? (lang === 'bn' ? 'প্রকাশ হচ্ছে...' : 'Publishing...') : (lang === 'bn' ? 'হোম পেজে প্রকাশ করুন (Publish)' : 'Publish to Home')}
              </Button>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: PREVIEW & VERTICAL WEBTOON / GRID LAYOUT */}
        <section aria-label={t('preview')} className="lg:sticky lg:top-20 lg:self-start">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-extrabold flex items-center gap-2">
                <span>{t('preview')}</span>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/20">
                  🎨 {t('renderer_badge')}
                </span>
              </h2>
            </div>
            <div className="flex gap-1 rounded-full border border-white/15 p-1 bg-ink-900/50">
              {(['strip', 'grid'] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  aria-pressed={layout === l}
                  onClick={() => setLayout(l)}
                  className={`rounded-full px-3 py-1 text-xs font-extrabold transition ${
                    layout === l ? 'bg-amber-400 text-ink-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {l === 'strip' ? `📜 ${t('layout_strip')}` : `⊞ ${t('layout_grid')}`}
                </button>
              ))}
            </div>
          </div>

          {project.panels.length === 0 ? (
            <p className="card text-center text-sm text-slate-400">{t('no_panels_desc')}</p>
          ) : (
            <div
              className={`rounded-2xl border border-white/10 bg-[#0d0a1f] p-4 shadow-2xl ${
                layout === 'strip' ? 'max-w-md mx-auto' : ''
              }`}
            >
              {/* Webtoon Strip Header in Preview */}
              {layout === 'strip' && (
                <div className="mb-4 border-b border-fuchsia-500/30 pb-3 text-center">
                  <h3 className="text-base font-extrabold text-white">
                    {project.title || t('untitled')}
                  </h3>
                  {(project.summary || project.story?.summary) && (
                    <p className="mt-1 text-xs text-slate-300 line-clamp-2">
                      {project.summary || project.story?.summary}
                    </p>
                  )}
                  <span className="mt-1.5 inline-block text-[10px] font-bold tracking-wider text-amber-400">
                    GOLPOFRAME • {genreById[project.genre].emoji} {pick(genreById[project.genre].name).toUpperCase()}
                  </span>
                </div>
              )}

              <div
                ref={previewContainerRef}
                className={
                  layout === 'strip'
                    ? 'flex flex-col gap-5'
                    : 'grid grid-cols-2 gap-3.5'
                }
              >
                {project.panels.map((p, i) => (
                  <div key={p.id} className="relative group">
                    <PanelArt
                      genre={project.genre}
                      index={i}
                      caption={p.caption}
                      dialogue={p.dialogue}
                      scene={p.scene}
                      speaker={p.speaker}
                      setting={p.setting}
                      pose={p.pose}
                      characterPreset={p.characterPreset}
                      colors={p.colors}
                      sfx={p.sfx}
                      imageUrl={p.imageUrl}
                      bubbleStyle={p.bubbleStyle}
                      bubblePosition={p.bubblePosition}
                      tailDirection={p.tailDirection}
                      bubbleX={p.bubbleX}
                      bubbleY={p.bubbleY}
                      bubbleWidth={p.bubbleWidth}
                      fontSize={p.fontSize}
                      captionPosition={p.captionPosition}
                      className={activePanelId === p.id ? '!border-amber-400 shadow-amber-400/30 ring-2 ring-amber-400/40' : ''}
                      onBubbleClick={() => scrollToPanelEditor(p.id)}
                      onCaptionClick={() => scrollToPanelEditor(p.id)}
                    />

                    {/* Live Progress Overlay on Panel Preview while Gemini generates */}
                    {generatingImg === p.id && genProgress?.panelId === p.id && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-ink-950/80 p-6 text-center backdrop-blur-sm">
                        <div className="mb-2 text-3xl font-black text-amber-400">
                          {genProgress.percent}%
                        </div>
                        <div className="w-48 overflow-hidden rounded-full bg-white/15 h-2.5 mb-3">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-amber-400 transition-all duration-200"
                            style={{ width: `${genProgress.percent}%` }}
                          />
                        </div>
                        <p className="text-xs font-bold text-white">
                          {getStageLabel(genProgress.stage)}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-300">
                          {lang === 'bn'
                            ? `বাকি আনুমানিক ~${Math.max(1, Math.ceil(((100 - genProgress.percent) / 100) * 6))} সেকেন্ড`
                            : `~${Math.max(1, Math.ceil(((100 - genProgress.percent) / 100) * 6))}s left`}
                        </p>
                      </div>
                    )}

                    {/* Quick export hover button on preview panel */}
                    <button
                      type="button"
                      onClick={() => handleExportSinglePanelPng(p, i)}
                      disabled={exportingPanelId === p.id}
                      className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition rounded-lg bg-ink-950/80 backdrop-blur border border-white/20 px-2 py-1 text-[11px] font-bold text-white hover:bg-ink-950 shadow-lg"
                      title={t('download_panel_png')}
                    >
                      {exportingPanelId === p.id ? '⏳' : '⬇️ PNG'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Webtoon Strip Footer in Preview */}
              {layout === 'strip' && (
                <div className="mt-5 border-t border-white/10 pt-3 text-center">
                  <p className="text-[11px] text-slate-400">
                    গল্পফ্রেম • GolpoFrame AI Comic Studio
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Bottom Preview Stats and Full Download Shortcut */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-400">
            <p>
              {genreById[project.genre].emoji} {pick(genreById[project.genre].name)} · {project.panels.length} {t('panels_count')}
            </p>
            <Button
              variant="secondary"
              onClick={handleExportFullComicPng}
              disabled={isExporting || project.panels.length === 0}
            >
              {isExporting ? '⏳ ...' : `⬇️ ${t('download_png')}`}
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
