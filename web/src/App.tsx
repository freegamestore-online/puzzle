import { useCallback, useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { PracticeTab } from './components/PracticeTab.tsx'
import { PreferencesTab } from './components/PreferencesTab.tsx'
import { LanguagePicker } from './components/LanguagePicker.tsx'
import { Leaderboard } from './components/Leaderboard.tsx'
import { useApplySettings, useSettings } from './hooks.ts'
import { useLeaderboard } from './hooks/useLeaderboard.ts'
import { getStrings } from './services/i18n.ts'
import { LEVELS, getLevelLabel } from './services/puzzles.ts'
import type { Mode } from './types.ts'

const MODES: Mode[] = ['play', 'preferences']

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
  const { topScores, recentScores, submitScore, loading: leaderboardLoading } = useLeaderboard("puzzle")

  useApplySettings(settings)

  const handlePuzzleSolved = useCallback((totalSolved: number) => {
    submitScore(totalSolved)
  }, [submitScore])

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
    <div className="relative h-[100dvh] overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[6%] h-72 w-72 rounded-full bg-[var(--accent-glow)] blur-3xl lg:h-[34rem] lg:w-[34rem]" />
        <div className="absolute right-[-12%] top-[10%] h-72 w-72 rounded-full bg-[var(--sky-glow)] blur-3xl lg:h-[28rem] lg:w-[28rem]" />
        <div className="absolute bottom-[-12%] left-[22%] h-80 w-80 rounded-full bg-[var(--mint-glow)] blur-3xl lg:h-[28rem] lg:w-[28rem]" />
      </div>

      <div className="relative mx-auto flex h-full max-w-[1540px] flex-col px-2 pb-2 pt-2 sm:px-4 lg:px-8 lg:py-4">
        <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-7">
          <aside className="hidden lg:flex lg:min-h-0 lg:flex-col lg:gap-5 lg:overflow-y-auto lg:rounded-[2rem] lg:border lg:border-[var(--line)] lg:bg-[var(--panel-strong)] lg:p-6 lg:shadow-[var(--shadow-soft)] lg:backdrop-blur-xl">
            <div className="rounded-[1.4rem] bg-[var(--accent-gradient)] p-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/20 px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-[var(--ink)]">
                {strings.appName}
              </div>
              <h1 className="display-font mt-4 text-4xl font-extrabold text-[var(--ink)]">Move. Sort. Solve.</h1>
              <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                A separate hands-on puzzle app built for moving pieces around, not just tapping two answers.
              </p>
            </div>

            <div className="space-y-1">
              <div className="px-1 text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-[var(--muted)]">{strings.language}</div>
              <LanguagePicker
                compact
                label={strings.language}
                value={settings.contentLang}
                onChange={(code) => update({ contentLang: code })}
              />
            </div>

            <nav className="space-y-1">
              {MODES.map((item) => (
                <button
                  key={item}
                  className={`w-full rounded-[1rem] px-4 py-3 text-left text-sm font-bold transition duration-200 ${
                    mode === item
                      ? 'border border-[var(--line-strong)] bg-[var(--glass-hover)] text-[var(--ink)] shadow-[var(--shadow-card)]'
                      : 'border border-transparent text-[var(--muted)] hover:bg-[var(--glass-soft)] hover:text-[var(--ink)]'
                  }`}
                  onClick={() => navigate(item)}
                  type="button"
                >
                  {item === 'play' ? strings.play : strings.preferences}
                </button>
              ))}
              {mode === 'play' && (
                <button
                  className={`w-full rounded-[1rem] px-4 py-3 text-left text-sm font-bold transition duration-200 ${
                    showStats
                      ? 'border border-[var(--line-strong)] bg-[var(--cool-gradient)] text-[var(--ink)] shadow-[var(--shadow-card)]'
                      : 'border border-transparent text-[var(--muted)] hover:bg-[var(--glass-soft)] hover:text-[var(--ink)]'
                  }`}
                  onClick={() => setShowStats(!showStats)}
                  type="button"
                >
                  {showStats ? strings.backToPlay : strings.stats}
                </button>
              )}
            </nav>

            <div className="space-y-1">
              <div className="px-1 text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-[var(--muted)]">{strings.level}</div>
              <div className="max-h-72 space-y-1 overflow-y-auto">
                {LEVELS.map((level) => (
                  <button
                    key={level}
                    className={`flex w-full items-center gap-2 rounded-[0.9rem] px-3 py-2.5 text-left text-sm ${
                      level === settings.level
                        ? 'bg-[var(--accent-gradient)] font-bold text-[var(--ink)]'
                        : 'text-[var(--muted)] hover:bg-[var(--glass-soft)] hover:text-[var(--ink)]'
                    }`}
                    onClick={() => update({ level })}
                    type="button"
                  >
                    <span className="font-extrabold">{level}</span>
                    <span>{getLevelLabel(level, settings.contentLang)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t" style={{ borderColor: "var(--line)" }}>
              <div className="text-xs font-semibold px-4 pt-3" style={{ color: "var(--muted)" }}>Leaderboard</div>
              <Leaderboard topScores={topScores} recentScores={recentScores} loading={leaderboardLoading} />
            </div>

            <div className="mt-auto rounded-[1.3rem] border border-[var(--line)] bg-[var(--panel)] p-4">
              <div className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[var(--muted)]">{strings.puzzleTips}</div>
              <div className="mt-3 space-y-2 text-sm leading-6 text-[var(--ink)]">
                <div>{strings.tipSelect}</div>
                <div>{strings.tipPlace}</div>
                <div>{strings.tipRotate}</div>
                <div>{strings.tipSwap}</div>
              </div>
            </div>
          </aside>

          <header className="mb-2 flex items-center gap-2 lg:hidden">
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
                {strings.level} {settings.level} · {getLevelLabel(settings.level, settings.contentLang)}
                <ChevronDown className={`h-3 w-3 transition-transform ${levelOpen ? 'rotate-180' : ''}`} strokeWidth={2.2} />
              </button>
              {levelOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLevelOpen(false)} />
                  <div className="absolute left-0 top-full z-50 mt-1 max-h-72 w-56 overflow-y-auto rounded-[1rem] border border-[var(--line-strong)] bg-[var(--panel-strong)] p-1 shadow-[var(--shadow-soft)] backdrop-blur-xl">
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
                className={`ml-auto rounded-full px-2 py-1.5 text-xs font-bold ${showStats ? 'bg-[var(--sky)] text-white' : 'text-[var(--muted)]'}`}
                onClick={() => setShowStats(!showStats)}
                type="button"
              >
                {showStats ? strings.play : strings.stats}
              </button>
            )}
          </header>

          <main className="flex min-h-0 min-w-0 flex-1 flex-col">
            <section className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-[1.4rem] bg-[var(--panel-quiet)] p-3 backdrop-blur-xl sm:p-4 lg:rounded-[1.7rem] lg:p-5">
              {mode === 'play' ? (
                <PracticeTab language={settings.contentLang} level={settings.level} showStats={showStats} onSolved={handlePuzzleSolved} />
              ) : (
                <PreferencesTab settings={settings} update={update} />
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}
