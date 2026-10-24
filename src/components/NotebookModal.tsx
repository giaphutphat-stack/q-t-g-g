import React, { useState } from 'react';
import { VocabularyItem, ReviewDeckItem, SkillModule } from '../types';
import { sound } from '../utils/audio';
import { speech } from '../utils/speech';
import {
  BookOpen,
  Volume2,
  Sparkles,
  RotateCcw,
  Headphones,
  FileText,
  PenTool,
  Mic,
  ChevronRight,
  Flame,
  CheckCircle2,
} from 'lucide-react';

interface NotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  vocabularyList: VocabularyItem[];
  reviewDeck: ReviewDeckItem[];
  onRemoveReviewItem?: (id: string) => void;
  onJumpToLevel?: (levelId: string) => void;
}

export const NotebookModal: React.FC<NotebookModalProps> = ({
  isOpen,
  onClose,
  vocabularyList,
  reviewDeck,
  onRemoveReviewItem,
  onJumpToLevel,
}) => {
  const [activeTab, setActiveTab] = useState<'corpus' | 'review'>('corpus');
  const [filterModule, setFilterModule] = useState<SkillModule | 'all'>('all');
  const [drillMode, setDrillMode] = useState<boolean>(false);
  const [drillIndex, setDrillIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  if (!isOpen) return null;

  const filteredVocab = vocabularyList.filter((item) =>
    filterModule === 'all' ? true : item.module === filterModule
  );

  const filteredReview = reviewDeck.filter((item) =>
    filterModule === 'all' ? true : item.moduleId === filterModule
  );

  const handleSpeak = (text: string) => {
    sound.playClick();
    speech.speak(text, { accent: 'en-GB', rate: 0.95 });
  };

  const getModuleIcon = (mod: SkillModule) => {
    switch (mod) {
      case 'listening':
        return <Headphones className="w-4 h-4 text-emerald-500" />;
      case 'reading':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'writing':
        return <PenTool className="w-4 h-4 text-purple-500" />;
      case 'speaking':
        return <Mic className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[85vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                随身高分语料库 & 错题复盘
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 font-mono font-semibold">
                  {vocabularyList.length} 核心条目
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                按模块萃取 Band 7.0-8.5 语料 · 沉浸式闪卡抽测
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            aria-label="关闭语料库窗口"
          >
            ✕
          </button>
        </div>

        {/* View Switcher & Module Filters */}
        <div className="px-6 py-3 bg-slate-100/60 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('corpus');
                setDrillMode(false);
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'corpus'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              📖 高阶语料库 ({vocabularyList.length})
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('review');
                setDrillMode(false);
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'review'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              🎯 错题与复盘卡组 ({reviewDeck.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'corpus' && (
              <button
                onClick={() => {
                  sound.playClick();
                  setDrillMode(!drillMode);
                  setDrillIndex(0);
                  setIsFlipped(false);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <Flame className="w-3.5 h-3.5 fill-current" />
                {drillMode ? '退出快刷模式' : '开启闪卡快刷'}
              </button>
            )}

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              {(['all', 'listening', 'reading', 'writing', 'speaking'] as const).map((mod) => (
                <button
                  key={mod}
                  onClick={() => {
                    sound.playClick();
                    setFilterModule(mod);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                    filterModule === mod
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {mod === 'all' ? '全部' : mod === 'listening' ? '听' : mod === 'reading' ? '读' : mod === 'writing' ? '写' : '说'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Main View */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/50">
          {/* Flashcard Drill View */}
          {drillMode && filteredVocab.length > 0 ? (
            <div className="max-w-md mx-auto h-full flex flex-col items-center justify-center py-6">
              <div className="text-xs text-slate-400 font-mono mb-2">
                快刷进度: {drillIndex + 1} / {filteredVocab.length}
              </div>

              {/* 3D Flip Card */}
              <div
                onClick={() => {
                  sound.playClick();
                  setIsFlipped(!isFlipped);
                }}
                className="w-full h-80 cursor-pointer rounded-3xl bg-white dark:bg-slate-800 border-2 border-indigo-500/20 shadow-xl p-8 flex flex-col justify-between transition-all hover:scale-[1.01] hover:border-indigo-500/40 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                    Band {filteredVocab[drillIndex].band}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeak(filteredVocab[drillIndex].term);
                    }}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600"
                    title="发音"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                {!isFlipped ? (
                  <div className="text-center my-auto">
                    <h4 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
                      {filteredVocab[drillIndex].term}
                    </h4>
                    {filteredVocab[drillIndex].phonetic && (
                      <p className="text-slate-400 font-mono text-sm">
                        {filteredVocab[drillIndex].phonetic}
                      </p>
                    )}
                    <p className="text-xs text-indigo-500 mt-6 animate-pulse">
                      👆 点击翻转卡片查看释义与考点搭配
                    </p>
                  </div>
                ) : (
                  <div className="my-auto space-y-3 animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40">
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-0.5">中文释义</p>
                      <p className="text-base font-bold text-slate-900 dark:text-white">
                        {filteredVocab[drillIndex].meaning}
                      </p>
                    </div>
                    {filteredVocab[drillIndex].collocation && (
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/50 text-xs">
                        <span className="text-slate-400 block mb-0.5">高分搭配:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {filteredVocab[drillIndex].collocation}
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {filteredVocab[drillIndex].ieltsContext}
                    </p>
                  </div>
                )}

                <div className="text-center text-[11px] text-slate-400">
                  {isFlipped ? '再次点击翻回正面' : '双语沉浸记忆'}
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center gap-4 mt-6">
                <button
                  disabled={drillIndex === 0}
                  onClick={() => {
                    sound.playClick();
                    setDrillIndex((prev) => Math.max(0, prev - 1));
                    setIsFlipped(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold disabled:opacity-40"
                >
                  上一张
                </button>
                <button
                  onClick={() => {
                    sound.playCorrect();
                    if (drillIndex < filteredVocab.length - 1) {
                      setDrillIndex((prev) => prev + 1);
                      setIsFlipped(false);
                    } else {
                      setDrillMode(false);
                    }
                  }}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md active:scale-95 transition-all"
                >
                  {drillIndex < filteredVocab.length - 1 ? '掌握 · 下一张' : '完成本组快刷！'}
                </button>
              </div>
            </div>
          ) : activeTab === 'corpus' ? (
            /* Standard Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVocab.map((vocab) => (
                <div
                  key={vocab.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400/50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {getModuleIcon(vocab.module)}
                        <h4 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {vocab.term}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                          Band {vocab.band}
                        </span>
                      </div>
                      {vocab.phonetic && (
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{vocab.phonetic}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleSpeak(vocab.term)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      title="朗读发音"
                      aria-label={`朗读 ${vocab.term}`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {vocab.meaning}
                    </div>
                    {vocab.collocation && (
                      <div className="p-2 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-mono text-[11px]">
                        搭配: {vocab.collocation}
                      </div>
                    )}
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                      💡 雅思考点：{vocab.ieltsContext}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Review Deck View */
            <div className="space-y-3">
              {filteredReview.length === 0 ? (
                <div className="text-center py-16">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-lg">
                    复盘卡组目前空空如也！
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    在关卡中使用三级战术支援破译、或点击收录，即可将疑难考点加入此处进行强化攻坚。
                  </p>
                </div>
              ) : (
                filteredReview.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        {getModuleIcon(item.moduleId)}
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {item.title}
                        </h4>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                          {item.moduleId}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {item.mistakeContext}
                      </p>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs font-mono text-emerald-600 dark:text-emerald-400">
                        正解提示：{item.solution}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onJumpToLevel && (
                        <button
                          onClick={() => {
                            sound.playClick();
                            onJumpToLevel(item.levelId);
                            onClose();
                          }}
                          className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 flex items-center gap-1 shadow-sm"
                        >
                          <span>重试此关</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onRemoveReviewItem && (
                        <button
                          onClick={() => {
                            sound.playClick();
                            onRemoveReviewItem(item.id);
                          }}
                          className="px-3 py-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-medium transition-colors"
                        >
                          已攻克
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
