import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBandScore,
  calculateLevelStars,
  calculateXpReward,
  getBandDescription,
  isLevelUnlocked,
} from './scoring';

test('calculateBandScore starts at 5.5 for zero completed levels', () => {
  assert.equal(calculateBandScore(0, 0), 5.5);
});

test('calculateBandScore increases monotonically with completions and xp', () => {
  const scoreEarly = calculateBandScore(150, 2, 0.8);
  const scoreMid = calculateBandScore(800, 8, 0.85);
  const scoreMaster = calculateBandScore(2400, 16, 0.95);

  assert.ok(scoreMid >= scoreEarly);
  assert.ok(scoreMaster >= scoreMid);
  assert.ok(scoreMaster <= 8.5);
  // Verify 0.5 step rounding
  assert.equal(scoreMid % 0.5, 0);
  assert.equal(scoreMaster % 0.5, 0);
});

test('calculateLevelStars awards 3 stars for clean run with minimal hints', () => {
  assert.equal(calculateLevelStars(0, 0), 3);
  assert.equal(calculateLevelStars(1, 0), 3);
  assert.equal(calculateLevelStars(0, 1), 2);
  assert.equal(calculateLevelStars(3, 3), 1);
});

test('calculateXpReward applies combo bonus and caps bounds', () => {
  const base = 100;
  const noComboNoHint = calculateXpReward(base, 0, 0);
  const highCombo = calculateXpReward(base, 5, 0);
  const tier3HintUsed = calculateXpReward(base, 0, 3);

  assert.equal(noComboNoHint, 100);
  assert.equal(highCombo, 160); // 100 + min(5*15, 60)
  assert.equal(tier3HintUsed, 70); // 100 - 30
});

test('isLevelUnlocked respects sequential unlock in module', () => {
  assert.equal(isLevelUnlocked(1, 'listening', []), true);
  assert.equal(isLevelUnlocked(2, 'listening', []), false);
  assert.equal(isLevelUnlocked(2, 'listening', ['listening-1']), true);
  assert.equal(isLevelUnlocked(3, 'listening', ['listening-1']), false);
  assert.equal(isLevelUnlocked(3, 'listening', ['listening-1', 'listening-2']), true);
});

test('getBandDescription returns valid title and color for score', () => {
  const desc7 = getBandDescription(7.5);
  assert.equal(desc7.color, 'teal');
  assert.ok(desc7.title.includes('7.5'));
});
