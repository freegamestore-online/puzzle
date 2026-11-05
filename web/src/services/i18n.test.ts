import { describe, it, expect, beforeEach } from 'vitest'
import { LANGUAGES, getStrings } from './i18n.ts'
import { loadSettings } from './settings.ts'

describe('languages', () => {
  it('only offers languages that have UI strings', () => {
    for (const { code } of LANGUAGES) expect(getStrings(code).play).toBeTruthy()
    expect(LANGUAGES.map((l) => l.code)).toEqual(['en', 'es'])
  })
})

describe('loadSettings', () => {
  beforeEach(() => localStorage.clear())

  it('falls back to English for a stored language that is no longer offered', () => {
    localStorage.setItem('freepuzzle-settings', JSON.stringify({ contentLang: 'fr', level: 3 }))
    expect(loadSettings()).toMatchObject({ contentLang: 'en', level: 3 })
  })

  it('keeps a supported stored language', () => {
    localStorage.setItem('freepuzzle-settings', JSON.stringify({ contentLang: 'es' }))
    expect(loadSettings().contentLang).toBe('es')
  })
})
