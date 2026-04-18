export function slugify(text: string): string {
  return (
    text
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9\uAC00-\uD7A3\u3130-\u318F-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'heading'
  );
}

export type TocHeading = {
  id: string;
  text: string;
  level: 1 | 2 | 3;
};

export function extractHeadings(blocks: any[]): TocHeading[] {
  const counts: Record<string, number> = {};
  return blocks
    .filter(
      (b) =>
        b.type === 'heading_1' ||
        b.type === 'heading_2' ||
        b.type === 'heading_3',
    )
    .map((b) => {
      const level = parseInt(b.type.slice(-1)) as 1 | 2 | 3;
      const text: string = b[b.type].rich_text
        .map((t: any) => t.plain_text)
        .join('');
      const base = slugify(text);
      counts[base] = (counts[base] ?? 0) + 1;
      const id = counts[base] > 1 ? `${base}-${counts[base]}` : base;
      return { id, text, level };
    });
}
