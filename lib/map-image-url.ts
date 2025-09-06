import { Block } from 'notion-types';
import { defaultMapImageUrl } from 'react-notion-x';

import { defaultPageIcon, defaultPageCover } from './config';

export const mapImageUrl = (url: string, block: Block) => {
  // 기본 아이콘과 커버 이미지는 그대로 사용
  if (url === defaultPageCover || url === defaultPageIcon) {
    return url;
  }
  return defaultMapImageUrl(url, block);
};
