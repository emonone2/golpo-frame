import test from 'node:test'
import assert from 'node:assert/strict'
import { fmtDate } from '../src/lib/format'

test('Date formatting: fmtDate in English and Bengali', () => {
  assert.equal(fmtDate(null, 'en'), '')
  assert.equal(fmtDate('', 'en'), '')
  assert.equal(fmtDate('invalid-date', 'en'), '')

  const iso = '2026-10-21T12:00:00Z'
  const enDate = fmtDate(iso, 'en')
  assert.ok(enDate.includes('2026') || enDate.includes('Oct'))

  const bnDate = fmtDate(iso, 'bn')
  // Should contain Bengali digits
  assert.ok(/[\u09E6-\u09EF]/.test(bnDate) || bnDate.includes('অক্টো'))
})
