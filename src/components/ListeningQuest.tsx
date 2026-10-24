import React, { useState, useEffect } from 'react';
import { QuestLevel, ListeningQuestData } from '../types';
import { speech } from '../utils/speech';
import { sound } from '../utils/audio';
import {
  Volume2,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  AudioWaveform,
  Play,
  Square,
} from 'lucide-react';

interface ListeningQuestProps {
  level: QuestLevel;
  unlockedHintTier: number;
  onSuccess: (mistakes: number) => void;
  onOpenHints: () => void;
}

export const ListeningQuest: React.FC<ListeningQuestProps> = ({
  level,
  unlockedHintTier,
  onSuccess,
  onOpenHints,
}) => {
  const questData = level.listening as ListeningQuestData;
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [slotAnswers, setSlotAnswers] = useState<Record<string, string>>({});
  const [activeSlotId, setActiveSlotId] = useState<string>(questData.slots[0].id);
  const [mistakes, setMistakes] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Stop audio on unmount
    return () => {
      speech.stop();
    };
  }, []);

  const handlePlayAudio = (rateOverride?: number) => {
    sound.playClick();
    const rate = rateOverride || playbackRate;

    if (isPlayingAudio) {
      speech.stop();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    speech.speak(questData.audioScript, {
      rate,
      accent: questData.audioAccent,
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  const handleSelectWord = (word: string) => {
    sound.playClick();
    if (isSuccess) return;

    // Place into activeSlotId or first empty slot
    let targetSlot = activeSlotId;
    if (!targetSlot || slotAnswers[targetSlot]) {
      const firstEmpty = questData.slots.find((s) => !slotAnswers[s.id]);
      if (firstEmpty) targetSlot = firstEmpty.id;
    }

    if (targetSlot) {
      setSlotAnswers((prev) => ({ ...prev, [targetSlot]: word }));
      // Auto move focus to next empty slot
      const currentIndex = questData.slots.findIndex((s) => s.id === targetSlot);
      const nextEmpty = questData.slots.find(
        (s, idx) => idx > currentIndex && !slotAnswers[s.id]
      );
      if (nextEmpty) setActiveSlotId(nextEmpty.id);
    }
  };

  const handleClearSlot = (slotId: string) => {
    sound.playClick();
    if (isSuccess) return;
    setSlotAnswers((prev) => {
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
    setActiveSlotId(slotId);
  };

  const handleSubmit = () => {
    const results: Record<string, boolean> = {};
    let allCorrect = true;

    questData.slots.forEach((s) => {
      const isCorrect = slotAnswers[s.id]?.trim().toLowerCase() === s.answer.trim().toLowerCase();
      results[s.id] = isCorrect;
      if (!isCorrect) allCorrect = true ? false : false;
    });

    setValidationResult(results);
    setIsSubmitted(true);

    if (allCorrect) {
      sound.playCorrect();
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess(mistakes);
      }, 1200);
    } else {
      sound.playError();
      setMistakes((prev) => prev + 1);
    }
  };

  // If tier 3 hint was applied by parent
  useEffect(() => {
    if (unlockedHintTier >= 3) {
      const autoFilled: Record<string, string> = {};
      questData.slots.forEach((s) => {
        autoFilled[s.id] = s.answer;
      });
      setSlotAnswers(autoFilled);
      setIsSuccess(true);
      const timer = setTimeout(() => {
        onSuccess(mistakes);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [unlockedHintTier, questData, mistakes, onSuccess]);

  // Words that have already been placed in slots
  const usedWords = Object.values(slotAnswers);

  // Excluded words if tier 1 hint is active
  const eliminatedKeys = level.hints.tier1.eliminatedKeys || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Audio Controller Panel */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            onClick={() => handlePlayAudio()}
            className={`min-h-[56px] min-w-[56px] w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all active:scale-95 ${
              isPlayingAudio
                ? 'bg-rose-500 shadow-rose-500/30 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
            }`}
            aria-label={isPlayingAudio ? '暂停播报' : '开始播报'}
          >
            {isPlayingAudio ? <Square className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {isPlayingAudio ? '正在播放雅思原音录音...' : '点击聆听场景录音'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                {questData.audioAccent} 发音
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              支持慢速重播 · 捕捉关键题眼信息
            </p>
          </div>
        </div>

        {/* Speed Toggles */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            倍速:
          </span>
          {([0.8, 1.0, 1.2] as const).map((rate) => (
            <button
              key={rate}
              onClick={() => {
                sound.playClick();
                setPlaybackRate(rate);
                if (isPlayingAudio) {
                  speech.stop();
                  handlePlayAudio(rate);
                }
              }}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                playbackRate === rate
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {rate.toFixed(1)}x
            </button>
          ))}
        </div>
      </div>

      {/* Target Scenario Sheet (e.g. Booking form or Map itinerary) */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-lg relative overflow-hidden">
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base tracking-wider text-slate-900 dark:text-white font-mono">
              {questData.contextTitle}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              点选下方词库槽位，填入听力所得关键信息
            </p>
          </div>
          <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
            {questData.slots.filter((s) => !!slotAnswers[s.id]).length} / {questData.slots.length} 已填
          </div>
        </div>

        {/* Form Slots */}
        <div className="space-y-4">
          {questData.slots.map((slot) => {
            const currentVal = slotAnswers[slot.id];
            const isCorrect = validationResult[slot.id];
            const isActive = activeSlotId === slot.id;

            return (
              <div
                key={slot.id}
                onClick={() => {
                  sound.playClick();
                  setActiveSlotId(slot.id);
                }}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer ${
                  isActive
                    ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-400/20'
                    : isSubmitted && isCorrect
                    ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10'
                    : isSubmitted && !isCorrect
                    ? 'border-rose-400 bg-rose-50/20 dark:bg-rose-950/10 animate-shake'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[120px]">
                    {slot.label}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{slot.prefix}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className={`min-w-[160px] min-h-[44px] px-4 py-2 rounded-xl flex items-center justify-between gap-2 border font-mono font-bold text-sm transition-all ${
                      currentVal
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 shadow-sm'
                        : 'bg-slate-100/80 dark:bg-slate-800/40 text-slate-400 border-dashed border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <span>{currentVal || '［ 点击下方词块填入 ］'}</span>
                    {currentVal && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearSlot(slot.id);
                        }}
                        className="text-slate-400 hover:text-rose-500 text-xs px-1"
                        aria-label="清除词块"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  {slot.suffix && (
                    <span className="text-xs font-mono text-slate-400">{slot.suffix}</span>
                  )}
                  {isSubmitted && isCorrect !== undefined && (
                    <span className="ml-2">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-500" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Word Bank Drawer */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              词块备选库
            </span>
            {unlockedHintTier >= 1 && (
              <span className="text-[10px] text-blue-500 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full font-medium">
                🛰️ 雷达已滤除干扰项
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400">
            点击任意词块自动填入当前选中的槽位
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {questData.wordBank.map((word) => {
            const isUsed = usedWords.includes(word);
            const isEliminated = unlockedHintTier >= 1 && eliminatedKeys.includes(word);

            return (
              <button
                key={word}
                disabled={isUsed || isEliminated || isSuccess}
                onClick={() => handleSelectWord(word)}
                className={`min-h-[48px] px-4 py-2.5 rounded-2xl font-mono text-xs sm:text-sm font-semibold transition-all active:scale-95 border ${
                  isEliminated
                    ? 'opacity-30 line-through bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                    : isUsed
                    ? 'opacity-40 bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-sm hover:shadow'
                }`}
              >
                {word}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => {
            sound.playClick();
            onOpenHints();
          }}
          className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1.5"
        >
          <HelpCircle className="w-4 h-4" />
          <span>遇到困难？呼叫三级战术支援</span>
        </button>

        <button
          onClick={handleSubmit}
          disabled={isSuccess || questData.slots.some((s) => !slotAnswers[s.id])}
          className="min-h-[48px] px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2"
        >
          {isSuccess ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>答案正确！</span>
            </>
          ) : (
            <span>提交验证结果</span>
          )}
        </button>
      </div>
    </div>
  );
};
