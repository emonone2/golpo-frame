import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { fetchMyProfile } from '../lib/cloud'
import {
  authenticateLocalEmail,
  ensureAccountForSupabaseUser,
  findAccountByEmail,
  findAccountById,
  getActiveAccount,
  registerOrSyncAccount,
  setActiveSessionUserId,
  toProfileFromAccount,
  toSupabaseUser,
} from '../lib/localAuth'
import { normalizeBdPhone } from '../lib/phone'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

export type AuthIssue = 'invalid' | 'exists' | 'weak' | 'unconfirmed' | 'rate_limit' | 'email_disabled' | 'unknown'

interface AuthValue {
  configured: boolean
  isConfigured: boolean
  loading: boolean
  user: User | null
  profile: Profile | null
  signIn: (identifier: string, password: string) => Promise<AuthIssue | null>
  signUp: (email: string, password: string) => Promise<{ issue: AuthIssue | null; needsConfirm: boolean }>
  signInWithPhone: (phone: string, password: string) => Promise<AuthIssue | null>
  signUpWithPhone: (phone: string, password: string) => Promise<{ issue: AuthIssue | null; normalizedPhone?: string }>
  verifyPhoneOtp: (phone: string, token: string) => Promise<AuthIssue | null>
  resendPhoneOtp: (phone: string) => Promise<AuthIssue | null>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  openAuth: (mode?: 'login' | 'signup') => void
}

const AuthContext = createContext<AuthValue | null>(null)

function issueOf(err: { message?: string; code?: string }): AuthIssue {
  const code = err.code ?? ''
  const msg = (err.message ?? '').toLowerCase()
  if (
    code === 'over_sms_send_rate_limit' ||
    code === 'over_request_rate_limit' ||
    msg.includes('rate limit') ||
    msg.includes('too many requests')
  ) {
    return 'rate_limit'
  }
  if (code === 'email_not_confirmed' || msg.includes('not confirmed')) return 'unconfirmed'
  if (
    code === 'email_provider_disabled' ||
    msg.includes('email signups are disabled') ||
    msg.includes('email provider is disabled')
  ) {
    return 'email_disabled'
  }
  if (
    code === 'invalid_credentials' ||
    code === 'bad_code' ||
    code === 'otp_expired' ||
    msg.includes('invalid') ||
    msg.includes('expired') ||
    msg.includes('wrong')
  ) {
    return 'invalid'
  }
  if (code === 'user_already_exists' || msg.includes('already registered')) return 'exists'
  if (code === 'weak_password' || msg.includes('password')) return 'weak'
  return 'unknown'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const active = getActiveAccount()
    return active ? toSupabaseUser(active) : null
  })
  const [profile, setProfile] = useState<Profile | null>(() => {
    const active = getActiveAccount()
    return active ? toProfileFromAccount(active) : null
  })
  const [loading, setLoading] = useState<boolean>(Boolean(supabase && !getActiveAccount()))
  const uid = user?.id

  useEffect(() => {
    const sb = supabase
    if (!sb) {
      setLoading(false)
      return
    }
    let active = true
    sb.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return
        if (data.session?.user) {
          const synced = ensureAccountForSupabaseUser(data.session.user)
          setUser(data.session.user)
          setProfile(toProfileFromAccount(synced))
        } else {
          const localAcc = getActiveAccount()
          if (localAcc) {
            setUser(toSupabaseUser(localAcc))
            setProfile(toProfileFromAccount(localAcc))
          } else {
            setUser(null)
            setProfile(null)
          }
        }
        setLoading(false)
      })
      .catch(() => {
        if (active) setLoading(false)
      })

    const { data } = sb.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const synced = ensureAccountForSupabaseUser(session.user)
        setUser(session.user)
        setProfile(toProfileFromAccount(synced))
      } else if (event === 'SIGNED_OUT') {
        const localAcc = getActiveAccount()
        if (!localAcc) {
          setUser(null)
          setProfile(null)
        }
      }
    })
    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!uid) {
      setProfile(null)
      return
    }
    try {
      const p = await fetchMyProfile(uid)
      if (p) {
        setProfile(p)
        return
      }
    } catch {
      // Fallback to local account profile
    }
    const localAcc = findAccountById(uid)
    if (localAcc) {
      setProfile(toProfileFromAccount(localAcc))
    }
  }, [uid])

  useEffect(() => {
    void refreshProfile()
  }, [refreshProfile])

  const signIn = useCallback(async (identifier: string, password: string): Promise<AuthIssue | null> => {
    const trimmed = identifier.trim()
    const bdPhone = normalizeBdPhone(trimmed)

    if (bdPhone && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ phone: bdPhone, password })
      if (!error && data.user) {
        const synced = ensureAccountForSupabaseUser(data.user, password)
        setUser(data.user)
        setProfile(toProfileFromAccount(synced))
        return null
      }
      return error ? issueOf(error) : 'invalid'
    }

    const normEmail = trimmed.toLowerCase()

    // 1. Check local account credentials first if registered locally
    const localExisting = findAccountByEmail(normEmail)
    if (localExisting && localExisting.password && localExisting.password !== password) {
      return 'invalid'
    }

    // 2. If Supabase is configured, try signing in via Supabase
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email: normEmail, password })
      if (!error && data.user) {
        const synced = ensureAccountForSupabaseUser(data.user, password)
        setUser(data.user)
        setProfile(toProfileFromAccount(synced))
        return null
      }

      if (error) {
        const issue = issueOf(error)
        // If Supabase says email_not_confirmed, allow immediate login without email verification
        if (issue === 'unconfirmed') {
          const { account } = registerOrSyncAccount({
            email: normEmail,
            password,
            preferredId: localExisting?.id,
            allowExistingUpdate: true,
          })
          if (account) {
            setUser(toSupabaseUser(account))
            setProfile(toProfileFromAccount(account))
            return null
          }
        }
      }
    }

    // 3. Authenticate against local account store
    const localAuth = authenticateLocalEmail(normEmail, password)
    if (localAuth.account) {
      setUser(toSupabaseUser(localAuth.account))
      setProfile(toProfileFromAccount(localAuth.account))
      return null
    }

    return 'invalid'
  }, [])

  const signUp = useCallback(
    async (email: string, password: string): Promise<{ issue: AuthIssue | null; needsConfirm: boolean }> => {
      const normEmail = email.trim().toLowerCase()
      if (password.length < 6) {
        return { issue: 'weak', needsConfirm: false }
      }

      // Check if already registered locally
      const existingLocal = findAccountByEmail(normEmail)
      if (existingLocal) {
        return { issue: 'exists', needsConfirm: false }
      }

      let preferredId: string | undefined

      if (supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: normEmail,
          password,
        })

        if (error) {
          const mapped = issueOf(error)
          if (mapped === 'exists' || mapped === 'weak') {
            return { issue: mapped, needsConfirm: false }
          }
          // If email confirmation/provider or rate limit issue on Supabase, still create account seamlessly
        } else if (data.user && data.user.identities && data.user.identities.length === 0) {
          return { issue: 'exists', needsConfirm: false }
        } else if (data.user) {
          preferredId = data.user.id
          if (data.session) {
            const synced = ensureAccountForSupabaseUser(data.user, password)
            setUser(data.user)
            setProfile(toProfileFromAccount(synced))
            return { issue: null, needsConfirm: false }
          }
          // Try immediate signInWithPassword in case auto-confirm trigger is active in DB
          const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
            email: normEmail,
            password,
          })
          if (!signInErr && signInData.user) {
            const synced = ensureAccountForSupabaseUser(signInData.user, password)
            setUser(signInData.user)
            setProfile(toProfileFromAccount(synced))
            return { issue: null, needsConfirm: false }
          }
        }
      }

      // Immediately register & activate the account without requiring email verification
      const { account, alreadyExists } = registerOrSyncAccount({
        email: normEmail,
        password,
        preferredId,
      })

      if (alreadyExists || !account) {
        return { issue: 'exists', needsConfirm: false }
      }

      setUser(toSupabaseUser(account))
      setProfile(toProfileFromAccount(account))
      return { issue: null, needsConfirm: false }
    },
    []
  )

  const signInWithPhone = useCallback(async (phoneInput: string, password: string) => {
    if (!supabase) return 'unknown' as const
    const normalized = normalizeBdPhone(phoneInput)
    if (!normalized) return 'invalid' as const
    const { data, error } = await supabase.auth.signInWithPassword({ phone: normalized, password })
    if (!error && data.user) {
      const synced = ensureAccountForSupabaseUser(data.user, password)
      setUser(data.user)
      setProfile(toProfileFromAccount(synced))
      return null
    }
    return error ? issueOf(error) : null
  }, [])

  const signUpWithPhone = useCallback(async (phoneInput: string, password: string) => {
    if (!supabase) return { issue: 'unknown' as const }
    const normalized = normalizeBdPhone(phoneInput)
    if (!normalized) return { issue: 'invalid' as const }

    const { data, error } = await supabase.auth.signUp({
      phone: normalized,
      password,
    })
    if (error) return { issue: issueOf(error) }
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return { issue: 'exists' as const }
    }
    return { issue: null, normalizedPhone: normalized }
  }, [])

  const verifyPhoneOtp = useCallback(async (phoneInput: string, token: string) => {
    if (!supabase) return 'unknown' as const
    const normalized = normalizeBdPhone(phoneInput) || phoneInput.trim()
    const { error } = await supabase.auth.verifyOtp({
      phone: normalized,
      token: token.trim(),
      type: 'sms',
    })
    return error ? issueOf(error) : null
  }, [])

  const resendPhoneOtp = useCallback(async (phoneInput: string) => {
    if (!supabase) return 'unknown' as const
    const normalized = normalizeBdPhone(phoneInput) || phoneInput.trim()
    const { error } = await supabase.auth.resend({
      type: 'sms',
      phone: normalized,
    })
    return error ? issueOf(error) : null
  }, [])

  const signOut = useCallback(async () => {
    setActiveSessionUserId(null)
    setUser(null)
    setProfile(null)
    if (supabase) {
      try {
        await supabase.auth.signOut()
      } catch {
        // ignore signOut network errors
      }
    }
  }, [])

  const openAuth = useCallback((_mode?: 'login' | 'signup') => {
    window.location.hash = '#/login'
  }, [])

  const value = useMemo<AuthValue>(
    () => ({
      configured: true,
      isConfigured: true,
      loading,
      user,
      profile,
      signIn,
      signUp,
      signInWithPhone,
      signUpWithPhone,
      verifyPhoneOtp,
      resendPhoneOtp,
      signOut,
      refreshProfile,
      openAuth,
    }),
    [
      loading,
      user,
      profile,
      signIn,
      signUp,
      signInWithPhone,
      signUpWithPhone,
      verifyPhoneOtp,
      resendPhoneOtp,
      signOut,
      refreshProfile,
      openAuth,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
