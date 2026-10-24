import { QuestLevel } from '../types';

export function generateSingleFileHtml(levels: QuestLevel[]): string {
  const levelsJson = JSON.stringify(levels);

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>雅思环球探索：解谜大冒险 | IELTS Quest</title>
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Noto+Serif:wght@600&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; -webkit-tap-highlight-color: transparent; }
    .font-serif { font-family: 'Noto Serif', serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased">
  <div id="app" class="flex-1 flex flex-col"></div>
  <script>
    const LEVELS = ${levelsJson};
    let currentLevel = null;
    let xp = 0;
    let combo = 0;
    let completed = [];
    let audioCtx = null;

    function playTone(freq, duration, type='sine') {
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      } catch(e){}
    }

    function renderHUD() {
      const band = (5.5 + Math.min(completed.length / 16, 1) * 2.5).toFixed(1);
      return \`
        <header class="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black flex items-center justify-center shadow">IQ</div>
            <div>
              <h1 class="font-extrabold text-sm sm:text-base">雅思解谜探索 · 单文件版</h1>
              <p class="text-[10px] text-slate-400">Global Explorer · Band 6.5-7.5</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono font-bold">
              Band: <span class="text-emerald-600">\${band}</span>
            </div>
            <div class="bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-xs font-mono font-bold text-amber-600">
              XP: \${xp}
            </div>
          </div>
        </header>
      \`;
    }

    function renderMap() {
      const app = document.getElementById('app');
      app.innerHTML = renderHUD() + \`
        <main class="max-w-6xl mx-auto p-6 flex-1 space-y-6">
          <div class="p-6 rounded-3xl bg-slate-900 text-white shadow-xl">
            <h2 class="text-2xl font-bold">雅思四大核心考点探索</h2>
            <p class="text-sm text-slate-300 mt-1">点击任意关卡即可开启沉浸解谜训练</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            \${['listening', 'reading', 'writing', 'speaking'].map(mod => {
              const modLevels = LEVELS.filter(l => l.moduleId === mod);
              const modNames = { listening: '声波观测站 (Listening)', reading: '古籍破译局 (Reading)', writing: '句法炼金室 (Writing)', speaking: '即兴演说厅 (Speaking)' };
              return \`
                <div class="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <h3 class="font-bold text-base text-slate-800">\${modNames[mod]}</h3>
                  <div class="grid grid-cols-2 gap-3">
                    \${modLevels.map(l => \`
                      <button onclick="startLevel('\${l.id}')" class="p-3.5 rounded-2xl border text-left hover:border-indigo-500 hover:shadow-md transition-all \${completed.includes(l.id) ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'}">
                        <div class="text-xs font-mono font-bold text-indigo-600">L\${l.levelNumber} · \${l.bandTarget}</div>
                        <div class="text-xs font-bold text-slate-800 mt-1 truncate">\${l.title.split('：')[0]}</div>
                      </button>
                    \`).join('')}
                  </div>
                </div>
              \`;
            }).join('')}
          </div>
        </main>
      \`;
    }

    window.startLevel = function(id) {
      playTone(520, 0.1);
      currentLevel = LEVELS.find(l => l.id === id);
      renderLevelView();
    };

    window.backToMap = function() {
      playTone(440, 0.08);
      currentLevel = null;
      renderMap();
    };

    function renderLevelView() {
      if (!currentLevel) return renderMap();
      const app = document.getElementById('app');
      app.innerHTML = renderHUD() + \`
        <main class="max-w-4xl mx-auto p-6 flex-1 space-y-6">
          <div class="flex items-center justify-between">
            <button onclick="backToMap()" class="px-4 py-2 rounded-xl bg-slate-200 text-xs font-bold hover:bg-slate-300">← 返回地图</button>
            <div class="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">\${currentLevel.bandTarget} · +\${currentLevel.xpReward} XP</div>
          </div>
          <div class="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h2 class="text-xl font-bold">\${currentLevel.title}</h2>
            <p class="text-xs text-slate-500">\${currentLevel.tagline}</p>
            <div class="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs space-y-1">
              <span class="font-bold text-indigo-700">🔬 考点透视：</span>
              <p class="text-slate-700">\${currentLevel.hints.tier2.trapOrLogic}</p>
            </div>
            <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
              <span class="font-bold text-emerald-700">🔓 破译核心点：</span>
              <p class="text-slate-800 font-mono">\${currentLevel.hints.tier3.fullAnswer}</p>
            </div>
            <button onclick="finishLevel()" class="w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow hover:bg-emerald-500">
              完成演练并打卡！
            </button>
          </div>
        </main>
      \`;
    }

    window.finishLevel = function() {
      playTone(660, 0.2);
      if (!completed.includes(currentLevel.id)) {
        completed.push(currentLevel.id);
        xp += currentLevel.xpReward;
      }
      alert('🎉 恭喜通关！获得 ' + currentLevel.xpReward + ' XP');
      backToMap();
    };

    renderMap();
  </script>
</body>
</html>`;
}
