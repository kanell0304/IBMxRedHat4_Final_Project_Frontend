import { useState } from 'react';
import GamePlay from './GamePlay';
import GameResult from './GameResult';
import PhoneFrame from '../Layout/PhoneFrame';

const MiniGameMain = () => {
  const [gameState, setGameState] = useState('menu');
  const [gameConfig, setGameConfig] = useState(null);
  const [gameResult, setGameResult] = useState(null);

  const [difficulty, setDifficulty] = useState('easy');
  const [mode, setMode] = useState('target_count');
  const [targetCount, setTargetCount] = useState(5);
  const [timeLimit, setTimeLimit] = useState(30);

  const startGame = () => {
    const config = {
      difficulty,
      mode,
      value: mode === 'target_count' ? targetCount : timeLimit
    };
    
    setGameConfig(config);
    setGameState('playing');
  };

  const handleGameEnd = (result) => {
    setGameResult(result);
    setGameState('result');
  };

  const resetGame = () => {
    setGameState('menu');
    setGameConfig(null);
    setGameResult(null);
  };

  if (gameState === 'playing') {
    return (
      <GamePlay 
        config={gameConfig} 
        onGameEnd={handleGameEnd}
        onExit={resetGame}
      />
    );
  }

  if (gameState === 'result') {
    return (
      <GameResult 
        result={gameResult} 
        onRestart={resetGame}
      />
    );
  }

  const difficultyOptions = [
    { key: 'easy', label: '쉬움', desc: '워밍업', color: 'from-emerald-500 to-teal-500' },
    { key: 'medium', label: '보통', desc: '균형 잡힘', color: 'from-amber-400 to-orange-400' },
    { key: 'hard', label: '어려움', desc: '챌린지', color: 'from-rose-500 to-red-500' },
  ];

  const modeOptions = [
    { key: 'target_count', label: '문장 개수', desc: '목표 개수 채우기', color: 'from-sky-500 to-indigo-500' },
    { key: 'time_limit', label: '제한 시간', desc: '시간 안에 클리어', color: 'from-fuchsia-500 to-purple-500' },
  ];

  const renderChip = (opt, isActive, onClick) => (
    <button
      key={opt.key}
      onClick={onClick}
      className={`group rounded-2xl px-4 py-3 text-left transition-all border shadow-sm
        ${isActive
          ? `bg-gradient-to-r ${opt.color} text-white border-transparent shadow-lg scale-[1.02]`
          : 'bg-white border-slate-200 text-slate-700 hover:-translate-y-0.5 hover:shadow-md'
        }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">{opt.label}</span>
        <span className={`text-[11px] font-bold ${isActive ? 'text-white/80' : 'text-slate-400'}`}>●</span>
      </div>
      <p className={`text-xs mt-1 ${isActive ? 'text-white/80' : 'text-slate-500'}`}>{opt.desc}</p>
    </button>
  );

  const sliderCommon = 'w-full h-2 rounded-full appearance-none cursor-pointer';

  return (
    <PhoneFrame title="미니게임" contentClass="p-4 pb-8 bg-gradient-to-b from-slate-50 via-white to-cyan-50">
      <div className="space-y-6">
        <div className="rounded-3xl bg-white/80 backdrop-blur border border-slate-100 shadow-[0_12px_40px_rgba(15,23,42,0.08)] p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 text-[11px] font-bold rounded-full bg-indigo-100 text-indigo-700">미니게임</span>
            <span className="text-xs text-slate-400">발음 & 속도 워밍업</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 leading-tight">똑바로 말해요</h1>
          <p className="text-sm text-slate-600 mt-2">
            난이도와 모드를 고르고, 빠르게 입 풀고 기록에 도전하세요.
          </p>
        </div>

        <section className="rounded-3xl bg-white border border-slate-100 shadow-[0_10px_30px_rgba(15,23,42,0.06)] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Step 1</p>
              <h2 className="text-lg font-bold text-slate-900">난이도 선택</h2>
            </div>
            <span className="text-[11px] text-slate-400">연습량에 맞춰 고르세요</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {difficultyOptions.map((opt) =>
              renderChip(opt, difficulty === opt.key, () => setDifficulty(opt.key))
            )}
          </div>
        </section>

        <section className="rounded-3xl bg-white border border-slate-100 shadow-[0_10px_30px_rgba(15,23,42,0.06)] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Step 2</p>
              <h2 className="text-lg font-bold text-slate-900">게임 모드</h2>
            </div>
            <span className="text-[11px] text-slate-400">목표 방식을 고르세요</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {modeOptions.map((opt) =>
              renderChip(opt, mode === opt.key, () => setMode(opt.key))
            )}
          </div>

          <div className="mt-4">
            {mode === 'target_count' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                  <span>목표 문장 수</span>
                  <span className="text-indigo-600">{targetCount}개</span>
                </div>
                <input type="range" min="3" max="15" value={targetCount} onChange={(e) => setTargetCount(Number(e.target.value))} className={`${sliderCommon} bg-slate-200`} />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>3개</span>
                  <span>15개</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                  <span>제한 시간</span>
                  <span className="text-indigo-600">{timeLimit}초</span>
                </div>
                <input type="range" min="30" max="60" step="5" value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} className={`${sliderCommon} bg-slate-200`} />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>30초</span>
                  <span>1분</span>
                </div>
              </div>
            )}
          </div>
        </section>

        <button onClick={startGame} className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold text-lg shadow-[0_14px_30px_rgba(59,130,246,0.28)] hover:bg-blue-700 hover:shadow-[0_16px_36px_rgba(59,130,246,0.36)] active:scale-95 transition-all">게임 시작</button>

        <div className="rounded-2xl bg-white border border-slate-100 shadow-[0_8px_24px_rgba(15,23,42,0.05)] p-5 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <h3 className="font-semibold text-slate-900">게임 방법</h3>
          </div>
          <ul className="text-sm text-slate-600 space-y-1.5 leading-relaxed">
            <li>• 화면에 뜨는 문장을 또렷하게 읽어 주세요.</li>
            <li>• 녹음 버튼을 눌러 음성을 남기고, 정확도를 확인해요.</li>
            <li>• 선택한 모드(개수/시간)에 따라 점수가 달라집니다.</li>
            <li>• 꾸준히 연습해서 최고 기록을 갱신해 보세요!</li>
          </ul>
        </div>
      </div>
    </PhoneFrame>
  );
};

export default MiniGameMain;
