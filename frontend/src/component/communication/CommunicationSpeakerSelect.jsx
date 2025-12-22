import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import PhoneFrame from '../Layout/PhoneFrame';

export default function CommunicationSpeakerSelect() {
  const nav = useNavigate(), { c_id } = useParams();
  const [status, setStatus] = useState('stt'); // 'stt' | 'ready' | 'analyzing'
  const [speakers, setSpeakers] = useState([]);
  const [sel, setSel] = useState(null);

  useEffect(() => {
    (async () => {
      await api.post(`/communication/${c_id}/stt`);
      const { data } = await api.get(`/communication/${c_id}`);
      const words = data?.stt_results?.[0]?.json_data?.results?.[0]?.alternatives?.[0]?.words || [];
      const map = {};
      words.forEach(w => {
        const sp = w.speakerLabel || '1';
        if (!map[sp]) map[sp] = { speaker: sp, firstUtterance: w.word || '', wordCount: 0 };
        map[sp].wordCount++;
      });
      setSpeakers(Object.values(map).sort((a, b) => a.speaker - b.speaker));
      setStatus('ready');
    })();
  }, [c_id]);

  const analyze = async () => {
    setStatus('analyzing');
    const { data } = await api.post(`/communication/${c_id}/analyze`, null, { params: { target_speaker: sel } });
    if (data.c_result_id) nav(`/communication/result/${c_id}`);
  };

  if (status !== 'ready') return (
    <PhoneFrame title="대화 분석">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-sm font-semibold text-gray-900">
            {status === 'stt' ? '음성 인식 처리 중...' : '분석 중입니다...'}
          </p>
          <p className="text-[13px] text-gray-600 mt-2">
            {status === 'stt' ? '1-2분 정도 소요될 수 있습니다' : '대화 내용을 분석하고 있습니다. 잠시만 기다려주세요.'}
          </p>
        </div>
      </div>
    </PhoneFrame>
  );

  return (
    <PhoneFrame title="대화 분석">
      <div className="space-y-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-500">대화 분석</p>
          <h1 className="text-2xl font-extrabold text-gray-900">화자 선택</h1>
          <p className="text-sm text-gray-600">분석할 화자를 선택하세요</p>
        </div>
        <div className="rounded-3xl bg-white shadow-sm p-6 space-y-4 border border-slate-100">
          <h2 className="text-lg font-semibold text-gray-900">👥 감지된 화자 목록</h2>
          {speakers.length === 0 ? (
            <div className="text-center py-8"><p className="text-sm text-gray-600">화자를 감지하지 못했습니다.</p></div>
          ) : (
            <div className="space-y-3">
              {speakers.map(s => (
                <button key={s.speaker} onClick={() => setSel(s.speaker)}
                  className={`w-full rounded-2xl p-4 transition ${sel === s.speaker ? 'bg-blue-50 border-2 border-blue-600' : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-xl font-bold ${sel === s.speaker ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                      {s.speaker}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-gray-900">화자 {s.speaker}</h3>
                        {sel === s.speaker && <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full">선택됨</span>}
                      </div>
                      <p className="text-[13px] text-gray-600 mb-2">발화 단어 수: {s.wordCount}개</p>
                      <div className="bg-white rounded-lg p-2 border border-gray-200">
                        <p className="text-[11px] text-gray-600">첫 번째 발언</p>
                        <p className="text-[13px] text-gray-900">"{s.firstUtterance}..."</p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          <button onClick={analyze} disabled={!sel}
            className="w-full rounded-2xl bg-blue-600 text-white py-3 font-semibold shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:translate-y-0">
            분석 시작
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}