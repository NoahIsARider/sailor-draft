// Fountain (industry-standard plain-text screenplay format) parser and serializer.
// Spec reference: https://fountain.io/syntax — we implement a pragmatic subset.

import type { ElementType, Script, ScriptLine } from './screenplay';
import { guessType } from './screenplay';

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

interface Parsed {
  title: string;
  author: string;
  lines: ScriptLine[];
}

export function parseFountain(source: string): Parsed {
  const raw = source.replace(/\r\n?/g, '\n');
  let body = raw;
  let title = '';
  let author = '';

  // Title page: leading key: value block ended by a blank line
  const titleMatch = raw.match(/^([\s\S]*?)\n\n/);
  if (titleMatch && /^[A-Za-z][A-Za-z ]*:/m.test(titleMatch[1])) {
    const tpBlock = titleMatch[1];
    body = raw.slice(titleMatch[0].length);
    const map: Record<string, string> = {};
    let currentKey = '';
    for (const l of tpBlock.split('\n')) {
      const m = l.match(/^([A-Za-z][A-Za-z ]*):\s*(.*)$/);
      if (m) {
        currentKey = m[1].trim().toLowerCase();
        map[currentKey] = m[2].trim();
      } else if (currentKey) {
        const extra = l.trim();
        if (extra) map[currentKey] = (map[currentKey] + ' ' + extra).trim();
      }
    }
    title = map['title'] || '';
    author = map['author'] || map['authors'] || map['credit'] || '';
  }

  const rawLines = body.split('\n');
  const out: ScriptLine[] = [];
  let prev: ElementType | undefined;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const t = line.trim();

    if (!t) {
      // Preserve as blank action to keep pacing
      if (out.length && out[out.length - 1].type !== 'action') {
        // Skip: blank line already acts as separator
      }
      prev = undefined;
      continue;
    }

    let type: ElementType;
    let text = t;

    // Forced element markers
    if (t.startsWith('!')) {
      type = 'action';
      text = t.slice(1);
    } else if (t.startsWith('.') && !t.startsWith('..')) {
      type = 'scene';
      text = t.slice(1).trim();
    } else if (t.startsWith('@')) {
      type = 'character';
      text = t.slice(1).trim();
    } else if (t.startsWith('>')) {
      const inner = t.slice(1).trim();
      if (inner.endsWith('<')) {
        type = 'action'; // centered — degrade to action
        text = inner.slice(0, -1).trim();
      } else {
        type = 'transition';
        text = inner;
      }
    } else {
      type = guessType(t, prev);
    }

    out.push({ id: uid(), type, text });
    prev = type;
  }

  return { title, author, lines: out };
}

export function serializeFountain(script: Script): string {
  const header: string[] = [];
  if (script.title) header.push(`Title: ${script.title}`);
  if (script.author) header.push(`Author: ${script.author}`);
  const parts: string[] = [];
  if (header.length) parts.push(header.join('\n'));

  const body: string[] = [];
  let prevType: ElementType | undefined;
  for (const l of script.lines) {
    const needsBlankBefore =
      prevType !== undefined && prevType !== l.type && !isDialogueGroup(prevType, l.type);
    if (needsBlankBefore) body.push('');

    switch (l.type) {
      case 'scene':
        body.push(l.text.toUpperCase());
        break;
      case 'action':
        body.push(l.text);
        break;
      case 'character':
        body.push(l.text.toUpperCase());
        break;
      case 'parenthetical': {
        const p = l.text.startsWith('(') ? l.text : `(${l.text})`;
        body.push(p);
        break;
      }
      case 'dialogue':
        body.push(l.text);
        break;
      case 'transition':
        body.push(l.text.toUpperCase());
        break;
      case 'shot':
        body.push(l.text.toUpperCase());
        break;
    }
    prevType = l.type;
  }
  parts.push(body.join('\n'));
  return parts.join('\n\n');
}

function isDialogueGroup(a: ElementType, b: ElementType): boolean {
  const grp: ElementType[] = ['character', 'parenthetical', 'dialogue'];
  return grp.includes(a) && grp.includes(b);
}

export function emptyScript(title = 'Untitled'): Script {
  const now = Date.now();
  return {
    id: uid(),
    title,
    author: '',
    lines: [{ id: uid(), type: 'scene', text: '' }],
    createdAt: now,
    updatedAt: now,
  };
}
