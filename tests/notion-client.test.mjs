import assert from 'node:assert/strict';
import test from 'node:test';

import { retryingFetch } from '../src/lib/notion-client.ts';

const mockFetch = (statuses, retryAfter) => {
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(url);
    const status = statuses[Math.min(calls.length - 1, statuses.length - 1)];
    return new Response('{}', {
      status,
      headers: retryAfter ? { 'retry-after': retryAfter } : {},
    });
  };
  return calls;
};

test('429를 받으면 다시 시도해 성공 응답을 돌려준다', async () => {
  const calls = mockFetch([429, 429, 200], '0.01');
  const response = await retryingFetch('https://api.notion.com/v1/x');
  assert.equal(response.status, 200);
  assert.equal(calls.length, 3);
});

test('계속 실패하면 3번까지만 다시 시도한다', async () => {
  const calls = mockFetch([503], '0.01');
  const response = await retryingFetch('https://api.notion.com/v1/x');
  assert.equal(response.status, 503);
  assert.equal(calls.length, 4);
});

test('다른 오류는 다시 시도하지 않는다', async () => {
  const calls = mockFetch([404]);
  const response = await retryingFetch('https://api.notion.com/v1/x');
  assert.equal(response.status, 404);
  assert.equal(calls.length, 1);
});
