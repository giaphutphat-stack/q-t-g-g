import React from 'react';
import { QuestLevel, SkillModule, PlayerProgress } from '../types';
import { isLevelUnlocked } from '../game/scoring';
import { sound } from '../utils/audio';
import {
  Headphones,
  FileText,
  PenTool,
  Mic,
  Lock,
  Star,
  CheckCircle,
  Play,
  Sparkles,
} from 'lucide-react';

interface WorldMapProps {
  levels: QuestLevel[];
  progress: PlayerProgress;
  onSelectLevel: (level: QuestLevel) => void;
}

const REGION_META: Record<
  SkillModule,
  {
    name: string;
    subname: string;
    description: string;
    themeGradient: string;
    cardBorder: string;
    iconBg: string;
    accentColor: string;
    islandColor: string;
  }
> = {
  listening: {
    name: '声波观测站',
    subname: 'Acoustic Observatory',
    description: 'Part 1-4 场景信息捕获 · 路线图与学术要点速记',
    themeGradient: 'from-emerald-500/10 via-teal-500/5 to-cyan-500/10',
    cardBorder: 'border-emerald-500/20 hover:border-emerald-500/50',
    iconBg: 'bg-emerald-500 text-white',
    accentColor: 'text-emerald-500',
    islandColor: 'emerald',
  },
  reading: {
    name: '古籍破译局',
    subname: 'Archive of Decryption',
    description: '学术短文同义替换消消乐 · T/F/NG 证据链绝对锁定',
    themeGradient: 'from-blue-500/10 via-sky-500/5 to-indigo-500/10',
    cardBorder: 'border-blue-500/20 hover:border-blue-500/50',
    iconBg: 'bg-blue-600 text-white',
    accentColor: 'text-blue-500',
    islandColor: 'blue',
  },
  writing: {
    name: '句法炼金室',
    subname: 'Syntax Alchemical Chamber',
    description: 'Band 5.5 平庸句型升舱 · 状语从句与动词名词化重组',
    themeGradient: 'from-purple-500/10 via-fuchsia-500/5 to-pink-500/10',
    cardBorder: 'border-purple-500/20 hover:border-purple-500/50',
    iconBg: 'bg-purple-600 text-white',
    accentColor: 'text-purple-500',
    islandColor: 'purple',
  },
  speaking: {
    name: '即兴演说厅',
    subname: 'Impromptu Oratory Hall',
    description: 'Part 2/3 话题卡解构 · 60s 地道习语充能与流利度演练',
    themeGradient: 'from-amber-500/10 via-orange-500/5 to-rose-500/10',
    cardBorder: 'border-amber-500/20 hover:border-amber-500/50',
    iconBg: 'bg-amber-500 text-white',
    accentColor: 'text-amber-500',
    islandColor: 'amber',
  },
};

export const WorldMap: React.FC<WorldMapProps> = ({ levels, progress, onSelectLevel }) => {
  const modules: SkillModule[] = ['listening', 'reading', 'writing', 'speaking'];

  const getModuleIcon = (mod: SkillModule) => {
    switch (mod) {
      case 'listening':
        return <Headphones className="w-5 h-5" />;
      case 'reading':
        return <FileText className="w-5 h-5" />;
      case 'writing':
        return <PenTool className="w-5 h-5" />;
      case 'speaking':
        return <Mic className="w-5 h-5" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-10">
      {/* Hero Banner with Duolingo/Monument Valley vibe */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>环球探索 · 雅思高分进阶地图</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            选择探索区域，解锁雅思 Band 7.5+ 秘境
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            四大核心学术观测域已就绪。所有题目源自雅思高频题眼，通过解谜机制助你内化学术词汇、逻辑同义替换与高阶复合句式。
          </p>
        </div>

        {/* Global Progress stats */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 sm:gap-10">
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              已解锁关卡
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono">
              {progress.completedLevels.length}{' '}
              <span className="text-xs text-slate-400 font-sans font-normal">/ {levels.length}</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              总探索经验值
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-amber-400">
              {progress.xp}{' '}
              <span className="text-xs text-slate-400 font-sans font-normal">XP</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              最高连击 (Max Combo)
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-rose-400">
              {progress.maxCombo}x
            </div>
          </div>
        </div>
      </div>

      {/* 4 Thematic Quadrants (World Regions) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {modules.map((modId) => {
          const meta = REGION_META[modId];
          const moduleLevels = levels.filter((l) => l.moduleId === modId);
          const completedCount = moduleLevels.filter((l) =>
            progress.completedLevels.includes(l.id)
          ).length;

          return (
            <div
              key={modId}
              className={`rounded-3xl bg-white dark:bg-slate-900/90 border ${meta.cardBorder} p-6 shadow-md transition-all flex flex-col justify-between`}
            >
              {/* Region Header */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl ${meta.iconBg} flex items-center justify-center shadow-md`}
                  >
                    {getModuleIcon(modId)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {meta.name}
                      </h3>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                        {completedCount} / 4 关
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{meta.subname}</p>
                  </div>
                </div>

                <div className="w-16 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 mt-3">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${(completedCount / 4) * 100}%` }}
                  />
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                {meta.description}
              </p>

              {/* Dynamic Path & Level Nodes (Monument Valley style node sequence) */}
              <div className="relative py-4 px-2">
                {/* Connecting SVG Path */}
                <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-slate-200 dark:bg-slate-800 rounded-full z-0" />

                <div className="relative z-10 grid grid-cols-4 gap-2 sm:gap-4">
                  {moduleLevels.map((lvl) => {
                    const isCompleted = progress.completedLevels.includes(lvl.id);
                    const unlocked = isLevelUnlocked(
                      lvl.levelNumber,
                      lvl.moduleId,
                      progress.completedLevels
                    );
                    const score = progress.levelScores[lvl.id];

                    return (
                      <div key={lvl.id} className="flex flex-col items-center">
                        <button
                          disabled={!unlocked}
                          onClick={() => {
                            sound.playClick();
                            onSelectLevel(lvl);
                          }}
                          className={`min-h-[56px] min-w-[56px] w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center relative transition-all duration-200 active:scale-95 shadow-md ${
                            isCompleted
                              ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white hover:scale-105 shadow-emerald-500/25 ring-2 ring-emerald-400/40'
                              : unlocked
                              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:scale-105 border-2 border-indigo-500 shadow-indigo-500/20'
                              : 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-60'
                          }`}
                          aria-label={`进入关卡 ${lvl.levelNumber}: ${lvl.title}`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-6 h-6" />
                          ) : unlocked ? (
                            <Play className="w-5 h-5 ml-0.5 fill-current" />
                          ) : (
                            <Lock className="w-5 h-5" />
                          )}

                          <span className="text-[10px] font-mono font-bold mt-0.5">
                            L{lvl.levelNumber}
                          </span>

                          {/* Star badges if completed */}
                          {isCompleted && score && (
                            <div className="absolute -bottom-2 flex items-center gap-0.5 bg-slate-900/90 px-1.5 py-0.5 rounded-full border border-slate-700 shadow">
                              {Array.from({ length: score.stars || 1 }).map((_, i) => (
                                <Star key={i} className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                              ))}
                            </div>
                          )}
                        </button>

                        <div className="mt-3 text-center">
                          <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 line-clamp-1 max-w-[80px]">
                            {lvl.title.split('：')[0]}
                          </p>
                          <span className="text-[10px] font-mono text-slate-400">
                            +{lvl.xpReward} XP
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
