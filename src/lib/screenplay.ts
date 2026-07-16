// Screenplay element types (Final Draft parlance)
export type ElementType =
  | 'scene'
  | 'action'
  | 'character'
  | 'parenthetical'
  | 'dialogue'
  | 'transition'
  | 'shot';

export interface ScriptLine {
  id: string;
  type: ElementType;
  text: string;
}

export interface Script {
  id: string;
  title: string;
  author: string;
  lines: ScriptLine[];
  createdAt: number;
  updatedAt: number;
}

export const ELEMENT_LABEL: Record<ElementType, string> = {
  scene: 'Scene Heading',
  action: 'Action',
  character: 'Character',
  parenthetical: 'Parenthetical',
  dialogue: 'Dialogue',
  transition: 'Transition',
  shot: 'Shot',
};

// Tab cycle order (matches Final Draft muscle memory)
export const TAB_CYCLE: ElementType[] = [
  'scene',
  'action',
  'character',
  'dialogue',
  'parenthetical',
  'transition',
  'shot',
];

// Enter key auto-predicts next element type
export function nextTypeOnEnter(current: ElementType): ElementType {
  switch (current) {
    case 'scene':
      return 'action';
    case 'action':
      return 'action';
    case 'character':
      return 'dialogue';
    case 'parenthetical':
      return 'dialogue';
    case 'dialogue':
      return 'action';
    case 'transition':
      return 'scene';
    case 'shot':
      return 'action';
    default:
      return 'action';
  }
}

export function cycleType(current: ElementType, reverse = false): ElementType {
  const i = TAB_CYCLE.indexOf(current);
  const idx = i < 0 ? 0 : i;
  const next = reverse
    ? (idx - 1 + TAB_CYCLE.length) % TAB_CYCLE.length
    : (idx + 1) % TAB_CYCLE.length;
  return TAB_CYCLE[next];
}

// Guess element type from raw text (used during Fountain import / paste)
export function guessType(text: string, prev?: ElementType): ElementType {
  const t = text.trim();
  if (!t) return prev === 'character' ? 'dialogue' : 'action';

  // Scene heading: INT./EXT./EST./INT/EXT prefix or forced with .
  if (/^(INT\.|EXT\.|EST\.|INT\/EXT|INT |EXT )/i.test(t)) return 'scene';
  if (t.startsWith('.') && !t.startsWith('..')) return 'scene';

  // Transition: ends with TO: or is uppercase and starts with FADE/CUT/DISSOLVE
  if (/^(FADE (IN|OUT)|CUT TO|DISSOLVE TO|SMASH CUT|MATCH CUT)/i.test(t)) return 'transition';
  if (/TO:$/.test(t) && t === t.toUpperCase()) return 'transition';
  if (t.startsWith('>')) return 'transition';

  // Parenthetical
  if (t.startsWith('(') && t.endsWith(')')) return 'parenthetical';

  // Character: uppercase line, no lowercase letters, previous line was blank/action
  if (
    t === t.toUpperCase() &&
    /[A-Z]/.test(t) &&
    t.length < 60 &&
    (prev === 'action' || prev === 'scene' || prev === 'transition' || !prev)
  ) {
    return 'character';
  }

  // Dialogue follows character/parenthetical
  if (prev === 'character' || prev === 'parenthetical' || prev === 'dialogue') {
    return 'dialogue';
  }

  return 'action';
}
