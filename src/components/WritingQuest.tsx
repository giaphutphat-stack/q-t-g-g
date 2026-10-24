import React, { useState, useEffect } from 'react';
import { QuestLevel, WritingQuestData, SentenceChunk } from '../types';
import { sound } from '../utils/audio';
import {
  PenTool,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Award,
} from 'lucide-react';

interface WritingQuestProps {
  level: QuestLevel;
  unlockedHintTier: number;
  onSuccess: (mistakes: number) => void;
  onOpenHints: () => void;
}

export const WritingQuest: React.FC<WritingQuestProps> = ({
  level,
  unlockedHintTier,
  onSuccess,
  onOpenHints,
}) => {
  const questData = level.writing as WritingQuestData;
  const [selectedChunkIds, setSelectedChunkIds] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState<number>(0);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [showCritiqueComparison, setShowCritiqueComparison] = useState<boolean>(false);
  const [wrongAttempt, setWrongAttempt] = useState<boolean>(false);

  // Auto solve if tier 3 hint unlocked
  useEffect(() => {
    if (unlockedHintTier >= 3) {
      setSelectedChunkIds(questData.correctOrder);
      setIsSuccess(true);
      setShowCritiqueComparison(true);
      const timer = setTimeout(() => {
        onSuccess(mistakes);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [unlockedHintTier, questData, mistakes, onSuccess]);

  const handleSelectChunk = (chunkId: string) => {
    sound.playClick();
    if (isSuccess || selectedChunkIds.includes(chunkId)) return;
    setSelectedChunkIds((prev) => [...prev, chunkId]);
  };

  const handleRemoveChunk = (chunkId: string) => {
    sound.playClick();
    if (isSuccess) return;
    setSelectedChunkIds((prev) => prev.filter((id) => id !== chunkId));
  };

  const handleResetSlots = () => {
    sound.playClick();
    if (isSuccess) return;
    setSelectedChunkIds([]);
  };

  const handleVerifySyntax = () => {
    if (selectedChunkIds.length !== questData.correctOrder.length) return;

    const isOrderCorrect = selectedChunkIds.every(
      (id, idx) => id === questData.correctOrder[idx]
    );

    if (isOrderCorrect) {
      sound.playVictory();
      setIsSuccess(true);
      setShowCritiqueComparison(true);
      setTimeout(() => {
        onSuccess(mistakes);
      }, 1600);
    } else {
      sound.playError();
      setMistakes((prev) => prev + 1);
      setWrongAttempt(true);
      setTimeout(() => setWrongAttempt(false), 700);
    }
  };

  // Find chunk objects in selected order
  const assembledSentence = selectedChunkIds
    .map((id) => questData.scrambledChunks.find((c) => c.id === id)?.text)
    .filter(Boolean)
    .join(' ');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Target Transformation Card (Band 5.5 vs Band 7.5+ Mission) */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-lg relative overflow-hidden">
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500" />

        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                句法炼金与升舱工坊
              </h3>
              <p className="text-xs text-slate-400 font-mono">{questData.topic}</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40">
            目标: Band 7.5+ 复合语法
          </span>
        </div>

        {/* Band 5.5 Benchmark Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-rose-500 flex items-center gap-1">
              ⚠️ Band 5.5 原始平庸句（需重构）：
            </span>
            <span className="text-slate-400">初阶句式缺陷</span>
          </div>
          <p className="font-serif italic text-sm text-slate-700 dark:text-slate-300">
            "{questData.originalBand5Sentence}"
          </p>
          <p className="text-xs text-slate-400">
            诊断批注：{questData.originalCritique}
          </p>
        </div>

        {/* Assembly Chamber (The Alchemical Crucible) */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              当前炼制中的升舱句构：
            </span>
            {selectedChunkIds.length > 0 && !isSuccess && (
              <button
                onClick={handleResetSlots}
                className="text-slate-400 hover:text-rose-500 text-xs flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                清空重排
              </button>
            )}
          </div>

          <div
            className={`min-h-[100px] p-4 rounded-2xl border-2 transition-all flex flex-wrap items-center gap-2 ${
              isSuccess
                ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-inner ring-2 ring-emerald-400/20'
                : wrongAttempt
                ? 'border-rose-400 bg-rose-50/30 animate-shake'
                : 'border-dashed border-purple-300 dark:border-purple-800/60 bg-purple-50/30 dark:bg-purple-950/10'
            }`}
          >
            {selectedChunkIds.length === 0 ? (
              <span className="text-xs sm:text-sm text-slate-400 italic mx-auto">
                从下方点击高分语法组件，按严密逻辑顺序组装入舱...
              </span>
            ) : (
              selectedChunkIds.map((chunkId, idx) => {
                const chunk = questData.scrambledChunks.find((c) => c.id === chunkId);
                if (!chunk) return null;

                return (
                  <button
                    key={chunkId}
                    disabled={isSuccess}
                    onClick={() => handleRemoveChunk(chunkId)}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-purple-600 text-white font-medium text-xs sm:text-sm shadow-md flex items-center gap-1.5 hover:bg-purple-700 active:scale-95 transition-all"
                  >
                    <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] font-mono flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span>{chunk.text}</span>
                    {!isSuccess && <span className="opacity-60 text-xs ml-0.5">✕</span>}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Scrambled Chunks Bank */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            高阶句式炼金组件库
          </span>
          <span className="text-xs text-slate-400">
            点击组件按序嵌入炼金舱
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {questData.scrambledChunks.map((chunk) => {
            const isUsed = selectedChunkIds.includes(chunk.id);

            return (
              <button
                key={chunk.id}
                disabled={isUsed || isSuccess}
                onClick={() => handleSelectChunk(chunk.id)}
                className={`min-h-[56px] p-4 rounded-2xl text-left border transition-all active:scale-95 flex flex-col justify-between gap-2 ${
                  isUsed
                    ? 'opacity-40 bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-purple-500 shadow-sm hover:shadow'
                }`}
              >
                <div className="font-medium text-xs sm:text-sm">{chunk.text}</div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-md">
                    {chunk.role}
                  </span>
                  <span className="font-mono font-bold">Band {chunk.band}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rubric Comparison Radar / Breakdown Box (Appears on Success) */}
      {showCritiqueComparison && (
        <div className="rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white p-6 sm:p-8 border border-purple-500/40 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Award className="w-5 h-5" />
            <span>雅思官方评分标准升舱剖析（LR & GRA）</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Lexical Resource */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-purple-300 font-bold block">
                词汇丰富度 (Lexical Resource)
              </span>
              <p className="text-slate-400 line-through">5.5级: {questData.rubricComparison.lr_5}</p>
              <p className="text-emerald-400 font-semibold">
                7.5+级: {questData.rubricComparison.lr_7}
              </p>
            </div>

            {/* Grammatical Range & Accuracy */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-cyan-300 font-bold block">
                语法多样性与准确性 (GRA)
              </span>
              <p className="text-slate-400">初阶: {questData.rubricComparison.gra_5}</p>
              <p className="text-emerald-400 font-semibold">
                高阶: {questData.rubricComparison.gra_7}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 text-xs text-slate-300">
            <span className="font-bold text-amber-300">炼金升级亮点：</span>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              {questData.rubricComparison.upgradeHighlights.map((hl, i) => (
                <li key={i}>{hl}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Footer verification controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => {
            sound.playClick();
            onOpenHints();
          }}
          className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1.5"
        >
          <HelpCircle className="w-4 h-4" />
          <span>战术提示</span>
        </button>

        <button
          disabled={selectedChunkIds.length !== questData.correctOrder.length || isSuccess}
          onClick={handleVerifySyntax}
          className="min-h-[48px] px-8 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-purple-600/20 active:scale-95 transition-all flex items-center gap-2"
        >
          {isSuccess ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>句型升舱成功！</span>
            </>
          ) : (
            <span>融合验证句法</span>
          )}
        </button>
      </div>
    </div>
  );
};
