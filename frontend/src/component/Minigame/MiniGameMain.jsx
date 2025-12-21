import { useState } from 'react';
import GamePlay from './GamePlay';
import GameResult from './GameResult';

const MiniGameMain = () => {
  const [gameState, setGameState] = useState('menu');
  const [gameConfig, setGameConfig] = useState(null);
  const [gameResult, setGameResult] = useState(null);

  const [difficulty, setDifficulty] = useState('easy');
  const [mode, setMode] = useState('target_count');
  const [targetCount, setTargetCount] = useState(5);
  const [timeLimit, setTimeLimit] = useState(60);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          똑바로 말해요
        </h1>
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">난이도 선택</h2>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setDifficulty('easy')}
              className={`py-3 px-6 rounded-xl font-semibold transition-all
                ${difficulty === 'easy'
                  ? 'bg-green-500 text-white shadow-lg scale-105'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
            >
              쉬움
            </button>
            <button
              onClick={() => setDifficulty('medium')}
              className={`py-3 px-6 rounded-xl font-semibold transition-all
                ${difficulty === 'medium'
                  ? 'bg-yellow-500 text-white shadow-lg scale-105'
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                }`}
            >
              보통
            </button>
            <button
              onClick={() => setDifficulty('hard')}
              className={`py-3 px-6 rounded-xl font-semibold transition-all
                ${difficulty === 'hard'
                  ? 'bg-red-500 text-white shadow-lg scale-105'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
            >
              어려움
            </button>
          </div>
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">게임 모드</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setMode('target_count')}
              className={`py-4 px-6 rounded-xl font-semibold transition-all
                ${mode === 'target_count'
                  ? 'bg-blue-500 text-white shadow-lg scale-105'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
            >
              목표 문장 수
            </button>
            <button
              onClick={() => setMode('time_limit')}
              className={`py-4 px-6 rounded-xl font-semibold transition-all
                ${mode === 'time_limit'
                  ? 'bg-purple-500 text-white shadow-lg scale-105'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
            >
              제한 시간
            </button>
          </div>
        </div>
        <div className="mb-8">
          {mode === 'target_count' ? (
            <div>
              <label className="block text-lg font-semibold mb-3">
                목표 문장 수: {targetCount}개
              </label>
              <input
                type="range"
                min="3"
                max="20"
                value={targetCount}
                onChange={(e) => setTargetCount(Number(e.target.value))}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>3개</span>
                <span>20개</span>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-lg font-semibold mb-3">
                제한 시간: {timeLimit}초
              </label>
              <input
                type="range"
                min="30"
                max="300"
                step="30"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>30초</span>
                <span>5분</span>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={startGame}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold text-xl rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          게임 시작
        </button>

        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <h3 className="font-semibold mb-2">게임 방법</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 화면에 표시된 문장을 정확하게 읽으세요</li>
            <li>• 녹음 버튼을 눌러 음성을 녹음하세요</li>
            <li>• 정확도에 따라 점수가 매겨집니다</li>
            <li>• 높은 점수를 목표로 도전하세요!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MiniGameMain;
