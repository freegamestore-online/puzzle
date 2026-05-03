import type {
  LanguageCode,
  PatternPuzzle,
  PieceGlyph,
  PuzzleDefinition,
  PuzzlePiece,
  RotatePuzzle,
  SequencePuzzle,
  SortPuzzle,
} from '../types.ts'
import { pickWeighted, type ProblemStatsMap } from './scores.ts'

type LocalizedText = { en: string } & Partial<Record<LanguageCode, string>>

interface PatternTemplate extends Omit<PatternPuzzle, 'title' | 'categoryLabel' | 'prompt' | 'celebration'> {
  title: LocalizedText
  categoryLabel: LocalizedText
  prompt: LocalizedText
  celebration: LocalizedText
}

interface SortTemplate extends Omit<SortPuzzle, 'title' | 'categoryLabel' | 'prompt' | 'celebration'> {
  title: LocalizedText
  categoryLabel: LocalizedText
  prompt: LocalizedText
  celebration: LocalizedText
}

interface SequenceTemplate extends Omit<SequencePuzzle, 'title' | 'categoryLabel' | 'prompt' | 'celebration'> {
  title: LocalizedText
  categoryLabel: LocalizedText
  prompt: LocalizedText
  celebration: LocalizedText
}

interface RotateTemplate extends Omit<RotatePuzzle, 'title' | 'categoryLabel' | 'prompt' | 'celebration'> {
  title: LocalizedText
  categoryLabel: LocalizedText
  prompt: LocalizedText
  celebration: LocalizedText
}

type PuzzleTemplate = PatternTemplate | SortTemplate | SequenceTemplate | RotateTemplate

const text = (en: string, partial?: Partial<Record<LanguageCode, string>>): LocalizedText => ({ en, ...partial })

const label = (en: string, es?: string): LocalizedText => text(en, es ? { es } : undefined)

const TITLES = {
  pattern: label('Pattern Parade', 'Desfile de patrones'),
  sort: label('Sorting Tables', 'Mesas de clasificacion'),
  sequence: label('Story Steps', 'Pasos de historia'),
  rotate: label('Spin Studio', 'Estudio giratorio'),
  mixed: label('Mixed Workshop', 'Taller mixto'),
  sprint: label('Puzzle Sprint', 'Sprint de rompecabezas'),
} as const

const CATEGORIES = {
  pattern: label('Build the pattern', 'Construye el patron'),
  sort: label('Move each piece home', 'Lleva cada pieza a su lugar'),
  sequence: label('Put the scene in order', 'Pon la escena en orden'),
  rotate: label('Turn tiles to match', 'Gira las piezas para coincidir'),
  mixed: label('Mix of puzzle skills', 'Mezcla de habilidades'),
} as const

const LEVEL_LABELS: Record<number, LocalizedText> = {
  1: TITLES.pattern,
  2: TITLES.sort,
  3: TITLES.sequence,
  4: TITLES.rotate,
  5: TITLES.mixed,
  6: TITLES.sprint,
}

const piece = (
  id: string,
  labelText: string,
  glyph: PieceGlyph,
  color: string,
  textColor?: string,
): PuzzlePiece => ({ id, label: labelText, glyph, color, textColor })

const coral = '#ff8a54'
const gold = '#ffd36b'
const teal = '#53d2c2'
const sky = '#6ea8ff'
const plum = '#8d79ff'
const mint = '#9be56f'
const rose = '#ff7db5'
const sand = '#ffd9bf'

const PUZZLES: Record<number, PuzzleTemplate[]> = {
  1: [
    {
      id: 'pattern-day-night',
      kind: 'pattern',
      title: label('Day Night Train'),
      categoryLabel: CATEGORIES.pattern,
      prompt: label('Finish the train by placing the missing sun and moon cars.'),
      celebration: label('The pattern train is rolling.'),
      slots: [
        { id: 'slot-1', hint: '1', fixedPiece: piece('sun-fixed-1', 'Sun', 'sun', coral) },
        { id: 'slot-2', hint: '2', fixedPiece: piece('moon-fixed-1', 'Moon', 'moon', plum) },
        { id: 'slot-3', hint: '3', answerPieceId: 'sun-bank' },
        { id: 'slot-4', hint: '4', fixedPiece: piece('moon-fixed-2', 'Moon', 'moon', plum) },
        { id: 'slot-5', hint: '5', answerPieceId: 'sun-bank-2' },
        { id: 'slot-6', hint: '6', answerPieceId: 'moon-bank' },
      ],
      pieces: [
        piece('sun-bank', 'Sun', 'sun', coral),
        piece('sun-bank-2', 'Sun', 'sun', coral),
        piece('moon-bank', 'Moon', 'moon', plum),
      ],
    },
    {
      id: 'pattern-garden-loop',
      kind: 'pattern',
      title: label('Garden Loop'),
      categoryLabel: CATEGORIES.pattern,
      prompt: label('Complete the garden loop so leaf, flower, star repeats again.'),
      celebration: label('The flower bed loops perfectly.'),
      slots: [
        { id: 'slot-1', hint: '1', fixedPiece: piece('leaf-fixed', 'Leaf', 'leaf', mint) },
        { id: 'slot-2', hint: '2', fixedPiece: piece('flower-fixed', 'Flower', 'flower', rose) },
        { id: 'slot-3', hint: '3', fixedPiece: piece('star-fixed', 'Star', 'star', gold, '#5e4200') },
        { id: 'slot-4', hint: '4', answerPieceId: 'leaf-bank' },
        { id: 'slot-5', hint: '5', answerPieceId: 'flower-bank' },
        { id: 'slot-6', hint: '6', answerPieceId: 'star-bank' },
      ],
      pieces: [
        piece('leaf-bank', 'Leaf', 'leaf', mint),
        piece('flower-bank', 'Flower', 'flower', rose),
        piece('star-bank', 'Star', 'star', gold, '#5e4200'),
      ],
    },
  ],
  2: [
    {
      id: 'sort-river-meadow',
      kind: 'sort',
      title: label('River and Meadow'),
      categoryLabel: CATEGORIES.sort,
      prompt: label('Move each animal to the place where it belongs.'),
      celebration: label('Every animal found the right home.'),
      buckets: [
        { id: 'river', label: 'River', hint: 'Swim here', color: sky },
        { id: 'meadow', label: 'Meadow', hint: 'Run here', color: mint },
      ],
      pieces: [
        piece('fish-piece', 'Fish', 'fish', sky),
        piece('drop-piece', 'Raindrop', 'drop', teal),
        piece('fox-piece', 'Fox', 'fox', coral),
        piece('leaf-piece', 'Leaf', 'leaf', mint),
      ],
      answers: {
        'fish-piece': 'river',
        'drop-piece': 'river',
        'fox-piece': 'meadow',
        'leaf-piece': 'meadow',
      },
    },
    {
      id: 'sort-shape-shelves',
      kind: 'sort',
      title: label('Shape Shelves'),
      categoryLabel: CATEGORIES.sort,
      prompt: label('Round shapes go left. Shapes with corners go right.'),
      celebration: label('The shelves are tidy and sorted.'),
      buckets: [
        { id: 'round', label: 'Round', hint: 'No corners', color: rose },
        { id: 'corners', label: 'Corners', hint: 'Pointy edges', color: gold },
      ],
      pieces: [
        piece('circle-piece', 'Circle', 'circle', rose),
        piece('oval-piece', 'Oval', 'oval', sand, '#70442d'),
        piece('triangle-piece', 'Triangle', 'triangle', teal),
        piece('square-piece', 'Square', 'square', sky),
      ],
      answers: {
        'circle-piece': 'round',
        'oval-piece': 'round',
        'triangle-piece': 'corners',
        'square-piece': 'corners',
      },
    },
  ],
  3: [
    {
      id: 'sequence-seed-story',
      kind: 'sequence',
      title: label('Seed to Bloom'),
      categoryLabel: CATEGORIES.sequence,
      prompt: label('Place the story cards from first to last.'),
      celebration: label('The flower story now makes sense.'),
      slots: [
        { id: 'step-1', hint: 'Start' },
        { id: 'step-2', hint: 'Then' },
        { id: 'step-3', hint: 'Next' },
        { id: 'step-4', hint: 'Finish' },
      ],
      pieces: [
        piece('seed-card', 'Put the seed in soil', 'seed', gold, '#5e4200'),
        piece('water-card', 'Give the pot water', 'drop', sky),
        piece('sprout-card', 'A green sprout pops up', 'sprout', mint),
        piece('flower-card', 'The flower opens', 'flower', rose),
      ],
      answers: ['seed-card', 'water-card', 'sprout-card', 'flower-card'],
    },
    {
      id: 'sequence-snack-story',
      kind: 'sequence',
      title: label('Snack Builder'),
      categoryLabel: CATEGORIES.sequence,
      prompt: label('Order the snack steps so the parfait gets built correctly.'),
      celebration: label('That snack stack is ready to eat.'),
      slots: [
        { id: 'step-1', hint: '1' },
        { id: 'step-2', hint: '2' },
        { id: 'step-3', hint: '3' },
        { id: 'step-4', hint: '4' },
      ],
      pieces: [
        piece('jar-card', 'Set out the jar', 'jar', sand, '#70442d'),
        piece('yogurt-card', 'Scoop in yogurt', 'plate', teal),
        piece('berry-card', 'Drop in berries', 'berry', rose),
        piece('top-card', 'Add a crunchy top', 'star', gold, '#5e4200'),
      ],
      answers: ['jar-card', 'yogurt-card', 'berry-card', 'top-card'],
    },
  ],
  4: [
    {
      id: 'rotate-rockets',
      kind: 'rotate',
      title: label('Rocket Compass'),
      categoryLabel: CATEGORIES.rotate,
      prompt: label('Tap each tile until the rocket points where the little arrow badge says.'),
      celebration: label('All rockets are pointing the right way.'),
      tiles: [
        { id: 'rocket-1', label: 'Up', glyph: 'rocket', color: coral, targetRotation: 0, startRotation: 180 },
        { id: 'rocket-2', label: 'Right', glyph: 'rocket', color: sky, targetRotation: 90, startRotation: 270 },
        { id: 'rocket-3', label: 'Left', glyph: 'rocket', color: mint, targetRotation: 270, startRotation: 0 },
        { id: 'rocket-4', label: 'Down', glyph: 'rocket', color: plum, targetRotation: 180, startRotation: 90 },
      ],
    },
    {
      id: 'rotate-birds',
      kind: 'rotate',
      title: label('Bird Turnabout'),
      categoryLabel: CATEGORIES.rotate,
      prompt: label('Turn every bird so it matches its direction badge.'),
      celebration: label('The birds all know where to fly.'),
      tiles: [
        { id: 'bird-1', label: 'Left', glyph: 'bird', color: rose, targetRotation: 270, startRotation: 90 },
        { id: 'bird-2', label: 'Up', glyph: 'bird', color: gold, targetRotation: 0, startRotation: 180 },
        { id: 'bird-3', label: 'Down', glyph: 'bird', color: teal, targetRotation: 180, startRotation: 270 },
        { id: 'bird-4', label: 'Right', glyph: 'bird', color: sand, targetRotation: 90, startRotation: 0 },
      ],
    },
  ],
  5: [
    {
      id: 'pattern-color-rhythm',
      kind: 'pattern',
      title: label('Color Rhythm'),
      categoryLabel: CATEGORIES.mixed,
      prompt: label('Build the beat: coral, teal, gold, then repeat it one more time.'),
      celebration: label('That rhythm line is perfectly steady.'),
      slots: [
        { id: 'slot-1', hint: '1', fixedPiece: piece('coral-fixed', 'Coral', 'drum', coral) },
        { id: 'slot-2', hint: '2', fixedPiece: piece('teal-fixed', 'Teal', 'flute', teal) },
        { id: 'slot-3', hint: '3', fixedPiece: piece('gold-fixed', 'Gold', 'maraca', gold, '#5e4200') },
        { id: 'slot-4', hint: '4', answerPieceId: 'coral-bank' },
        { id: 'slot-5', hint: '5', answerPieceId: 'teal-bank' },
        { id: 'slot-6', hint: '6', answerPieceId: 'gold-bank' },
      ],
      pieces: [
        piece('coral-bank', 'Coral', 'drum', coral),
        piece('teal-bank', 'Teal', 'flute', teal),
        piece('gold-bank', 'Gold', 'maraca', gold, '#5e4200'),
      ],
    },
    {
      id: 'sort-art-room',
      kind: 'sort',
      title: label('Art Room Carts'),
      categoryLabel: CATEGORIES.mixed,
      prompt: label('Place reading things on the library cart and art things on the studio cart.'),
      celebration: label('The room carts are ready to roll.'),
      buckets: [
        { id: 'library', label: 'Library cart', hint: 'Read here', color: plum },
        { id: 'studio', label: 'Studio cart', hint: 'Create here', color: coral },
      ],
      pieces: [
        piece('book-piece', 'Book', 'book', plum),
        piece('shell-piece', 'Story shell', 'shell', sand, '#70442d'),
        piece('paint-piece', 'Paint tray', 'paint', coral),
        piece('flower-piece', 'Flower stamp', 'flower', rose),
      ],
      answers: {
        'book-piece': 'library',
        'shell-piece': 'library',
        'paint-piece': 'studio',
        'flower-piece': 'studio',
      },
    },
  ],
  6: [
    {
      id: 'sequence-camp-morning',
      kind: 'sequence',
      title: label('Camp Morning'),
      categoryLabel: CATEGORIES.mixed,
      prompt: label('Put the camp morning in the order it happens.'),
      celebration: label('Camp is ready for a bright day.'),
      slots: [
        { id: 'step-1', hint: 'Wake' },
        { id: 'step-2', hint: 'Pack' },
        { id: 'step-3', hint: 'Travel' },
        { id: 'step-4', hint: 'Play' },
      ],
      pieces: [
        piece('wake-card', 'Wake up in the tent', 'moon', plum),
        piece('pack-card', 'Pack the map and snacks', 'book', gold, '#5e4200'),
        piece('walk-card', 'Walk to the lake', 'leaf', mint),
        piece('paddle-card', 'Paddle the canoe', 'drop', sky),
      ],
      answers: ['wake-card', 'pack-card', 'walk-card', 'paddle-card'],
    },
    {
      id: 'rotate-pinwheel-party',
      kind: 'rotate',
      title: label('Pinwheel Party'),
      categoryLabel: CATEGORIES.mixed,
      prompt: label('Turn each pinwheel until it lines up with its arrow badge.'),
      celebration: label('All the pinwheels are lined up for the breeze.'),
      tiles: [
        { id: 'pinwheel-1', label: 'Right', glyph: 'pinwheel', color: coral, targetRotation: 90, startRotation: 180 },
        { id: 'pinwheel-2', label: 'Left', glyph: 'pinwheel', color: teal, targetRotation: 270, startRotation: 90 },
        { id: 'pinwheel-3', label: 'Up', glyph: 'pinwheel', color: gold, targetRotation: 0, startRotation: 270 },
        { id: 'pinwheel-4', label: 'Down', glyph: 'pinwheel', color: sky, targetRotation: 180, startRotation: 0 },
      ],
    },
  ],
}

export const LEVELS = Object.keys(PUZZLES).map(Number)

function localize(value: LocalizedText, language: LanguageCode) {
  return value[language] ?? value.en
}

function materializePuzzle(template: PuzzleTemplate, language: LanguageCode): PuzzleDefinition {
  return {
    ...template,
    title: localize(template.title, language),
    categoryLabel: localize(template.categoryLabel, language),
    prompt: localize(template.prompt, language),
    celebration: localize(template.celebration, language),
  }
}

export function getLevelLabel(level: number, language: LanguageCode) {
  const labelText = LEVEL_LABELS[level]
  return labelText ? localize(labelText, language) : `${level}`
}

export function getPuzzleLabel(id: string, language: LanguageCode) {
  const template = Object.values(PUZZLES).flat().find((item) => item.id === id)
  return template ? localize(template.title, language) : id
}

export function generatePuzzle(
  level: number,
  language: LanguageCode,
  stats: ProblemStatsMap,
  previousId?: string,
) {
  const pool = PUZZLES[level] ?? PUZZLES[1]
  const previous = previousId ? pool.find((item) => item.id === previousId) : undefined
  const template = pickWeighted(pool, stats, previous)
  return materializePuzzle(template, language)
}
