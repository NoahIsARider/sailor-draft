'use client';

import type { Script } from './screenplay';

const KEY = 'sailor-draft:scripts';

export function loadAll(): Script[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Script[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveAll(scripts: Script[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(scripts));
}

export function loadOne(id: string): Script | undefined {
  return loadAll().find((s) => s.id === id);
}

export function upsert(script: Script): void {
  const all = loadAll();
  const idx = all.findIndex((s) => s.id === script.id);
  const next = { ...script, updatedAt: Date.now() };
  if (idx >= 0) {
    all[idx] = next;
  } else {
    all.unshift(next);
  }
  saveAll(all);
}

export function remove(id: string): void {
  const all = loadAll().filter((s) => s.id !== id);
  saveAll(all);
}
