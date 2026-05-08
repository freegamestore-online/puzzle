import { useCallback, useEffect, useState } from 'react'
import { GameShell, GameTopbar } from '@freegamestore/games'
import { ChevronDown } from 'lucide-react'
import { PracticeTab } from './components/PracticeTab.tsx'
import { PreferencesTab } from './components/PreferencesTab.tsx'
import { LanguagePicker } from './components/LanguagePicker.tsx'
import { useApplySettings, useSettings } from './hooks.ts'
import { getStrings } from './services/i18n.ts'
import { LEVELS, getLevelLabel } from './services/puzzles.ts'
import type { Mode } from './types.ts'

const PATH_TO_MODE: Record<string, Mode> = {
  '/': 'play',
  '/play': 'play',
  '/preferences': 'preferences',
}

const MODE_TO_PATH: Record<Mode, string> = {
  play: '/play',
  preferences: '/preferences',
}

function getModeFromPath(): Mode {
  return PATH_TO_MODE[window.location.pathname] ?? 'play'
}

export default function App() {
  const [mode, setMode] = useState<Mode>(getModeFromPath)
  const [showStats, setShowStats] = useState(false)
  const [levelOpen, setLevelOpen] = useState(false)
  const { settings, update } = useSettings()
  const strings = getStrings(settings.contentLang)

  useApplySettings(settings)

  const navigate = useCallback((nextMode: Mode) => {
    setMode(nextMode)
    setShowStats(false)
    window.history.pushState(null, '', MODE_TO_PATH[nextMode])
  }, [])

  useEffect(() => {
    const onPop = () => setMode(getModeFromPath())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  return (
    <GameShell
      topbar={
        <GameTopbar
          title="Puzzle"
          actions={
            <div className="flex items-center gap-2">
              <LanguagePicker
                compact
                label={strings.language}
                value={settings.contentLang}
                onChange={(code) => update({ contentLang: code })}
              />

              <div className="relative">
                <button
                  className="flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--glass)] px-2 py-1.5 text-xs font-bold text-[var(--muted)]"
                  onClick={() => setLevelOpen(!levelOpen)}
                  type="button"
                >
                  Lv {settings.level}
                  <ChevronDown className={`h-3 w-3 transition-transform ${levelOpen ? 'rotate-180' : ''}`} strokeWidth={2.2} />
                </button>
                {levelOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setLevelOpen(false)} />
                    <div className="absolute right-0 top-full z-50 mt-1 max-h-72 w-56 overflow-y-auto rounded-[1rem] border border-[var(--line-strong)] bg-[var(--panel-strong)] p-1 shadow-[var(--shadow-soft)] backdrop-blur-xl">
                      {LEVELS.map((level) => (
                        <button
                          key={level}
                          className={`flex w-full items-center gap-2 rounded-[0.75rem] px-3 py-2 text-left text-sm ${
                            level === settings.level
                              ? 'bg-[var(--accent-gradient)] font-bold text-[var(--ink)]'
                              : 'text-[var(--muted)] hover:bg-[var(--glass-hover)] hover:text-[var(--ink)]'
                          }`}
                          onClick={() => {
                            update({ level })
                            setLevelOpen(false)
                          }}
                          type="button"
                        >
                          <span className="font-extrabold">{level}</span>
                          <span>{getLevelLabel(level, settings.contentLang)}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {mode === 'play' && (
                <button
                  className={`rounded-full px-2 py-1.5 text-xs font-bold ${showStats ? 'bg-[var(--sky)] text-white' : 'text-[var(--muted)]'}`}
                  onClick={() => setShowStats(!showStats)}
                  type="button"
                >
                  {showStats ? strings.play : strings.stats}
                </button>
              )}

              <button
                className={`rounded-full px-2 py-1.5 text-xs font-bold ${mode === 'preferences' ? 'bg-[var(--ink)] text-[var(--paper)]' : 'text-[var(--muted)]'}`}
                onClick={() => navigate(mode === 'preferences' ? 'play' : 'preferences')}
                type="button"
              >
                {mode === 'preferences' ? strings.play : strings.preferences}
              </button>
            </div>
          }
        />
      }
    >
      <div className="relative w-full h-full">
        <div className="flex min-h-0 flex-1 flex-col h-full">
          <section className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-[1rem] bg-[var(--panel-quiet)] p-1.5 backdrop-blur-xl sm:rounded-[1.4rem] sm:p-3 lg:rounded-[1.7rem] lg:p-5">
            {mode === 'play' ? (
              <PracticeTab language={settings.contentLang} level={settings.level} showStats={showStats} />
            ) : (
              <PreferencesTab settings={settings} update={update} />
            )}
          </section>
        </div>
      </div>
    </GameShell>
  )
}
