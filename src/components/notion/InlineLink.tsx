'use client';

import { useEffect, useState } from 'react';

import { ExternalLink } from 'lucide-react';

interface Props {
  href: string;
  className?: string;
  children: React.ReactNode;
}

export function InlineLink({ href, className, children }: Props) {
  const [label, setLabel] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!href.startsWith('http')) return;
    fetch(`/api/og-preview?url=${encodeURIComponent(href)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data?.label) setLabel(data.label); })
      .catch(() => {});
  }, [href]);

  return (
    <span className="relative inline">
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
      </a>
      {visible && label && (
        <span className="pointer-events-none absolute bottom-full -left-1 z-50 mb-2 flex w-max items-center gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-semibold text-neutral-700 shadow-md indent-0 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100">
          <span>{label}</span>
          <ExternalLink size={13} className="shrink-0 text-indigo-500" />
        </span>
      )}
    </span>
  );
}
