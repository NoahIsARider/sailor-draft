'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ElementType, Script, ScriptLine } from '@/lib/screenplay';
import {
  ELEMENT_LABEL,
  cycleType,
  nextTypeOnEnter,
} from '@/lib/screenplay';

interface EditorProps {
  script: Script;
  onChange: (script: Script) => void;
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

const rowClass: Record<ElementType, string> = {
  scene: 'row-scene',
  action: 'row-action',
  character: 'row-character',
  parenthetical: 'row-parenthetical',
  dialogue: 'row-dialogue',
  transition: 'row-transition',
  shot: 'row-shot',
};

export function ScreenplayEditor({ script, onChange }: EditorProps) {
  const [lines, setLines] = useState<ScriptLine[]>(script.lines);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const refs = useRef<Array<HTMLTextAreaElement | null>>([]);
  const pendingFocus = useRef<{ index: number; caret?: 'start' | 'end' } | null>(
    null,
  );

  // Reset lines when a different script loads
  const scriptIdRef = useRef(script.id);
  useEffect(() => {
    if (scriptIdRef.current !== script.id) {
      scriptIdRef.current = script.id;
      setLines(script.lines);
      setActiveIndex(0);
    }
  }, [script.id, script.lines]);

  // Propagate changes upward (title/author changes handled by parent; here just lines)
  useEffect(() => {
    onChange({ ...script, lines });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines]);

  // Autosize textareas so each line grows with content
  useLayoutEffect(() => {
    for (const el of refs.current) {
      if (!el) continue;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [lines]);

  // Apply pending focus after render
  useLayoutEffect(() => {
    const p = pendingFocus.current;
    if (!p) return;
    const el = refs.current[p.index];
    if (el) {
      el.focus();
      if (p.caret === 'start') el.setSelectionRange(0, 0);
      else {
        const pos = el.value.length;
        el.setSelectionRange(pos, pos);
      }
    }
    pendingFocus.current = null;
  }, [lines, activeIndex]);

  const updateLine = (index: number, patch: Partial<ScriptLine>) => {
    setLines((prev) => {
      const next = prev.slice();
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const insertLineAfter = (index: number, type: ElementType) => {
    setLines((prev) => {
      const next = prev.slice();
      const newLine: ScriptLine = {
        id: uid(),
        type,
        text: type === 'parenthetical' ? '()' : '',
      };
      next.splice(index + 1, 0, newLine);
      return next;
    });
    pendingFocus.current = { index: index + 1, caret: 'start' };
    setActiveIndex(index + 1);
  };

  const removeLine = (index: number) => {
    setLines((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.slice();
      const removed = next.splice(index, 1)[0];
      const target = Math.max(0, index - 1);
      // Merge removed text into previous line's tail
      if (removed.text) {
        const prevLine = next[target];
        next[target] = { ...prevLine, text: prevLine.text + removed.text };
      }
      return next;
    });
    const target = Math.max(0, index - 1);
    pendingFocus.current = { index: target, caret: 'end' };
    setActiveIndex(target);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    index: number,
  ) => {
    const line = lines[index];
    const ta = e.currentTarget;

    if (e.key === 'Tab') {
      e.preventDefault();
      const nextType = cycleType(line.type, e.shiftKey);
      updateLine(index, { type: nextType });
      return;
    }

    if (e.key === 'Enter') {
      // Shift+Enter: soft line break inside the same element
      if (e.shiftKey) return;
      e.preventDefault();
      const caret = ta.selectionStart;
      const before = ta.value.slice(0, caret);
      const after = ta.value.slice(ta.selectionEnd);
      const nextType = nextTypeOnEnter(line.type);
      setLines((prev) => {
        const next = prev.slice();
        next[index] = { ...next[index], text: before };
        next.splice(index + 1, 0, {
          id: uid(),
          type: nextType,
          text: after,
        });
        return next;
      });
      pendingFocus.current = { index: index + 1, caret: 'start' };
      setActiveIndex(index + 1);
      return;
    }

    if (e.key === 'Backspace') {
      if (ta.selectionStart === 0 && ta.selectionEnd === 0 && index > 0) {
        e.preventDefault();
        removeLine(index);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      if (ta.selectionStart === 0 && index > 0) {
        e.preventDefault();
        pendingFocus.current = { index: index - 1, caret: 'end' };
        setActiveIndex(index - 1);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      if (ta.selectionStart === ta.value.length && index < lines.length - 1) {
        e.preventDefault();
        pendingFocus.current = { index: index + 1, caret: 'start' };
        setActiveIndex(index + 1);
      }
      return;
    }
  };

  const activeType = lines[activeIndex]?.type ?? 'action';

  return (
    <div className="relative">
      {/* Element-type indicator (right margin, quiet) */}
      <div
        className="pointer-events-none fixed right-8 top-24 text-[11px] tracking-[0.15em] uppercase"
        style={{ color: 'var(--color-muted-ink)' }}
      >
        {ELEMENT_LABEL[activeType]}
      </div>

      <div className="flex justify-center py-12">
        <div className="screenplay-page">
          {lines.map((line, i) => (
            <div key={line.id} className={`screenplay-row ${rowClass[line.type]}`}>
              <textarea
                ref={(el) => {
                  refs.current[i] = el;
                }}
                className="screenplay-line"
                value={line.text}
                rows={1}
                spellCheck
                onChange={(e) => updateLine(i, { text: e.target.value })}
                onFocus={() => setActiveIndex(i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                placeholder={
                  i === 0 && !line.text ? 'INT. SOMEWHERE - DAY' : ''
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
