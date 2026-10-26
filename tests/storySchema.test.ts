import test from 'node:test'
import assert from 'node:assert/strict'
import { checkOptions } from '../src/lib/story/generate'
import { MAX_INCIDENT, MAX_PANELS, MIN_PANELS, validateStory } from '../src/lib/story/schema'

test('Story validation: checkOptions', () => {
  // Empty incident
  assert.equal(
    checkOptions({
      genre: 'comedy',
      incident: '   ',
      heroName: 'Rafi',
      panelCount: 4,
      language: 'bn',
      humor: 'witty',
      seed: 1,
    }),
    'incident_empty'
  )

  // Incident too long
  const longText = 'a'.repeat(MAX_INCIDENT + 5)
  assert.equal(
    checkOptions({
      genre: 'comedy',
      incident: longText,
      heroName: 'Rafi',
      panelCount: 4,
      language: 'bn',
      humor: 'witty',
      seed: 1,
    }),
    'incident_long'
  )

  // Panel count below min
  assert.equal(
    checkOptions({
      genre: 'comedy',
      incident: 'Classroom funny moments',
      heroName: 'Rafi',
      panelCount: MIN_PANELS - 1,
      language: 'en',
      humor: 'witty',
      seed: 1,
    }),
    'panel_count'
  )

  // Panel count above max
  assert.equal(
    checkOptions({
      genre: 'comedy',
      incident: 'Classroom funny moments',
      heroName: 'Rafi',
      panelCount: MAX_PANELS + 1,
      language: 'en',
      humor: 'witty',
      seed: 1,
    }),
    'panel_count'
  )

  // Valid options
  assert.equal(
    checkOptions({
      genre: 'comedy',
      incident: 'University campus bus delay',
      heroName: 'Rafi',
      panelCount: 4,
      language: 'en',
      humor: 'witty',
      seed: 1,
    }),
    null
  )
})

test('Story validation: validateStory', () => {
  // Null or non-object
  const res1 = validateStory(null)
  assert.equal(res1.ok, false)

  // Missing panels
  const res2 = validateStory({
    title: 'Test story',
    summary: 'Summary',
    punchline: 'Punchline',
    characters: [{ name: 'Rafi', role: 'Hero' }],
    panels: [],
  })
  assert.equal(res2.ok, false)

  // Valid 4-panel story
  const validStory = {
    title: 'পরীক্ষার আগের রাত',
    summary: 'সব ভুলে যাওয়ার এক চিরন্তন গল্প',
    punchline: 'ঘুমই একমাত্র সমাধান!',
    characters: [
      { name: 'রাফি', role: 'ছাত্র' },
      { name: 'তানিম', role: 'বন্ধু' },
      { name: 'শিক্ষক', role: 'পরীক্ষক' },
    ],
    panels: [
      { scene: 'রাফি টেবিলে বই নিয়ে বসে আছে।', caption: 'রাত ১২টা।', speaker: 'রাফি', dialogue: 'আজ সব শেষ করব!' },
      { scene: 'তানিম রুমে ঢুকল।', caption: 'রাত ১টা।', speaker: 'তানিম', dialogue: 'চা খাবি?' },
      { scene: 'দুইজন চায়ের দোকানে আড্ডা দিচ্ছে।', caption: 'রাত ২টা।', speaker: 'রাফি', dialogue: 'এক কাপ চা জীবন বাঁচায়।' },
      { scene: 'সকালে পরীক্ষার হলে রাফি ঘুমাচ্ছে।', caption: 'সকাল ১০টা।', speaker: 'শিক্ষক', dialogue: 'খাতা জমা দাও!' },
    ],
  }

  const res3 = validateStory(validStory)
  assert.equal(res3.ok, true)
  if (res3.ok) {
    assert.equal(res3.data.title, 'পরীক্ষার আগের রাত')
    assert.equal(res3.data.panels.length, 4)
  }
})
