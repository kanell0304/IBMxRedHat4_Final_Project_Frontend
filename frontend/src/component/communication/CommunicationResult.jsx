import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import PhoneFrame from '../Layout/PhoneFrame';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DetailSection = ({ title, json }) => {
  if (!json?.detected_examples?.length) return null;
  return (
    <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
      <h4 className="font-bold text-gray-900">{title}</h4>
      <div>
        <p className="text-sm text-gray-600 mb-1">감지된 예시:</p>
        <ul className="list-disc list-inside text-gray-800 ml-2 space-y-1">
          {json.detected_examples.map((ex, i) => <li key={i} className="text-sm">{ex}</li>)}
        </ul>
      </div>
      {json.reason && <div><p className="text-sm text-gray-600 mb-1">이유:</p><p className="text-gray-800 text-sm">{json.reason}</p></div>}
      {json.improvement && <div><p className="text-sm text-gray-600 mb-1">개선 방법:</p><p className="text-gray-800 text-sm">{json.improvement}</p></div>}
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
      audioRef.current = new Audio(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'}/communication/${c_id}/audio`);
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

  const parseTime = (t) => parseFloat((t || '0').replace('s', ''));
  
  const playSegment = (s) => {
    if (!audioRef.current) return;
    const start = parseTime(s.start_time), end = parseTime(s.end_time);
    if (playingId === s.c_ss_id) { audioRef.current.pause(); setPlayingId(null); return; }
    audioRef.current.currentTime = start;
    audioRef.current.play();
    setPlayingId(s.c_ss_id);
    const onTime = () => { if (audioRef.current.currentTime >= end) { audioRef.current.pause(); setPlayingId(null); audioRef.current.removeEventListener('timeupdate', onTime); }};
    audioRef.current.addEventListener('timeupdate', onTime);
  };

  if (loading) return <PhoneFrame title="대화 분석"><div className="flex items-center justify-center min-h-[400px]"><div className="text-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4" /><p className="text-sm text-gray-600">결과를 불러오는 중...</p></div></div></PhoneFrame>;
  if (!data?.result) return <PhoneFrame title="대화 분석"><div className="flex items-center justify-center min-h-[400px]"><div className="text-center space-y-4"><p className="text-sm text-gray-600">분석 결과를 찾을 수 없습니다.</p><button onClick={() => nav('/communication')} className="rounded-2xl bg-blue-600 text-white px-6 py-2.5 font-semibold">목록으로 돌아가기</button></div></div></PhoneFrame>;

  const { result: r, bert_result: b, script_sentences: ss, llm_result: llm } = data;
  const radar = [{ subject: '말하는 속도', score: r.speaking_speed * 10, fullMark: 100 }, { subject: '침묵', score: r.silence * 10, fullMark: 100 }, { subject: '발음', score: 100 - r.clarity, fullMark: 100 }, { subject: '의미 전달', score: 100 - r.meaning_clarity, fullMark: 100 }];
  const bar = [
    { name: '욕설', count: llm?.curse?.count || 0 },
    { name: '군말/망설임', count: llm?.filler?.count || 0 },
    { name: '편향', count: llm?.biased?.count || 0 },
    { name: '비표준어', count: llm?.slang?.count || 0 },
    { name: '말 끊기', count: r.cut || 0 }
  ];
  const iconMap = { speaking_speed: '🗣️', silence: '🤫', clarity: '🔊', meaning_clarity: '💭', cut: '✂️', curse: '🤬', filler: '🙄', biased: '⚠️', slang: '💬' };

  return (
    <PhoneFrame title="대화 분석">
      <div className="space-y-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-500">대화 분석</p>
          <h1 className="text-2xl font-extrabold text-gray-900">분석 결과</h1>
          <p className="text-sm text-gray-600">대화 #{c_id}</p>
        </div>
        <div className="flex gap-2">
          {['scores', 'feedback', 'script'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-2xl py-2.5 text-sm font-semibold transition ${tab === t ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
              {t === 'scores' ? '📊 점수' : t === 'feedback' ? '💡 피드백' : '💬 스크립트'}
            </button>
          ))}
        </div>

        {tab === 'scores' && (
          <div className="space-y-4">
            <div className="rounded-3xl bg-white shadow-sm p-5 space-y-3">
              <h3 className="text-base font-bold text-gray-900">📝 요약</h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{r.summary}</p>
            </div>
            <div className="rounded-3xl bg-white shadow-sm p-5 space-y-3">
              <h3 className="text-base font-bold text-gray-900">🎯 조언</h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{r.advice}</p>
            </div>
            <div className="rounded-3xl bg-white shadow-sm p-5">
              <h3 className="text-base font-bold text-gray-900 mb-4">📈 종합 점수</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radar}><PolarGrid /><PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} /><PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} /><Radar name="점수" dataKey="score" stroke="#2563eb" fill="#2563eb" fillOpacity={0.6} /><Legend wrapperStyle={{ fontSize: '12px' }} /></RadarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {radar.map((i, idx) => <div key={idx} className="rounded-xl bg-blue-50 p-3"><div className="text-xs text-blue-700 font-medium">{i.subject}</div><div className="text-lg font-bold text-blue-900">{i.score.toFixed(1)}</div></div>)}
              </div>
            </div>
            <div className="rounded-3xl bg-white shadow-sm p-5">
              <h3 className="text-base font-bold text-gray-900 mb-4">📊 발견된 문제</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={bar}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="count" fill="#2563eb" /></BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {tab === 'feedback' && (
          <div className="space-y-3">
            <DetailSection title="🗣️ 말하는 속도" json={r.speaking_speed_json} />
            <DetailSection title="🤫 침묵" json={r.silence_json} />
            <DetailSection title="🔊 발음" json={r.clarity_json} />
            <DetailSection title="💭 의미 전달" json={r.meaning_clarity_json} />
            <DetailSection title="✂️ 말 끊기" json={r.cut_json} />
            {!r.speaking_speed_json && !r.silence_json && !r.clarity_json && !r.meaning_clarity_json && !r.cut_json && (
              <div className="rounded-3xl bg-white shadow-sm p-12 text-center"><p className="text-gray-600">상세 피드백이 없습니다</p></div>
            )}
          </div>
        )}

        {tab === 'script' && (
          <div className="space-y-3 pb-4">
            {!ss?.length ? <div className="rounded-3xl bg-white shadow-sm p-12 text-center"><p className="text-gray-600">스크립트가 없습니다</p></div> : (
              <div className="space-y-2">
                {ss.sort((a, b) => a.sentence_index - b.sentence_index).map(s => {
                  const isTarget = s.speaker_label === b?.target_speaker, hasFb = s.feedback?.length > 0;
                  return (
                    <div key={s.c_ss_id} className={`flex ${isTarget ? 'justify-end' : 'justify-start'} gap-2 relative`}>
                      {isTarget && <button onClick={() => playSegment(s)} className="flex-shrink-0 w-10 h-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center transition self-stretch"><span className="text-lg">{playingId === s.c_ss_id ? '⏸' : '▶️'}</span></button>}
                      <div className={`max-w-[75%] ${isTarget ? 'items-end' : 'items-start'} flex flex-col gap-1 relative`}>
                        {hasFb && isTarget && <div className="flex gap-1 justify-end">{s.feedback.map((fb, i) => <span key={i} className="text-xs bg-red-100 px-1.5 py-0.5 rounded" title={fb.category}>{iconMap[fb.category] || '⚠️'}</span>)}</div>}
                        <div onClick={() => hasFb && isTarget && setOpenFb(openFb === s.c_ss_id ? null : s.c_ss_id)}
                          className={`bubble-trigger rounded-2xl px-4 py-2.5 shadow-sm transition ${isTarget ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'} ${hasFb && isTarget ? 'cursor-pointer active:opacity-80' : ''}`}>
                          <p className="text-sm leading-relaxed break-words">{s.text}</p>
                        </div>
                        {s.start_time && <span className={`text-[10px] text-gray-500 ${isTarget ? 'text-right' : 'text-left'}`}>{s.start_time} ~ {s.end_time}</span>}
                        {openFb === s.c_ss_id && hasFb && (
                          <div ref={fbRef} className="absolute top-0 right-0 mt-12 mr-0 bg-white border border-red-300 rounded-xl shadow-lg p-3 w-64 z-50" onClick={(e) => e.stopPropagation()}>
                            <p className="text-xs font-semibold text-red-700 mb-2">감지된 문제</p>
                            <ul className="space-y-1.5">{s.feedback.map((fb, i) => <li key={i} className="text-xs text-gray-700 flex items-start gap-1"><span className="font-medium text-red-600 flex-shrink-0">{iconMap[fb.category]}</span><span>{fb.message}</span></li>)}</ul>
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
          <button onClick={() => nav('/history')} className="flex-1 rounded-2xl bg-white text-gray-700 py-3 font-semibold shadow-sm transition hover:bg-gray-50">목록으로</button>
          <button onClick={() => nav('/communication/info')} className="flex-1 rounded-2xl bg-blue-600 text-white py-3 font-semibold shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700">새 분석 시작</button>
        </div>
      </div>
    </PhoneFrame>
  );
}
