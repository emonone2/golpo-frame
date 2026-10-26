import test from 'node:test'
import assert from 'node:assert/strict'
import { generateFromTemplate } from '../src/lib/story/templateGenerator'

test('Template generator: English keyword matching & panel counts', () => {
  const story4 = generateFromTemplate({
    genre: 'comedy',
    incident: 'I was late for the bus and the professor locked the exam hall door',
    heroName: 'Rafi',
    panelCount: 4,
    language: 'en',
    humor: 'witty',
    seed: 42,
  })

  assert.equal(story4.panels.length, 4)
  assert.ok(story4.title.length > 0)
  assert.ok(story4.characters.length >= 2)
  assert.equal(story4.panels[0].speaker.length > 0, true)

  const story6 = generateFromTemplate({
    genre: 'comedy',
    incident: 'Campus hostel gossip and late night tea stall',
    heroName: 'Nusrat',
    panelCount: 6,
    language: 'en',
    humor: 'slapstick',
    seed: 101,
  })

  assert.equal(story6.panels.length, 6)
  assert.ok(story6.punchline.length > 0)
})

test('Template generator: Bengali keyword matching & Unicode text', () => {
  const storyBn = generateFromTemplate({
    genre: 'comedy',
    incident: 'পরীক্ষার আগের রাতে হলে চা খাওয়ার আড্ডা এবং দেরি করে পৌঁছানো',
    heroName: 'রাফি',
    panelCount: 4,
    language: 'bn',
    humor: 'wholesome',
    seed: 7,
  })

  assert.equal(storyBn.panels.length, 4)
  assert.ok(storyBn.title.length > 0)
  // Ensure Bangla characters are present
  assert.ok(/[\u0980-\u09FF]/.test(storyBn.title))
  assert.ok(/[\u0980-\u09FF]/.test(storyBn.panels[0].dialogue))
})
