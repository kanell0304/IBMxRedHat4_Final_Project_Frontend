import { useState, useEffect, useCallback } from 'react';
import { minigameAPI } from '../../api/minigameApi';
import RecordingButton from './RecordingButton';
import Timer from './Timer';
import PhoneFrame from '../Layout/PhoneFrame';

const GamePlay = ({ config, onGameEnd, onExit }) => {
  const [sessionId, setSessionId] = useState(null);
  const [currentSentence, setCurrentSentence] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStatus, setGameStatus] = useState(null);
  const [error, setError] = useState(null);

  // 게임 종료 함수
  const finishGame = useCallback(async () => {
    if (!sessionId) return;

    try {
      const result = await minigameAPI.finishGame(sessionId);
      onGameEnd(result);
    } catch (error) {
      console.error('게임 종료 실패:', error);
      setError('게임을 종료할 수 없습니다.');
    }
  }, [sessionId, onGameEnd]);

  // 게임 초기화
  useEffect(() => {
    const initGame = async () => {
      try {
        const result = await minigameAPI.startGame(
          config.difficulty,
          config.mode,
          config.value
        );
        setSessionId(result.session_id);
        setIsLoading(false);
      } catch (error) {
        console.error('게임 시작 실패:', error);
        setError('게임을 시작할 수 없습니다.');
      }
    };

    initGame();
  }, [config]);

  // 다음 문제 가져오기
  const loadNextSentence = useCallback(async () => {
    if (!sessionId) return;

    try {
      setIsLoading(true);
      const sentence = await minigameAPI.getNextSentence(sessionId);
      setCurrentSentence(sentence);
      setIsLoading(false);
    } catch (error) {
      if (error.message === 'NO_MORE_SENTENCES') {
        finishGame();
      } else {
        console.error('문제 로드 실패:', error);
        setError('문제를 가져올 수 없습니다.');
      }
    }
  }, [sessionId, finishGame]);

  // 첫 문제 로드 - sessionId가 설정되면 한 번만 실행
  useEffect(() => {
    if (sessionId) {
      const loadFirst = async () => {
        try {
          setIsLoading(true);
          const sentence = await minigameAPI.getNextSentence(sessionId);
          setCurrentSentence(sentence);
          setIsLoading(false);
        } catch (error) {
          if (error.message === 'NO_MORE_SENTENCES') {
            finishGame();
          } else {
            console.error('문제 로드 실패:', error);
            setError('문제를 가져올 수 없습니다.');
          }
        }
      };
      
      loadFirst();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]); // sessionId가 변경될 때만 실행

  // 녹음 완료 처리
  const handleRecordingComplete = useCallback(async (audioBlob) => {
    if (!sessionId) return;

    try {
      setIsProcessing(true);
      setIsPaused(true);
      
      await minigameAPI.submitAudio(sessionId, audioBlob);
      
      const initialStatus = await minigameAPI.getGameStatus(sessionId);
      const initialCount = initialStatus.completed_count;
      
      let attempts = 0;
      const maxAttempts = 60;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const status = await minigameAPI.getGameStatus(sessionId);
        
        if (status.completed_count > initialCount) {
          setGameStatus(status);
          setIsProcessing(false);
          setIsPaused(false);
          
          if (config.mode === 'target_count' && status.completed_count >= config.value) {
            finishGame();
            return;
          }
          
          loadNextSentence();
          return;
        }
        
        attempts++;
      }
      
      setError('처리 시간이 너무 오래 걸립니다. 다시 시도해주세요.');
      setIsProcessing(false);
      setIsPaused(false);
      
    } catch (error) {
      console.error('음성 제출 실패:', error);
      setError('음성을 제출할 수 없습니다.');
      setIsProcessing(false);
      setIsPaused(false);
    }
  }, [sessionId, config.mode, config.value, finishGame, loadNextSentence]);

  // 시간 종료
  const handleTimeUp = useCallback(() => {
    finishGame();
  }, [finishGame]);

  if (error) {
    return (
      <PhoneFrame title="오류" contentClass="p-4 pb-6 bg-gradient-to-b from-red-50 via-white to-blue-50/40">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-rose-600 mb-3">오류 발생</h2>
            <p className="text-sm text-gray-600 mb-5">{error}</p>
            <button
              onClick={onExit}
              className="px-5 py-2.5 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-900 transition"
            >
              메인으로 돌아가기
            </button>
          </div>
        </div>
      </PhoneFrame>
    );
  }

  if (isLoading) {
    return (
      <PhoneFrame title="미니게임" contentClass="p-4 pb-6 bg-gradient-to-b from-blue-50 via-white to-indigo-50/40">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-sky-500 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-700">문제를 불러오는 중...</p>
          </div>
        </div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame title="미니게임" showTitleRow={false} contentClass="p-4 pb-6 bg-gradient-to-b from-blue-50 via-white to-indigo-50/40">
      <div className="space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 bg-sky-100 text-sky-700 rounded-full font-semibold text-sm">
              {config.difficulty === 'easy' ? '쉬움' : config.difficulty === 'medium' ? '보통' : '어려움'}
            </span>
            {config.mode === 'target_count' ? (
              <span className="text-lg font-bold text-gray-700">
                {gameStatus?.completed_count || 0} / {config.value}
              </span>
            ) : (
              <Timer 
                timeLimit={config.value} 
                onTimeUp={handleTimeUp}
                isPaused={isPaused}
              />
            )}
          </div>
          
          <button
            onClick={onExit}
            className="px-3 py-1.5 bg-slate-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition"
          >
            나가기
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-3">다음 문장을 똑바로 말해보세요</p>
            <h2 className="text-xl font-bold text-gray-800 leading-relaxed mb-4">
              {currentSentence?.sentence}
            </h2>
            
            {currentSentence?.category && (
              <span className="inline-block px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm">
                {currentSentence.category}
              </span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          {isProcessing ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-sky-500 mx-auto mb-3"></div>
              <p className="text-base font-semibold text-gray-700">음성 분석 중...</p>
              <p className="text-sm text-gray-500 mt-1">잠시만 기다려주세요</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <RecordingButton 
                onRecordingComplete={handleRecordingComplete}
                disabled={isProcessing}
              />
              <p className="text-sm text-gray-500 mt-3">
                녹음 버튼을 눌러 문장을 읽어주세요
              </p>
            </div>
          )}

          {gameStatus && gameStatus.scores.length > 0 && (
            <div className="mt-5 p-4 bg-gradient-to-r from-sky-50 to-indigo-50 rounded-xl">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">마지막 점수</p>
                <p className="text-2xl font-bold text-sky-600">
                  {gameStatus.scores[gameStatus.scores.length - 1].toFixed(1)}점
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  평균: {(gameStatus.scores.reduce((a, b) => a + b, 0) / gameStatus.scores.length).toFixed(1)}점
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PhoneFrame>
  );
};

export default GamePlay;
