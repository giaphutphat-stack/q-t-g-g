import React from 'react';
import { PlayerProgress, SkillModule } from '../types';
import { calculateBandScore, getBandDescription } from '../game/scoring';
import { sound } from '../utils/audio';
import {
  Sparkles,
  Flame,
  BookOpen,
  Volume2,
  VolumeX,
  Compass,
  Download,
  ShieldAlert,
} from 'lucide-react';

interface HUDProps {
  progress: PlayerProgress;
  currentModule?: SkillModule | null;
  onOpenNotebook: () => void;
  onToggleSound: () => void;
  onBackToMap?: () => void;
  onOpenHints?: () => void;
  onExportSingleFile?: () => void;
  isPlayingLevel?: boolean;
}

export const HUD: React.FC<HUDProps> = ({
  progress,
  onOpenNotebook,
  onToggleSound,
  onBackToMap,
  onOpenHints,
  onExportSingleFile,
  isPlayingLevel = false,
}) => {
  const currentBand = calculateBandScore(progress.xp, progress.completedLevels.length);
  const bandInfo = getBandDescription(currentBand);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* Left: App Brand & Map Return Button */}
        <div className="flex items-center gap-3">
          {isPlayingLevel ? (
            <button
              onClick={() => {
                sound.playClick();
                onBackToMap?.();
              }}
              className="min-h-[48px] min-w-[48px] px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95 shadow-sm"
              aria-label="返回探索地图"
            >
              <Compass className="w-5 h-5 text-indigo-500 animate-spin-slow" />
              <span className="hidden sm:inline">探索地图</span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 font-black text-lg">
                IQ
              </div>
              <div className="leading-tight">
                <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  雅思解谜探索
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                    iPad Pro
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Global Explorer · Band 6.5-7.5
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Center: Band Score Gauge & XP Bar */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Band Score Pill */}
          <div className="flex items-center gap-2.5 bg-slate-100/90 dark:bg-slate-800/80 px-3.5 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-inner">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-mono font-black text-xs shadow-sm">
              {currentBand.toFixed(1)}
            </div>
            <div className="leading-tight">
              <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                预估 Band
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[90px] sm:max-w-none">
                {bandInfo.title.split(' ')[0]}
              </div>
            </div>
          </div>

          {/* XP & Combo Cluster */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-amber-500 font-black text-xs sm:text-sm bg-amber-500/10 dark:bg-amber-500/15 px-3 py-1.5 rounded-2xl border border-amber-500/20">
              <Sparkles className="w-4 h-4 fill-amber-400" />
              <span className="font-mono tabular-nums">{progress.xp}</span>
              <span className="text-[10px] text-amber-600/80 dark:text-amber-400 font-sans">XP</span>
            </div>

            {progress.combo > 1 && (
              <div className="flex items-center gap-1 text-rose-500 font-extrabold text-xs sm:text-sm bg-rose-500/10 px-2.5 py-1.5 rounded-2xl border border-rose-500/20 animate-bounce">
                <Flame className="w-4 h-4 fill-rose-500" />
                <span className="font-mono tabular-nums">{progress.combo}x</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Tactical Support / Notebook / Audio / Export Controls */}
        <div className="flex items-center gap-2">
          {isPlayingLevel && onOpenHints && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenHints();
              }}
              className="min-h-[48px] min-w-[48px] px-3.5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
              aria-label="开启三级战术支援"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>战术支援</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick();
              onOpenNotebook();
            }}
            className="min-h-[48px] min-w-[48px] px-3 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-all relative"
            aria-label="打开随身语料库与错题卡组"
          >
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <span className="hidden md:inline">语料库</span>
            {progress.reviewDeck.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold flex items-center justify-center shadow">
                {progress.reviewDeck.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onToggleSound();
            }}
            className="min-h-[48px] min-w-[48px] p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-center"
            aria-label={progress.soundEnabled ? '静音音效' : '开启音效'}
          >
            {progress.soundEnabled ? (
              <Volume2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {onExportSingleFile && (
            <button
              onClick={() => {
                sound.playClick();
                onExportSingleFile();
              }}
              className="min-h-[48px] min-w-[48px] px-3 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 font-semibold text-xs hidden lg:flex items-center gap-1.5 transition-all"
              title="导出单文件 HTML 独立运行版"
              aria-label="导出单文件 HTML"
            >
              <Download className="w-4 h-4" />
              <span>导出单文件</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
