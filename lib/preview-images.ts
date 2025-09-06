import got from 'got';
import lqip from 'lqip-modern';
import pMap from 'p-map';
import pMemoize from 'p-memoize';
import { ExtendedRecordMap, PreviewImage, PreviewImageMap } from 'notion-types';
import { getPageImageUrls, normalizeUrl } from 'notion-utils';

import { defaultPageIcon, defaultPageCover } from './config';
import { db } from './db';
import { mapImageUrl } from './map-image-url';

export async function getPreviewImageMap(recordMap: ExtendedRecordMap): Promise<PreviewImageMap> {
  const urls: string[] = getPageImageUrls(recordMap, {
    mapImageUrl,
  })
    .concat([defaultPageIcon, defaultPageCover])
    .filter(Boolean);

  const previewImagesMap = Object.fromEntries(
    await pMap(
      urls,
      async url => {
        const cacheKey = normalizeUrl(url);

        // 공식 API의 서명된 URL인 경우 프리뷰 생성을 건너뛰기
        if (url.includes('amazonaws.com') || url.includes('file.notion.so')) {
          // 서명된 URL은 만료되므로 프리뷰 이미지 생성하지 않음
          return [cacheKey, null];
        }

        return [cacheKey, await getPreviewImage(url, { cacheKey })];
      },
      {
        concurrency: 8,
      },
    ),
  );

  return previewImagesMap;
}

async function createPreviewImage(
  url: string,
  { cacheKey }: { cacheKey: string },
): Promise<PreviewImage | null> {
  try {
    try {
      const cachedPreviewImage = await db.get(cacheKey);
      if (cachedPreviewImage) {
        return cachedPreviewImage;
      }
    } catch (err) {
      // ignore redis errors
      console.warn(`redis error get "${cacheKey}"`, err.message);
    }

    // 공식 Notion API의 서명된 URL인 경우 직접 사용
    let imageUrl = url;
    if (url.includes('amazonaws.com') || url.includes('file.notion.so')) {
      // 서명된 URL은 그대로 사용
      imageUrl = url;
    } else if (url.startsWith('https://www.notion.so/image/')) {
      // 이미 프록시된 URL은 그대로 사용
      imageUrl = url;
    }

    const { body } = await got(imageUrl, {
      responseType: 'buffer',
      timeout: {
        request: 10000, // 10초 타임아웃
      },
    });
    const result = await lqip(body);

    const previewImage = {
      originalWidth: result.metadata.originalWidth,
      originalHeight: result.metadata.originalHeight,
      dataURIBase64: result.metadata.dataURIBase64,
    };

    try {
      await db.set(cacheKey, previewImage);
    } catch (err) {
      // ignore redis errors
      console.warn(`redis error set "${cacheKey}"`, err.message);
    }

    return previewImage;
  } catch (err) {
    if (!err.message.includes('unsupported image format')) {
      console.warn('failed to create preview image', url, err.message);
    }
    return null;
  }
}

export const getPreviewImage = pMemoize(createPreviewImage);
