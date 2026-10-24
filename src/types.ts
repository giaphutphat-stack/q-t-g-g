export type SkillModule = 'listening' | 'reading' | 'writing' | 'speaking';

export interface VocabularyItem {
  id: string;
  term: string;
  phonetic?: string;
  meaning: string;
  collocation?: string;
  ieltsContext: string;
  band: string;
  module: SkillModule;
}

export interface TacticalHint {
  tier1: {
    title: string;
    hint: string;
    actionType?: 'highlight' | 'eliminate' | 'slow_audio';
    eliminatedKeys?: string[];
  };
  tier2: {
    title: string;
    analysis?: string;
    trapOrLogic: string;
  };
  tier3: {
    title: string;
    fullAnswer: string;
    explanation: string;
    vocabulary: VocabularyItem[];
  };
}

export interface ListeningQuestData {
  audioScript: string;
  audioAccent: 'en-GB' | 'en-AU';
  contextTitle: string;
  scenarioType: 'boarding_pass' | 'map_guide' | 'consultation' | 'academic_outline';
  slots: Array<{
    id: string;
    label: string;
    prefix?: string;
    suffix?: string;
    answer: string;
  }>;
  wordBank: string[];
}

export interface SynonymPair {
  target: string;
  passageMatch: string;
  meaning: string;
}

export interface TfngItem {
  statement: string;
  answer: 'TRUE' | 'FALSE' | 'NOT_GIVEN';
  evidenceQuote: string;
  trapExplanation: string;
}

export interface ReadingQuestData {
  passageTitle: string;
  passageTopic: string;
  passageText: string;
  mode: 'synonym_match' | 'tfng_evidence';
  synonymPairs?: SynonymPair[];
  tfngItem?: TfngItem;
}

export interface SentenceChunk {
  id: string;
  text: string;
  role: string;
  band: string;
}

export interface WritingQuestData {
  taskType: 'task1_trend' | 'task1_process' | 'task2_argument' | 'task2_problem';
  topic: string;
  originalBand5Sentence: string;
  originalCritique: string;
  targetSentence: string;
  scrambledChunks: SentenceChunk[];
  correctOrder: string[]; // chunk ids
  rubricComparison: {
    lr_5: string;
    lr_7: string;
    gra_5: string;
    gra_7: string;
    upgradeHighlights: string[];
  };
}

export interface SpeakingPhrase {
  id: string;
  phrase: string;
  phonetic: string;
  meaning: string;
  usageSample: string;
}

export interface SpeakingQuestData {
  part: 'Part 2 Cue Card' | 'Part 3 Discussion';
  topicTitle: string;
  cueBulletPoints: string[];
  targetPhrases: SpeakingPhrase[];
  fluencyGoal: number;
}

export interface QuestLevel {
  id: string;
  moduleId: SkillModule;
  levelNumber: number;
  title: string;
  tagline: string;
  bandTarget: string;
  xpReward: number;
  hints: TacticalHint;
  listening?: ListeningQuestData;
  reading?: ReadingQuestData;
  writing?: WritingQuestData;
  speaking?: SpeakingQuestData;
}

export interface ReviewDeckItem {
  id: string;
  levelId: string;
  moduleId: SkillModule;
  title: string;
  mistakeContext: string;
  solution: string;
  addedAt: number;
}

export interface PlayerProgress {
  xp: number;
  combo: number;
  maxCombo: number;
  completedLevels: string[];
  levelScores: Record<string, { stars: number; accuracy: number; hintsUsed: number }>;
  notebook: VocabularyItem[];
  reviewDeck: ReviewDeckItem[];
  soundEnabled: boolean;
}
