/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { QuestLevel, PlayerProgress, VocabularyItem, ReviewDeckItem } from './types';
import { QUEST_LEVELS, INITIAL_VOCABULARY } from './data/curriculum';
import { calculateLevelStars, calculateXpReward, calculateBandScore, getBandDescription } from './game/scoring';
import { sound } from './utils/audio';
import { HUD } from './components/HUD';
import { WorldMap } from './components/WorldMap';
import { ListeningQuest } from './components/ListeningQuest';
import { ReadingQuest } from './components/ReadingQuest';
import { WritingQuest } from './components/WritingQuest';
import { SpeakingQuest } from './components/SpeakingQuest';
import { TacticalHintModal } from './components/TacticalHintModal';
import { NotebookModal } from './components/NotebookModal';
import { ParticleCanvas } from './components/ParticleCanvas';
import { generateSingleFileHtml } from './utils/exporter';
import {
  Trophy,
  Star,
  Sparkles,
  ArrowRight,
  BookOpen,
  RotateCcw,
  Compass,
  CheckCircle2,
  Volume2,
} from 'lucide-react';

const STORAGE_KEY = 'ielts_quest_player_progress_v1';

const DEFAULT_PROGRESS: PlayerProgress = {
  xp: 0,
  combo: 0,
  maxCombo: 0,
  completedLevels: [],
  levelScores: {},
  notebook: INITIAL_VOCABULARY.slice(0, 8),
  reviewDeck: [],
  soundEnabled: true,
};

export default function App() {
  const [progress, setProgress] = useState<PlayerProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_PROGRESS,
          ...parsed,
          // ensure initial vocab presence
          notebook: parsed.notebook?.length ? parsed.notebook : INITIAL_VOCABULARY.slice(0, 8),
        };
      }
    } catch (e) {
      console.warn('Failed to load saved progress:', e);
    }
    return DEFAULT_PROGRESS;
  });

  const [currentLevel, setCurrentLevel] = useState<QuestLevel | null>(null);
  const [unlockedHintTier, setUnlockedHintTier] = useState<number>(0);
  const [isHintModalOpen, setIsHintModalOpen] = useState<boolean>(false);
  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState<boolean>(false);
  const [triggerCelebration, setTriggerCelebration] = useState<boolean>(false);
  const [victoryModalData, setVictoryModalData] = useState<{
    level: QuestLevel;
    earnedXp: number;
    stars: number;
  } | null>(null);

  // Sync progress to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [progress]);

  // Support ?autostart=1 or ?level=id for testing and quick start
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const levelParam = params.get('level');
      const autostart = params.get('autostart');

      if (levelParam) {
        const found = QUEST_LEVELS.find((l) => l.id === levelParam);
        if (found) setCurrentLevel(found);
      } else if (autostart === '1') {
        setCurrentLevel(QUEST_LEVELS[0]);
      }
    }
  }, []);

  const handleSelectLevel = (level: QuestLevel) => {
    setCurrentLevel(level);
    setUnlockedHintTier(0);
  };

  const handleLevelSuccess = (mistakes: number) => {
    if (!currentLevel) return;

    const stars = calculateLevelStars(unlockedHintTier, mistakes);
    const newCombo = progress.combo + 1;
    const earnedXp = calculateXpReward(currentLevel.xpReward, newCombo, unlockedHintTier);

    // Merge vocabulary into notebook
    const newVocab = [...progress.notebook];
    currentLevel.hints.tier3.vocabulary.forEach((item) => {
      if (!newVocab.some((v) => v.id === item.id)) {
        newVocab.push(item);
      }
    });

    const isNewlyCompleted = !progress.completedLevels.includes(currentLevel.id);
    const nextCompleted = isNewlyCompleted
      ? [...progress.completedLevels, currentLevel.id]
      : progress.completedLevels;

    setProgress((prev) => ({
      ...prev,
      xp: prev.xp + earnedXp,
      combo: newCombo,
      maxCombo: Math.max(prev.maxCombo, newCombo),
      completedLevels: nextCompleted,
      notebook: newVocab,
      levelScores: {
        ...prev.levelScores,
        [currentLevel.id]: {
          stars: Math.max(stars, prev.levelScores[currentLevel.id]?.stars || 0),
          accuracy: mistakes === 0 ? 1.0 : 0.8,
          hintsUsed: unlockedHintTier,
        },
      },
    }));

    setTriggerCelebration(true);
    setTimeout(() => setTriggerCelebration(false), 3000);

    setVictoryModalData({
      level: currentLevel,
      earnedXp,
      stars,
    });
  };

  const handleNextLevel = () => {
    sound.playClick();
    if (!currentLevel) return;
    const currentIndex = QUEST_LEVELS.findIndex((l) => l.id === currentLevel.id);
    if (currentIndex >= 0 && currentIndex < QUEST_LEVELS.length - 1) {
      const next = QUEST_LEVELS[currentIndex + 1];
      setCurrentLevel(next);
      setUnlockedHintTier(0);
      setVictoryModalData(null);
    } else {
      // Finished all levels or back to map
      setCurrentLevel(null);
      setVictoryModalData(null);
    }
  };

  const handleToggleSound = () => {
    const nextState = !progress.soundEnabled;
    sound.setMuted(!nextState);
    setProgress((prev) => ({ ...prev, soundEnabled: nextState }));
  };

  const handleAddToReviewDeck = () => {
    if (!currentLevel) return;
    const exists = progress.reviewDeck.some((r) => r.levelId === currentLevel.id);
    if (exists) return;

    const newItem: ReviewDeckItem = {
      id: `rev-${Date.now()}`,
      levelId: currentLevel.id,
      moduleId: currentLevel.moduleId,
      title: currentLevel.title,
      mistakeContext: currentLevel.hints.tier2.trapOrLogic,
      solution: currentLevel.hints.tier3.fullAnswer,
      addedAt: Date.now(),
    };

    setProgress((prev) => ({
      ...prev,
      reviewDeck: [newItem, ...prev.reviewDeck],
    }));
  };

  const handleExportSingleFile = () => {
    sound.playClick();
    const htmlContent = generateSingleFileHtml(QUEST_LEVELS);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ielts-quest-single-file.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isCurrentInReviewDeck = currentLevel
    ? progress.reviewDeck.some((r) => r.levelId === currentLevel.id)
    : false;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white antialiased">
      {/* Particle Canvas */}
      <ParticleCanvas triggerCelebration={triggerCelebration} />

      {/* Top HUD */}
      <HUD
        progress={progress}
        currentModule={currentLevel?.moduleId}
        onOpenNotebook={() => setIsNotebookModalOpen(true)}
        onToggleSound={handleToggleSound}
        onBackToMap={() => setCurrentLevel(null)}
        onOpenHints={() => setIsHintModalOpen(true)}
        onExportSingleFile={handleExportSingleFile}
        isPlayingLevel={!!currentLevel}
      />

      {/* Main Playfield Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col">
        {!currentLevel ? (
          <WorldMap
            levels={QUEST_LEVELS}
            progress={progress}
            onSelectLevel={handleSelectLevel}
          />
        ) : (
          <div className="flex-1 flex flex-col space-y-6 animate-in fade-in duration-200">
            {/* Level Context Title Banner */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-mono font-bold flex items-center justify-center text-sm shadow-sm">
                  L{currentLevel.levelNumber}
                </span>
                <div>
                  <h2 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white">
                    {currentLevel.title}
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">{currentLevel.tagline}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {currentLevel.bandTarget}
                </span>
                <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                  +{currentLevel.xpReward} XP
                </span>
              </div>
            </div>

            {/* Level Specific Interactive Component */}
            <div className="flex-1">
              {currentLevel.moduleId === 'listening' && (
                <ListeningQuest
                  key={currentLevel.id}
                  level={currentLevel}
                  unlockedHintTier={unlockedHintTier}
                  onSuccess={handleLevelSuccess}
                  onOpenHints={() => setIsHintModalOpen(true)}
                />
              )}

              {currentLevel.moduleId === 'reading' && (
                <ReadingQuest
                  key={currentLevel.id}
                  level={currentLevel}
                  unlockedHintTier={unlockedHintTier}
                  onSuccess={handleLevelSuccess}
                  onOpenHints={() => setIsHintModalOpen(true)}
                />
              )}

              {currentLevel.moduleId === 'writing' && (
                <WritingQuest
                  key={currentLevel.id}
                  level={currentLevel}
                  unlockedHintTier={unlockedHintTier}
                  onSuccess={handleLevelSuccess}
                  onOpenHints={() => setIsHintModalOpen(true)}
                />
              )}

              {currentLevel.moduleId === 'speaking' && (
                <SpeakingQuest
                  key={currentLevel.id}
                  level={currentLevel}
                  unlockedHintTier={unlockedHintTier}
                  onSuccess={handleLevelSuccess}
                  onOpenHints={() => setIsHintModalOpen(true)}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Tactical Hint Modal */}
      {currentLevel && (
        <TacticalHintModal
          level={currentLevel}
          isOpen={isHintModalOpen}
          onClose={() => setIsHintModalOpen(false)}
          unlockedTier={unlockedHintTier}
          onUnlockTier={(tier) => setUnlockedHintTier(tier)}
          onApplyTacticalSkip={() => {
            setUnlockedHintTier(3);
            handleAddToReviewDeck();
          }}
          onAddToReviewDeck={handleAddToReviewDeck}
          isAlreadyInReviewDeck={isCurrentInReviewDeck}
        />
      )}

      {/* Notebook & Review Deck Modal */}
      <NotebookModal
        isOpen={isNotebookModalOpen}
        onClose={() => setIsNotebookModalOpen(false)}
        vocabularyList={progress.notebook}
        reviewDeck={progress.reviewDeck}
        onRemoveReviewItem={(id) => {
          setProgress((prev) => ({
            ...prev,
            reviewDeck: prev.reviewDeck.filter((r) => r.id !== id),
          }));
        }}
        onJumpToLevel={(levelId) => {
          const target = QUEST_LEVELS.find((l) => l.id === levelId);
          if (target) {
            setCurrentLevel(target);
            setUnlockedHintTier(0);
          }
        }}
      />

      {/* Victory Celebration Modal */}
      {victoryModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-emerald-500/40 p-6 sm:p-8 text-center space-y-5 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mx-auto flex items-center justify-center shadow-lg">
              <Trophy className="w-8 h-8 animate-bounce" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                关卡突破！
              </div>
              <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">
                {victoryModalData.level.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                成功掌握雅思高频题眼与核心学术语料！
              </p>
            </div>

            {/* Stars Display */}
            <div className="flex items-center justify-center gap-2 py-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-8 h-8 transition-all ${
                    i < victoryModalData.stars
                      ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow'
                      : 'text-slate-300 dark:text-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Rewards stats */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">收获探索经验</span>
                <span className="text-lg font-black font-mono text-amber-500">
                  +{victoryModalData.earnedXp} XP
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">已收录高分词卡</span>
                <span className="text-lg font-black font-mono text-indigo-500">
                  +{victoryModalData.level.hints.tier3.vocabulary.length} 词
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setCurrentLevel(null);
                  setVictoryModalData(null);
                }}
                className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
              >
                返回地图
              </button>
              <button
                onClick={handleNextLevel}
                className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <span>下一关卡</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
