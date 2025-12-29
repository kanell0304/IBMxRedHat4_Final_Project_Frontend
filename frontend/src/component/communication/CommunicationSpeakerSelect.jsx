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
      try {
        await api.post(`/communication/${c_id}/stt`);
        const { data } = await api.get(`/communication/${c_id}`);
        const words = data?.stt_results?.[0]?.json_data?.results?.[0]?.alternatives?.[0]?.words || [];
        const map = {};
        const firstAppearance = {};

        words.forEach((w, idx) => {
          const sp = w.speakerLabel || '1';
          if (!map[sp]) {
            map[sp] = { speaker: sp, firstUtterance: '', wordCount: 0 };
            firstAppearance[sp] = idx;
          }
          map[sp].wordCount++;
        });

        Object.keys(firstAppearance).forEach(sp => {
          const startIdx = firstAppearance[sp];
          const utteranceWords = [];
          for (let i = startIdx; i < words.length; i++) {
            const currentSpeaker = words[i].speakerLabel || '1';
            if (currentSpeaker === sp) utteranceWords.push(words[i].word || '');
            else break;
          }
          map[sp].firstUtterance = utteranceWords.join(' ');
        });

        setSpeakers(Object.values(map).sort((a, b) => a.speaker - b.speaker));
        setStatus('ready');
      } catch (e) {
        console.error(e);
        // Handle error appropriately
      }
    })();
  }, [c_id]);

  const analyze = async () => {
    setStatus('analyzing');
    const { data } = await api.post(`/communication/${c_id}/analyze`, null, { params: { target_speaker: sel } });
    if (data.c_result_id) nav(`/communication/result/${c_id}`);
  };

  if (status !== 'ready') return (
    <PhoneFrame title="대화 분석">
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {status === 'stt' ? '음성 인식 처리 중...' : '분석 중입니다...'}
        </h3>
        <p className="text-sm text-gray-500">
          {status === 'stt' ? '잠시만 기다려주세요.' : '대화 내용을 분석하고 있습니다.'}
        </p>
      </div>
    </PhoneFrame>
  );

  return (
    <PhoneFrame title="대화 분석" showTitleRow={true}>
      <div className="flex flex-col justify-between min-h-[624px] -mb-6">
        <div className="space-y-8">
          {/* Header */}
          <div className="px-1 pt-2">
            <p className="text-xs font-bold text-gray-500 mb-1">대화 분석 서비스</p>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight mb-4">화자 선택</h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              여러 명의 화자가 인식됐어요.<br />
              분석을 원하는 화자를 선택해주세요.
            </p>
          </div>

          {/* Speaker Grid */}
          {speakers.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100">
              <p className="text-gray-400">감지된 화자가 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 px-2">
              {speakers.map(s => {
                const isSelected = sel === s.speaker;
                return (
                  <button 
                    key={s.speaker} 
                    onClick={() => setSel(s.speaker)}
                    className="flex flex-col items-center text-center group"
                  >
                    {/* Icon Circle */}
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-all duration-300 shadow-sm ${isSelected ? 'bg-blue-400 text-white scale-110 shadow-blue-200' : 'bg-gray-300 text-white group-hover:bg-gray-400'}`}>
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    
                    {/* Info */}
                    <div className="space-y-1">
                      <p className={`text-sm font-bold ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                        {s.wordCount} 단어
                      </p>
                      <p className="text-sm text-gray-800 font-medium line-clamp-2 px-1 break-keep leading-snug">
                        {s.firstUtterance}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Sticky Bottom Button */}
        <div className="sticky bottom-0 left-0 right-0 p-4 -mx-4 bg-white border-t border-gray-50">
          <button 
            onClick={analyze} 
            disabled={!sel}
            className="w-full max-w-[340px] mx-auto block py-4 rounded-full bg-blue-500 text-white font-bold text-lg shadow-xl shadow-blue-200 active:scale-95 transition-transform disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
          >
            피드백 받기
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}