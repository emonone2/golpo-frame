import type { User } from '@supabase/supabase-js'
import type {
  DiaryEntry,
  EntryContent,
  EntryInput,
  Profile,
  Project,
  PublicStory,
  SharePlatform,
  StoryComment,
  StoryShare,
  Visibility,
} from '../types'
import { detectPose, detectSetting } from './image/imageAdapter'

const ACCOUNTS_KEY = 'golpoframe.accounts.v1'
const SESSION_KEY = 'golpoframe.session.v1'
const ENTRIES_KEY = 'golpoframe.entries.v1'
const LIKES_KEY = 'golpoframe.likes.v1'
const COMMENTS_KEY = 'golpoframe.comments.v1'
const SHARES_KEY = 'golpoframe.shares.v1'

export interface StoredAccount {
  id: string
  email: string
  phone?: string
  password: string
  username: string
  displayName: string
  bio: string
  createdAt: string
}

export interface StoredDiaryRow extends DiaryEntry {
  ownerId: string
}

function makeUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/** Deterministic UUID v4-like string from email so the same email gets a stable ID if needed */
export function deterministicUuidFromEmail(email: string): string {
  const clean = email.trim().toLowerCase()
  let h1 = 0xdeadbeef ^ clean.length
  let h2 = 0x41c6ce57 ^ clean.length
  let h3 = 0x9e3779b9 ^ clean.length
  let h4 = 0x85ebca6b ^ clean.length
  for (let i = 0; i < clean.length; i++) {
    const ch = clean.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
    h3 = Math.imul(h3 ^ ch, 2246822507)
    h4 = Math.imul(h4 ^ ch, 3266489909)
  }
  const hex = (n: number, len: number) => (n >>> 0).toString(16).padStart(8, '0').slice(0, len)
  const p1 = hex(h1, 8)
  const p2 = hex(h2, 4)
  const p3 = '4' + hex(h2 ^ h3, 3)
  const p4 = 'a' + hex(h3 ^ h4, 3)
  const p5 = hex(h4, 8) + hex(h1 ^ h4, 4)
  return `${p1}-${p2}-${p3}-${p4}-${p5}`
}

function safeReadJson<T>(key: string, fallback: T): T {
  if (typeof localStorage === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function safeWriteJson<T>(key: string, value: T): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore storage quota errors
  }
}

export function loadAccounts(): StoredAccount[] {
  const list = safeReadJson<StoredAccount[]>(ACCOUNTS_KEY, [])
  return Array.isArray(list) ? list : []
}

function saveAccounts(accounts: StoredAccount[]): void {
  safeWriteJson(ACCOUNTS_KEY, accounts)
}

function generateUniqueUsername(emailOrPhone: string, existing: StoredAccount[], preferredId: string): string {
  const baseRaw = emailOrPhone.includes('@') ? emailOrPhone.split('@')[0] : emailOrPhone
  const sanitized = baseRaw.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
  let candidate = sanitized.slice(0, 18)
  if (candidate.length < 3) {
    candidate = `user_${preferredId.replace(/-/g, '').slice(0, 8)}`
  }
  const taken = new Set(existing.map((a) => a.username.toLowerCase()))
  if (!taken.has(candidate)) return candidate
  const suffix = preferredId.replace(/-/g, '').slice(0, 4)
  const withSuffix = `${candidate.slice(0, 19)}_${suffix}`
  if (!taken.has(withSuffix)) return withSuffix
  return `user_${preferredId.replace(/-/g, '').slice(0, 10)}`
}

export function toSupabaseUser(acc: StoredAccount): User {
  return {
    id: acc.id,
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: {
      display_name: acc.displayName,
      username: acc.username,
    },
    aud: 'authenticated',
    created_at: acc.createdAt,
    email: acc.email || undefined,
    phone: acc.phone || undefined,
    email_confirmed_at: acc.createdAt,
    confirmed_at: acc.createdAt,
  } as User
}

export function toProfileFromAccount(acc: StoredAccount): Profile {
  return {
    id: acc.id,
    username: acc.username,
    displayName: acc.displayName,
    bio: acc.bio,
  }
}

export function getActiveAccount(): StoredAccount | null {
  const sessionUserId = safeReadJson<string | null>(SESSION_KEY, null)
  if (!sessionUserId) return null
  const accounts = loadAccounts()
  return accounts.find((a) => a.id === sessionUserId) ?? null
}

export function setActiveSessionUserId(userId: string | null): void {
  if (typeof localStorage === 'undefined') return
  if (!userId) {
    localStorage.removeItem(SESSION_KEY)
  } else {
    safeWriteJson(SESSION_KEY, userId)
  }
}

export function findAccountByEmail(email: string): StoredAccount | undefined {
  const norm = email.trim().toLowerCase()
  return loadAccounts().find((a) => a.email.toLowerCase() === norm)
}

export function findAccountById(userId: string): StoredAccount | undefined {
  return loadAccounts().find((a) => a.id === userId)
}

export function findAccountByUsername(username: string): StoredAccount | undefined {
  const norm = username.trim().toLowerCase()
  return loadAccounts().find((a) => a.username.toLowerCase() === norm)
}

export function registerOrSyncAccount(opts: {
  email: string
  password: string
  preferredId?: string
  allowExistingUpdate?: boolean
}): { account?: StoredAccount; alreadyExists: boolean } {
  const normEmail = opts.email.trim().toLowerCase()
  const accounts = loadAccounts()
  const existingIdx = accounts.findIndex((a) => a.email.toLowerCase() === normEmail)

  if (existingIdx !== -1) {
    if (!opts.allowExistingUpdate) {
      return { alreadyExists: true }
    }
    const updated: StoredAccount = {
      ...accounts[existingIdx],
      password: opts.password,
      id: opts.preferredId || accounts[existingIdx].id,
    }
    accounts[existingIdx] = updated
    saveAccounts(accounts)
    setActiveSessionUserId(updated.id)
    return { account: updated, alreadyExists: false }
  }

  const id = opts.preferredId || deterministicUuidFromEmail(normEmail) || makeUuid()
  const username = generateUniqueUsername(normEmail, accounts, id)
  const displayPrefix = normEmail.split('@')[0] || 'Creator'
  const displayName = displayPrefix.charAt(0).toUpperCase() + displayPrefix.slice(1)

  const newAcc: StoredAccount = {
    id,
    email: normEmail,
    password: opts.password,
    username,
    displayName: displayName.slice(0, 60),
    bio: '',
    createdAt: new Date().toISOString(),
  }

  saveAccounts([...accounts, newAcc])
  setActiveSessionUserId(newAcc.id)
  return { account: newAcc, alreadyExists: false }
}

export function authenticateLocalEmail(
  email: string,
  password: string
): { account: StoredAccount | null; reason?: 'not_found' | 'wrong_password' } {
  const acc = findAccountByEmail(email)
  if (!acc) return { account: null, reason: 'not_found' }
  if (acc.password !== password) return { account: null, reason: 'wrong_password' }
  setActiveSessionUserId(acc.id)
  return { account: acc }
}

export function ensureAccountForSupabaseUser(sbUser: User, password?: string): StoredAccount {
  const accounts = loadAccounts()
  const email = (sbUser.email || '').trim().toLowerCase()
  const idx = accounts.findIndex(
    (a) => a.id === sbUser.id || (email && a.email.toLowerCase() === email)
  )

  if (idx !== -1) {
    const existing = accounts[idx]
    const updated: StoredAccount = {
      ...existing,
      id: sbUser.id,
      email: email || existing.email,
      password: password ?? existing.password,
    }
    accounts[idx] = updated
    saveAccounts(accounts)
    setActiveSessionUserId(updated.id)
    return updated
  }

  const username = generateUniqueUsername(email || sbUser.phone || sbUser.id, accounts, sbUser.id)
  const rawName =
    (sbUser.user_metadata?.display_name as string | undefined) ||
    (email ? email.split('@')[0] : 'User')
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1)

  const created: StoredAccount = {
    id: sbUser.id,
    email,
    phone: sbUser.phone || undefined,
    password: password ?? '',
    username,
    displayName: displayName.slice(0, 60),
    bio: '',
    createdAt: sbUser.created_at || new Date().toISOString(),
  }

  saveAccounts([...accounts, created])
  setActiveSessionUserId(created.id)
  return created
}

export function updateLocalProfile(
  userId: string,
  patch: { username: string; displayName: string; bio: string }
): Profile | null {
  const accounts = loadAccounts()
  const normUser = patch.username.trim().toLowerCase()
  const conflict = accounts.find((a) => a.id !== userId && a.username.toLowerCase() === normUser)
  if (conflict) {
    throw new Error('username_taken')
  }
  const idx = accounts.findIndex((a) => a.id === userId)
  if (idx === -1) return null

  accounts[idx] = {
    ...accounts[idx],
    username: normUser,
    displayName: patch.displayName,
    bio: patch.bio,
  }
  saveAccounts(accounts)
  return toProfileFromAccount(accounts[idx])
}

// ---- Local Diary & Community Entries Store (per-account + public view) ----

export function loadAllLocalEntries(): StoredDiaryRow[] {
  const list = safeReadJson<StoredDiaryRow[]>(ENTRIES_KEY, [])
  return Array.isArray(list) ? list : []
}

function saveAllLocalEntries(entries: StoredDiaryRow[]): void {
  safeWriteJson(ENTRIES_KEY, entries)
}

export function listLocalDiaryEntries(
  ownerId: string,
  offset: number,
  limit: number
): { items: DiaryEntry[]; hasMore: boolean } {
  const all = loadAllLocalEntries()
    .filter((e) => e.ownerId === ownerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const sliced = all.slice(offset, offset + limit)
  return {
    items: sliced,
    hasMore: all.length > offset + limit,
  }
}

export function getLocalDiaryEntry(ownerId: string, id: string): DiaryEntry | null {
  const found = loadAllLocalEntries().find((e) => e.id === id && e.ownerId === ownerId)
  return found ?? null
}

export function createLocalDiaryEntry(ownerId: string, input: EntryInput, customId?: string): DiaryEntry {
  const now = new Date().toISOString()
  const all = loadAllLocalEntries()
  const id = customId || makeUuid()
  const existingIdx = all.findIndex((e) => e.id === id)

  const row: StoredDiaryRow = {
    id,
    ownerId,
    title: input.title,
    incident: input.incident,
    summary: input.summary,
    punchline: input.punchline,
    genre: input.genre,
    language: input.language,
    source: input.source,
    engine: input.engine,
    characters: input.characters,
    panels: input.panels,
    visibility: input.visibility,
    publishedAt: input.visibility === 'public' ? now : null,
    createdAt: existingIdx !== -1 ? all[existingIdx].createdAt : now,
    updatedAt: now,
  }

  if (existingIdx !== -1) {
    all[existingIdx] = row
    saveAllLocalEntries(all)
  } else {
    saveAllLocalEntries([row, ...all])
  }
  return row
}

export function updateLocalDiaryEntry(ownerId: string, id: string, content: EntryContent): DiaryEntry | null {
  const all = loadAllLocalEntries()
  const idx = all.findIndex((e) => e.id === id && e.ownerId === ownerId)
  if (idx === -1) return null
  const updated: StoredDiaryRow = {
    ...all[idx],
    ...content,
    updatedAt: new Date().toISOString(),
  }
  all[idx] = updated
  saveAllLocalEntries(all)
  return updated
}

export function setLocalEntryVisibility(
  ownerId: string,
  id: string,
  visibility: Visibility
): DiaryEntry | null {
  const all = loadAllLocalEntries()
  const idx = all.findIndex((e) => e.id === id && e.ownerId === ownerId)
  if (idx === -1) return null
  const now = new Date().toISOString()
  const updated: StoredDiaryRow = {
    ...all[idx],
    visibility,
    publishedAt: visibility === 'public' ? all[idx].publishedAt || now : null,
    updatedAt: now,
  }
  all[idx] = updated
  saveAllLocalEntries(all)
  return updated
}

export function deleteLocalDiaryEntry(ownerId: string, id: string): boolean {
  const all = loadAllLocalEntries()
  const filtered = all.filter((e) => !(e.id === id && e.ownerId === ownerId))
  if (filtered.length === all.length) return false
  saveAllLocalEntries(filtered)
  return true
}

// ---- Likes store ----

interface LikeRecord {
  storyId: string
  userId: string
}

function loadLikes(): LikeRecord[] {
  const list = safeReadJson<LikeRecord[]>(LIKES_KEY, [])
  return Array.isArray(list) ? list : []
}

function saveLikes(likes: LikeRecord[]): void {
  safeWriteJson(LIKES_KEY, likes)
}

export function getLocalLikedSet(userId: string, storyIds: string[]): Set<string> {
  const likes = loadLikes()
  const target = new Set(storyIds)
  const out = new Set<string>()
  for (const l of likes) {
    if (l.userId === userId && target.has(l.storyId)) out.add(l.storyId)
  }
  return out
}

export function toggleLocalLike(userId: string, storyId: string, liked: boolean): number {
  const likes = loadLikes().filter((l) => !(l.userId === userId && l.storyId === storyId))
  if (liked) {
    likes.push({ userId, storyId })
  }
  saveLikes(likes)
  return likes.filter((l) => l.storyId === storyId).length
}

export function getLocalLikeCounts(storyIds: string[]): Record<string, number> {
  const likes = loadLikes()
  const out: Record<string, number> = {}
  for (const id of storyIds) {
    out[id] = likes.filter((l) => l.storyId === id).length
  }
  return out
}

// ---- Comments table store (comment / comments) ----

function loadComments(): StoryComment[] {
  const list = safeReadJson<StoryComment[]>(COMMENTS_KEY, [])
  return Array.isArray(list) ? list : []
}

function saveComments(comments: StoryComment[]): void {
  safeWriteJson(COMMENTS_KEY, comments)
}

export function listLocalComments(storyId: string): StoryComment[] {
  const accounts = loadAccounts()
  const accMap = new Map(accounts.map((a) => [a.id, a]))
  return loadComments()
    .filter((c) => c.storyId === storyId)
    .map((c) => {
      const acc = accMap.get(c.userId)
      return {
        ...c,
        username: acc?.username || c.username || 'user',
        displayName: acc?.displayName || c.displayName || 'User',
      }
    })
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export function addLocalComment(userId: string, storyId: string, content: string): StoryComment {
  const clean = content.trim().slice(0, 500)
  if (!clean) {
    throw new Error('empty_comment')
  }
  const acc = findAccountById(userId)
  const comment: StoryComment = {
    id: makeUuid(),
    storyId,
    userId,
    username: acc?.username || 'user',
    displayName: acc?.displayName || 'User',
    content: clean,
    createdAt: new Date().toISOString(),
  }
  const all = loadComments()
  saveComments([...all, comment])
  return comment
}

export function deleteLocalComment(userId: string, commentId: string): boolean {
  const all = loadComments()
  const filtered = all.filter((c) => !(c.id === commentId && c.userId === userId))
  if (filtered.length === all.length) return false
  saveComments(filtered)
  return true
}

export function getLocalCommentCounts(storyIds: string[]): Record<string, number> {
  const comments = loadComments()
  const out: Record<string, number> = {}
  for (const id of storyIds) {
    out[id] = comments.filter((c) => c.storyId === id).length
  }
  return out
}

// ---- Shares table store (share / shares) ----

function loadShares(): StoryShare[] {
  const list = safeReadJson<StoryShare[]>(SHARES_KEY, [])
  return Array.isArray(list) ? list : []
}

function saveShares(shares: StoryShare[]): void {
  safeWriteJson(SHARES_KEY, shares)
}

export function listLocalShares(storyId: string): StoryShare[] {
  return loadShares()
    .filter((s) => s.storyId === storyId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function recordLocalShare(
  storyId: string,
  platform: SharePlatform = 'copy_link',
  userId?: string
): { share: StoryShare; count: number } {
  const acc = userId ? findAccountById(userId) : getActiveAccount() || undefined
  const share: StoryShare = {
    id: makeUuid(),
    storyId,
    userId: acc?.id || userId,
    username: acc?.username,
    platform,
    createdAt: new Date().toISOString(),
  }
  const all = loadShares()
  const next = [share, ...all]
  saveShares(next)
  const count = next.filter((s) => s.storyId === storyId).length
  return { share, count }
}

export function getLocalShareCounts(storyIds: string[]): Record<string, number> {
  const shares = loadShares()
  const out: Record<string, number> = {}
  for (const id of storyIds) {
    out[id] = shares.filter((s) => s.storyId === id).length
  }
  return out
}

export function listLocalPublicStories(opts: {
  offset: number
  limit: number
  genre?: string
  username?: string
}): { items: PublicStory[]; hasMore: boolean } {
  const accounts = loadAccounts()
  const accMap = new Map(accounts.map((a) => [a.id, a]))
  const likes = loadLikes()
  const comments = loadComments()
  const shares = loadShares()

  // Also read Studio projects so we can enrich panel imageUrls or include public Studio projects directly
  const rawProjects = safeReadJson<Project[]>('golpoframe.projects.v1', [])
  const projectMap = new Map(
    (Array.isArray(rawProjects) ? rawProjects : []).map((p) => [p.id, p])
  )

  const pubEntries = loadAllLocalEntries()
    .filter((e) => e.visibility === 'public')
    .map((e): PublicStory => {
      const owner = accMap.get(e.ownerId)
      const likeCount = likes.filter((l) => l.storyId === e.id).length
      const commentCount = comments.filter((c) => c.storyId === e.id).length
      const shareCount = shares.filter((sh) => sh.storyId === e.id).length
      const matchingProj = projectMap.get(e.id)

      const enrichedPanels = e.panels.map((p, idx) => {
        const sp = matchingProj?.panels?.[idx]
        return {
          ...p,
          imageUrl: p.imageUrl || sp?.imageUrl,
          setting: p.setting || sp?.setting || detectSetting(p.scene, p.dialogue),
          pose: p.pose || sp?.pose || detectPose(p.scene, p.dialogue),
          characterPreset: p.characterPreset || sp?.characterPreset,
          colors: p.colors || sp?.colors,
          sfx: p.sfx || sp?.sfx,
          bubbleStyle: p.bubbleStyle || sp?.bubbleStyle,
          bubblePosition: p.bubblePosition || sp?.bubblePosition,
          tailDirection: p.tailDirection || sp?.tailDirection,
          fontSize: p.fontSize || sp?.fontSize,
          captionPosition: p.captionPosition || sp?.captionPosition,
        }
      })

      return {
        id: e.id,
        ownerId: e.ownerId,
        username: owner?.username || 'creator',
        displayName: owner?.displayName || 'Creator',
        title: e.title,
        summary: e.summary,
        punchline: e.punchline,
        genre: e.genre,
        language: e.language,
        source: e.source,
        engine: e.engine,
        characters: e.characters,
        panels: enrichedPanels,
        likeCount,
        commentCount,
        shareCount,
        publishedAt: e.publishedAt || e.updatedAt,
      }
    })

  const seenIds = new Set(pubEntries.map((s) => s.id))

  // Include any Studio projects marked isPublic: true that aren't in pubEntries yet
  const fromStudioProjects: PublicStory[] = (Array.isArray(rawProjects) ? rawProjects : [])
    .filter((p) => p.isPublic && !seenIds.has(p.id) && p.panels && p.panels.length > 0)
    .map((p): PublicStory => {
      const owner = p.userId ? accMap.get(p.userId) : getActiveAccount() || undefined
      const likeCount = likes.filter((l) => l.storyId === p.id).length
      const commentCount = comments.filter((c) => c.storyId === p.id).length
      const shareCount = shares.filter((sh) => sh.storyId === p.id).length
      return {
        id: p.id,
        ownerId: p.userId || owner?.id || 'local-user',
        username: owner?.username || 'creator',
        displayName: owner?.displayName || 'Creator',
        title: p.title || 'Untitled comic',
        summary: p.summary || p.story?.summary || p.title || 'Studio comic story',
        punchline: p.punchline || p.story?.punchline || 'সমাপ্ত',
        genre: p.genre || 'action',
        language: p.story?.language || 'bn',
        source: p.story?.source || 'manual',
        engine: p.story?.engine || 'GolpoFrame Studio',
        characters: p.story?.characters || [{ name: p.panels[0]?.speaker || 'রাফি', role: 'প্রধান চরিত্র' }],
        panels: p.panels.map((pan, idx) => ({
          scene: pan.scene || pan.caption || `Scene ${idx + 1}`,
          caption: pan.caption || '',
          speaker: pan.speaker || '',
          dialogue: pan.dialogue || '',
          imageUrl: pan.imageUrl,
          setting: pan.setting || detectSetting(pan.scene, pan.dialogue),
          pose: pan.pose || detectPose(pan.scene, pan.dialogue),
          characterPreset: pan.characterPreset,
          colors: pan.colors,
          sfx: pan.sfx,
          bubbleStyle: pan.bubbleStyle,
          bubblePosition: pan.bubblePosition,
          tailDirection: pan.tailDirection,
          fontSize: pan.fontSize,
          captionPosition: pan.captionPosition,
        })),
        likeCount,
        commentCount,
        shareCount,
        publishedAt: new Date(p.updatedAt || Date.now()).toISOString(),
      }
    })

  const pub = [...pubEntries, ...fromStudioProjects]
    .filter((s) => {
      if (opts.genre && s.genre !== opts.genre) return false
      if (opts.username && s.username.toLowerCase() !== opts.username.toLowerCase()) return false
      return true
    })
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))

  return {
    items: pub.slice(opts.offset, opts.offset + opts.limit),
    hasMore: pub.length > opts.offset + opts.limit,
  }
}

export function getLocalPublicStoryById(id: string): PublicStory | null {
  const all = listLocalPublicStories({ offset: 0, limit: 1000 })
  return all.items.find((s) => s.id === id) ?? null
}

/** Converts a DiaryEntry into a Studio Project so diary comics also appear on the user's Dashboard */
export function diaryEntryToProject(entry: StoredDiaryRow): Project {
  return {
    id: entry.id,
    userId: entry.ownerId,
    isPublic: entry.visibility === 'public',
    title: entry.title,
    summary: entry.summary,
    punchline: entry.punchline,
    genre: entry.genre,
    updatedAt: new Date(entry.updatedAt).getTime() || Date.now(),
    story: {
      source: entry.source === 'ai' ? 'ai' : 'template',
      engine: entry.engine || 'GolpoFrame',
      language: entry.language,
      summary: entry.summary,
      punchline: entry.punchline,
      characters: entry.characters,
    },
    panels: entry.panels.map((p, idx) => ({
      id: `${entry.id}-p-${idx}`,
      scene: p.scene,
      caption: p.caption,
      speaker: p.speaker,
      dialogue: p.dialogue,
      imageUrl: p.imageUrl,
      setting: p.setting || detectSetting(p.scene, p.dialogue),
      pose: p.pose || detectPose(p.scene, p.dialogue),
      characterPreset: p.characterPreset,
      colors: p.colors,
      sfx: p.sfx,
      bubbleStyle: p.bubbleStyle,
      bubblePosition: p.bubblePosition,
      tailDirection: p.tailDirection,
      fontSize: p.fontSize,
      captionPosition: p.captionPosition,
    })),
  }
}
