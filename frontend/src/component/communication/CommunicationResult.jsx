import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import PhoneFrame from '../Layout/PhoneFrame';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DetailSection = ({ title, json }) => {
  if (!json?.detected_examples?.length) return null;
  return (
    <div className="bg-white rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100">
      <h4 className="font-bold text-gray-900 mb-3">{title}</h4>
      <div className="space-y-3">
        <div>
          <p className="text-xs font-bold text-gray-500 mb-1 ml-1">발견된 구간</p>
          <div className="flex flex-wrap gap-2">
            {json.detected_examples.map((ex, i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-medium border border-red-100">
                {ex}
              </span>
            ))}
          </div>
        </div>
        {json.improvement && (
          <div className="bg-blue-50 p-3 rounded-2xl">
            <p className="text-xs font-bold text-blue-500 mb-1">개선 방법</p>
            <p className="text-sm text-blue-800 font-semibold leading-relaxed">{json.improvement}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function CommunicationResult() {
  const nav = useNavigate(), { c_id } = useParams();
  const [data, setData] = useState(null), [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('scores'), [playingId, setPlayingId] = useState(null), [openFb, setOpenFb] = useState(null);
  const audioRef = useRef(null), fbRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { data: d } = await api.get(`/communication/${c_id}`);
      setData(d);
      setLoading(false);
    })();
  }, [c_id]);

  useEffect(() => {
    if (c_id && tab === 'script') {
      audioRef.current = new Audio(`${import.meta.env.VITE_API_BASE_URL || 'https://api.st-each.com'}/communication/${c_id}/audio`);
      audioRef.current.preload = 'auto';
      return () => { audioRef.current?.pause(); audioRef.current = null; };
    }
  }, [c_id, tab]);

  useEffect(() => {
    if (openFb === null) return;
    const handler = (e) => { if (fbRef.current && !fbRef.current.contains(e.target) && !e.target.closest('.bubble-trigger')) setOpenFb(null); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openFb]);

  const playSegment = (sentence) => {
    if (!audioRef.current) return;
    if (playingId === sentence.c_ss_id) {
      audioRef.current.pause();
      setPlayingId(null);
      return;
    }
    const startSec = parseFloat(sentence.start_time) || 0;
    const endSec = parseFloat(sentence.end_time) || startSec + 5;
    audioRef.current.currentTime = startSec;
    audioRef.current.play();
    setPlayingId(sentence.c_ss_id);
    const handleTimeUpdate = () => {
      if (audioRef.current.currentTime >= endSec) {
        audioRef.current.pause();
        setPlayingId(null);
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
      }
    };
    audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
    audioRef.current.addEventListener('ended', () => setPlayingId(null), { once: true });
  };

  
  if (loading) return (
    <PhoneFrame title="분석 중">
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg font-semibold text-slate-800">결과를 불러오는 중...</p>
      </div>
    </PhoneFrame>
  );

  if (!data?.result) return (
    <PhoneFrame title="오류">
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <p className="text-lg font-semibold text-slate-800 mb-4">분석 결과를 찾을 수 없습니다.</p>
        <button onClick={() => nav('/communication')} className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-200 active:scale-95 transition-transform">목록으로 돌아가기</button>
      </div>
    </PhoneFrame>
  );

  const { result: r, bert_result: b, script_sentences: ss, llm_result: llm } = data;
  
  // 점수 정규화 (모두 100점 만점, 높을수록 좋음)
  const speedScore = Math.max(0, 100 - Math.abs(r.speaking_speed - 4.0) * 20);
  const silenceScore = Math.max(0, 100 - (r.silence * 5));
  const cutScore = Math.max(0, 100 - (r.cut * 10));

  const radar = [
    { subject: '속도 적절성', score: speedScore, fullMark: 100 },
    { subject: '휴지 적절성', score: silenceScore, fullMark: 100 },
    { subject: '발음 정확도', score: r.clarity, fullMark: 100 },
    { subject: '의미 명확성', score: r.meaning_clarity, fullMark: 100 },
    { subject: '대화 흐름', score: cutScore, fullMark: 100 }
  ];

  const iconMap = { speaking_speed: '🗣️', silence: '🤫', clarity: '🔊', meaning_clarity: '💭', cut: '✂️', curse: '🤬', filler: '🙄', biased: '⚠️', slang: '💬' };

  return (
    <PhoneFrame title="대화 분석" showTitleRow={true}>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="px-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">분석 결과</h1>
              <p className="text-sm text-gray-500 mt-1">완료된 분석 결과를 확인해보세요.</p>
            </div>
            <button onClick={() => nav('/communication')} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition">↺</button>
          </div>
        </div>

        {/* Segmented Control */}
        <div className="bg-gray-100 p-1 rounded-xl flex">
          {['scores', 'feedback', 'script'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t === 'scores' ? '점수' : t === 'feedback' ? '피드백' : '스크립트'}
            </button>
          ))}
        </div>

        {tab === 'scores' && (
          <div className="space-y-5 animate-fade-in-up">

            {/* Radar Chart */}
            <div className="bg-white p-5 rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-4">📈 종합 점수</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radar}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#4b5563' }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <Radar name="점수" dataKey="score" stroke="#2563eb" fill="#2563eb" fillOpacity={0.5} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {radar.map((i, idx) => (
                  <div key={idx} className="rounded-xl bg-blue-50 p-3 text-center">
                    <div className="text-xs text-blue-600 font-medium mb-1">{i.subject}</div>
                    <div className="text-lg font-bold text-blue-900">{i.score.toFixed(1)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white p-5 rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-3">📝 요약</h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{r.summary}</p>
            </div>

          </div>
        )}

        {tab === 'feedback' && (
          <div className="space-y-4 animate-fade-in-up">
          
            {/* Advice */}
            <div className="bg-white p-5 rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-3">종합 피드백</h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{r.advice}</p>
            </div>
            <DetailSection title="🗣️ 말하는 속도" json={r.speaking_speed_json} />
            <DetailSection title="🤫 침묵" json={r.silence_json} />
            <DetailSection title="🔊 발음" json={r.clarity_json} />
            <DetailSection title="💭 의미 전달" json={r.meaning_clarity_json} />
            <DetailSection title="✂️ 말 끊기" json={r.cut_json} />
            {!r.speaking_speed_json && !r.silence_json && !r.clarity_json && !r.meaning_clarity_json && !r.cut_json && (
              <div className="bg-white rounded-3xl p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100">
                <p className="text-gray-400">상세 피드백이 없습니다</p>
              </div>
            )}
          </div>
        )}

        {tab === 'script' && (
          <div className="space-y-4 pb-4 animate-fade-in-up">
            {!ss?.length ? (
              <div className="bg-white rounded-3xl p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100">
                <p className="text-gray-400">스크립트가 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ss.sort((a, b) => a.sentence_index - b.sentence_index).map(s => {
                  const isTarget = s.speaker_label === b?.target_speaker;
                  const hasFb = s.feedback?.length > 0;
                  const isPlaying = playingId === s.c_ss_id;

                  return (
                    <div key={s.c_ss_id} className={`flex ${isTarget ? 'justify-end' : 'justify-start'} gap-2 relative group`}>

                      {!isTarget && s.start_time && (
                        <button
                          onClick={() => playSegment(s)}
                          className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm flex-shrink-0 self-end mb-5"
                        >
                          {isPlaying ? '⏸' : '▶'}
                        </button>
                      )}

                      <div className={`max-w-[80%] flex flex-col gap-1 ${isTarget ? 'items-end' : 'items-start'}`}>
                        {hasFb && isTarget && (
                          <div className="flex flex-wrap gap-1 justify-end mb-1">
                            {s.feedback.map((fb, i) => (
                              <span key={i} className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100 font-medium flex items-center gap-1">
                                {iconMap[fb.category]} {fb.message}
                              </span>
                            ))}
                          </div>
                        )}

                        <div
                          onClick={() => hasFb && isTarget && setOpenFb(openFb === s.c_ss_id ? null : s.c_ss_id)}
                          className={`
                            relative px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm transition-all
                            ${isTarget
                              ? 'bg-blue-600 text-white rounded-tr-none'
                              : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                            }
                            ${hasFb && isTarget ? 'ring-2 ring-red-300 ring-offset-1 cursor-pointer' : ''}
                            ${isPlaying ? 'ring-2 ring-blue-400' : ''}
                          `}
                        >
                          {s.text}
                        </div>

                        {s.start_time && (
                          <span className="text-[10px] text-gray-400 px-1">
                            {s.start_time}
                          </span>
                        )}
                      </div>

                      {isTarget && s.start_time && (
                        <button
                          onClick={() => playSegment(s)}
                          className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm flex-shrink-0 self-end mb-5"
                        >
                          {isPlaying ? '⏸' : '▶'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button onClick={() => nav('/history')} className="flex-1 py-3.5 rounded-2xl bg-white text-gray-700 font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 hover:bg-gray-50 transition">목록으로</button>
          <button onClick={() => nav('/communication/info')} className="flex-1 py-3.5 rounded-2xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-200 active:scale-95 transition-transform">새 분석</button>
        </div>
      </div>
    </PhoneFrame>
  );
}
