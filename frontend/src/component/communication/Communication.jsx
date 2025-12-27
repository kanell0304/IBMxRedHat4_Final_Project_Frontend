import { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import PhoneFrame from '../Layout/PhoneFrame';

const Communication = () => {
  const nav = useNavigate(), loc = useLocation();
  const initial = useMemo(() => {
    if (loc.state?.c_id && loc.state?.target_speaker) return loc.state;
    try { return JSON.parse(sessionStorage.getItem('communicationSession')); } catch { return null; }
  }, [loc.state]);

  const [c_id] = useState(initial?.c_id), [targetSpeaker] = useState(initial?.target_speaker || '1');
  const [loading, setLoading] = useState(false), [error, setError] = useState('');
  const [result, setResult] = useState(null), [script, setScript] = useState([]);
  const [tab, setTab] = useState('overview');

  useEffect(() => { if (initial?.c_id) sessionStorage.setItem('communicationSession', JSON.stringify(initial)); }, [initial]);

  useEffect(() => {
    if (!c_id || !targetSpeaker) return;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.post(`/communication/${c_id}/analyze`, null, { params: { target_speaker: targetSpeaker } });
        setResult(data);
        const { data: sc } = await api.get(`/communication/${c_id}/script`).catch(() => ({ data: [] }));
        setScript(sc || []);
      } catch (e) { setError(e?.message || '분석 중 오류가 발생했습니다.'); }
      setLoading(false);
    })();
  }, [c_id, targetSpeaker]);

  if (!c_id || !targetSpeaker) return (
    <PhoneFrame title="오류">
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-2xl">⚠️</div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">정보를 불러올 수 없음</h3>
        <p className="text-sm text-gray-500 mb-6">화자 선택 정보가 없습니다.</p>
        <button onClick={() => nav('/communication/start')} className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-200 active:scale-95 transition-transform">
          다시 시작하기
        </button>
      </div>
    </PhoneFrame>
  );

  if (loading) return (
    <PhoneFrame title="분석 중">
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="relative w-20 h-20 mb-6">
          <svg className="animate-spin w-full h-full text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">말투 분석 중...</h3>
        <p className="text-sm text-gray-500">잠시만 기다려주세요.</p>
      </div>
    </PhoneFrame>
  );

  if (error) return (
    <PhoneFrame title="오류">
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 text-2xl text-red-500">✕</div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">오류 발생</h3>
        <p className="text-sm text-gray-500 mb-6">{error}</p>
        <button onClick={() => nav('/communication/start')} className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-200 active:scale-95 transition-transform">
          다시 시작하기
        </button>
      </div>
    </PhoneFrame>
  );

  if (!result) return null;

  const metrics = [
    { key: 'speed', label: '말하기 속도', score: result.speed },
    { key: 'speech_rate', label: '발화 비율', score: result.speech_rate },
    { key: 'silence', label: '침묵 처리', score: result.silence },
    { key: 'clarity', label: '발음 명확성', score: result.clarity },
    { key: 'meaning_clarity', label: '의미 명확성', score: result.meaning_clarity },
  ];
  const getColor = (s) => s >= 8 ? 'text-green-500' : s >= 6 ? 'text-yellow-500' : 'text-red-500';
  const targetScript = script.filter(s => s.speaker_label === targetSpeaker);

  return (
    <PhoneFrame title="분석 결과" showTitleRow={true}>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="px-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">분석 완료</h1>
              <p className="text-sm text-gray-500 mt-1">Speaker {targetSpeaker}의 분석 리포트</p>
            </div>
            <button onClick={() => nav('/communication/start')} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition">↺</button>
          </div>
        </div>

        {/* Segmented Control */}
        <div className="bg-gray-100 p-1 rounded-xl flex">
          {['overview', 'detail', 'script'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t === 'overview' ? '요약' : t === 'detail' ? '상세' : '스크립트'}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="space-y-5 animate-fade-in-up">
            {/* Score Grid */}
            <div className="grid grid-cols-2 gap-3">
              {metrics.map(m => (
                <div key={m.key} className="bg-white p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col items-center justify-center text-center">
                  <p className="text-xs font-medium text-gray-500 mb-2">{m.label}</p>
                  <div className="relative flex items-center justify-center w-16 h-16">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="32" cy="32" r="28" stroke="#f3f4f6" strokeWidth="6" fill="none" />
                      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="none" strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * (m.score || 0) / 10)} className={`transition-all duration-1000 ease-out ${getColor(m.score)}`} />
                    </svg>
                    <span className={`absolute text-lg font-bold ${getColor(m.score)}`}>{m.score?.toFixed(1)}</span>
                  </div>
                </div>
              ))}
              <div className="bg-white p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col items-center justify-center text-center">
                <p className="text-xs font-medium text-gray-500 mb-2">말 끊김</p>
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-orange-50 text-orange-600 text-2xl font-bold">
                  {result.cut}
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-white p-5 rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-blue-500">📝</span> 종합 요약
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{result.summary}</p>
            </div>

            {/* Advice Card */}
            <div className="bg-white p-5 rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-green-500">💡</span> 개선 조언
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{result.advice}</p>
            </div>
          </div>
        )}

        {tab === 'detail' && (
          <div className="space-y-4 animate-fade-in-up">
            {metrics.map(m => {
              const json = result[`${m.key}_json`];
              const hasIssue = json?.detected_examples?.length > 0;
              return (
                <div key={m.key} className={`bg-white p-5 rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border ${hasIssue ? 'border-orange-100' : 'border-gray-100'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-gray-900">{m.label}</h3>
                    <span className={`text-lg font-bold ${getColor(m.score)}`}>{m.score?.toFixed(1)}점</span>
                  </div>
                  
                  {!hasIssue ? (
                    <p className="text-sm text-gray-400 flex items-center gap-2"><span className="text-green-500">✓</span> 문제가 발견되지 않았습니다.</p>
                  ) : (
                    <div className="space-y-3">
                      {json.reason && (
                        <div className="bg-gray-50 p-3 rounded-2xl">
                          <p className="text-xs font-bold text-gray-500 mb-1">문제점</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{json.reason}</p>
                        </div>
                      )}
                      {json.improvement && (
                        <div className="bg-blue-50 p-3 rounded-2xl">
                          <p className="text-xs font-bold text-blue-500 mb-1">개선 방안</p>
                          <p className="text-sm text-blue-800 leading-relaxed">{json.improvement}</p>
                        </div>
                      )}
                      {json.detected_examples?.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-gray-500 mb-2 ml-1">발견된 구간</p>
                          <div className="flex flex-wrap gap-2">
                            {json.detected_examples.map((ex, i) => (
                              <span key={i} className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-medium border border-red-100">
                                #{ex}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            
            {result.cut_json?.detected_examples?.length > 0 && (
              <div className="bg-white p-5 rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-orange-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-gray-900">말 끊김</h3>
                  <span className="text-lg font-bold text-orange-600">{result.cut}회</span>
                </div>
                <div className="bg-orange-50 p-3 rounded-2xl mb-3">
                  <p className="text-sm text-orange-800 leading-relaxed">{result.cut_json.reason}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.cut_json.detected_examples.map((ex, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-orange-100 text-orange-700 text-xs font-medium">
                      #{ex}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'script' && (
          <div className="bg-white rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden animate-fade-in-up">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-sm font-bold text-gray-900">전체 스크립트</h2>
              <p className="text-xs text-gray-500 mt-0.5">Speaker {targetSpeaker}의 발화 내용</p>
            </div>
            <div className="divide-y divide-gray-100">
              {targetScript.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">스크립트가 없습니다.</div>
              ) : (
                targetScript.map(s => (
                  <div key={s.c_ss_id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-600">#{s.sentence_index + 1}</span>
                      {s.start_time && <span className="text-[10px] text-gray-400">{s.start_time}</span>}
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed">{s.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </PhoneFrame>
  );
};

export default Communication;
