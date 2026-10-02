import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

import React from 'react';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const { getImageProps } = require('next/image');

test('썸네일은 반응형으로 최적화하고 외부 URL·오류는 원본으로 표시한다', () => {
  for (const [directory, name, prop] of [
    ['post', 'PostCard', 'post'],
    ['project', 'ProjectCard', 'project'],
  ]) {
    let failedSrc;
    const react = {
      ...React,
      useState: () => [failedSrc, (src) => (failedSrc = src)],
    };
    const source = readFileSync(
      new URL(`../src/components/${directory}/${name}.tsx`, import.meta.url),
      'utf8',
    );
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.React,
        esModuleInterop: true,
      },
    });
    const exports = {};
    new Function('require', 'exports', outputText)(
      (id) => (id === 'react' ? react : require(id)),
      exports,
    );
    const thumbnail = (src) => {
      const card = exports[name]({
        [prop]: {
          thumbnailUrl: src,
          tags: [],
          slug: 'example',
          status: '발행',
        },
      });
      return card.props.children.props.children[0].props.children.props;
    };

    const src = '/api/notion-image?pageId=example&field=cover&v=file-id';
    const optimized = thumbnail(src);
    assert.match(getImageProps(optimized).props.srcSet, /384w/);
    assert.ok(optimized.sizes.includes('100vw'));

    optimized.onError();
    assert.equal(getImageProps(thumbnail(src)).props.src, src);
    assert.equal(getImageProps(thumbnail(src)).props.srcSet, undefined);
    assert.ok(getImageProps(thumbnail(`${src}-new`)).props.srcSet);

    const external = 'https://external.example/cover.svg';
    assert.equal(getImageProps(thumbnail(external)).props.src, external);
    assert.equal(getImageProps(thumbnail(external)).props.srcSet, undefined);
  }
});
