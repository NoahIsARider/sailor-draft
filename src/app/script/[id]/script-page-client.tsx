'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Script } from '@/lib/screenplay';
import { emptyScript } from '@/lib/fountain';
import { loadOne, upsert } from '@/lib/storage';
import { ScreenplayEditor } from '@/components/screenplay-editor';
import { EditorTopbar } from '@/components/editor-topbar';

interface Props {
  id: string;
}

export function ScriptPageClient({ id }: Props) {
  const router = useRouter();
  const [script, setScript] = useState<Script | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [notFound, setNotFound] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const found = loadOne(id);
    if (found) {
      setScript(found);
    } else {
      setNotFound(true);
    }
  }, [id]);

  // Debounced autosave
  useEffect(() => {
    if (!script) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      upsert(script);
      setSavedAt(Date.now());
    }, 500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [script]);

  if (notFound) {
    return (
      <main
        className="min-h-screen"
        style={{ background: 'var(--color-desk)', color: 'var(--color-ink)' }}
      >
        <div className="mx-auto max-w-[520px] px-8 pt-40">
          <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: 'var(--color-muted-ink)' }}>
            404 · Script not found
          </div>
          <h1 className="mt-3 text-[28px]">This page is blank.</h1>
          <p className="mt-4 text-[14px]" style={{ color: 'var(--color-muted-ink)' }}>
            The script may have been deleted or its identifier is unknown to this
            browser.
          </p>
          <div className="mt-8 flex gap-6 text-[13px] uppercase tracking-[0.18em]">
            <Link href="/" className="underline underline-offset-[6px]">Home</Link>
            <Link href="/library" className="underline underline-offset-[6px]">Library</Link>
            <button
              className="underline underline-offset-[6px]"
              onClick={() => {
                const s = emptyScript('Untitled');
                upsert(s);
                router.push(`/script/${s.id}`);
              }}
            >
              New script
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!script) {
    return (
      <main
        className="min-h-screen"
        style={{ background: 'var(--color-desk)', color: 'var(--color-muted-ink)' }}
      >
        <div className="mx-auto max-w-[520px] px-8 pt-40 text-[13px] uppercase tracking-[0.22em]">
          Loading page…
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen"
      style={{ background: 'var(--color-desk)', color: 'var(--color-ink)' }}
    >
      <EditorTopbar
        script={script}
        savedAt={savedAt}
        onRename={(title) => setScript({ ...script, title })}
        onAuthor={(author) => setScript({ ...script, author })}
        onImport={({ title, author, lines }) =>
          setScript({ ...script, title, author, lines })
        }
      />
      <ScreenplayEditor
        script={script}
        onChange={(next) => setScript(next)}
      />
    </main>
  );
}
