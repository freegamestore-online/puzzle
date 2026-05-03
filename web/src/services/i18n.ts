import type { Language, LanguageCode } from '../types.ts'

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'tr', name: 'Turkish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'uk', name: 'Ukrainian' },
]

export interface UiStrings {
  appName: string
  play: string
  preferences: string
  stats: string
  backToPlay: string
  level: string
  language: string
  appearance: string
  sizing: string
  theme: string
  surface: string
  motion: string
  labelSize: string
  contentSize: string
  system: string
  light: string
  dark: string
  soft: string
  bold: string
  full: string
  reduced: string
  puzzleGoal: string
  moveTray: string
  selectedPiece: string
  tapTarget: string
  tapPlacedPiece: string
  checkPuzzle: string
  nextPuzzle: string
  resetBoard: string
  fillBoardFirst: string
  solved: string
  notQuite: string
  keepTrying: string
  streak: string
  best: string
  puzzlesSolved: string
  checks: string
  accuracy: string
  solvedLabel: string
  checksLabel: string
  bestStreak: string
  recentPuzzles: string
  mastered: string
  struggling: string
  puzzleTips: string
  tipSelect: string
  tipPlace: string
  tipRotate: string
  tipSwap: string
  rotateHint: string
  levelDone: string
}

const STRINGS: Partial<Record<LanguageCode, UiStrings>> = {
  en: {
    appName: 'FreePuzzle',
    play: 'Play',
    preferences: 'Preferences',
    stats: 'Stats',
    backToPlay: 'Back to play',
    level: 'Level',
    language: 'Language',
    appearance: 'Appearance',
    sizing: 'Sizing',
    theme: 'Theme',
    surface: 'Surface',
    motion: 'Motion',
    labelSize: 'Label size',
    contentSize: 'Content size',
    system: 'System',
    light: 'Light',
    dark: 'Dark',
    soft: 'Soft',
    bold: 'Bold',
    full: 'Full',
    reduced: 'Reduced',
    puzzleGoal: 'Puzzle goal',
    moveTray: 'Move tray',
    selectedPiece: 'Selected piece',
    tapTarget: 'Tap a target to place the selected piece.',
    tapPlacedPiece: 'Tap any placed piece to pick it back up.',
    checkPuzzle: 'Check puzzle',
    nextPuzzle: 'Next puzzle',
    resetBoard: 'Reset board',
    fillBoardFirst: 'Finish placing the missing pieces first.',
    solved: 'Solved',
    notQuite: 'Not quite',
    keepTrying: 'Move a few pieces and try again.',
    streak: 'streak',
    best: 'best',
    puzzlesSolved: 'Puzzles solved',
    checks: 'Checks',
    accuracy: 'Accuracy',
    solvedLabel: 'Solved',
    checksLabel: 'Checks',
    bestStreak: 'Best streak',
    recentPuzzles: 'Recent puzzles',
    mastered: 'Mastered',
    struggling: 'Needs another try',
    puzzleTips: 'Puzzle tips',
    tipSelect: 'Select a piece first.',
    tipPlace: 'Tap a slot or bucket to place it.',
    tipRotate: 'Tap rotate tiles until the direction badge matches.',
    tipSwap: 'Tapping a filled slot swaps pieces quickly.',
    rotateHint: 'Tap to rotate',
    levelDone: 'Level solved',
  },
  es: {
    appName: 'FreePuzzle',
    play: 'Jugar',
    preferences: 'Preferencias',
    stats: 'Estadisticas',
    backToPlay: 'Volver a jugar',
    level: 'Nivel',
    language: 'Idioma',
    appearance: 'Apariencia',
    sizing: 'Tamano',
    theme: 'Tema',
    surface: 'Superficie',
    motion: 'Movimiento',
    labelSize: 'Tamano de etiqueta',
    contentSize: 'Tamano del contenido',
    system: 'Sistema',
    light: 'Claro',
    dark: 'Oscuro',
    soft: 'Suave',
    bold: 'Fuerte',
    full: 'Completo',
    reduced: 'Reducido',
    puzzleGoal: 'Meta del puzzle',
    moveTray: 'Bandeja de piezas',
    selectedPiece: 'Pieza elegida',
    tapTarget: 'Toca un destino para colocar la pieza elegida.',
    tapPlacedPiece: 'Toca una pieza colocada para volver a tomarla.',
    checkPuzzle: 'Revisar puzzle',
    nextPuzzle: 'Siguiente puzzle',
    resetBoard: 'Reiniciar tablero',
    fillBoardFirst: 'Primero coloca todas las piezas que faltan.',
    solved: 'Resuelto',
    notQuite: 'Casi',
    keepTrying: 'Mueve algunas piezas y prueba otra vez.',
    streak: 'racha',
    best: 'mejor',
    puzzlesSolved: 'Puzzles resueltos',
    checks: 'Revisiones',
    accuracy: 'Precision',
    solvedLabel: 'Resueltos',
    checksLabel: 'Intentos',
    bestStreak: 'Mejor racha',
    recentPuzzles: 'Puzzles recientes',
    mastered: 'Dominados',
    struggling: 'Necesita otro intento',
    puzzleTips: 'Consejos',
    tipSelect: 'Primero elige una pieza.',
    tipPlace: 'Toca un hueco o una cesta para colocarla.',
    tipRotate: 'Toca las piezas giratorias hasta que coincidan.',
    tipSwap: 'Tocar un hueco lleno cambia piezas rapidamente.',
    rotateHint: 'Toca para girar',
    levelDone: 'Nivel resuelto',
  },
}

export function getStrings(language: LanguageCode) {
  return STRINGS[language] ?? STRINGS.en!
}
