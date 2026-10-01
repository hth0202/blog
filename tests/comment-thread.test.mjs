import assert from 'node:assert/strict';
import test from 'node:test';

import { buildCommentThreads, OWNER_NAME } from '../src/lib/comment-thread.ts';

let seq = 0;
const visitor = (author, text) => ({
  id: `c${++seq}`,
  text,
  createdAt: `2026-10-01T00:00:${String(seq).padStart(2, '0')}.000Z`,
  author,
});
const owner = (text) => ({ ...visitor(null, text), author: null });

test('주인 댓글은 바로 앞 방문자 댓글의 답글이 된다', () => {
  const [a, b] = buildCommentThreads([
    visitor('A', '첫 댓글'),
    owner('A님 감사해요'),
    visitor('B', '두 번째'),
    owner('B님도 감사해요'),
  ]);
  assert.deepEqual(
    a.replies.map((r) => r.content),
    ['A님 감사해요'],
  );
  assert.deepEqual(
    b.replies.map((r) => r.content),
    ['B님도 감사해요'],
  );
});

test('@이름으로 시작하면 그 사람 댓글에 붙고 이름은 지운다', () => {
  const [a, b] = buildCommentThreads([
    visitor('룰루랄라', '재밌네요!'),
    visitor('야메군', '잘 봤어요'),
    owner('@룰루랄라님, 고마워요'),
  ]);
  assert.deepEqual(
    a.replies.map((r) => r.content),
    ['고마워요'],
  );
  assert.equal(b.replies.length, 0);
});

test('이름이 겹치면 더 긴 이름을 고른다', () => {
  const [short, long] = buildCommentThreads([
    visitor('룰루', '하나'),
    visitor('룰루랄라', '둘'),
    visitor('C', '셋'),
    owner('@룰루랄라 답글'),
  ]);
  assert.equal(short.replies.length, 0);
  assert.deepEqual(
    long.replies.map((r) => r.content),
    ['답글'],
  );
});

test('없는 이름이면 앞 댓글에 원문 그대로 붙는다', () => {
  const [a] = buildCommentThreads([visitor('A', 'x'), owner('@누구 안녕')]);
  assert.deepEqual(
    a.replies.map((r) => r.content),
    ['@누구 안녕'],
  );
});

test('방문자 댓글이 없을 때 주인 댓글은 단독 댓글이 된다', () => {
  const [c] = buildCommentThreads([owner('공지입니다')]);
  assert.equal(c.isOwner, true);
  assert.equal(c.author, OWNER_NAME);
});

test('주인 댓글은 다른 주인 댓글의 답글이 되지 않는다', () => {
  const [notice, a] = buildCommentThreads([
    owner('공지'),
    visitor('A', 'x'),
    owner('답글'),
  ]);
  assert.equal(notice.replies.length, 0);
  assert.equal(a.replies.length, 1);
});
