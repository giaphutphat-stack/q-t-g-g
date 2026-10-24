import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeEndpoint, cleanAndParseJSON, getTopWeaknessTag } from './engine';

test('normalizeEndpoint appends /v1/chat/completions when missing', () => {
  assert.equal(normalizeEndpoint('https://www.inroi.shop'), 'https://www.inroi.shop/v1/chat/completions');
  assert.equal(normalizeEndpoint('https://www.inroi.shop/v1'), 'https://www.inroi.shop/v1/chat/completions');
  assert.equal(
    normalizeEndpoint('https://www.inroi.shop/v1/chat/completions'),
    'https://www.inroi.shop/v1/chat/completions'
  );
  assert.equal(
    normalizeEndpoint('[https://www.inroi.shop/v1/chat/completions](https://www.inroi.shop/v1/chat/completions)'),
    'https://www.inroi.shop/v1/chat/completions'
  );
});

test('cleanAndParseJSON strips markdown code fences and parses valid JSON', () => {
  const wrapped = '```json\n{"id":"test-1","module":"reading","correctKey":"B"}\n```';
  const parsed = cleanAndParseJSON<{ id: string; module: string; correctKey: string }>(wrapped);
  assert.equal(parsed.id, 'test-1');
  assert.equal(parsed.module, 'reading');
  assert.equal(parsed.correctKey, 'B');
});

test('cleanAndParseJSON extracts JSON object when surrounded by text', () => {
  const noisy = 'Here is the generated level:\n```json\n{"id":"lvl-9","difficulty":"Band 7.0"}\n```\nEnjoy!';
  const parsed = cleanAndParseJSON<{ id: string; difficulty: string }>(noisy);
  assert.equal(parsed.id, 'lvl-9');
  assert.equal(parsed.difficulty, 'Band 7.0');
});

test('getTopWeaknessTag returns highest frequency tag or default', () => {
  assert.equal(getTopWeaknessTag({}), '#同义替换未认出');
  assert.equal(
    getTopWeaknessTag({
      '#同义替换未认出': 2,
      '#NG过度推理': 5,
      '#漏听转折路标词': 1,
    }),
    '#NG过度推理'
  );
});
