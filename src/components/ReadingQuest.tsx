import React, { useState, useEffect } from 'react';
import { QuestLevel, ReadingQuestData, SynonymPair } from '../types';
import { sound } from '../utils/audio';
import {
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  Sparkles,
  HelpCircle,
  Highlighter,
  Lock,
} from 'lucide-react';

interface ReadingQuestProps {
  level: QuestLevel;
  unlockedHintTier: number;
  onSuccess: (mistakes: number) => void;
  onOpenHints: () => void;
}

export const ReadingQuest: React.FC<ReadingQuestProps> = ({
  level,
  unlockedHintTier,
  onSuccess,
  onOpenHints,
}) => {
  const questData = level.reading as ReadingQuestData;
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState<number>(0);
  const [selectedTfng, setSelectedTfng] = useState<'TRUE' | 'FALSE' | 'NOT_GIVEN' | null>(null);
  const [highlightedEvidence, setHighlightedEvidence] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [wrongAttempt, setWrongAttempt] = useState<boolean>(false);

  // Auto solve if tier 3 hint triggered
  useEffect(() => {
    if (unlockedHintTier >= 3) {
      if (questData.mode === 'synonym_match' && questData.synonymPairs) {
        setMatchedPairs(questData.synonymPairs.map((p) => p.target));
        setIsSuccess(true);
        const timer = setTimeout(() => onSuccess(mistakes), 800);
        return () => clearTimeout(timer);
      } else if (questData.mode === 'tfng_evidence' && questData.tfngItem) {
        setSelectedTfng(questData.tfngItem.answer);
        setHighlightedEvidence(true);
        setIsSuccess(true);
        const timer = setTimeout(() => onSuccess(mistakes), 800);
        return () => clearTimeout(timer);
      }
    }
  }, [unlockedHintTier, questData, mistakes, onSuccess]);

  // Handle Synonym Matching
  const handleTargetClick = (target: string) => {
    sound.playClick();
    if (matchedPairs.includes(target)) return;
    setSelectedTarget(target);
  };

  const handlePassageWordClick = (passageMatch: string) => {
    if (!selectedTarget) {
      sound.playClick();
      return;
    }

    const currentPair = questData.synonymPairs?.find((p) => p.target === selectedTarget);
    if (currentPair && currentPair.passageMatch.toLowerCase() === passageMatch.toLowerCase()) {
      sound.playCorrect(matchedPairs.length + 1);
      const newMatches = [...matchedPairs, selectedTarget];
      setMatchedPairs(newMatches);
      setSelectedTarget(null);

      if (newMatches.length === (questData.synonymPairs?.length || 0)) {
        setIsSuccess(true);
        setTimeout(() => onSuccess(mistakes), 1200);
      }
    } else {
      sound.playError();
      setWrongAttempt(true);
      setMistakes((prev) => prev + 1);
      setTimeout(() => setWrongAttempt(false), 600);
    }
  };

  // Handle T/F/NG
  const handleSelectTfng = (val: 'TRUE' | 'FALSE' | 'NOT_GIVEN') => {
    sound.playClick();
    setSelectedTfng(val);
  };

  const handleToggleEvidence = () => {
    sound.playClick();
    setHighlightedEvidence(true);
  };

  const handleVerifyTfng = () => {
    if (!questData.tfngItem) return;
    if (selectedTfng === questData.tfngItem.answer) {
      sound.playCorrect();
      setIsSuccess(true);
      setTimeout(() => onSuccess(mistakes), 1200);
    } else {
      sound.playError();
      setMistakes((prev) => prev + 1);
      setWrongAttempt(true);
      setTimeout(() => setWrongAttempt(false), 600);
    }
  };

  // Shuffled or clean passage representation
  const passage = questData.passageText;

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Academic Manuscript (7 cols) */}
      <div className="lg:col-span-7 rounded-3xl bg-amber-50/40 dark:bg-slate-900 border-2 border-amber-200/60 dark:border-slate-800 p-6 sm:p-8 shadow-lg flex flex-col justify-between">
        <div>
          {/* Ancient / Academic Header */}
          <div className="flex items-center justify-between border-b border-amber-200/50 dark:border-slate-800 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-amber-100">
                  {questData.passageTitle}
                </h3>
                <p className="text-xs text-slate-400 font-mono">{questData.passageTopic}</p>
              </div>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 font-semibold">
              学术原卷
            </span>
          </div>

          {/* Passage Body */}
          <div className="font-serif text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed tracking-wide space-y-4">
            <p>
              {passage}
            </p>
          </div>

          {/* Interactive Evidence Highlight Banner for TFNG */}
          {questData.mode === 'tfng_evidence' && questData.tfngItem && (
            <div className="mt-6 pt-5 border-t border-amber-200/50 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Highlighter className="w-3.5 h-3.5 text-blue-500" />
                  原文定位印证句
                </span>
                <button
                  onClick={handleToggleEvidence}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                    highlightedEvidence
                      ? 'bg-blue-600 text-white border-blue-500 font-semibold'
                      : 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                  }`}
                >
                  {highlightedEvidence ? '✓ 原文核心句已高亮' : '点击点亮原文证据'}
                </button>
              </div>

              {highlightedEvidence && (
                <div className="p-3.5 rounded-2xl bg-amber-200/40 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 text-xs sm:text-sm text-slate-900 dark:text-amber-100 font-serif italic animate-in fade-in">
                  “...{questData.tfngItem.evidenceQuote}...“
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-amber-200/40 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <span>来源：IELTS Academic Corpus</span>
          <span>Cambridge Reading Standard</span>
        </div>
      </div>

      {/* Right Column: Decryption Task Matrix (5 cols) */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        {/* Task 1: Synonym Match */}
        {questData.mode === 'synonym_match' && questData.synonymPairs && (
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-md flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    同义替换消消乐
                  </h4>
                  <p className="text-xs text-slate-400">
                    先选定题干词，再点击右侧对应的学术转述
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  {matchedPairs.length} / {questData.synonymPairs.length}
                </span>
              </div>

              {/* Targets List */}
              <div className="space-y-2.5">
                <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  题干考点词：
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {questData.synonymPairs.map((pair) => {
                    const isMatched = matchedPairs.includes(pair.target);
                    const isSelected = selectedTarget === pair.target;

                    return (
                      <button
                        key={pair.target}
                        disabled={isMatched || isSuccess}
                        onClick={() => handleTargetClick(pair.target)}
                        className={`min-h-[48px] p-3 rounded-2xl text-left font-mono text-xs sm:text-sm font-bold border transition-all flex items-center justify-between ${
                          isMatched
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                            : isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-400/30'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                        }`}
                      >
                        <span>{pair.target}</span>
                        {isMatched ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <span className="text-[10px] text-slate-400 font-sans font-normal">
                            {pair.meaning}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Passage Match Options */}
              <div className="space-y-2.5 pt-2">
                <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  原文高阶同义表达（点击配对）：
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {questData.synonymPairs.map((pair) => {
                    const isMatched = matchedPairs.includes(pair.target);

                    return (
                      <button
                        key={pair.passageMatch}
                        disabled={isMatched || isSuccess}
                        onClick={() => handlePassageWordClick(pair.passageMatch)}
                        className={`min-h-[48px] p-3 rounded-2xl text-left font-mono text-xs sm:text-sm font-bold border transition-all flex items-center justify-between ${
                          isMatched
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 line-through opacity-60'
                            : 'bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-500 shadow-sm'
                        }`}
                      >
                        <span>{pair.passageMatch}</span>
                        {isMatched && <span className="text-[10px] font-sans">✓ 已破译</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Hint & Status Footer */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
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
              {isSuccess && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  全部破译完成！
                </span>
              )}
            </div>
          </div>
        )}

        {/* Task 2: T/F/NG Evidence Locking */}
        {questData.mode === 'tfng_evidence' && questData.tfngItem && (
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-md flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold uppercase">
                  T / F / NG 逻辑裁定
                </span>
                <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mt-1">
                  审定题干陈述
                </h4>
              </div>

              {/* Statement Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                “{questData.tfngItem.statement}”
              </div>

              {/* 3 Option Buttons */}
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                {(['TRUE', 'FALSE', 'NOT_GIVEN'] as const).map((opt) => {
                  const isSelected = selectedTfng === opt;
                  return (
                    <button
                      key={opt}
                      disabled={isSuccess}
                      onClick={() => handleSelectTfng(opt)}
                      className={`min-h-[52px] py-3 px-2 rounded-2xl font-mono text-xs sm:text-sm font-extrabold border transition-all active:scale-95 ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-400/30'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                      }`}
                    >
                      {opt === 'TRUE' ? 'TRUE (一致)' : opt === 'FALSE' ? 'FALSE (矛盾)' : 'NOT GIVEN (未提)'}
                    </button>
                  );
                })}
              </div>

              {wrongAttempt && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 animate-shake">
                  判定有误，请注意绝对词或对比关系！建议先点击左侧点亮证据句。
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
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
                disabled={!selectedTfng || isSuccess}
                onClick={handleVerifyTfng}
                className="min-h-[48px] px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center gap-2"
              >
                {isSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>逻辑裁定无误！</span>
                  </>
                ) : (
                  <span>提交逻辑裁定</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
