import { describe, it, expect } from 'vitest'
import { attemptOutcome, createBoardState } from './board.ts'
import { generatePuzzle } from './puzzles.ts'

describe('attemptOutcome', () => {
  it('ignores an incomplete board', () => {
    const puzzle = generatePuzzle(1, 'en', {})
    expect(attemptOutcome(puzzle, createBoardState(puzzle))).toBeNull()
  })

  it('never counts an unsolved rotate puzzle as a failed attempt', () => {
    const puzzle = generatePuzzle(4, 'en', {})
    expect(puzzle.kind).toBe('rotate')
    expect(attemptOutcome(puzzle, createBoardState(puzzle))).toBeNull()
  })
})
