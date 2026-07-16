import type { Metadata } from 'next';
import { ScriptPageClient } from './script-page-client';

export const metadata: Metadata = {
  title: 'Editing',
};

interface Params {
  id: string;
}

export default async function ScriptPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  return <ScriptPageClient id={id} />;
}
