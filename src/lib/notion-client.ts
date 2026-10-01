import { Client } from '@notionhq/client';

// Notion API는 요청 제한(평균 초당 3회)에 걸리면 429를 돌려준다. 배포 직후처럼
// 요청이 몰릴 때 이 한 번의 실패로 목록이 비어 보이는 일이 있어, 429와 일시 장애
// (503)는 잠깐 기다렸다가 다시 시도한다. 두 응답 모두 요청이 처리되지 않은
// 상태라 쓰기 요청도 다시 보내도 안전하다.
// 빌드(프리렌더) 중에는 방문자가 기다리지 않으므로 더 오래 기다린다. 빌드가
// 실패하면 배포가 안 되고 기존 사이트가 유지되지만, 다시 배포해야 하니 번거롭다
const IS_BUILD = process.env.NEXT_PHASE === 'phase-production-build';
const MAX_RETRIES = IS_BUILD ? 6 : 3;
const MAX_TOTAL_WAIT_MS = IS_BUILD ? 60_000 : 8000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const retryingFetch: typeof fetch = async (input, init) => {
  let waited = 0;
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(input, init);
    if (
      (response.status !== 429 && response.status !== 503) ||
      attempt >= MAX_RETRIES
    ) {
      return response;
    }
    const retryAfter = Number(response.headers.get('retry-after'));
    const wait = Math.min(
      retryAfter > 0 ? retryAfter * 1000 : 500 * 2 ** attempt,
      MAX_TOTAL_WAIT_MS - waited,
    );
    if (wait <= 0) return response;
    await sleep(wait);
    waited += wait;
  }
};

export const createNotionClient = () =>
  new Client({ auth: process.env.NOTION_AUTH_TOKEN, fetch: retryingFetch });
