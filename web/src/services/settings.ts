import type { LanguageCode } from '../types.ts'
import { isSupportedLanguage } from './i18n.ts'

const STORAGE_KEY = 'freepuzzle-settings'

export type ThemePreference = 'system' | 'light' | 'dark'
export type FontSizePreference = 'small' | 'medium' | 'large' | 'xlarge'
export type MotionPreference = 'full' | 'reduced'
export type SurfacePreference = 'soft' | 'bold'

export interface Settings {
  contentLang: LanguageCode
  theme: ThemePreference
  labelSize: FontSizePreference
  contentSize: FontSizePreference
  motion: MotionPreference
  surface: SurfacePreference
  level: number
}

const defaults: Settings = {
  contentLang: 'en',
  theme: 'light',
  labelSize: 'medium',
  contentSize: 'medium',
  motion: 'full',
  surface: 'bold',
  level: 1,
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const stored = { ...defaults, ...JSON.parse(raw) } as Settings
      // Older versions offered languages that were never translated.
      if (!isSupportedLanguage(stored.contentLang)) stored.contentLang = defaults.contentLang
      return stored
    }
  } catch { /* ignore */ }
  return defaults
}

export function saveSettings(settings: Settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}
