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

const comboOf = (prompt) => parseMidjourneyPrompt(prompt).combo?.label ?? null;
const comboKeyOf = (prompt) => parseMidjourneyPrompt(prompt).combo?.key;

test('sref와 프로필 코드를 모두 합쳐 조합을 만든다', () => {
  assert.equal(
    comboOf(
      'girl --sref 363125409::2 912227515 --v 8 --p ukwd6z8 tmzi831 --sref 1',
    ),
    '--profile ukwd6z8 tmzi831 --sref 363125409::2 912227515 1',
  );
  assert.equal(comboOf('girl --sref 1 --p a'), '--profile a --sref 1');
});

test('코드가 1개 이하면 조합이 없다', () => {
  assert.equal(comboOf('girl --sref 1 --v 8'), null);
  assert.equal(comboOf('--sref 1 1::2'), null);
});

test('이미지 링크는 조합과 sref에서 뺀다', () => {
  assert.equal(
    comboOf(
      'cat --profile 8nb5hyj --sref https://s.mj.run/aaa https://s.mj.run/bbb',
    ),
    null,
  );
  assert.equal(
    comboOf('cat --p a --sref https://s.mj.run/x 12'),
    '--profile a --sref 12',
  );
  assert.deepEqual(
    parseMidjourneyPrompt('cat --p a --sref https://s.mj.run/x, 12,').srefs,
    [{ value: '12', weight: undefined }],
  );
});

test('코드 순서와 --p/--profile 표기가 달라도 같은 조합이다', () => {
  assert.equal(
    comboKeyOf('--p a --sref 2 1'),
    comboKeyOf('--sref 1 2 --profile a'),
  );
});

test('가중치가 다르면 다른 조합이다', () => {
  assert.notEqual(comboKeyOf('--sref 1::2 2'), comboKeyOf('--sref 1 2'));
});
