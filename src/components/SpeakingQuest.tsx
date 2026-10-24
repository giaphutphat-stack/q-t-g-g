import React, { useState, useEffect, useRef } from 'react';
import { QuestLevel, SpeakingQuestData, SpeakingPhrase } from '../types';
import { sound } from '../utils/audio';
import { speech, createSpeechRecognizer } from '../utils/speech';
import {
  Mic,
  MicOff,
  Volume2,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  HelpCircle,
  Play,
  RotateCcw,
} from 'lucide-react';

interface SpeakingQuestProps {
  level: QuestLevel;
  unlockedHintTier: number;
  onSuccess: (mistakes: number) => void;
  onOpenHints: () => void;
}

export const SpeakingQuest: React.FC<SpeakingQuestProps> = ({
  level,
  unlockedHintTier,
  onSuccess,
  onOpenHints,
}) => {
  const questData = level.speaking as SpeakingQuestData;
  const [litPhraseIds, setLitPhraseIds] = useState<string[]>([]);
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [mistakes, setMistakes] = useState<number>(0);
  const recognizerRef = useRef<any>(null);

  // Auto solve if tier 3 hint triggered
  useEffect(() => {
    if (unlockedHintTier >= 3) {
      setLitPhraseIds(questData.targetPhrases.map((p) => p.id));
      setIsSuccess(true);
      const timer = setTimeout(() => onSuccess(mistakes), 1000);
      return () => clearTimeout(timer);
    }
  }, [unlockedHintTier, questData, mistakes, onSuccess]);

  // Timer Countdown
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  // Speech Recognition hook
  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        try {
          recognizerRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const handleToggleTimer = () => {
    sound.playClick();
    if (!isTimerRunning && timerSeconds === 0) {
      setTimerSeconds(60);
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const handleToggleMic = () => {
    sound.playClick();
    if (isListeningMic) {
      if (recognizerRef.current) {
        try {
          recognizerRef.current.stop();
        } catch (e) {}
      }
      setIsListeningMic(false);
      return;
    }

    const rec = createSpeechRecognizer(
      (newTranscript) => {
        setTranscript(newTranscript);
        // Check if any target phrase was uttered
        questData.targetPhrases.forEach((phrase) => {
          const simplifiedTarget = phrase.phrase.toLowerCase().replace(/[^a-z0-9 ]/g, '');
          const words = simplifiedTarget.split(' ').slice(0, 3).join(' ');
          if (newTranscript.includes(simplifiedTarget) || (words.length > 4 && newTranscript.includes(words))) {
            if (!litPhraseIds.includes(phrase.id)) {
              handleLightPhrase(phrase.id);
            }
          }
        });
      },
      () => {
        // Fallback gracefully without crash if mic denied
        setIsListeningMic(false);
      }
    );

    if (rec) {
      recognizerRef.current = rec;
      try {
        rec.start();
        setIsListeningMic(true);
        if (!isTimerRunning) setIsTimerRunning(true);
      } catch (e) {
        setIsListeningMic(false);
      }
    } else {
      // Microphone not supported in this browser, user can freely use the manual tap mode
      setIsListeningMic(false);
    }
  };

  const handleLightPhrase = (id: string) => {
    sound.playCorrect(litPhraseIds.length + 1);
    if (!litPhraseIds.includes(id)) {
      const next = [...litPhraseIds, id];
      setLitPhraseIds(next);

      if (next.length >= questData.fluencyGoal && !isSuccess) {
        sound.playVictory();
        setIsSuccess(true);
        setTimeout(() => onSuccess(mistakes), 1500);
      }
    }
  };

  const handlePlayModelPronunciation = (phraseText: string) => {
    sound.playClick();
    speech.speak(phraseText, { accent: 'en-GB', rate: 0.9 });
  };

  const fluencyPercentage = Math.min(
    100,
    Math.round((litPhraseIds.length / questData.fluencyGoal) * 100)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Controller: Cue Card & Timer/Energy Bar */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />

        {/* Card Header & 60s Timer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 mb-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold uppercase">
              {questData.part}
            </span>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              {questData.topicTitle}
            </h3>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Mic recognition toggle */}
            <button
              onClick={handleToggleMic}
              className={`min-h-[44px] px-3.5 py-2 rounded-2xl font-semibold text-xs flex items-center gap-1.5 transition-all active:scale-95 border ${
                isListeningMic
                  ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
            >
              {isListeningMic ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4 text-slate-400" />}
              <span>{isListeningMic ? '实时监听中' : '启动麦克风识别'}</span>
            </button>

            {/* Timer Dial Button */}
            <button
              onClick={handleToggleTimer}
              className={`min-h-[44px] px-4 py-2 rounded-2xl font-mono font-bold text-sm flex items-center gap-2 border transition-all active:scale-95 ${
                isTimerRunning
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{timerSeconds}s</span>
            </button>
          </div>
        </div>

        {/* Cue Card Prompts (Bullet Points) */}
        <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            You should say:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
            {questData.cueBulletPoints.map((pt, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Fluency Charge Energy Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              表达流利度充能槽 (Fluency Energy)
            </span>
            <span className="font-mono font-bold text-amber-500">
              {litPhraseIds.length} / {questData.fluencyGoal} 词组已点亮
            </span>
          </div>

          <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 rounded-full transition-all duration-500 shadow-md"
              style={{ width: `${fluencyPercentage}%` }}
            />
          </div>
        </div>

        {/* Live speech recognition preview if mic active */}
        {isListeningMic && transcript && (
          <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 font-mono">
            🎙️ 语音识别中: {transcript}
          </div>
        )}
      </div>

      {/* Target Idiomatic Collocations Matrix (Click to Power Up / Light) */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              Band 7.5+ 地道习语充能池
            </h4>
            <p className="text-xs text-slate-400">
              开口演练并在使用时点击点亮，也可点击小喇叭听示范发音
            </p>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            双重模式：语音识别 / 手动点选
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {questData.targetPhrases.map((phrase) => {
            const isLit = litPhraseIds.includes(phrase.id);

            return (
              <div
                key={phrase.id}
                onClick={() => handleLightPhrase(phrase.id)}
                className={`min-h-[64px] p-4 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98] flex flex-col justify-between gap-3 ${
                  isLit
                    ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 shadow-md ring-2 ring-amber-400/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-800 bg-white dark:bg-slate-800/80 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className={`font-bold text-sm ${isLit ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                        {phrase.phrase}
                      </h5>
                      {isLit && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950">
                          ✓ 已充能
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{phrase.phonetic}</p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayModelPronunciation(phrase.phrase);
                    }}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                    title="朗读示范"
                    aria-label={`朗读 ${phrase.phrase}`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1 text-xs">
                  <p className="font-medium text-slate-700 dark:text-slate-300">{phrase.meaning}</p>
                  <p className="text-slate-400 italic">“{phrase.usageSample}”</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
          disabled={litPhraseIds.length < questData.fluencyGoal || isSuccess}
          onClick={() => {
            sound.playVictory();
            setIsSuccess(true);
            setTimeout(() => onSuccess(mistakes), 1200);
          }}
          className="min-h-[48px] px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2"
        >
          {isSuccess ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-slate-950" />
              <span>流利度演练达标！</span>
            </>
          ) : (
            <span>完成 60s 即兴演说</span>
          )}
        </button>
      </div>
    </div>
  );
};
