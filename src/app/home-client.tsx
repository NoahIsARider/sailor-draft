'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Script } from '@/lib/screenplay';
import { emptyScript, parseFountain } from '@/lib/fountain';
import { loadAll, upsert } from '@/lib/storage';

export function HomeClient() {
  const router = useRouter();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setScripts(loadAll());
    setMounted(true);
  }, []);

  const handleNew = () => {
    const s = emptyScript('Untitled');
    upsert(s);
    router.push(`/script/${s.id}`);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseFountain(text);
    const now = Date.now();
    const s: Script = {
      id: Math.random().toString(36).slice(2, 10) + now.toString(36),
      title: parsed.title || file.name.replace(/\.(fountain|txt)$/i, ''),
      author: parsed.author,
      lines: parsed.lines.length
        ? parsed.lines
        : [{ id: 'l0', type: 'scene', text: '' }],
      createdAt: now,
      updatedAt: now,
    };
    upsert(s);
    router.push(`/script/${s.id}`);
  };

  const recent = mounted
    ? [...scripts]
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 3)
    : [];

  return (
    <main
      className="min-h-screen"
      style={{ background: 'var(--color-desk)', color: 'var(--color-ink)' }}
    >
      <div className="mx-auto max-w-[720px] px-8 pt-32 pb-24">
        {/* Wordmark */}
        <div className="mb-24">
          <div className="text-[11px] uppercase tracking-[0.28em]" style={{ color: 'var(--color-muted-ink)' }}>
            an editor for screenwriters
          </div>
          <h1 className="mt-3 text-[44px] leading-none tracking-tight">
            Sailor Draft
          </h1>
          <p className="mt-6 max-w-[520px] text-[15px] leading-[1.7]" style={{ color: 'var(--color-muted-ink)' }}>
            A quiet page in standard Hollywood format. Courier Prime, correct
            margins, nothing between you and the scene. Tab cycles element type,
            Enter predicts the next one — the muscle memory you already have.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3 text-[14px]">
          <button
            onClick={handleNew}
            className="uppercase tracking-[0.18em] underline decoration-1 underline-offset-[6px] hover:decoration-2"
            style={{ color: 'var(--color-ink)' }}
          >
            New script →
          </button>
          <button
            onClick={handleImportClick}
            className="uppercase tracking-[0.18em] hover:underline decoration-1 underline-offset-[6px]"
            style={{ color: 'var(--color-ink)' }}
          >
            Import .fountain / .txt
          </button>
          <Link
            href="/library"
            className="uppercase tracking-[0.18em] hover:underline decoration-1 underline-offset-[6px]"
            style={{ color: 'var(--color-ink)' }}
          >
            Library
          </Link>
        </div>

        {/* Recent */}
        <div className="mt-20 border-t pt-6" style={{ borderColor: 'var(--color-rule)' }}>
          <div className="mb-4 text-[11px] uppercase tracking-[0.22em]" style={{ color: 'var(--color-muted-ink)' }}>
            Recent
          </div>
          {mounted && recent.length === 0 && (
            <div className="text-[14px]" style={{ color: 'var(--color-muted-ink)' }}>
              — Nothing yet. Start a new script and the paper will remember it.
            </div>
          )}
          {recent.length > 0 && (
            <ul className="space-y-2">
              {recent.map((s) => (
                <li key={s.id} className="flex items-baseline gap-4">
                  <Link
                    href={`/script/${s.id}`}
                    className="text-[15px] hover:underline decoration-1 underline-offset-4"
                    style={{ color: 'var(--color-ink)' }}
                  >
                    {s.title || 'Untitled'}
                  </Link>
                  <span className="text-[12px]" style={{ color: 'var(--color-muted-ink)' }}>
                    {new Date(s.updatedAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Format legend */}
        <div className="mt-24 grid grid-cols-2 gap-x-8 gap-y-2 border-t pt-6 text-[12px]" style={{ borderColor: 'var(--color-rule)' }}>
          <div style={{ color: 'var(--color-muted-ink)' }} className="uppercase tracking-[0.2em]">Format</div>
          <div style={{ color: 'var(--color-muted-ink)' }} className="uppercase tracking-[0.2em]">Shortcut</div>

          <div>Scene Heading</div><div>Tab · starts with INT./EXT.</div>
          <div>Action</div><div>Tab</div>
          <div>Character</div><div>Tab</div>
          <div>Dialogue</div><div>Enter after Character</div>
          <div>Parenthetical</div><div>Tab</div>
          <div>Transition</div><div>Tab · ends with TO:</div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".fountain,.txt,text/plain"
          className="hidden"
          onChange={handleFile}
        />
      </div>
    </main>
  );
}
