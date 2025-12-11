import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function PresentationDetail() {
  const navigate = useNavigate();
  const { prId } = useParams();
  const [loading, setLoading] = useState(true);
  const [presentationData, setPresentationData] = useState(null);

  useEffect(() => {
    fetchPresentationData();
  }, [prId]);

  const fetchPresentationData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8081/presentations/${prId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setPresentationData(response.data.data);
      }
    } catch (error) {
      console.error('데이터 조회 실패:', error);
      alert('결과를 불러오는 중 오류가 발생했습니다.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!presentationData || !presentationData.feedbacks || presentationData.feedbacks.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">분석 결과를 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const feedback = presentationData.feedbacks[0];
  const result = presentationData.results[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            자세한 분석 결과
          </h1>
          <p className="text-gray-600">{presentationData.title}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>전반적인 평가</span>
          </h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {feedback.detailed_summary || '분석 결과가 없습니다.'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-green-600 mb-4 flex items-center gap-2">
            <span>잘한 점</span>
          </h2>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {feedback.detailed_strengths || '정보가 없습니다.'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-orange-600 mb-4 flex items-center gap-2">
            <span>개선할 점</span>
          </h2>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {feedback.detailed_improvements || '정보가 없습니다.'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-blue-600 mb-4 flex items-center gap-2">
            <span>구체적인 조언</span>
          </h2>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {feedback.detailed_advice || '정보가 없습니다.'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>측정 수치</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">발표 시간</div>
              <div className="text-2xl font-bold text-gray-800">
                {result.duration_min.toFixed(1)} 분
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">평균 음량</div>
              <div className="text-2xl font-bold text-gray-800">
                {result.avg_volume_db.toFixed(1)} dB
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">평균 음높이</div>
              <div className="text-2xl font-bold text-gray-800">
                {result.avg_pitch.toFixed(1)} Hz
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">침묵 비율</div>
              <div className="text-2xl font-bold text-gray-800">
                {(result.silence_ratio * 100).toFixed(1)} %
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">발화 속도</div>
              <div className="text-2xl font-bold text-gray-800">
                {result.speech_rate > 0 ? `${result.speech_rate.toFixed(1)} 음절/초` : '측정되지 않음'}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">주요 감정</div>
              <div className="text-2xl font-bold text-gray-800">
                {result.emotion === 'Anxious' ? '불안' : '당황'}
                <span className="text-base ml-2 text-gray-500">
                  ({result.emotion_confidence.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate(`/presentation/result/${prId}`)}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            ← 결과 화면으로
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}