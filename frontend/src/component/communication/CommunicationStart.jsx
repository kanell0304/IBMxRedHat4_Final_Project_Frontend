import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadVoiceFile, processSTT } from './CommunicationAPI';

const CommunicationStart = () => {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [sttLoading, setSTTLoading] = useState(false);
  const [error, setError] = useState('');
  const [c_id, setC_id] = useState(null);
  const [sttResult, setSTTResult] = useState(null);
  const [selectedSpeaker, setSelectedSpeaker] = useState('');
  const [speakerPreviews, setSpeakerPreviews] = useState({});

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setError('');
    setC_id(null);
    setSTTResult(null);
    setSelectedSpeaker('');
    setSpeakerPreviews({});

    if (audioUrl) URL.revokeObjectURL(audioUrl);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
  };

  const handleUpload = async () => {
    if (!uploadedFile) {
      setError('녹음 파일을 선택해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await uploadVoiceFile(uploadedFile);
      setC_id(data.c_id);
      console.log('Upload success:', data);
    } catch (err) {
      console.error('Upload error', err?.response || err);
      setError(err?.message || '파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSTT = async () => {
    if (!c_id) {
      setError('먼저 파일을 업로드해주세요.');
      return;
    }

    try {
      setSTTLoading(true);
      setError('');
      const data = await processSTT(c_id);
      console.log('STT success:', data);

      // STT 결과에서 화자별 미리보기 생성
      const sttData = data.json_data || data;
      const previews = extractSpeakerPreviews(sttData);
      setSpeakerPreviews(previews);
      setSTTResult(data);
    } catch (err) {
      console.error('STT error', err?.response || err);
      setError(err?.message || 'STT 처리 중 오류가 발생했습니다.');
    } finally {
      setSTTLoading(false);
    }
  };

  const extractSpeakerPreviews = (sttData) => {
    const previews = {};

    if (!sttData?.results) return previews;

    sttData.results.forEach((result) => {
      if (!result.alternatives || !result.alternatives[0]?.words) return;

      const words = result.alternatives[0].words;
      words.forEach((wordInfo) => {
        const speaker = wordInfo.speakerLabel || '1';
        if (!previews[speaker]) {
          previews[speaker] = [];
        }
        previews[speaker].push(wordInfo.word);
      });
    });

    // 각 화자별로 앞부분 20단어만 추출
    Object.keys(previews).forEach((speaker) => {
      previews[speaker] = previews[speaker].slice(0, 20).join(' ') + '...';
    });

    return previews;
  };

  const handleAnalyze = () => {
    if (!selectedSpeaker) {
      setError('분석할 화자를 선택해주세요.');
      return;
    }

    navigate('/communication', {
      state: {
        c_id,
        target_speaker: selectedSpeaker,
      },
    });
  };

  const speakers = Object.keys(speakerPreviews).sort();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8 font-sans">
      <div className="w-full max-w-[420px] mx-auto bg-[#f8fafc] rounded-[28px] border border-slate-200 shadow-lg px-5 py-7 max-h-[844px] min-h-[720px] overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shadow-sm hover:bg-slate-200 transition"
            aria-label="뒤로가기"
          >
            ←
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600/80">Communication</p>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">말투 분석</h1>
            <p className="text-xs text-slate-500 mt-1">통화 녹음본을 업로드하고 분석할 화자를 선택하세요.</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Step 1: 파일 업로드 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold inline-flex items-center justify-center shadow-sm shadow-blue-200">
                1
              </span>
              <span className="text-sm font-semibold text-slate-800">녹음 파일 업로드</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-4 py-4">
              <label className="block w-full">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold hover:file:bg-slate-200 cursor-pointer"
                />
              </label>
              <p className="text-xs text-slate-500 mt-3">
                통화 녹음 파일을 선택하세요. (mp3, wav, m4a 등)
              </p>

              {audioUrl && (
                <div className="mt-4 rounded-xl border border-slate-200 p-3 bg-slate-50">
                  <p className="text-sm font-semibold text-slate-800 mb-2">선택된 파일</p>
                  <audio controls src={audioUrl} className="w-full" />
                </div>
              )}

              <button
                type="button"
                onClick={handleUpload}
                disabled={!uploadedFile || loading || c_id}
                className={`w-full mt-4 px-4 py-3 rounded-xl font-semibold text-white transition ${
                  !uploadedFile || loading || c_id
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? '업로드 중...' : c_id ? '업로드 완료' : '파일 업로드'}
              </button>
            </div>
          </div>

          {/* Step 2: STT 처리 */}
          {c_id && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold inline-flex items-center justify-center shadow-sm shadow-blue-200">
                  2
                </span>
                <span className="text-sm font-semibold text-slate-800">음성 인식 처리</span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-4 py-4">
                <p className="text-sm text-slate-600 mb-4">
                  음성을 텍스트로 변환하고 화자를 분리합니다.
                </p>
                <button
                  type="button"
                  onClick={handleSTT}
                  disabled={sttLoading || sttResult}
                  className={`w-full px-4 py-3 rounded-xl font-semibold text-white transition ${
                    sttLoading || sttResult
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {sttLoading ? 'STT 처리 중...' : sttResult ? 'STT 완료' : 'STT 시작'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: 화자 선택 */}
          {sttResult && speakers.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold inline-flex items-center justify-center shadow-sm shadow-blue-200">
                  3
                </span>
                <span className="text-sm font-semibold text-slate-800">분석할 화자 선택</span>
              </div>
              <div className="space-y-3">
                {speakers.map((speaker) => (
                  <button
                    key={speaker}
                    type="button"
                    onClick={() => setSelectedSpeaker(speaker)}
                    className={`w-full text-left px-4 py-4 rounded-xl border-2 transition ${
                      selectedSpeaker === speaker
                        ? 'bg-white text-sky-900 border-sky-300 shadow-md shadow-sky-100 ring-2 ring-offset-1 ring-offset-white ring-sky-100'
                        : 'bg-white border-slate-200 hover:border-sky-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold px-2 py-1 rounded bg-blue-100 text-blue-700">
                        화자 {speaker}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {speakerPreviews[speaker]}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 분석 시작 버튼 */}
          {selectedSpeaker && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleAnalyze}
                className="w-full px-4 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 text-white font-bold text-base shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-blue-200 active:translate-y-0 transition duration-150"
              >
                분석 시작
              </button>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500 font-semibold">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunicationStart;
