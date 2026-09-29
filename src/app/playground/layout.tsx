import type { Metadata } from 'next';

// 놀이터는 전체를 AI 크롤러 수집 대상에서 제외한다. (robots.ts에서도 차단)
// 비표준 지시어지만 일부 AI 크롤러가 준수한다.
export const metadata: Metadata = {
  other: { robots: 'noai, noimageai' },
};

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
