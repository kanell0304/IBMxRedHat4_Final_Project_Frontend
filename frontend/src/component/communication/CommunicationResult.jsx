import React, { useEffect, useState, useRef } from 'react';
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
    </div>
  );
};

export default function CommunicationResult() {
  const navigate = useNavigate();
  const { c_id } = useParams();
  const { getCommunication, loading } = useCommunication();
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('scores');
  const [expandedSentenceId, setExpandedSentenceId] = useState(null);

  // 오디오 재생 관련 상태
  const audioRef = useRef(null);
  const [playingSentenceId, setPlayingSentenceId] = useState(null);
  const [openFeedbackId, setOpenFeedbackId] = useState(null);
  const feedbackBubbleRef = useRef(null);

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

  // 오디오 파일 로드
  useEffect(() => {
    if (c_id && activeTab === 'script') {
      const audio = new Audio(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'}/communication/${c_id}/audio`);
      audio.preload = 'auto';
      audioRef.current = audio;

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }
  }, [c_id, activeTab]);

  // 외부 클릭 감지 (피드백 버블 닫기)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (feedbackBubbleRef.current && !feedbackBubbleRef.current.contains(event.target)) {
        const clickedOnBubbleTrigger = event.target.closest('.bubble-trigger');
        if (!clickedOnBubbleTrigger) {
          setOpenFeedbackId(null);
        }
      }
    };

    if (openFeedbackId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openFeedbackId]);

  // 시간 포맷 변환 (1.440s → 1.44)
  const parseTime = (timeStr) => {
    if (!timeStr) return 0;
    return parseFloat(timeStr.replace('s', ''));
  };

  // 오디오 구간 재생 제어
  const handlePlaySegment = (sentence) => {
    if (!audioRef.current) return;

    const startTime = parseTime(sentence.start_time);
    const endTime = parseTime(sentence.end_time);

    if (playingSentenceId === sentence.c_ss_id) {
      // 재생 중이면 정지
      audioRef.current.pause();
      setPlayingSentenceId(null);
    } else {
      // 재생 시작
      audioRef.current.currentTime = startTime;
      audioRef.current.play();
      setPlayingSentenceId(sentence.c_ss_id);

      // timeupdate 이벤트로 구간 종료 감지
      const handleTimeUpdate = () => {
        if (audioRef.current.currentTime >= endTime) {
          audioRef.current.pause();
          setPlayingSentenceId(null);
          audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        }
      };

      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
    }
  };

  // 피드백 버블 토글
  const handleFeedbackClick = (sentenceId) => {
    if (openFeedbackId === sentenceId) {
      setOpenFeedbackId(null);
    } else {
      setOpenFeedbackId(sentenceId);
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
    { subject: '발화속도', score: result.speaking_speed * 10, fullMark: 100 },
    { subject: '침묵', score: result.silence * 10, fullMark: 100 },
    { subject: '발음', score: (100 - result.clarity), fullMark: 100 },
    { subject: '의미명료도', score: (100 - result.meaning_clarity), fullMark: 100 },
  ];

  const barData = [
    { name: '욕설', count: bertResult?.curse_count || 0 },
    { name: '필러', count: bertResult?.filler_count || 0 },
    { name: '말 끊기', count: result.cut || 0 },
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
            <DetailSection title="🗣️ 발화 속도" jsonData={result.speaking_speed_json} />
            <DetailSection title="🤫 침묵" jsonData={result.silence_json} />
            <DetailSection title="🔊 발음" jsonData={result.clarity_json} />
            <DetailSection title="💭 의미 명료도" jsonData={result.meaning_clarity_json} />
            <DetailSection title="✂️ 말 끊기" jsonData={result.cut_json} />

            {(!result.speaking_speed_json && !result.silence_json &&
              !result.clarity_json && !result.meaning_clarity_json && !result.cut_json) && (
              <div className="rounded-3xl bg-white shadow-sm p-12 text-center">
                <p className="text-gray-600">상세 피드백이 없습니다</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'script' && (
          <div className="space-y-3 pb-4">
            {scriptSentences.length === 0 ? (
              <div className="rounded-3xl bg-white shadow-sm p-12 text-center">
                <p className="text-gray-600">스크립트가 없습니다</p>
              </div>
            ) : (
              <div className="space-y-2">
                {scriptSentences
                  .sort((a, b) => a.sentence_index - b.sentence_index)
                  .map((sentence) => {
                    const hasFeedback = sentence.feedback && sentence.feedback.length > 0;
                    const isTargetSpeaker = sentence.speaker_label === bertResult?.target_speaker;
                    const isPlaying = playingSentenceId === sentence.c_ss_id;
                    const isFeedbackOpen = openFeedbackId === sentence.c_ss_id;

                    // 아이콘 매핑
                    const iconMap = {
                      'speaking_speed': '🗣️',
                      'silence': '🤫',
                      'clarity': '🔊',
                      'meaning_clarity': '💭',
                      'cut': '✂️',
                      'curse': '🤬',
                      'filler': '🙄'
                    };

                    return (
                      <div
                        key={sentence.c_ss_id}
                        className={`flex ${isTargetSpeaker ? 'justify-end' : 'justify-start'} gap-2 relative`}
                      >
                        {/* 재생 버튼 (분석 대상만, 좌측) */}
                        {isTargetSpeaker && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlaySegment(sentence);
                            }}
                            className="flex-shrink-0 w-10 h-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center transition self-stretch"
                            title={isPlaying ? '재생 중' : '재생'}
                          >
                            <span className="text-lg">{isPlaying ? '⏸' : '▶️'}</span>
                          </button>
                        )}

                        {/* 말풍선 컨테이너 */}
                        <div className={`max-w-[75%] ${isTargetSpeaker ? 'items-end' : 'items-start'} flex flex-col gap-1 relative`}>
                          {/* 피드백 아이콘 (말풍선 상단) */}
                          {hasFeedback && isTargetSpeaker && (
                            <div className="flex gap-1 justify-end">
                              {sentence.feedback.map((fb, idx) => {
                                const icon = iconMap[fb.category] || '⚠️';
                                return (
                                  <span
                                    key={idx}
                                    className="text-xs bg-red-100 px-1.5 py-0.5 rounded"
                                    title={fb.category}
                                  >
                                    {icon}
                                  </span>
                                );
                              })}
                            </div>
                          )}

                          {/* 말풍선 */}
                          <div
                            onClick={() => {
                              if (hasFeedback && isTargetSpeaker) {
                                handleFeedbackClick(sentence.c_ss_id);
                              }
                            }}
                            className={`bubble-trigger rounded-2xl px-4 py-2.5 shadow-sm transition ${
                              isTargetSpeaker
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-gray-800'
                            } ${hasFeedback && isTargetSpeaker ? 'cursor-pointer active:opacity-80' : ''}`}
                          >
                            <p className="text-sm leading-relaxed break-words">{sentence.text}</p>
                          </div>

                          {/* 발화 시간 */}
                          {sentence.start_time && (
                            <span className={`text-[10px] text-gray-500 ${isTargetSpeaker ? 'text-right' : 'text-left'}`}>
                              {sentence.start_time} ~ {sentence.end_time}
                            </span>
                          )}

                          {/* Floating Bubble (피드백) */}
                          {isFeedbackOpen && hasFeedback && (
                            <div
                              ref={feedbackBubbleRef}
                              className="absolute top-0 right-0 mt-12 mr-0 bg-white border border-red-300 rounded-xl shadow-lg p-3 w-64 z-50"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <p className="text-xs font-semibold text-red-700 mb-2">감지된 문제</p>
                              <ul className="space-y-1.5">
                                {sentence.feedback.map((fb, idx) => (
                                  <li key={idx} className="text-xs text-gray-700 flex items-start gap-1">
                                    <span className="font-medium text-red-600 flex-shrink-0">
                                      {iconMap[fb.category]}
                                    </span>
                                    <span>{fb.message}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
