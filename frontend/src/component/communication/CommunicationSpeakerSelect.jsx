import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import PhoneFrame from '../Layout/PhoneFrame';

export default function CommunicationSpeakerSelect() {
  const nav = useNavigate(), { c_id } = useParams();
  const [status, setStatus] = useState('stt'); // 'stt' | 'ready' | 'analyzing'
  const [speakers, setSpeakers] = useState([]);
  const [sel, setSel] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState({ text: '' });

  const sttSteps = [
    { percent: 20, text: '음성 파일 처리 중' },
    { percent: 40, text: '화자 분리 중' },
    { percent: 70, text: '음성 인식 중' },
    { percent: 90, text: '텍스트 변환 중' }
  ];

  const analysisSteps = [
    { percent: 25, text: '대화 내용 분석 중' },
    { percent: 50, text: 'BERT 모델 분석 중' },
    { percent: 75, text: 'LLM 피드백 생성 중' },
    { percent: 90, text: '최종 리포트 작성 중' }
  ];

  useEffect(() => {
    if (status === 'ready') return;

    const steps = status === 'stt' ? sttSteps : analysisSteps;
    let currentStepIndex = 0;
    setProgress(0);
    setCurrentStep(steps[0]);

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + 1, 95);
        while (currentStepIndex < steps.length - 1 && next >= steps[currentStepIndex + 1].percent) {
          currentStepIndex++;
        }
        setCurrentStep(steps[currentStepIndex]);
        return next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [status]);

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
        setProgress(100);
        setStatus('ready');
      } catch (e) {
        console.error(e);
      }
    })();
  }, [c_id]);

  const analyze = async () => {
    setStatus('analyzing');
    const { data } = await api.post(`/communication/${c_id}/analyze`, null, { params: { target_speaker: sel } });
    setProgress(100);
    if (data.c_result_id) nav(`/communication/result/${c_id}`);
  };

  if (status !== 'ready') {
    const steps = status === 'stt' ? sttSteps : analysisSteps;
    return (
      <PhoneFrame title="대화 분석">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-full max-w-md space-y-8">
            {/* 스피너 */}
            <div className="flex justify-center">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
              </div>
            </div>

            {/* 제목 */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {status === 'stt' ? '음성 인식 처리 중' : '분석 중입니다'}
              </h3>
              <p className="text-sm text-gray-600">
                {status === 'stt' ? 'AI가 대화 내용을 분석하고 있습니다.' : '대화 내용을 종합 분석하고 있습니다.'}
              </p>
            </div>

            {/* 프로그레스 바 */}
            <div className="space-y-3">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 font-medium">{currentStep.text}</span>
                <span className="text-gray-500">{progress}%</span>
              </div>
            </div>

            {/* 단계 리스트 */}
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-5 space-y-3">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  {progress >= step.percent ? (
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${progress >= step.percent ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                    {step.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PhoneFrame>
    );
  }

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