import React, { useState } from 'react';
import { TacticalHint, QuestLevel } from '../types';
import { sound } from '../utils/audio';
import { ShieldAlert, Radio, Search, Unlock, ArrowRight, CheckCircle2, BookmarkPlus } from 'lucide-react';

interface TacticalHintModalProps {
  level: QuestLevel;
  isOpen: boolean;
  onClose: () => void;
  unlockedTier: number; // 0, 1, 2, 3
  onUnlockTier: (tier: number) => void;
  onApplyTacticalSkip: () => void;
  onAddToReviewDeck: () => void;
  isAlreadyInReviewDeck: boolean;
}

export const TacticalHintModal: React.FC<TacticalHintModalProps> = ({
  level,
  isOpen,
  onClose,
  unlockedTier,
  onUnlockTier,
  onApplyTacticalSkip,
  onAddToReviewDeck,
  isAlreadyInReviewDeck,
}) => {
  const [activeTab, setActiveTab] = useState<number>(Math.max(1, unlockedTier));

  if (!isOpen) return null;

  const { hints } = level;

  const handleSelectTier = (tier: number) => {
    sound.playClick();
    if (tier > unlockedTier) {
      sound.playRadar();
      onUnlockTier(tier);
    }
    setActiveTab(tier);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                三级战术支援系统
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                  {level.bandTarget} 靶向侦测
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                自主可控梯级点拨 · 解锁支援不影响通关认证
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            aria-label="关闭支援窗口"
          >
            ✕
          </button>
        </div>

        {/* 3 Tier Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-100/60 dark:bg-slate-950/30 border-b border-slate-200/50 dark:border-slate-800/50">
          {/* Tier 1 Tab */}
          <button
            onClick={() => handleSelectTier(1)}
            className={`flex items-center justify-center gap-2 py-3 px-2 rounded-2xl font-medium text-xs sm:text-sm transition-all border ${
              activeTab === 1
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                : unlockedTier >= 1
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50'
                : 'bg-white/60 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-dashed border-slate-300 dark:border-slate-700'
            }`}
          >
            <Radio className="w-4 h-4 shrink-0" />
            <span>一级·线索雷达</span>
            {unlockedTier >= 1 && <span className="text-[10px] bg-blue-500/20 px-1.5 py-0.5 rounded-full">已开启</span>}
          </button>

          {/* Tier 2 Tab */}
          <button
            onClick={() => handleSelectTier(2)}
            className={`flex items-center justify-center gap-2 py-3 px-2 rounded-2xl font-medium text-xs sm:text-sm transition-all border ${
              activeTab === 2
                ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/20'
                : unlockedTier >= 2
                ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/50'
                : 'bg-white/60 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-dashed border-slate-300 dark:border-slate-700'
            }`}
          >
            <Search className="w-4 h-4 shrink-0" />
            <span>二级·考点透视</span>
            {unlockedTier >= 2 && <span className="text-[10px] bg-purple-500/20 px-1.5 py-0.5 rounded-full">已开启</span>}
          </button>

          {/* Tier 3 Tab */}
          <button
            onClick={() => handleSelectTier(3)}
            className={`flex items-center justify-center gap-2 py-3 px-2 rounded-2xl font-medium text-xs sm:text-sm transition-all border ${
              activeTab === 3
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                : unlockedTier >= 3
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50'
                : 'bg-white/60 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-dashed border-slate-300 dark:border-slate-700'
            }`}
          >
            <Unlock className="w-4 h-4 shrink-0" />
            <span>三级·战术破译</span>
            {unlockedTier >= 3 && <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded-full">已开启</span>}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm">
                <Radio className="w-4 h-4 animate-pulse" />
                <span>{hints.tier1.title}</span>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 text-slate-700 dark:text-slate-200 text-sm leading-relaxed">
                {hints.tier1.hint}
              </div>
              {hints.tier1.eliminatedKeys && hints.tier1.eliminatedKeys.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <span className="font-semibold text-rose-500">🚫 雷达已智能标出干扰项：</span>
                  <span>{hints.tier1.eliminatedKeys.join('、')}</span>
                </div>
              )}
              <p className="text-xs text-slate-400">
                💡 提示：该级别支援仅提供轻微引导，助你保持思维连贯，建议再次仔细阅读/聆听题干。
              </p>
            </div>
          )}

          {activeTab === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold text-sm">
                <Search className="w-4 h-4" />
                <span>{hints.tier2.title}</span>
              </div>
              <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 text-slate-700 dark:text-slate-200 text-sm leading-relaxed">
                {hints.tier2.trapOrLogic}
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                🎯 考官思维：雅思在此处专门考查考生的抗干扰能力与深层同义转换敏锐度。
              </div>
            </div>
          )}

          {activeTab === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                <Unlock className="w-4 h-4" />
                <span>{hints.tier3.title}</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
                <p className="text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider mb-1">
                  精准破译答案
                </p>
                <p className="text-base font-bold text-slate-900 dark:text-white font-mono">
                  {hints.tier3.fullAnswer}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <span className="font-semibold text-slate-900 dark:text-white block mb-1">权威考点解析：</span>
                {hints.tier3.explanation}
              </div>

              {/* Action buttons for Tier 3 */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    sound.playClick();
                    onApplyTacticalSkip();
                    onClose();
                  }}
                  className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  一键填入正解并通关
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    onAddToReviewDeck();
                  }}
                  disabled={isAlreadyInReviewDeck}
                  className={`py-3 px-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 border transition-all ${
                    isAlreadyInReviewDeck
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <BookmarkPlus className="w-4 h-4 text-amber-500" />
                  {isAlreadyInReviewDeck ? '已加入错题卡组' : '收录至复盘卡组'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            支持状态: {unlockedTier === 0 ? '尚未请求支援' : `已激活第 ${unlockedTier} 级支援`}
          </span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="py-2 px-5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            返回作答
          </button>
        </div>
      </div>
    </div>
  );
};
