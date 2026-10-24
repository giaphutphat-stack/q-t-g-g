/**
 * Pure scoring and progression logic for IELTS Quest
 */

export function calculateBandScore(xp: number, completedCount: number, accuracyAvg: number = 0.85): number {
  if (completedCount === 0) return 5.5;

  // Base band scaled between 5.5 and 8.5
  // 16 total levels in the game
  const progressRatio = Math.min(completedCount / 16, 1.0);
  const xpRatio = Math.min(xp / 2400, 1.0);

  const weightedScore = 5.5 + progressRatio * 1.5 + xpRatio * 1.0 + (accuracyAvg - 0.5) * 1.0;
  // Round to nearest 0.5
  const rounded = Math.round(weightedScore * 2) / 2;
  return Math.min(8.5, Math.max(5.5, rounded));
}

export function calculateLevelStars(hintsUsed: number, mistakes: number): number {
  if (mistakes === 0 && hintsUsed <= 1) return 3;
  if (mistakes <= 2 && hintsUsed <= 2) return 2;
  return 1;
}

export function calculateXpReward(baseReward: number, combo: number, hintsUsed: number): number {
  const comboBonus = Math.min(combo * 15, 60);
  const hintPenalty = hintsUsed === 3 ? 30 : hintsUsed * 10;
  return Math.max(20, baseReward + comboBonus - hintPenalty);
}

export function getBandDescription(band: number): { title: string; color: string; feedback: string } {
  if (band >= 8.0) {
    return {
      title: 'Very Good / Expert User (Band 8.0+)',
      color: 'emerald',
      feedback: '精通学术词汇同义替换与多维句式结构，已具备剑桥雅思高分梯队水准！',
    };
  }
  if (band >= 7.5) {
    return {
      title: 'Good User (Band 7.5)',
      color: 'teal',
      feedback: '熟练掌握地道搭配与逻辑衔接，写作与口语用词具备鲜明的高阶质感。',
    };
  }
  if (band >= 7.0) {
    return {
      title: 'Competent User (Band 7.0)',
      color: 'sky',
      feedback: '逻辑清晰，能有效避开常见干扰项与平庸句式，冲击名校门槛！',
    };
  }
  if (band >= 6.5) {
    return {
      title: 'Promising User (Band 6.5)',
      color: 'amber',
      feedback: '基本掌握核心考点，通过强化同义替换与复杂句型即可稳步跃升 7.0+。',
    };
  }
  return {
    title: 'Explorer (Band 5.5 - 6.0)',
    color: 'rose',
    feedback: '正在打牢听说读写核心语料基底，开启环球探索全面提分！',
  };
}

export function isLevelUnlocked(
  levelIndex: number,
  moduleId: string,
  completedLevels: string[]
): boolean {
  // Level 1 of any module is unlocked by default
  if (levelIndex === 1) return true;
  // Previous level of same module must be completed
  const prevLevelId = `${moduleId}-${levelIndex - 1}`;
  return completedLevels.includes(prevLevelId);
}
