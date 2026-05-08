import { useCallback, useEffect, useRef, useState } from 'react'
import { getStrings } from '../services/i18n.ts'
import { generatePuzzle, getPuzzleLabel } from '../services/puzzles.ts'
import { loadProblemStats, loadScores, recordAttempt, recordProblemAnswer } from '../services/scores.ts'
import type {
  LanguageCode,
  PatternPuzzle,
  PieceGlyph,
  PuzzleDefinition,
  PuzzlePiece,
  RotatePuzzle,
  Score,
  SequencePuzzle,
  SortPuzzle,
} from '../types.ts'
import type { ProblemStatsMap } from '../services/scores.ts'

interface Props {
  language: LanguageCode
  level: number
  showStats: boolean
  onSolved?: (totalSolved: number) => void
}

interface BoardState {
  selectedPieceId: string | null
  slotPlacements: Record<string, string | null>
  bucketPlacements: Record<string, string[]>
  rotations: Record<string, number>
}

type FeedbackState =
  | { kind: 'solved'; message: string }
  | { kind: 'retry'; message: string }
  | { kind: 'incomplete'; message: string }
  | null

interface HistoryEntry {
  puzzle: PuzzleDefinition
  board: BoardState
  solvedAt: number
}

const HISTORY_KEY = 'freepuzzle-history'
const MAX_HISTORY = 50

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

function appendHistory(prev: HistoryEntry[], entry: HistoryEntry): HistoryEntry[] {
  const next = [...prev, entry].slice(-MAX_HISTORY)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
  return next
}

export function PracticeTab({ language, level, showStats, onSolved }: Props) {
  const strings = getStrings(language)
  const [scores, setScores] = useState<Score>(loadScores)
  const [problemStats, setProblemStats] = useState<ProblemStatsMap>(loadProblemStats)
  const [puzzle, setPuzzle] = useState<PuzzleDefinition | null>(null)
  const [board, setBoard] = useState<BoardState | null>(null)
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory)
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)
  const statsRef = useRef(problemStats)

  useEffect(() => {
    statsRef.current = problemStats
  }, [problemStats])

  const nextPuzzle = useCallback(() => {
    setPuzzle((prev) => {
      const next = generatePuzzle(level, language, statsRef.current, prev?.id)
      setBoard(createBoardState(next))
      setFeedback(null)
      return next
    })
  }, [language, level])

  useEffect(() => {
    const next = generatePuzzle(level, language, statsRef.current)
    setPuzzle(next)
    setBoard(createBoardState(next))
    setFeedback(null)
    setHistoryIndex(null)
  }, [language, level])

  const currentPiece = !puzzle || !board?.selectedPieceId
    ? null
    : getAllPieces(puzzle).find((piece) => piece.id === board.selectedPieceId) ?? null

  const onSelectPiece = useCallback((pieceId: string) => {
    setBoard((prev) => {
      if (!prev) return prev
      return { ...prev, selectedPieceId: prev.selectedPieceId === pieceId ? null : pieceId }
    })
  }, [])

  const onSlotPress = useCallback((slotId: string) => {
    if (!puzzle) return
    setBoard((prev) => {
      if (!prev) return prev
      const occupied = prev.slotPlacements[slotId]

      if (!prev.selectedPieceId && occupied) {
        return takePieceFromSlot(prev, slotId, occupied)
      }

      if (!prev.selectedPieceId) return prev

      let next = removePieceEverywhere(prev, prev.selectedPieceId)
      const swapPieceId = next.slotPlacements[slotId]
      next = {
        ...next,
        slotPlacements: {
          ...next.slotPlacements,
          [slotId]: prev.selectedPieceId,
        },
        selectedPieceId: swapPieceId && swapPieceId !== prev.selectedPieceId ? swapPieceId : null,
      }
      return next
    })
  }, [puzzle])

  const onBucketPress = useCallback((bucketId: string) => {
    setBoard((prev) => {
      if (!prev?.selectedPieceId) return prev
      const next = removePieceEverywhere(prev, prev.selectedPieceId)
      return {
        ...next,
        bucketPlacements: {
          ...next.bucketPlacements,
          [bucketId]: [...next.bucketPlacements[bucketId], prev.selectedPieceId],
        },
        selectedPieceId: null,
      }
    })
  }, [])

  const onBucketPiecePress = useCallback((bucketId: string, pieceId: string) => {
    setBoard((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        bucketPlacements: {
          ...prev.bucketPlacements,
          [bucketId]: prev.bucketPlacements[bucketId].filter((item) => item !== pieceId),
        },
        selectedPieceId: pieceId,
      }
    })
  }, [])

  const onRotateTile = useCallback((tileId: string) => {
    setBoard((prev) => {
      if (!prev) return prev
      const rotation = prev.rotations[tileId] ?? 0
      return {
        ...prev,
        rotations: {
          ...prev.rotations,
          [tileId]: (rotation + 90) % 360,
        },
      }
    })
  }, [])

  const onReset = useCallback(() => {
    if (!puzzle) return
    setBoard(createBoardState(puzzle))
    setFeedback(null)
  }, [puzzle])

  useEffect(() => {
    if (!puzzle || !board || feedback?.kind === 'solved') return
    if (evaluatePuzzle(puzzle, board) !== 'solved') return
    setScores((prev) => {
      const next = recordAttempt(prev, true)
      onSolved?.(next.solved)
      return next
    })
    setProblemStats((prev) => recordProblemAnswer(prev, puzzle.id, true))
    setFeedback({ kind: 'solved', message: puzzle.celebration })
    setHistory((prev) => appendHistory(prev, { puzzle, board, solvedAt: Date.now() }))
  }, [board, puzzle, feedback?.kind, onSolved])

  useEffect(() => {
    if (feedback?.kind !== 'solved' || historyIndex !== null) return
    const timer = setTimeout(nextPuzzle, 1200)
    return () => clearTimeout(timer)
  }, [feedback?.kind, nextPuzzle, historyIndex])

  if (showStats) return <div className="flex min-h-0 flex-1 flex-col overflow-y-auto"><StatsView scores={scores} problemStats={problemStats} language={language} /></div>
  if (!puzzle || !board) return null

  const viewingHistory = historyIndex !== null
  const displayPuzzle = viewingHistory ? history[historyIndex].puzzle : puzzle
  const displayBoard = viewingHistory ? { ...history[historyIndex].board, selectedPieceId: null } : board
  const bankPieces = viewingHistory ? [] : getBankPieces(puzzle, board)
  const solved = viewingHistory || feedback?.kind === 'solved'

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 sm:gap-3 lg:gap-4">
      <section className="shrink rounded-[1.6rem] border border-[var(--line)] bg-[var(--panel-strong)] p-2 shadow-[var(--shadow-card)] sm:p-3 lg:p-4 overflow-hidden">
        <div className="flex flex-col gap-2 sm:gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-0.5 sm:space-y-1">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-[var(--glass)] px-2 py-0.5 text-[0.62rem] font-extrabold uppercase tracking-[0.16em] text-[var(--accent-deep)] sm:px-3 sm:py-1 sm:text-[0.68rem]">
                {displayPuzzle.categoryLabel}
              </div>
              {viewingHistory && (
                <div className="inline-flex items-center gap-2 rounded-full bg-[var(--mint-gradient)] px-2 py-0.5 text-[0.62rem] font-extrabold uppercase tracking-[0.16em] text-[var(--ink)] sm:px-3 sm:py-1 sm:text-[0.68rem]">
                  {strings.solved}
                </div>
              )}
            </div>
            <div>
              <h1 className="display-font text-base font-extrabold text-[var(--ink)] sm:text-xl lg:text-3xl">{displayPuzzle.title}</h1>
              <p className="mt-0.5 max-w-3xl text-[0.7rem] leading-4 text-[var(--muted)] sm:mt-1 sm:text-sm sm:leading-6">{displayPuzzle.prompt}</p>
            </div>
          </div>

          {viewingHistory ? (
            <HistoryNav
              index={historyIndex}
              total={history.length}
              onPrev={() => setHistoryIndex(historyIndex > 0 ? historyIndex - 1 : 0)}
              onNext={() => setHistoryIndex(historyIndex < history.length - 1 ? historyIndex + 1 : null)}
              onResume={() => setHistoryIndex(null)}
            />
          ) : (
            <div className="grid grid-cols-3 gap-1.5 rounded-[1rem] bg-[var(--warm-gradient)] p-1.5 text-center shadow-[var(--shadow-card)] sm:gap-2 sm:rounded-[1.4rem] sm:p-2 sm:min-w-[18rem]">
              <StatPill label={strings.puzzlesSolved} value={scores.solved} tone="warm" />
              <StatPill label={strings.streak} value={scores.streak} tone="cool" />
              <StatPill label={strings.best} value={scores.bestStreak} tone="mint" />
            </div>
          )}
        </div>
      </section>

      <section className="grid min-h-0 flex-1 gap-2 sm:gap-3 lg:grid-cols-[minmax(0,1.25fr)_21rem] lg:gap-4 overflow-y-auto">
        <div className={`overflow-y-auto rounded-[1.2rem] border border-[var(--line)] bg-[var(--panel)] p-2 shadow-[var(--shadow-card)] sm:rounded-[1.7rem] sm:p-4 ${viewingHistory ? 'pointer-events-none' : ''}`}>
          <PuzzleStage
            puzzle={displayPuzzle}
            board={displayBoard}
            language={language}
            onSelectPiece={onSelectPiece}
            onSlotPress={onSlotPress}
            onBucketPress={onBucketPress}
            onBucketPiecePress={onBucketPiecePress}
            onRotateTile={onRotateTile}
          />
        </div>

        <aside className="flex min-h-0 flex-col gap-2 sm:gap-3 overflow-y-auto">
          {viewingHistory ? (
            <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--panel-strong)] p-4 shadow-[var(--shadow-card)]">
              <div className="rounded-[1.2rem] bg-[var(--mint-gradient)] px-4 py-3 text-sm font-semibold text-[var(--ink)]">
                <div className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[var(--muted)]">{strings.solved}</div>
                <div className="mt-1">{displayPuzzle.celebration}</div>
              </div>
              <div className="mt-4 rounded-[1.2rem] bg-[var(--cool-gradient)] p-3 text-sm leading-6 text-[var(--ink)]">
                {displayPuzzle.prompt}
              </div>
              <div className="mt-4">
                <HistoryNav
                  index={historyIndex}
                  total={history.length}
                  onPrev={() => setHistoryIndex(historyIndex > 0 ? historyIndex - 1 : 0)}
                  onNext={() => setHistoryIndex(historyIndex < history.length - 1 ? historyIndex + 1 : null)}
                  onResume={() => setHistoryIndex(null)}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-[1.2rem] border border-[var(--line)] bg-[var(--panel-strong)] p-2 shadow-[var(--shadow-card)] sm:rounded-[1.5rem] sm:p-4">
                <div className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[var(--muted)]">{strings.moveTray}</div>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:mt-3 sm:gap-3">
                  {bankPieces.map((piece) => (
                    <PieceButton
                      key={piece.id}
                      piece={piece}
                      active={board.selectedPieceId === piece.id}
                      onClick={() => onSelectPiece(piece.id)}
                    />
                  ))}
                  {bankPieces.length === 0 && (
                    <div className="col-span-2 rounded-[1rem] border border-dashed border-[var(--line-strong)] bg-[var(--glass-soft)] px-3 py-4 text-center text-sm font-semibold text-[var(--muted)] sm:rounded-[1.2rem] sm:px-4 sm:py-8">
                      {solved ? strings.levelDone : strings.tapPlacedPiece}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[1.2rem] border border-[var(--line)] bg-[var(--panel-strong)] p-2 shadow-[var(--shadow-card)] sm:rounded-[1.5rem] sm:p-4">
                <div className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[var(--muted)]">{strings.puzzleGoal}</div>
                <div className="mt-2 rounded-[1rem] bg-[var(--cool-gradient)] p-2 text-sm leading-5 text-[var(--ink)] sm:mt-3 sm:rounded-[1.2rem] sm:p-3 sm:leading-6">
                  {puzzle.prompt}
                </div>
                <div className="mt-2 rounded-[1rem] border border-[var(--line)] bg-[var(--glass-soft)] p-2 sm:mt-4 sm:rounded-[1.2rem] sm:p-3">
                  <div className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[var(--muted)]">{strings.selectedPiece}</div>
                  {currentPiece ? (
                    <div className="mt-3">
                      <PieceButton piece={currentPiece} active onClick={() => onSelectPiece(currentPiece.id)} />
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-[var(--muted)]">{strings.tapTarget}</p>
                  )}
                </div>

                {feedback && (
                  <div
                    className={`mt-2 rounded-[1rem] px-3 py-2 text-sm font-semibold sm:mt-4 sm:rounded-[1.2rem] sm:px-4 sm:py-3 ${
                      feedback.kind === 'solved'
                        ? 'bg-[var(--mint-gradient)] text-[var(--ink)]'
                        : feedback.kind === 'retry'
                          ? 'bg-[var(--warm-gradient)] text-[var(--ink)]'
                          : 'bg-[var(--glass-soft)] text-[var(--ink)]'
                    }`}
                  >
                    <div className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[var(--muted)]">
                      {feedback.kind === 'solved' ? strings.solved : feedback.kind === 'retry' ? strings.notQuite : strings.checkPuzzle}
                    </div>
                    <div className="mt-1">{feedback.message}</div>
                  </div>
                )}

                <div className="mt-2 flex flex-wrap gap-2 sm:mt-4">
                  <ActionButton label={strings.resetBoard} onClick={onReset} tone="quiet" />
                  {solved && <ActionButton label={strings.nextPuzzle} onClick={nextPuzzle} tone="success" />}
                  {!solved && history.length > 0 && (
                    <ActionButton label={`${strings.solved} (${history.length})`} onClick={() => setHistoryIndex(history.length - 1)} tone="quiet" />
                  )}
                </div>
              </div>
            </>
          )}
        </aside>
      </section>
    </div>
  )
}

function createBoardState(puzzle: PuzzleDefinition): BoardState {
  if (puzzle.kind === 'pattern') {
    return {
      selectedPieceId: null,
      slotPlacements: Object.fromEntries(
        puzzle.slots
          .filter((slot) => slot.answerPieceId)
          .map((slot) => [slot.id, null]),
      ),
      bucketPlacements: {},
      rotations: {},
    }
  }

  if (puzzle.kind === 'sequence') {
    return {
      selectedPieceId: null,
      slotPlacements: Object.fromEntries(puzzle.slots.map((slot) => [slot.id, null])),
      bucketPlacements: {},
      rotations: {},
    }
  }

  if (puzzle.kind === 'sort') {
    return {
      selectedPieceId: null,
      slotPlacements: {},
      bucketPlacements: Object.fromEntries(puzzle.buckets.map((bucket) => [bucket.id, []])),
      rotations: {},
    }
  }

  return {
    selectedPieceId: null,
    slotPlacements: {},
    bucketPlacements: {},
    rotations: Object.fromEntries(puzzle.tiles.map((tile) => [tile.id, tile.startRotation])),
  }
}

function getAllPieces(puzzle: PuzzleDefinition) {
  if (puzzle.kind === 'rotate') return []
  return puzzle.pieces
}

function getBankPieces(puzzle: PuzzleDefinition, board: BoardState) {
  if (puzzle.kind === 'rotate') return []
  const used = new Set<string>()
  Object.values(board.slotPlacements).forEach((pieceId) => pieceId && used.add(pieceId))
  Object.values(board.bucketPlacements).forEach((pieces) => pieces.forEach((pieceId) => used.add(pieceId)))
  return puzzle.pieces.filter((piece) => !used.has(piece.id) || board.selectedPieceId === piece.id)
}

function removePieceEverywhere(board: BoardState, pieceId: string): BoardState {
  const slotPlacements = Object.fromEntries(
    Object.entries(board.slotPlacements).map(([slotId, placed]) => [slotId, placed === pieceId ? null : placed]),
  )
  const bucketPlacements = Object.fromEntries(
    Object.entries(board.bucketPlacements).map(([bucketId, pieces]) => [bucketId, pieces.filter((item) => item !== pieceId)]),
  )
  return { ...board, slotPlacements, bucketPlacements }
}

function takePieceFromSlot(board: BoardState, slotId: string, pieceId: string): BoardState {
  return {
    ...board,
    slotPlacements: {
      ...board.slotPlacements,
      [slotId]: null,
    },
    selectedPieceId: pieceId,
  }
}

function evaluatePuzzle(puzzle: PuzzleDefinition, board: BoardState) {
  if (puzzle.kind === 'pattern') {
    const openSlots = puzzle.slots.filter((slot) => slot.answerPieceId)
    const incomplete = openSlots.some((slot) => !board.slotPlacements[slot.id])
    if (incomplete) return 'incomplete' as const
    const solved = openSlots.every((slot) => board.slotPlacements[slot.id] === slot.answerPieceId)
    return solved ? 'solved' as const : 'wrong' as const
  }

  if (puzzle.kind === 'sequence') {
    const incomplete = puzzle.slots.some((slot) => !board.slotPlacements[slot.id])
    if (incomplete) return 'incomplete' as const
    const solved = puzzle.answers.every((pieceId, index) => board.slotPlacements[puzzle.slots[index].id] === pieceId)
    return solved ? 'solved' as const : 'wrong' as const
  }

  if (puzzle.kind === 'sort') {
    const placedCount = Object.values(board.bucketPlacements).reduce((sum, pieces) => sum + pieces.length, 0)
    if (placedCount < puzzle.pieces.length) return 'incomplete' as const
    const solved = puzzle.pieces.every((piece) =>
      board.bucketPlacements[puzzle.answers[piece.id]]?.includes(piece.id),
    )
    return solved ? 'solved' as const : 'wrong' as const
  }

  const solved = puzzle.tiles.every((tile) => (board.rotations[tile.id] ?? 0) % 360 === tile.targetRotation % 360)
  return solved ? 'solved' as const : 'wrong' as const
}

function PuzzleStage({
  puzzle,
  board,
  language,
  onSelectPiece,
  onSlotPress,
  onBucketPress,
  onBucketPiecePress,
  onRotateTile,
}: {
  puzzle: PuzzleDefinition
  board: BoardState
  language: LanguageCode
  onSelectPiece: (pieceId: string) => void
  onSlotPress: (slotId: string) => void
  onBucketPress: (bucketId: string) => void
  onBucketPiecePress: (bucketId: string, pieceId: string) => void
  onRotateTile: (tileId: string) => void
}) {
  const strings = getStrings(language)

  if (puzzle.kind === 'pattern') {
    return <PatternBoard puzzle={puzzle} board={board} onSlotPress={onSlotPress} />
  }

  if (puzzle.kind === 'sort') {
    return (
      <SortBoard
        puzzle={puzzle}
        board={board}
        onBucketPress={onBucketPress}
        onBucketPiecePress={onBucketPiecePress}
        onSelectPiece={onSelectPiece}
      />
    )
  }

  if (puzzle.kind === 'sequence') {
    return <SequenceBoard puzzle={puzzle} board={board} onSlotPress={onSlotPress} />
  }

  return <RotateBoard puzzle={puzzle} board={board} onRotateTile={onRotateTile} rotateHint={strings.rotateHint} />
}

function PatternBoard({
  puzzle,
  board,
  onSlotPress,
}: {
  puzzle: PatternPuzzle
  board: BoardState
  onSlotPress: (slotId: string) => void
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {puzzle.slots.map((slot) => {
          const placedPiece = slot.answerPieceId ? puzzle.pieces.find((piece) => piece.id === board.slotPlacements[slot.id]) : null
          const content = slot.fixedPiece ?? placedPiece
          return (
            <button
              key={slot.id}
              className={`rounded-[1.4rem] border p-3 text-left shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 ${
                slot.fixedPiece
                  ? 'border-[var(--line)] bg-[var(--glass-soft)]'
                  : 'border-dashed border-[var(--line-strong)] bg-[var(--warm-gradient)]'
              }`}
              onClick={() => !slot.fixedPiece && onSlotPress(slot.id)}
              type="button"
            >
              <div className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[var(--muted)]">{slot.hint}</div>
              <div className="mt-3 min-h-12">
                {content ? <PieceCard piece={content} compact /> : <EmptyCard label="Place piece" />}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SequenceBoard({
  puzzle,
  board,
  onSlotPress,
}: {
  puzzle: SequencePuzzle
  board: BoardState
  onSlotPress: (slotId: string) => void
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {puzzle.slots.map((slot, index) => {
        const placedPiece = puzzle.pieces.find((piece) => piece.id === board.slotPlacements[slot.id])
        return (
          <button
            key={slot.id}
            className="rounded-[1.4rem] border border-dashed border-[var(--line-strong)] bg-[var(--cool-gradient)] p-3 text-left shadow-[var(--shadow-card)] transition hover:-translate-y-0.5"
            onClick={() => onSlotPress(slot.id)}
            type="button"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[var(--muted)]">
                {index + 1}. {slot.hint}
              </div>
            </div>
            <div className="mt-3 min-h-12">
              {placedPiece ? <PieceCard piece={placedPiece} compact /> : <EmptyCard label="Place story card" />}
            </div>
          </button>
        )
      })}
    </div>
  )
}

function SortBoard({
  puzzle,
  board,
  onBucketPress,
  onBucketPiecePress,
  onSelectPiece,
}: {
  puzzle: SortPuzzle
  board: BoardState
  onBucketPress: (bucketId: string) => void
  onBucketPiecePress: (bucketId: string, pieceId: string) => void
  onSelectPiece: (pieceId: string) => void
}) {
  const bankPieces = getBankPieces(puzzle, board)

  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-2">
        {puzzle.buckets.map((bucket) => (
          <button
            key={bucket.id}
            className="rounded-[1.5rem] border border-[var(--line)] p-4 text-left shadow-[var(--shadow-card)] transition hover:-translate-y-0.5"
            style={{ background: `linear-gradient(180deg, ${bucket.color}22, rgba(255,255,255,0.72))` }}
            onClick={() => onBucketPress(bucket.id)}
            type="button"
          >
            <div className="text-sm font-extrabold text-[var(--ink)]">{bucket.label}</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{bucket.hint}</div>
            <div className="mt-4 grid gap-2">
              {board.bucketPlacements[bucket.id].length === 0 && <EmptyCard label="Drop pieces here" />}
              {board.bucketPlacements[bucket.id].map((pieceId) => {
                const placedPiece = puzzle.pieces.find((piece) => piece.id === pieceId)
                if (!placedPiece) return null
                return (
                  <PieceButton
                    key={pieceId}
                    piece={placedPiece}
                    compact
                    onClick={() => onBucketPiecePress(bucket.id, pieceId)}
                  />
                )
              })}
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-[1.4rem] border border-[var(--line)] bg-[var(--glass-soft)] p-4">
        <div className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[var(--muted)]">Extra pieces</div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {bankPieces.map((piece) => (
            <PieceButton key={piece.id} piece={piece} onClick={() => onSelectPiece(piece.id)} />
          ))}
        </div>
      </div>
    </div>
  )
}

function RotateBoard({
  puzzle,
  board,
  onRotateTile,
  rotateHint,
}: {
  puzzle: RotatePuzzle
  board: BoardState
  onRotateTile: (tileId: string) => void
  rotateHint: string
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {puzzle.tiles.map((tile) => (
        <button
          key={tile.id}
          className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--panel-strong)] p-4 text-left shadow-[var(--shadow-card)] transition hover:-translate-y-0.5"
          onClick={() => onRotateTile(tile.id)}
          type="button"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="rounded-full border border-[var(--line)] bg-[var(--glass-soft)] px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[var(--muted)]">
              {tile.label}
            </div>
            <div className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[var(--muted)]">{rotateHint}</div>
          </div>
          <div className="mt-2 flex justify-center rounded-[1.25rem] bg-[var(--cool-gradient)] p-3">
            <div style={{ transform: `rotate(${board.rotations[tile.id] ?? 0}deg)` }}>
              <Glyph glyph={tile.glyph} color={tile.color} size={56} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
            <DirectionBadge label={tile.label} />
            <span>Match this direction</span>
          </div>
        </button>
      ))}
    </div>
  )
}

function PieceButton({
  piece,
  active,
  compact,
  onClick,
}: {
  piece: PuzzlePiece
  active?: boolean
  compact?: boolean
  onClick: () => void
}) {
  return (
    <button
      className={`rounded-[1.25rem] border p-3 text-left shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 ${
        active
          ? 'border-[var(--accent)] bg-[var(--warm-gradient)]'
          : 'border-[var(--line)] bg-[var(--panel-strong)]'
      } ${compact ? 'w-full' : ''}`}
      onClick={onClick}
      type="button"
    >
      <PieceCard piece={piece} compact={compact} />
    </button>
  )
}

function PieceCard({ piece, compact }: { piece: PuzzlePiece; compact?: boolean }) {
  return (
    <div className={`flex ${compact ? 'items-center gap-3' : 'flex-col gap-3'}`}>
      <div
        className="inline-flex h-10 w-10 items-center justify-center rounded-[0.8rem] sm:h-12 sm:w-12 sm:rounded-[1rem]"
        style={{ backgroundColor: piece.color, color: piece.textColor ?? '#111111' }}
      >
        <Glyph glyph={piece.glyph} color="currentColor" size={28} />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-extrabold text-[var(--ink)]">{piece.label}</div>
      </div>
    </div>
  )
}

function EmptyCard({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-12 items-center justify-center rounded-[1.1rem] border border-dashed border-[var(--line-strong)] bg-[var(--glass-soft)] px-3 text-center text-sm font-semibold text-[var(--muted)]">
      {label}
    </div>
  )
}

function StatPill({ label, value, tone }: { label: string; value: number; tone: 'warm' | 'cool' | 'mint' }) {
  const styles = {
    warm: 'bg-[var(--warm-gradient)]',
    cool: 'bg-[var(--cool-gradient)]',
    mint: 'bg-[var(--mint-gradient)]',
  } as const

  return (
    <div className={`rounded-[0.75rem] px-2 py-2 sm:rounded-[1rem] sm:px-3 sm:py-3 ${styles[tone]}`}>
      <div className="text-[0.58rem] font-extrabold uppercase tracking-[0.14em] text-[var(--muted)] sm:text-[0.68rem]">{label}</div>
      <div className="mt-0.5 text-lg font-extrabold text-[var(--ink)] sm:mt-1 sm:text-2xl">{value}</div>
    </div>
  )
}

function HistoryNav({
  index,
  total,
  onPrev,
  onNext,
  onResume,
}: {
  index: number
  total: number
  onPrev: () => void
  onNext: () => void
  onResume: () => void
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--glass-soft)] text-[var(--ink)] disabled:opacity-30"
        onClick={onPrev}
        disabled={index === 0}
        type="button"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <span className="min-w-[3.5rem] text-center text-sm font-extrabold text-[var(--muted)]">
        {index + 1} / {total}
      </span>
      <button
        className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--glass-soft)] text-[var(--ink)]"
        onClick={index < total - 1 ? onNext : onResume}
        type="button"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        className="rounded-full border border-[var(--line)] bg-[var(--glass-soft)] px-3 min-h-[2.75rem] min-w-[2.75rem] text-xs font-extrabold text-[var(--ink)]"
        onClick={onResume}
        type="button"
      >
        Resume
      </button>
    </div>
  )
}

function ActionButton({
  label,
  onClick,
  tone,
}: {
  label: string
  onClick: () => void
  tone: 'quiet' | 'accent' | 'success'
}) {
  const styles = {
    quiet: 'border border-[var(--line)] bg-[var(--glass-soft)] text-[var(--ink)]',
    accent: 'border border-transparent bg-[var(--accent)] text-white',
    success: 'border border-transparent bg-[var(--mint)] text-black',
  } as const

  return (
    <button className={`rounded-full px-4 py-2.5 min-h-[2.75rem] text-sm font-extrabold shadow-[var(--shadow-card)] ${styles[tone]}`} onClick={onClick} type="button">
      {label}
    </button>
  )
}

function StatsView({
  scores,
  problemStats,
  language,
}: {
  scores: Score
  problemStats: ProblemStatsMap
  language: LanguageCode
}) {
  const strings = getStrings(language)
  const accuracy = scores.checks > 0 ? Math.round((scores.solved / scores.checks) * 100) : 0
  const ranked = Object.entries(problemStats).sort((a, b) => {
    const scoreA = a[1].failed - a[1].solved
    const scoreB = b[1].failed - b[1].solved
    return scoreB - scoreA
  })

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <StatPill label={strings.solvedLabel} value={scores.solved} tone="warm" />
        <StatPill label={strings.checksLabel} value={scores.checks} tone="cool" />
        <StatPill label={strings.bestStreak} value={scores.bestStreak} tone="mint" />
        <StatPill label={strings.accuracy} value={accuracy} tone="warm" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--panel-strong)] p-4 shadow-[var(--shadow-card)]">
          <div className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[var(--muted)]">{strings.mastered}</div>
          <div className="mt-3 space-y-2">
            {ranked
              .filter(([, stat]) => stat.solved >= 2 && stat.failed === 0)
              .slice(0, 5)
              .map(([id]) => (
                <div key={id} className="rounded-[1rem] bg-[var(--mint-gradient)] px-3 py-2 text-sm font-semibold text-[var(--ink)]">
                  {getPuzzleLabel(id, language)}
                </div>
              ))}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--panel-strong)] p-4 shadow-[var(--shadow-card)]">
          <div className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[var(--muted)]">{strings.struggling}</div>
          <div className="mt-3 space-y-2">
            {ranked.slice(0, 5).map(([id]) => (
              <div key={id} className="rounded-[1rem] bg-[var(--warm-gradient)] px-3 py-2 text-sm font-semibold text-[var(--ink)]">
                {getPuzzleLabel(id, language)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function DirectionBadge({ label }: { label: string }) {
  const angle = label === 'Right' ? 90 : label === 'Down' ? 180 : label === 'Left' ? 270 : 0
  return (
    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--ink)] text-white" style={{ transform: `rotate(${angle}deg)` }}>
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2}>
        <path d="M12 5v14" strokeLinecap="round" />
        <path d="M7 10l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

const EMOJI: Record<PieceGlyph, string> = {
  sun: '☀️',
  moon: '🌙',
  leaf: '🍃',
  flower: '🌸',
  star: '⭐',
  drop: '💧',
  fish: '🐟',
  fox: '🦊',
  triangle: '🔺',
  circle: '⭕',
  square: '🔳',
  oval: '🥚',
  seed: '🌰',
  sprout: '🌱',
  tree: '🌳',
  plate: '🍽️',
  berry: '🫐',
  jar: '🫙',
  rocket: '🚀',
  bird: '🐦',
  arrow: '⬆️',
  pinwheel: '💫',
  drum: '🥁',
  flute: '🎵',
  maraca: '🪇',
  book: '📖',
  paint: '🎨',
  shell: '🐚',
}

function Glyph({ glyph, size }: { glyph: PieceGlyph; color?: string; size?: number }) {
  const dimension = size ?? 32
  return (
    <span
      className="inline-flex select-none items-center justify-center leading-none"
      style={{ width: dimension, height: dimension, fontSize: dimension * 0.75 }}
    >
      {EMOJI[glyph]}
    </span>
  )
}
