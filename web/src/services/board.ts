import type { PuzzleDefinition } from '../types.ts'

export interface BoardState {
  selectedPieceId: string | null
  slotPlacements: Record<string, string | null>
  bucketPlacements: Record<string, string[]>
  rotations: Record<string, number>
}

export function createBoardState(puzzle: PuzzleDefinition): BoardState {
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

export function getAllPieces(puzzle: PuzzleDefinition) {
  if (puzzle.kind === 'rotate') return []
  return puzzle.pieces
}

export function getBankPieces(puzzle: PuzzleDefinition, board: BoardState) {
  if (puzzle.kind === 'rotate') return []
  const used = new Set<string>()
  Object.values(board.slotPlacements).forEach((pieceId) => pieceId && used.add(pieceId))
  Object.values(board.bucketPlacements).forEach((pieces) => pieces.forEach((pieceId) => used.add(pieceId)))
  return puzzle.pieces.filter((piece) => !used.has(piece.id) || board.selectedPieceId === piece.id)
}

export function removePieceEverywhere(board: BoardState, pieceId: string): BoardState {
  const slotPlacements = Object.fromEntries(
    Object.entries(board.slotPlacements).map(([slotId, placed]) => [slotId, placed === pieceId ? null : placed]),
  )
  const bucketPlacements = Object.fromEntries(
    Object.entries(board.bucketPlacements).map(([bucketId, pieces]) => [bucketId, pieces.filter((item) => item !== pieceId)]),
  )
  return { ...board, slotPlacements, bucketPlacements }
}

export function takePieceFromSlot(board: BoardState, slotId: string, pieceId: string): BoardState {
  return {
    ...board,
    slotPlacements: {
      ...board.slotPlacements,
      [slotId]: null,
    },
    selectedPieceId: pieceId,
  }
}

export function evaluatePuzzle(puzzle: PuzzleDefinition, board: BoardState) {
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
