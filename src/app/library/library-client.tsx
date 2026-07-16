'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Script } from '@/lib/screenplay';
import { emptyScript, parseFountain, serializeFountain } from '@/lib/fountain';
import { loadAll, remove, upsert } from '@/lib/storage';

export function LibraryClient() {
  const router = useRouter();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [mounted, setMounted] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const refresh = () => setScripts(loadAll());

  useEffect(() => {
    refresh();
    setMounted(true);
  }, []);

  const handleNew = () => {
    const s = emptyScript('Untitled');
    upsert(s);
    router.push(`/script/${s.id}`);
  };

  const handleDelete = (id: string) => {
    remove(id);
    setConfirmId(null);
    refresh();
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

  const download = (script: Script) => {
    const content = serializeFountain(script);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safe = (script.title || 'untitled').replace(/[^\w\-]+/g, '_');
    a.href = url;
    a.download = `${safe}.fountain`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sorted = mounted
    ? [...scripts].sort((a, b) => b.updatedAt - a.updatedAt)
    : [];

  return (
    <main
      className="min-h-screen"
      style={{ background: 'var(--color-desk)', color: 'var(--color-ink)' }}
    >
      <div className="mx-auto max-w-[720px] px-8 pt-20 pb-24">
        <div className="mb-2 flex items-baseline justify-between">
          <Link
            href="/"
            className="text-[11px] uppercase tracking-[0.22em] hover:underline decoration-1 underline-offset-4"
            style={{ color: 'var(--color-muted-ink)' }}
          >
            ← Sailor Draft
          </Link>
          <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: 'var(--color-muted-ink)' }}>
            Library
          </div>
        </div>

        <h1 className="mt-4 text-[36px] leading-none tracking-tight">Your scripts</h1>

        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-[13px]">
          <button
            onClick={handleNew}
            className="uppercase tracking-[0.18em] underline decoration-1 underline-offset-[6px]"
          >
            New script →
          </button>
          <button
            onClick={handleImportClick}
            className="uppercase tracking-[0.18em] hover:underline decoration-1 underline-offset-[6px]"
          >
            Import
          </button>
        </div>

        <div className="mt-12 border-t" style={{ borderColor: 'var(--color-rule)' }}>
          {mounted && sorted.length === 0 && (
            <div className="py-16 text-center text-[14px]" style={{ color: 'var(--color-muted-ink)' }}>
              — This drawer is empty.
            </div>
          )}

          {sorted.map((s) => (
            <div
              key={s.id}
              className="flex items-baseline gap-4 border-b py-5"
              style={{ borderColor: 'var(--color-rule)' }}
            >
              <div className="flex-1">
                <Link
                  href={`/script/${s.id}`}
                  className="text-[17px] hover:underline decoration-1 underline-offset-4"
                >
                  {s.title || 'Untitled'}
                </Link>
                <div className="mt-1 text-[12px]" style={{ color: 'var(--color-muted-ink)' }}>
                  {s.author ? `by ${s.author} · ` : ''}
                  {s.lines.length} line{s.lines.length === 1 ? '' : 's'} · edited{' '}
                  {new Date(s.updatedAt).toLocaleString()}
                </div>
              </div>

              <button
                onClick={() => download(s)}
                className="text-[12px] uppercase tracking-[0.18em] hover:underline decoration-1 underline-offset-4"
              >
                Export
              </button>

              {confirmId === s.id ? (
                <>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-[12px] uppercase tracking-[0.18em] hover:underline decoration-1 underline-offset-4"
                    style={{ color: 'var(--color-margin-red)' }}
                  >
                    Confirm delete
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="text-[12px] uppercase tracking-[0.18em] hover:underline decoration-1 underline-offset-4"
                    style={{ color: 'var(--color-muted-ink)' }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setConfirmId(s.id)}
                  className="text-[12px] uppercase tracking-[0.18em] hover:underline decoration-1 underline-offset-4"
                  style={{ color: 'var(--color-muted-ink)' }}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
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
