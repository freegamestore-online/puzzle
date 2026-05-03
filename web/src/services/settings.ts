import type { LanguageCode } from '../types.ts'

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
    if (raw) return { ...defaults, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return defaults
}

export function saveSettings(settings: Settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}
