export type Mode = 'play' | 'preferences'
export type LanguageCode =
  | 'en'
  | 'es'
  | 'fr'
  | 'de'
  | 'it'
  | 'pt'
  | 'ja'
  | 'ko'
  | 'zh'
  | 'ru'
  | 'ar'
  | 'hi'
  | 'tr'
  | 'nl'
  | 'pl'
  | 'uk'

export interface Language {
  code: LanguageCode
  name: string
}

export type PieceGlyph =
  | 'sun'
  | 'moon'
  | 'leaf'
  | 'flower'
  | 'star'
  | 'drop'
  | 'fish'
  | 'fox'
  | 'triangle'
  | 'circle'
  | 'square'
  | 'oval'
  | 'seed'
  | 'sprout'
  | 'tree'
  | 'plate'
  | 'berry'
  | 'jar'
  | 'rocket'
  | 'bird'
  | 'arrow'
  | 'pinwheel'
  | 'drum'
  | 'flute'
  | 'maraca'
  | 'book'
  | 'paint'
  | 'shell'

export type PuzzleKind = 'pattern' | 'sort' | 'sequence' | 'rotate'

export interface PuzzlePiece {
  id: string
  label: string
  glyph: PieceGlyph
  color: string
  textColor?: string
}

export interface PatternSlot {
  id: string
  hint: string
  fixedPiece?: PuzzlePiece
  answerPieceId?: string
}

export interface SortBucket {
  id: string
  label: string
  hint: string
  color: string
}

export interface SequenceSlot {
  id: string
  hint: string
}

export interface RotateTile {
  id: string
  label: string
  glyph: PieceGlyph
  color: string
  targetRotation: number
  startRotation: number
}

interface PuzzleBase {
  id: string
  kind: PuzzleKind
  title: string
  categoryLabel: string
  prompt: string
  celebration: string
}

export interface PatternPuzzle extends PuzzleBase {
  kind: 'pattern'
  slots: PatternSlot[]
  pieces: PuzzlePiece[]
}

export interface SortPuzzle extends PuzzleBase {
  kind: 'sort'
  buckets: SortBucket[]
  pieces: PuzzlePiece[]
  answers: Record<string, string>
}

export interface SequencePuzzle extends PuzzleBase {
  kind: 'sequence'
  slots: SequenceSlot[]
  pieces: PuzzlePiece[]
  answers: string[]
}

export interface RotatePuzzle extends PuzzleBase {
  kind: 'rotate'
  tiles: RotateTile[]
}

export type PuzzleDefinition =
  | PatternPuzzle
  | SortPuzzle
  | SequencePuzzle
  | RotatePuzzle

export interface Score {
  solved: number
  checks: number
  streak: number
  bestStreak: number
}
