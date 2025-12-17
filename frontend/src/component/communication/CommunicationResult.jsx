import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCommunication } from '../../hooks/useCommunication';
import PhoneFrame from '../Layout/PhoneFrame';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const DetailSection = ({ title, jsonData }) => {
  if (!jsonData || !jsonData.detected_examples || jsonData.detected_examples.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
      <h4 className="font-bold text-gray-900">{title}</h4>
      <div>
        <p className="text-sm text-gray-600 mb-1">감지된 예시:</p>
        <ul className="list-disc list-inside text-gray-800 ml-2 space-y-1">
          {jsonData.detected_examples.map((example, idx) => (
            <li key={idx} className="text-sm">{example}</li>
          ))}
        </ul>
      </div>
      {jsonData.reason && (
        <div>
          <p className="text-sm text-gray-600 mb-1">이유:</p>
          <p className="text-gray-800 text-sm">{jsonData.reason}</p>
        </div>
      )}
      {jsonData.improvement && (
        <div>
          <p className="text-sm text-gray-600 mb-1">개선 방법:</p>
          <p className="text-gray-800 text-sm">{jsonData.improvement}</p>
        </div>
      )}
      {jsonData.revised_examples && jsonData.revised_examples.length > 0 && (
        <div>
          <p className="text-sm text-gray-600 mb-1">수정 예시:</p>
          <div className="ml-2 space-y-2">
            {jsonData.revised_examples.map((example, idx) => (
              <div key={idx} className="text-sm">
                {typeof example === 'object' ? (
                  <>
                    <div className="text-gray-500">원본: {example.original}</div>
                    <div className="text-blue-700 font-medium">수정: {example.revised}</div>
                  </>
                ) : (
                  <div>{example}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function CommunicationResult() {
  const navigate = useNavigate();
  const { c_id } = useParams();
  const { getCommunication, loading } = useCommunication();
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('scores');

  useEffect(() => {
    fetchData();
  }, [c_id]);

  const fetchData = async () => {
    const result = await getCommunication(c_id);
    if (result.success) {
      setData(result.data);
    } else {
      alert(result.error || '결과를 불러오는 중 오류가 발생했습니다.');
      navigate('/communication');
    }
  };

  if (loading) {
    return (
      <PhoneFrame title="대화 분석">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">결과를 불러오는 중...</p>
          </div>
        </div>
      </PhoneFrame>
    );
  }

  if (!data || !data.result) {
    return (
      <PhoneFrame title="대화 분석">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">분석 결과를 찾을 수 없습니다.</p>
            <button
              onClick={() => navigate('/communication')}
              className="rounded-2xl bg-blue-600 text-white px-6 py-2.5 font-semibold shadow-sm transition hover:bg-blue-700"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </PhoneFrame>
    );
  }

  const result = data.result;
  const bertResult = data.bert_result;
  const scriptSentences = data.script_sentences || [];

  const radarData = [
    { subject: '속도', score: result.speed * 10, fullMark: 100 },
    { subject: '발화속도', score: result.speech_rate * 10, fullMark: 100 },
    { subject: '침묵', score: result.silence * 10, fullMark: 100 },
    { subject: '명료도', score: result.clarity * 10, fullMark: 100 },
    { subject: '의미명료도', score: result.meaning_clarity * 10, fullMark: 100 },
  ];

  const barData = [
    { name: '욕설', count: bertResult?.curse_count || 0 },
    { name: '필러', count: bertResult?.filler_count || 0 },
    { name: 'Cut', count: result.cut || 0 },
  ];

  return (
    <PhoneFrame title="대화 분석">
      <div className="space-y-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-500">대화 분석</p>
          <h1 className="text-2xl font-extrabold text-gray-900">분석 결과</h1>
          <p className="text-sm text-gray-600">대화 #{c_id}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('scores')}
            className={`flex-1 rounded-2xl py-2.5 text-sm font-semibold transition ${
              activeTab === 'scores'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            📊 점수
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`flex-1 rounded-2xl py-2.5 text-sm font-semibold transition ${
              activeTab === 'feedback'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            💡 피드백
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`flex-1 rounded-2xl py-2.5 text-sm font-semibold transition ${
              activeTab === 'script'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            💬 스크립트
          </button>
        </div>

        {activeTab === 'scores' && (
          <div className="space-y-4">
            <div className="rounded-3xl bg-white shadow-sm p-5 space-y-3">
              <h3 className="text-base font-bold text-gray-900">📝 전체 요약</h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {result.summary}
              </p>
            </div>

            <div className="rounded-3xl bg-white shadow-sm p-5 space-y-3">
              <h3 className="text-base font-bold text-gray-900">🎯 조언</h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {result.advice}
              </p>
            </div>

            <div className="rounded-3xl bg-white shadow-sm p-5">
              <h3 className="text-base font-bold text-gray-900 mb-4">📈 종합 점수</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar
                    name="점수"
                    dataKey="score"
                    stroke="#2563eb"
                    fill="#2563eb"
                    fillOpacity={0.6}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-3xl bg-white shadow-sm p-5">
              <h3 className="text-base font-bold text-gray-900 mb-4">📊 감지 횟수</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-blue-50 p-4">
                <div className="text-xs text-blue-700 mb-1">표준어 점수</div>
                <div className="text-2xl font-bold text-blue-900">
                  {bertResult?.standard_score?.toFixed(2) || 'N/A'}
                </div>
              </div>
              <div className="rounded-2xl bg-red-50 p-4">
                <div className="text-xs text-red-700 mb-1">욕설</div>
                <div className="text-2xl font-bold text-red-900">
                  {bertResult?.curse_count || 0}회
                </div>
              </div>
              <div className="rounded-2xl bg-orange-50 p-4">
                <div className="text-xs text-orange-700 mb-1">필러</div>
                <div className="text-2xl font-bold text-orange-900">
                  {bertResult?.filler_count || 0}회
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="space-y-3">
            <DetailSection title="⚡ 속도" jsonData={result.speed_json} />
            <DetailSection title="🗣️ 발화 속도" jsonData={result.speech_rate_json} />
            <DetailSection title="🤫 침묵" jsonData={result.silence_json} />
            <DetailSection title="🔊 명료도" jsonData={result.clarity_json} />
            <DetailSection title="💭 의미 명료도" jsonData={result.meaning_clarity_json} />
            <DetailSection title="✂️ Cut" jsonData={result.cut_json} />

            {(!result.speed_json && !result.speech_rate_json && !result.silence_json &&
              !result.clarity_json && !result.meaning_clarity_json && !result.cut_json) && (
              <div className="rounded-3xl bg-white shadow-sm p-12 text-center">
                <p className="text-gray-600">상세 피드백이 없습니다</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'script' && (
          <div className="space-y-3">
            {scriptSentences.length === 0 ? (
              <div className="rounded-3xl bg-white shadow-sm p-12 text-center">
                <p className="text-gray-600">스크립트가 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scriptSentences
                  .sort((a, b) => a.sentence_index - b.sentence_index)
                  .map((sentence) => (
                    <div
                      key={sentence.c_ss_id}
                      className={`rounded-2xl p-4 ${
                        sentence.speaker_label === bertResult?.target_speaker
                          ? 'bg-blue-50 border-l-4 border-blue-600'
                          : 'bg-white shadow-sm border-l-4 border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">
                            화자 {sentence.speaker_label}
                          </span>
                          {sentence.speaker_label === bertResult?.target_speaker && (
                            <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full">
                              분석 대상
                            </span>
                          )}
                        </div>
                        {sentence.start_time && (
                          <span className="text-xs text-gray-500">
                            {sentence.start_time} - {sentence.end_time}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-800">{sentence.text}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/communication')}
            className="flex-1 rounded-2xl bg-white text-gray-700 py-3 font-semibold shadow-sm transition hover:bg-gray-50"
          >
            목록으로
          </button>
          <button
            onClick={() => navigate('/communication/info')}
            className="flex-1 rounded-2xl bg-blue-600 text-white py-3 font-semibold shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            새 분석 시작
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}
