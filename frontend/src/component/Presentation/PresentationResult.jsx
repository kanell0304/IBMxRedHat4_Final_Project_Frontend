import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function PresentationResult() {
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
  const scores = feedback.scores;

  const radarData = [
    { subject: '음량', score: scores.volume, fullMark: 100 },
    { subject: '피치', score: scores.pitch, fullMark: 100 },
    { subject: '속도', score: scores.speed, fullMark: 100 },
    { subject: '침묵', score: scores.silence, fullMark: 100 },
    { subject: '명료도', score: scores.clarity, fullMark: 100 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            당신의 발표를 분석한 결과입니다!
          </h1>
          <p className="text-gray-600">{presentationData.title}</p>
        </div>

        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
              ✓
            </div>
            <div className="w-24 h-1 bg-blue-600"></div>
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
              ✓
            </div>
            <div className="w-24 h-1 bg-blue-600"></div>
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center">
            <p className="text-gray-600 mb-2">종합 점수</p>
            <div className="text-6xl font-bold text-blue-600 mb-2">
              {scores.overall}
              <span className="text-3xl text-gray-400">/100</span>
            </div>
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {scores.overall >= 80 ? '훌륭합니다!' : scores.overall >= 60 ? '좋습니다!' : '노력이 필요합니다'}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
              세부 점수
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="점수"
                  dataKey="score"
                  stroke="#2563eb"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
              <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                <span className="text-gray-600">음량</span>
                <span className="font-bold text-blue-600">{scores.volume}</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                <span className="text-gray-600">피치</span>
                <span className="font-bold text-blue-600">{scores.pitch}</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                <span className="text-gray-600">속도</span>
                <span className="font-bold text-blue-600">{scores.speed}</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                <span className="text-gray-600">침묵</span>
                <span className="font-bold text-blue-600">{scores.silence}</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded col-span-2">
                <span className="text-gray-600">명료도</span>
                <span className="font-bold text-blue-600">{scores.clarity}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              간단한 피드백
            </h2>
            <div className="bg-blue-50 rounded-lg p-4 text-gray-700 leading-relaxed">
              {feedback.brief}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            홈으로
          </button>
          <button
            onClick={() => navigate(`/presentation/detail/${prId}`)}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            자세히 보기 →
          </button>
        </div>
      </div>
    </div>
  );
}