import test from 'node:test'
import assert from 'node:assert/strict'
import {
  normalizeBdPhone,
  isValidBdPhone,
  formatBdPhoneLocal,
  formatBdPhoneInternational,
  maskBdPhone,
} from '../src/lib/phone'

test('Phone normalization: Valid Bangladesh numbers in various formats', () => {
  // Local 11-digit format
  assert.equal(normalizeBdPhone('01712345678'), '+8801712345678')
  assert.equal(normalizeBdPhone('01312345678'), '+8801312345678')
  assert.equal(normalizeBdPhone('01412345678'), '+8801412345678')
  assert.equal(normalizeBdPhone('01512345678'), '+8801512345678')
  assert.equal(normalizeBdPhone('01612345678'), '+8801612345678')
  assert.equal(normalizeBdPhone('01812345678'), '+8801812345678')
  assert.equal(normalizeBdPhone('01912345678'), '+8801912345678')

  // International format with +880
  assert.equal(normalizeBdPhone('+8801712345678'), '+8801712345678')

  // International format without +
  assert.equal(normalizeBdPhone('8801712345678'), '+8801712345678')

  // Formatted with hyphens and spaces
  assert.equal(normalizeBdPhone('01712-345678'), '+8801712345678')
  assert.equal(normalizeBdPhone('+880 1712 345678'), '+8801712345678')
  assert.equal(normalizeBdPhone('01712 345 678'), '+8801712345678')
  assert.equal(normalizeBdPhone('  01712345678  '), '+8801712345678')
})

test('Phone normalization: Invalid numbers rejected', () => {
  // Inactive prefixes (010, 011, 012 are not active BD mobile operators)
  assert.equal(normalizeBdPhone('01012345678'), null)
  assert.equal(normalizeBdPhone('01112345678'), null)
  assert.equal(normalizeBdPhone('01212345678'), null)

  // Too short or too long
  assert.equal(normalizeBdPhone('0171234567'), null) // 10 digits
  assert.equal(normalizeBdPhone('017123456789'), null) // 12 digits
  assert.equal(normalizeBdPhone('123456'), null)

  // Non-Bangladeshi countries
  assert.equal(normalizeBdPhone('+14155552671'), null)
  assert.equal(normalizeBdPhone('+919876543210'), null)

  // Letters and garbage
  assert.equal(normalizeBdPhone('01712abcd78'), null)
  assert.equal(normalizeBdPhone(''), null)
  assert.equal(normalizeBdPhone('   '), null)
})

test('Phone formatting and masking', () => {
  const phone = '01712345678'
  assert.equal(isValidBdPhone(phone), true)
  assert.equal(isValidBdPhone('01112345678'), false)

  assert.equal(formatBdPhoneLocal(phone), '01712-345678')
  assert.equal(formatBdPhoneInternational(phone), '+880 1712-345678')
  assert.equal(maskBdPhone(phone), '+880 17***-**678')
})
