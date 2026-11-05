import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import type { SortPuzzle } from '../types.ts'

const SORT: SortPuzzle = {
  id: 'test-sort',
  kind: 'sort',
  title: 'Test sort',
  categoryLabel: 'Sort',
  prompt: 'Sort them',
  celebration: 'Done!',
  buckets: [
    { id: 'river', label: 'River', hint: 'Swim', color: '#00f' },
    { id: 'meadow', label: 'Meadow', hint: 'Run', color: '#0f0' },
  ],
  pieces: [
    { id: 'fish', label: 'Fish', glyph: 'fish', color: '#00f' },
    { id: 'fox', label: 'Fox', glyph: 'fox', color: '#f00' },
  ],
  answers: { fish: 'river', fox: 'meadow' },
}

vi.mock('../services/puzzles.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services/puzzles.ts')>()),
  generatePuzzle: () => SORT,
}))

import { PracticeTab } from './PracticeTab.tsx'

const pieceButton = (label: string) => screen.getAllByText(label)[0]!.closest('button')!
const bucket = (label: string) => screen.getByRole('button', { name: label })
const bucketCard = (label: string) => bucket(label).parentElement!
const storedScores = () => JSON.parse(localStorage.getItem('freepuzzle-scores') ?? 'null')

beforeEach(() => localStorage.clear())
afterEach(cleanup)

describe('PracticeTab stats', () => {
  it('records a full but wrong board as a failed check', () => {
    render(<PracticeTab language="en" level={2} showStats={false} />)
    fireEvent.click(pieceButton('Fish'))
    fireEvent.click(bucket('Meadow'))
    fireEvent.click(pieceButton('Fox'))
    fireEvent.click(bucket('River'))

    expect(screen.getByText('Not quite')).toBeInTheDocument()
    expect(storedScores()).toMatchObject({ solved: 0, checks: 1, streak: 0 })
    expect(JSON.parse(localStorage.getItem('freepuzzle-puzzle-stats')!)['test-sort']).toMatchObject({ solved: 0, failed: 1 })
  })

  it('records a solve once', () => {
    render(<PracticeTab language="en" level={2} showStats={false} />)
    fireEvent.click(pieceButton('Fish'))
    fireEvent.click(bucket('River'))
    fireEvent.click(pieceButton('Fox'))
    fireEvent.click(bucket('Meadow'))

    expect(storedScores()).toMatchObject({ solved: 1, checks: 1, streak: 1 })
  })
})

describe('PracticeTab sort buckets', () => {
  it('tapping a placed piece picks it back up', () => {
    render(<PracticeTab language="en" level={2} showStats={false} />)
    fireEvent.click(pieceButton('Fish'))
    fireEvent.click(bucket('River'))
    const placed = screen.getAllByText('Fish').map((el) => el.closest('button')!).find((b) => bucketCard('River').contains(b))!
    fireEvent.click(placed)
    // Picked up: it is back in the tray, no longer inside the River bucket.
    expect(bucketCard('River')).not.toContainElement(placed)
    expect(screen.getAllByText('Drop pieces here')).toHaveLength(2)
  })

  it('never nests a button inside another button', () => {
    const { container } = render(<PracticeTab language="en" level={2} showStats={false} />)
    fireEvent.click(pieceButton('Fish'))
    fireEvent.click(bucket('River'))
    expect(bucketCard('River')).toHaveTextContent('Fish')
    expect(container.querySelectorAll('button button')).toHaveLength(0)
  })
})
