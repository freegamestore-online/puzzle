import type { Score } from '../types.ts'

const SCORES_KEY = 'freepuzzle-scores'
const PROBLEM_STATS_KEY = 'freepuzzle-puzzle-stats'

export function loadScores(): Score {
  try {
    const raw = localStorage.getItem(SCORES_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { solved: 0, checks: 0, streak: 0, bestStreak: 0 }
}

function saveScores(scores: Score) {
  localStorage.setItem(SCORES_KEY, JSON.stringify(scores))
}

export function recordAttempt(scores: Score, solved: boolean): Score {
  const streak = solved ? scores.streak + 1 : 0
  const bestStreak = Math.max(scores.bestStreak, streak)
  const next = {
    solved: scores.solved + (solved ? 1 : 0),
    checks: scores.checks + 1,
    streak,
    bestStreak,
  }
  saveScores(next)
  return next
}

// --- Per-problem-type stats ---

export interface ProblemStat {
  solved: number
  failed: number
  lastSeen: number
}

export type ProblemStatsMap = Record<string, ProblemStat>

export function loadProblemStats(): ProblemStatsMap {
  try {
    const raw = localStorage.getItem(PROBLEM_STATS_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return {}
}

function saveProblemStats(stats: ProblemStatsMap) {
  localStorage.setItem(PROBLEM_STATS_KEY, JSON.stringify(stats))
}

export function recordProblemAnswer(stats: ProblemStatsMap, key: string, correct: boolean): ProblemStatsMap {
  const prev = stats[key] ?? { solved: 0, failed: 0, lastSeen: 0 }
  const next = {
    ...stats,
    [key]: {
      solved: prev.solved + (correct ? 1 : 0),
      failed: prev.failed + (correct ? 0 : 1),
      lastSeen: Date.now(),
    },
  }
  saveProblemStats(next)
  return next
}

export function pickWeighted<T extends { id: string }>(
  pool: T[],
  stats: ProblemStatsMap,
  exclude?: T,
): T {
  const filtered = exclude ? pool.filter(p => p.id !== exclude.id) : pool
  if (filtered.length === 0) return pool[0]

  const now = Date.now()
  const weights = filtered.map((item) => {
    const s = stats[item.id]
    if (!s) return 3

    const total = s.solved + s.failed
    const errorRate = total > 0 ? s.failed / total : 0.5
    const hoursSince = (now - s.lastSeen) / (1000 * 60 * 60)
    const timeFactor = Math.min(hoursSince / 24, 2)

    return 1 + errorRate * 3 + timeFactor + (total < 3 ? 1 : 0)
  })

  const totalWeight = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * totalWeight
  for (let i = 0; i < filtered.length; i++) {
    r -= weights[i]
    if (r <= 0) return filtered[i]
  }
  return filtered[filtered.length - 1]
}
