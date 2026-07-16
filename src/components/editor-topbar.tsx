'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Script } from '@/lib/screenplay';
import { parseFountain, serializeFountain } from '@/lib/fountain';

interface Props {
  script: Script;
  savedAt: number | null;
  onRename: (title: string) => void;
  onAuthor: (author: string) => void;
  onImport: (imported: { title: string; author: string; lines: Script['lines'] }) => void;
}

export function EditorTopbar({ script, savedAt, onRename, onAuthor, onImport }: Props) {
  const [titleValue, setTitleValue] = useState(script.title);
  const [authorValue, setAuthorValue] = useState(script.author);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setTitleValue(script.title);
    setAuthorValue(script.author);
  }, [script.id, script.title, script.author]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleImportClick = () => {
    setMenuOpen(false);
    fileInputRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseFountain(text);
    onImport({
      title: parsed.title || file.name.replace(/\.(fountain|txt)$/i, ''),
      author: parsed.author,
      lines: parsed.lines.length ? parsed.lines : script.lines,
    });
    e.target.value = '';
  };

  const download = (filename: string, mime: string, content: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const safeName = (script.title || 'untitled').replace(/[^\w\-]+/g, '_');

  const exportFountain = () => {
    setMenuOpen(false);
    download(`${safeName}.fountain`, 'text/plain;charset=utf-8', serializeFountain(script));
  };

  const exportTxt = () => {
    setMenuOpen(false);
    download(`${safeName}.txt`, 'text/plain;charset=utf-8', serializeFountain(script));
  };

  const exportPdf = () => {
    setMenuOpen(false);
    // Client-side print → user chooses "Save as PDF" from print dialog.
    window.print();
  };

  const saveNote = savedAt
    ? `saved · ${new Date(savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : 'unsaved';

  return (
    <div
      className="sticky top-0 z-10 border-b print:hidden"
      style={{ background: 'var(--color-desk)', borderColor: 'var(--color-rule)' }}
    >
      <div className="mx-auto flex max-w-[1024px] items-center gap-6 px-6 py-3">
        <Link
          href="/"
          className="text-[13px] uppercase tracking-[0.18em]"
          style={{ color: 'var(--color-ink)' }}
        >
          Sailor Draft
        </Link>

        <span style={{ color: 'var(--color-rule)' }}>|</span>

        <input
          className="min-w-[180px] flex-1 bg-transparent text-[14px] outline-none"
          style={{ color: 'var(--color-ink)' }}
          value={titleValue}
          onChange={(e) => setTitleValue(e.target.value)}
          onBlur={() => onRename(titleValue.trim() || 'Untitled')}
          placeholder="Untitled"
          aria-label="Script title"
        />

        <input
          className="w-[160px] bg-transparent text-right text-[13px] outline-none"
          style={{ color: 'var(--color-muted-ink)' }}
          value={authorValue}
          onChange={(e) => setAuthorValue(e.target.value)}
          onBlur={() => onAuthor(authorValue.trim())}
          placeholder="by —"
          aria-label="Author"
        />

        <span className="text-[11px] tracking-[0.15em] uppercase" style={{ color: 'var(--color-muted-ink)' }}>
          {saveNote}
        </span>

        <div className="relative" ref={menuRef}>
          <button
            className="px-2 text-[16px] leading-none"
            style={{ color: 'var(--color-ink)' }}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="More"
          >
            ⋯
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-56 border"
              style={{
                background: 'var(--color-page)',
                borderColor: 'var(--color-rule)',
                boxShadow: '0 12px 24px -18px rgba(60,50,30,0.35)',
              }}
            >
              <MenuItem onClick={handleImportClick}>⤓  Import .fountain / .txt</MenuItem>
              <MenuItem onClick={exportFountain}>⤒  Export .fountain</MenuItem>
              <MenuItem onClick={exportTxt}>⤒  Export .txt</MenuItem>
              <MenuItem onClick={exportPdf}>⤒  Print / Save as PDF</MenuItem>
              <div className="border-t" style={{ borderColor: 'var(--color-rule)' }} />
              <MenuItem href="/library">☰  Library</MenuItem>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".fountain,.txt,text/plain"
          className="hidden"
          onChange={handleFile}
        />
      </div>
    </div>
  );
}

interface MenuItemProps {
  onClick?: () => void;
  href?: string;
  children: React.ReactNode;
}

function MenuItem({ onClick, href, children }: MenuItemProps) {
  const cls =
    'block w-full px-4 py-2 text-left text-[13px] hover:underline decoration-1 underline-offset-4';
  if (href) {
    return (
      <Link href={href} className={cls} style={{ color: 'var(--color-ink)' }}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} style={{ color: 'var(--color-ink)' }} onClick={onClick}>
      {children}
    </button>
  );
}
