'use client';

import { NotionRenderer } from 'react-notion-x';

import type { ExtendedRecordMap } from 'notion-types';

interface NotionContentProps {
  recordMap: ExtendedRecordMap;
  rootPageId?: string;
}

export function NotionContent({ recordMap, rootPageId }: NotionContentProps) {
  return (
    <div className="notion-content">
      <NotionRenderer
        recordMap={recordMap}
        fullPage={false}
        darkMode={false}
        rootPageId={rootPageId}
        previewImages={true}
        showCollectionViewDropdown={false}
        showTableOfContents={false}
        minTableOfContentsItems={3}
        defaultPageIcon="📄"
        defaultPageCover=""
        defaultPageCoverPosition={0.5}
        className="notion-page"
      />
    </div>
  );
}
