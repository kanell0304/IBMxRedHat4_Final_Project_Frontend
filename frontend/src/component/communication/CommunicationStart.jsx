import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import PhoneFrame from '../Layout/PhoneFrame';

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
    <PhoneFrame title="말투 분석" showTitleRow={true}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="px-1">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">새로운 분석 시작</h1>
          <p className="text-sm text-gray-500 mt-1">통화 녹음 파일을 업로드하여 분석합니다.</p>
        </div>

        {/* Step 1: File Upload */}
        <div className="bg-white rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">1. 파일 선택</h2>
            {file && <span className="text-blue-500 text-xl">✓</span>}
          </div>
          
          {!file ? (
            <label className="flex flex-col items-center justify-center w-full h-32 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 transition cursor-pointer group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <span className="text-3xl text-gray-300 group-hover:text-blue-500 transition mb-2">+</span>
                <p className="text-sm text-gray-500">터치하여 파일 업로드</p>
                <p className="text-xs text-gray-400 mt-1">MP3, M4A, WAV</p>
              </div>
              <input type="file" accept="audio/*" onChange={handleFile} className="hidden" />
            </label>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50 border border-blue-100">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">♪</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-blue-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button onClick={() => { setFile(null); setAudioUrl(''); }} className="text-gray-400 hover:text-red-500 px-2">✕</button>
              </div>
              {audioUrl && <audio controls src={audioUrl} className="w-full h-8" />}
              <button 
                onClick={handleUpload} 
                disabled={loading || c_id} 
                className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all ${c_id ? 'bg-green-500 text-white' : 'bg-blue-600 text-white active:scale-[0.98] shadow-lg shadow-blue-200'}`}
              >
                {loading ? '업로드 중...' : c_id ? '업로드 완료' : '파일 업로드'}
              </button>
            </div>
          )}
        </div>

        {/* Step 2: STT Processing */}
        {c_id && (
          <div className="bg-white rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">2. 음성 분석</h2>
              {sttResult && <span className="text-blue-500 text-xl">✓</span>}
            </div>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">화자를 분리하고 텍스트로 변환합니다.</p>
            <button 
              onClick={handleSTT} 
              disabled={sttLoading || sttResult} 
              className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all ${sttResult ? 'bg-green-500 text-white' : 'bg-gray-900 text-white active:scale-[0.98]'}`}
            >
              {sttLoading ? '분석 중...' : sttResult ? '분석 완료' : '음성 분석 시작'}
            </button>
          </div>
        )}

        {/* Step 3: Speaker Selection */}
        {sttResult && speakers.length > 0 && (
          <div className="bg-white rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 animate-fade-in-up">
            <h2 className="text-base font-semibold text-gray-900 mb-4">3. 화자 선택</h2>
            <div className="space-y-3">
              {speakers.map(sp => (
                <button 
                  key={sp} 
                  onClick={() => setSelectedSpeaker(sp)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${selectedSpeaker === sp ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${selectedSpeaker === sp ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                      Speaker {sp}
                    </span>
                    {selectedSpeaker === sp && <span className="text-blue-600 text-sm">●</span>}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{previews[sp]}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Final Action */}
        {selectedSpeaker && (
          <div className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent -mx-4">
            <button 
              onClick={handleAnalyze} 
              className="w-full max-w-[340px] mx-auto block py-4 rounded-full bg-blue-600 text-white font-bold text-lg shadow-xl shadow-blue-200 active:scale-95 transition-transform"
            >
              결과 보기 →
            </button>
          </div>
        )}
        
        {/* Spacer for fixed button */}
        {selectedSpeaker && <div className="h-20" />}

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-medium text-center animate-shake">
            {error}
          </div>
        )}
      </div>
    </PhoneFrame>
  );
};

export default CommunicationStart;
