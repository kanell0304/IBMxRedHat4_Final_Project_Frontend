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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="text-8xl mb-4">{emoji}</div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            게임 종료
          </h1>
          <p className="text-gray-600">수고하셨습니다</p>
        </div>
        <div className="text-center mb-8">
          <div className={`inline-block px-12 py-6 bg-${color}-100 rounded-3xl`}>
            <p className="text-sm text-gray-600 mb-2">종합 등급</p>
            <p className={`text-7xl font-bold text-${color}-600`}>{grade}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center">
            <p className="text-sm text-gray-600 mb-2">평균 점수(정확도)</p>
            <p className="text-3xl font-bold text-blue-600">
              {result.average_score.toFixed(1)}점
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 text-center">
            <p className="text-sm text-gray-600 mb-2">완료한 문제</p>
            <p className="text-3xl font-bold text-purple-600">
              {result.completed_count}개
            </p>
          </div>
        </div>
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-center">개별 점수</h3>
          <div className="grid grid-cols-5 gap-2">
            {result.scores.map((score, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 text-center"
              >
                <p className="text-xs text-gray-500 mb-1">{index + 1}번</p>
                <p className="text-lg font-bold text-gray-700">
                  {score.toFixed(0)}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-50 rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600 mb-1">최고 점수</p>
              <p className="text-xl font-bold text-green-600">
                {Math.max(...result.scores).toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">최저 점수</p>
              <p className="text-xl font-bold text-red-600">
                {Math.min(...result.scores).toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">난이도</p>
              <p className="text-xl font-bold text-blue-600">
                {result.difficulty === 'easy' ? '쉬움' : 
                 result.difficulty === 'medium' ? '보통' : '어려움'}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={onRestart}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold text-xl rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          다시 도전하기
        </button>
      </div>
    </div>
  );
};

export default GameResult;
