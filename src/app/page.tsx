import type { Metadata } from 'next';
import { HomeClient } from './home-client';

export const metadata: Metadata = {
  title: 'Sailor Draft — Screenwriting, unadorned',
  description:
    'A minimalist screenplay editor. Standard Hollywood format, Courier Prime, import and export.',
};

export default function Home() {
  return <HomeClient />;
}
