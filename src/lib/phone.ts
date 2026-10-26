/**
 * Bangladesh Mobile Number Normalization & Validation Helper
 * Supports local (01XXXXXXXXX) and international (+8801XXXXXXXXX) formats.
 * Validates active Bangladeshi mobile operator prefixes (013-019).
 */

// Active Bangladesh mobile operator prefixes (after optional +88 or 88):
// 013, 017 (Grameenphone)
// 014, 019 (Banglalink)
// 015 (Teletalk)
// 016, 018 (Robi / Airtel)
const BD_PHONE_REGEX = /^(?:\+?880|0)?(1[3-9]\d{8})$/

/**
 * Normalizes any Bangladesh phone input to canonical E.164 format:
 * Example: '01712345678' -> '+8801712345678'
 * Returns null if the number is invalid.
 */
export function normalizeBdPhone(raw: string): string | null {
  if (!raw || typeof raw !== 'string') return null
  // Strip spaces, dashes, parentheses, dots
  const cleaned = raw.trim().replace(/[\s\-\(\)\.]/g, '')

  const match = cleaned.match(BD_PHONE_REGEX)
  if (!match) return null

  const localDigits = match[1] // exactly 1XXXXXXXX (9 digits, starting with 13-19)
  return `+880${localDigits}`
}

/**
 * Validates whether the given string is a valid Bangladesh mobile number.
 */
export function isValidBdPhone(raw: string): boolean {
  return normalizeBdPhone(raw) !== null
}

/**
 * Formats canonical E.164 phone into standard local display format:
 * Example: '+8801712345678' -> '01712-345678'
 */
export function formatBdPhoneLocal(phone: string): string {
  const norm = normalizeBdPhone(phone)
  if (!norm) return phone
  const num = norm.replace('+880', '0')
  return `${num.slice(0, 5)}-${num.slice(5)}`
}

/**
 * Formats canonical E.164 phone into international display format:
 * Example: '+8801712345678' -> '+880 1712-345678'
 */
export function formatBdPhoneInternational(phone: string): string {
  const norm = normalizeBdPhone(phone)
  if (!norm) return phone
  const num = norm.replace('+880', '')
  return `+880 ${num.slice(0, 4)}-${num.slice(4)}`
}

/**
 * Masks phone number for secure display on OTP verification screens:
 * Example: '+8801712345678' -> '+880 17***-**678'
 */
export function maskBdPhone(phone: string): string {
  const norm = normalizeBdPhone(phone)
  if (!norm) return phone
  const local = norm.replace('+880', '0') // 11 digits
  return `+880 ${local.slice(1, 3)}***-**${local.slice(8)}`
}
