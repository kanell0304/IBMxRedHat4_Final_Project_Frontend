import PhoneFrame from '../Layout/PhoneFrame';

const GameResult = ({ result, onRestart }) => {
  const getGrade = (score) => {
    if (score >= 90) return { grade: 'S', color: 'purple', emoji: '🏆' };
    if (score >= 80) return { grade: 'A', color: 'blue', emoji: '🌟' };
    if (score >= 70) return { grade: 'B', color: 'green', emoji: '👍' };
    if (score >= 60) return { grade: 'C', color: 'yellow', emoji: '💪' };
    return { grade: 'D', color: 'gray', emoji: '📚' };
  };

  const { grade, color, emoji } = getGrade(result.average_score);

  return (
    <PhoneFrame title="게임 결과" contentClass="p-4 pb-6 bg-gradient-to-b from-blue-50 via-white to-indigo-50/40">
      <div className="space-y-5">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 text-center">
          <div className="text-6xl mb-3">{emoji}</div>
          <h1 className="text-2xl font-bold mb-1 bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
            게임 종료
          </h1>
          <p className="text-sm text-gray-600">수고하셨습니다</p>
        </div>
        
        <div className="text-center">
          <div className={`inline-block px-8 py-4 bg-${color}-100 rounded-2xl`}>
            <p className="text-sm text-gray-600 mb-1">종합 등급</p>
            <p className={`text-5xl font-bold text-${color}-600`}>{grade}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-2xl p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">평균 점수</p>
            <p className="text-2xl font-bold text-sky-600">
              {result.average_score.toFixed(1)}점
            </p>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">완료한 문제</p>
            <p className="text-2xl font-bold text-indigo-600">
              {result.completed_count}개
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
          <h3 className="text-base font-semibold mb-3 text-center">개별 점수</h3>
          <div className="grid grid-cols-5 gap-2">
            {result.scores.map((score, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-2 text-center"
              >
                <p className="text-[10px] text-gray-500 mb-0.5">{index + 1}번</p>
                <p className="text-sm font-bold text-gray-700">
                  {score.toFixed(0)}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-2xl p-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-gray-600 mb-0.5">최고 점수</p>
              <p className="text-lg font-bold text-green-600">
                {Math.max(...result.scores).toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-0.5">최저 점수</p>
              <p className="text-lg font-bold text-red-600">
                {Math.min(...result.scores).toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-0.5">난이도</p>
              <p className="text-lg font-bold text-blue-600">
                {result.difficulty === 'easy' ? '쉬움' : 
                 result.difficulty === 'medium' ? '보통' : '어려움'}
              </p>
            </div>
          </div>
        </div>
        
        <button
          onClick={onRestart}
          className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold rounded-xl hover:from-sky-600 hover:to-indigo-600 transition shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:-translate-y-0.5"
        >
          다시 도전하기
        </button>
      </div>
    </PhoneFrame>
  );
};

export default GameResult;