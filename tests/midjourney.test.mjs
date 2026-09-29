import assert from 'node:assert/strict';
import test from 'node:test';

import { parseMidjourneyPrompt } from '../src/lib/midjourney.ts';

test('Midjourney 원문에서 갤러리 필터와 상세 정보를 읽는다', () => {
  const meta = parseMidjourneyPrompt(
    'girl, ninja --ar 3:4 --exp 10 --sref 2117288039::3 4156373960 --profile ukwd6z8 lujq3gr --stylize 1000 --v 8.2',
  );

  assert.equal(meta.model, 'Midjourney 8.2');
  assert.deepEqual(meta.srefs, [
    { value: '2117288039', weight: '3' },
    { value: '4156373960', weight: undefined },
  ]);
  assert.deepEqual(meta.profiles, ['ukwd6z8', 'lujq3gr']);
  assert.equal(meta.ratio, '3:4');
  assert.equal(meta.stylize, '1000');
});

test('모델이 없으면 Midjourney 8.2, niji 플래그가 있으면 Niji 버전을 사용한다', () => {
  assert.equal(parseMidjourneyPrompt('girl, portrait').model, 'Midjourney 8.2');
  assert.equal(
    parseMidjourneyPrompt('girl, portrait --niji 7').model,
    'Niji 7',
  );
});

test('값 없는 hd 플래그를 프로필에서 제외한다', () => {
  assert.deepEqual(
    parseMidjourneyPrompt('girl --profile ukwd6z8 saqoahf --hd').profiles,
    ['ukwd6z8', 'saqoahf'],
  );
});
