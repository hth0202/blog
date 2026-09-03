import { notFound } from 'next/navigation';

import { PageContent } from '@/components/260903/Content';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '태피스토리',
  robots: { index: false, follow: false },
};

interface GatedPageProps {
  searchParams: Promise<{ secret?: string }>;
}

export default async function GatedPage({ searchParams }: GatedPageProps) {
  const { secret } = await searchParams;

  if (!process.env.SECRET_260903 || secret !== process.env.SECRET_260903) {
    notFound();
  }

  return <PageContent />;
}
