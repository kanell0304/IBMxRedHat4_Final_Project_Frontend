import { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';

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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow p-6 text-center space-y-4">
        <p className="text-lg font-semibold text-slate-800">분석 정보를 불러올 수 없습니다.</p>
        <p className="text-sm text-slate-500">화자 선택 후 다시 시작해주세요.</p>
        <button onClick={() => nav('/communication/start')} className="w-full rounded-xl bg-blue-600 text-white font-semibold py-3 hover:bg-blue-700 transition">다시 시작하기</button>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg font-semibold text-slate-800">말투를 분석하고 있습니다...</p>
        <p className="text-sm text-slate-500 mt-2">잠시만 기다려주세요.</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow p-6 text-center space-y-4">
        <p className="text-lg font-semibold text-red-600">오류 발생</p>
        <p className="text-sm text-slate-600">{error}</p>
        <button onClick={() => nav('/communication/start')} className="w-full rounded-xl bg-blue-600 text-white font-semibold py-3 hover:bg-blue-700 transition">다시 시작하기</button>
      </div>
    </div>
  );

  if (!result) return null;

  const metrics = [
    { key: 'speed', label: '말하기 속도', score: result.speed },
    { key: 'speech_rate', label: '발화 비율', score: result.speech_rate },
    { key: 'silence', label: '침묵 처리', score: result.silence },
    { key: 'clarity', label: '발음 명확성', score: result.clarity },
    { key: 'meaning_clarity', label: '의미 명확성', score: result.meaning_clarity },
  ];
  const getColor = (s) => s >= 8 ? 'text-green-600' : s >= 6 ? 'text-yellow-600' : 'text-red-600';
  const targetScript = script.filter(s => s.speaker_label === targetSpeaker);

  const TabBtn = ({ name, label }) => (
    <button onClick={() => setTab(name)} className={`px-4 py-2 text-sm font-semibold transition ${tab === name ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>{label}</button>
  );

  return (
    <div className="w-full max-w-5xl">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600/80">Communication Analysis</p>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">말투 분석 결과</h1>
            <p className="text-sm text-slate-500 mt-1">화자 {targetSpeaker}의 말투를 분석한 결과입니다.</p>
          </div>
          <button onClick={() => nav('/communication/start')} className="text-sm font-semibold text-blue-600 hover:text-blue-700">다시 분석하기</button>
        </div>
        <div className="flex items-center gap-2 border-b border-slate-200">
          <TabBtn name="overview" label="종합 요약" /><TabBtn name="detail" label="세부 지표" /><TabBtn name="script" label="전체 스크립트" />
        </div>
      </div>

      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4">말투 지표</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {metrics.map(m => (
                <div key={m.key} className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                  <p className="text-xs font-semibold text-slate-600 mb-2">{m.label}</p>
                  <div className="flex items-baseline gap-2"><span className={`text-3xl font-black ${getColor(m.score)}`}>{m.score?.toFixed(1)}</span><span className="text-sm text-slate-500">/ 10</span></div>
                </div>
              ))}
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                <p className="text-xs font-semibold text-slate-600 mb-2">말 끊김 횟수</p>
                <div className="flex items-baseline gap-2"><span className="text-3xl font-black text-slate-900">{result.cut}</span><span className="text-sm text-slate-500">회</span></div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4">종합 요약</h2>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{result.summary}</p>
          </div>
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4">개선 조언</h2>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{result.advice}</p>
          </div>
        </div>
      )}

      {tab === 'detail' && (
        <div className="space-y-6">
          {metrics.map(m => {
            const json = result[`${m.key}_json`];
            if (!json?.detected_examples?.length) return (
              <div key={m.key} className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
                <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold text-slate-900">{m.label}</h2><span className={`text-2xl font-black ${getColor(m.score)}`}>{m.score?.toFixed(1)}</span></div>
                <p className="text-sm text-slate-500">문제가 발견되지 않았습니다.</p>
              </div>
            );
            return (
              <div key={m.key} className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
                <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold text-slate-900">{m.label}</h2><span className={`text-2xl font-black ${getColor(m.score)}`}>{m.score?.toFixed(1)}</span></div>
                {json.reason && <div className="mb-4"><h3 className="text-sm font-semibold text-slate-700 mb-2">문제점</h3><p className="text-sm text-slate-600 leading-relaxed">{json.reason}</p></div>}
                {json.detected_examples?.length > 0 && <div className="mb-4"><h3 className="text-sm font-semibold text-slate-700 mb-2">문제 구간</h3><div className="space-y-2">{json.detected_examples.map((ex, i) => <div key={i} className="rounded-lg border border-red-200 bg-red-50 p-3"><p className="text-sm text-slate-800">{ex}</p></div>)}</div></div>}
                {json.improvement && <div className="mb-4"><h3 className="text-sm font-semibold text-slate-700 mb-2">개선 방안</h3><p className="text-sm text-slate-600 leading-relaxed">{json.improvement}</p></div>}
                {json.revised_examples?.length > 0 && <div><h3 className="text-sm font-semibold text-slate-700 mb-2">개선 예시</h3><div className="space-y-2">{json.revised_examples.map((ex, i) => <div key={i} className="rounded-lg border border-green-200 bg-green-50 p-3"><p className="text-sm text-slate-800">{ex}</p></div>)}</div></div>}
              </div>
            );
          })}
          {result.cut_json?.detected_examples?.length > 0 && (
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold text-slate-900">말 끊김 구간</h2><span className="text-2xl font-black text-slate-900">{result.cut}회</span></div>
              {result.cut_json.reason && <div className="mb-4"><h3 className="text-sm font-semibold text-slate-700 mb-2">분석</h3><p className="text-sm text-slate-600 leading-relaxed">{result.cut_json.reason}</p></div>}
              <div className="space-y-2">{result.cut_json.detected_examples.map((ex, i) => <div key={i} className="rounded-lg border border-orange-200 bg-orange-50 p-3"><p className="text-sm text-slate-800">{ex}</p></div>)}</div>
            </div>
          )}
        </div>
      )}

      {tab === 'script' && (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">화자 {targetSpeaker}의 발화 내용</h2>
          {targetScript.length === 0 ? <p className="text-sm text-slate-500">스크립트를 불러올 수 없습니다.</p> : (
            <div className="space-y-3">
              {targetScript.map(s => (
                <div key={s.c_ss_id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-1 rounded bg-blue-100 text-blue-700">#{s.sentence_index + 1}</span>
                    {s.start_time && <span className="text-xs text-slate-500">{s.start_time} ~ {s.end_time}</span>}
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Communication;
