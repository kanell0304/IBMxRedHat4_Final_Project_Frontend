import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CommunicationStart = () => {
  const nav = useNavigate();
  const [file, setFile] = useState(null), [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false), [sttLoading, setSttLoading] = useState(false), [error, setError] = useState('');
  const [c_id, setC_id] = useState(null), [sttResult, setSttResult] = useState(null);
  const [selectedSpeaker, setSelectedSpeaker] = useState(''), [previews, setPreviews] = useState({});

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f); setError(''); setC_id(null); setSttResult(null); setSelectedSpeaker(''); setPreviews({});
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file) { setError('녹음 파일을 선택해주세요.'); return; }
    setLoading(true); setError('');
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/communication/upload', formData, { params: { user_id: 1 } });
    setC_id(data.c_id);
    setLoading(false);
  };

  const handleSTT = async () => {
    if (!c_id) { setError('먼저 파일을 업로드해주세요.'); return; }
    setSttLoading(true); setError('');
    const { data } = await api.post(`/communication/${c_id}/stt`);
    const stt = data.json_data || data;
    const pv = {};
    stt.results?.forEach(r => {
      r.alternatives?.[0]?.words?.forEach(w => {
        const sp = w.speakerLabel || '1';
        if (!pv[sp]) pv[sp] = [];
        pv[sp].push(w.word);
      });
    });
    Object.keys(pv).forEach(sp => pv[sp] = pv[sp].slice(0, 20).join(' ') + '...');
    setPreviews(pv);
    setSttResult(data);
    setSttLoading(false);
  };

  const handleAnalyze = () => {
    if (!selectedSpeaker) { setError('분석할 화자를 선택해주세요.'); return; }
    nav('/communication', { state: { c_id, target_speaker: selectedSpeaker } });
  };

  const speakers = Object.keys(previews).sort();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8 font-sans">
      <div className="w-full max-w-[420px] mx-auto bg-[#f8fafc] rounded-[28px] border border-slate-200 shadow-lg px-5 py-7 max-h-[844px] min-h-[720px] overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => nav('/')} className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shadow-sm hover:bg-slate-200 transition" aria-label="뒤로가기">←</button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600/80">Communication</p>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">말투 분석</h1>
            <p className="text-xs text-slate-500 mt-1">통화 녹음본을 업로드하고 분석할 화자를 선택하세요.</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Step 1 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold inline-flex items-center justify-center shadow-sm shadow-blue-200">1</span>
              <span className="text-sm font-semibold text-slate-800">녹음 파일 업로드</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-4 py-4">
              <input type="file" accept="audio/*" onChange={handleFile} className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold hover:file:bg-slate-200 cursor-pointer" />
              <p className="text-xs text-slate-500 mt-3">통화 녹음 파일을 선택하세요. (mp3, wav, m4a 등)</p>
              {audioUrl && <div className="mt-4 rounded-xl border border-slate-200 p-3 bg-slate-50"><p className="text-sm font-semibold text-slate-800 mb-2">선택된 파일</p><audio controls src={audioUrl} className="w-full" /></div>}
              <button onClick={handleUpload} disabled={!file || loading || c_id} className={`w-full mt-4 px-4 py-3 rounded-xl font-semibold text-white transition ${!file || loading || c_id ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {loading ? '업로드 중...' : c_id ? '업로드 완료' : '파일 업로드'}
              </button>
            </div>
          </div>

          {/* Step 2 */}
          {c_id && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold inline-flex items-center justify-center shadow-sm shadow-blue-200">2</span>
                <span className="text-sm font-semibold text-slate-800">음성 인식 처리</span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-4 py-4">
                <p className="text-sm text-slate-600 mb-4">음성을 텍스트로 변환하고 화자를 분리합니다.</p>
                <button onClick={handleSTT} disabled={sttLoading || sttResult} className={`w-full px-4 py-3 rounded-xl font-semibold text-white transition ${sttLoading || sttResult ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  {sttLoading ? 'STT 처리 중...' : sttResult ? 'STT 완료' : 'STT 시작'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {sttResult && speakers.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold inline-flex items-center justify-center shadow-sm shadow-blue-200">3</span>
                <span className="text-sm font-semibold text-slate-800">분석할 화자 선택</span>
              </div>
              <div className="space-y-3">
                {speakers.map(sp => (
                  <button key={sp} onClick={() => setSelectedSpeaker(sp)}
                    className={`w-full text-left px-4 py-4 rounded-xl border-2 transition ${selectedSpeaker === sp ? 'bg-white text-sky-900 border-sky-300 shadow-md shadow-sky-100 ring-2 ring-offset-1 ring-offset-white ring-sky-100' : 'bg-white border-slate-200 hover:border-sky-200 hover:shadow-md'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold px-2 py-1 rounded bg-blue-100 text-blue-700">화자 {sp}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{previews[sp]}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Analyze Button */}
          {selectedSpeaker && (
            <div className="pt-2">
              <button onClick={handleAnalyze} className="w-full px-4 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 text-white font-bold text-base shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-blue-200 active:translate-y-0 transition duration-150">
                분석 시작
              </button>
            </div>
          )}

          {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default CommunicationStart;
