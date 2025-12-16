import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
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

// 목업 데이터 사용 여부
const USE_MOCK_DATA = true;

// 목업 데이터
const MOCK_DATA = {
  c_id: 1,
  user_id: 1,
  status: 'completed',
  created_at: '2025-12-15T10:30:00',
  result: {
    c_result_id: 1,
    c_id: 1,
    c_br_id: 1,
    speed: 7.5,
    speech_rate: 8.2,
    silence: 6.8,
    clarity: 8.5,
    meaning_clarity: 7.9,
    cut: 3,
    speed_json: {
      detected_examples: ['너무 빠르게 말하는 부분이 있습니다', '중요한 내용을 천천히 설명해주세요'],
      reason: '전달력을 높이기 위해 적절한 속도 조절이 필요합니다',
      improvement: '중요한 포인트에서는 속도를 늦추고, 강조하는 연습을 해보세요',
      revised_examples: ['(천천히) 이 부분이 중요한데요', '잠깐만요, 다시 설명드리겠습니다']
    },
    clarity_json: {
      detected_examples: ['발음이 불명확한 단어들이 있습니다'],
      reason: '청중이 내용을 정확히 이해하지 못할 수 있습니다',
      improvement: '입을 크게 벌리고 또박또박 발음하는 연습이 필요합니다',
      revised_examples: []
    },
    summary: '전반적으로 좋은 대화 스킬을 보여주셨습니다.\n속도와 명료도 면에서 우수하며, 의미 전달이 명확했습니다.\n다만 간혹 불필요한 침묵이나 필러가 있었으니 이 부분을 개선하면 더욱 좋을 것 같습니다.',
    advice: '대화 시작 부분의 속도를 조금 늦추시고,\n중요한 포인트에서는 적절한 pause를 활용하세요.\n필러 단어 사용을 줄이기 위해 의식적으로 연습해보시면 좋겠습니다.',
    created_at: '2025-12-15T10:35:00'
  },
  bert_result: {
    c_br_id: 1,
    c_id: 1,
    c_sr_id: 1,
    target_speaker: '1',
    curse_count: 0,
    filler_count: 12,
    standard_score: 8.3,
    analyzed_segments: {
      slang: 0.2,
      biased: 0.1,
      curse: 0.0
    },
    created_at: '2025-12-15T10:34:00'
  },
  script_sentences: [
    {
      c_ss_id: 1,
      c_id: 1,
      c_sr_id: 1,
      sentence_index: 0,
      speaker_label: '1',
      text: '안녕하세요 오늘 회의 시작하겠습니다',
      start_time: '00:00:00',
      end_time: '00:00:03',
      created_at: '2025-12-15T10:33:00'
    },
    {
      c_ss_id: 2,
      c_id: 1,
      c_sr_id: 1,
      sentence_index: 1,
      speaker_label: '2',
      text: '네 감사합니다',
      start_time: '00:00:03',
      end_time: '00:00:05',
      created_at: '2025-12-15T10:33:01'
    },
    {
      c_ss_id: 3,
      c_id: 1,
      c_sr_id: 1,
      sentence_index: 2,
      speaker_label: '1',
      text: '먼저 지난주 안건부터 검토하도록 하겠습니다',
      start_time: '00:00:05',
      end_time: '00:00:08',
      created_at: '2025-12-15T10:33:02'
    },
    {
      c_ss_id: 4,
      c_id: 1,
      c_sr_id: 1,
      sentence_index: 3,
      speaker_label: '1',
      text: '그러니까 말이죠 이 부분이 중요한데요',
      start_time: '00:00:08',
      end_time: '00:00:11',
      created_at: '2025-12-15T10:33:03'
    },
    {
      c_ss_id: 5,
      c_id: 1,
      c_sr_id: 1,
      sentence_index: 4,
      speaker_label: '3',
      text: '질문이 있는데요 그 부분은 어떻게 처리하면 될까요',
      start_time: '00:00:11',
      end_time: '00:00:15',
      created_at: '2025-12-15T10:33:04'
    },
    {
      c_ss_id: 6,
      c_id: 1,
      c_sr_id: 1,
      sentence_index: 5,
      speaker_label: '1',
      text: '좋은 질문이십니다 제가 설명드리겠습니다',
      start_time: '00:00:15',
      end_time: '00:00:18',
      created_at: '2025-12-15T10:33:05'
    }
  ]
};

// DetailSection 컴포넌트 - React Hooks 규칙을 위해 외부에 정의
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
          <ul className="list-disc list-inside text-gray-800 ml-2 space-y-1">
            {jsonData.revised_examples.map((example, idx) => (
              <li key={idx} className="text-sm">{example}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default function CommunicationResult() {
  const navigate = useNavigate();
  const { c_id } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('scores'); // scores, feedback, script

  useEffect(() => {
    fetchData();
  }, [c_id]);

  const fetchData = async () => {
    if (USE_MOCK_DATA) {
      // 목업 데이터 사용
      setTimeout(() => {
        setData(MOCK_DATA);
        setLoading(false);
      }, 500);
      return;
    }

    // 실제 API 호출
    try {
      const response = await axios.get(
        `http://localhost:8081/communication/${c_id}`,
        { withCredentials: true }
      );
      setData(response.data);
    } catch (error) {
      console.error('데이터 조회 실패:', error);
      alert('결과를 불러오는 중 오류가 발생했습니다.');
      navigate('/communication');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="min-h-screen w-full max-w-3xl mx-auto bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">결과를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.result) {
    return (
      <div className="min-h-screen bg-white">
        <div className="min-h-screen w-full max-w-3xl mx-auto bg-gray-100 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-gray-600">분석 결과를 찾을 수 없습니다.</p>
            <button
              onClick={() => navigate('/communication')}
              className="rounded-2xl bg-blue-600 text-white px-6 py-2.5 font-semibold shadow-sm transition hover:bg-blue-700"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const result = data.result;
  const bertResult = data.bert_result;
  const scriptSentences = data.script_sentences || [];

  // Radar Chart 데이터
  const radarData = [
    { subject: '속도', score: result.speed * 10, fullMark: 100 },
    { subject: '발화속도', score: result.speech_rate * 10, fullMark: 100 },
    { subject: '침묵', score: result.silence * 10, fullMark: 100 },
    { subject: '명료도', score: result.clarity * 10, fullMark: 100 },
    { subject: '의미명료도', score: result.meaning_clarity * 10, fullMark: 100 },
  ];

  // Bar Chart 데이터
  const barData = [
    { name: '욕설', count: bertResult?.curse_count || 0 },
    { name: '필러', count: bertResult?.filler_count || 0 },
    { name: 'Cut', count: result.cut || 0 },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="min-h-screen w-full max-w-3xl mx-auto bg-gray-100 px-4 md:px-6 py-8 space-y-6">
        <header className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/communication')}
            className="h-10 w-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-lg"
          >
            ←
          </button>
          <div>
            <p className="text-xs font-semibold text-gray-500">대화 분석</p>
            <h1 className="text-xl font-bold text-gray-900">분석 결과</h1>
            <p className="text-sm text-gray-500 mt-1">대화 #{c_id}</p>
          </div>
        </header>

        {/* 탭 메뉴 */}
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

        {/* 탭 컨텐츠 */}
        {activeTab === 'scores' && (
          <div className="space-y-4">
            {/* 요약 및 조언 */}
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

            {/* Radar Chart */}
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

            {/* Bar Chart */}
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

            {/* 수치 */}
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

        {/* 하단 버튼 */}
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
    </div>
  );
}
