import test from 'node:test'
import assert from 'node:assert/strict'
import { DICT_EN, DICT_BN } from '../src/lib/communityI18n'

test('Community i18n dictionary: key parity between English and Bengali', () => {
  const enKeys = Object.keys(DICT_EN).sort()
  const bnKeys = Object.keys(DICT_BN).sort()

  assert.deepEqual(enKeys, bnKeys, 'English and Bengali dictionaries must have identical translation keys')

  // Verify non-empty translations
  for (const key of enKeys as (keyof typeof DICT_EN)[]) {
    assert.ok(DICT_EN[key].length > 0, `English translation for ${key} should not be empty`)
    assert.ok(DICT_BN[key].length > 0, `Bengali translation for ${key} should not be empty`)
  }
})
