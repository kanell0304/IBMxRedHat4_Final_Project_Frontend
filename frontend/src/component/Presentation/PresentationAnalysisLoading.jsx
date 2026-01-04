import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import PhoneFrame from '../Layout/PhoneFrame';

export default function PresentationAnalysisLoading() {
  const navigate = useNavigate();
  const { prId } = useParams();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState({ text: '음성 파일 처리 중' });
  const [hasSkipped, setHasSkipped] = useState(false);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.st-each.com';

  const steps = [
    { percent: 15, text: '음성 파일 처리 중' },
    { percent: 30, text: '음성을 분석 중' },
    { percent: 50, text: 'AI가 감정을 분석 중' },
    { percent: 70, text: '결과를 점수화하는 중' },
    { percent: 90, text: '종합 피드백 생성 중' },
  ];

  // 진행도 바 애니메이션
  useEffect(() => {
    let currentStepIndex = 0;
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + 1, 95);

        // 단계 업데이트
        while (currentStepIndex < steps.length - 1 && next >= steps[currentStepIndex + 1].percent) {
          currentStepIndex++;
        }
        setCurrentStep(steps[currentStepIndex]);

        return next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  // 백엔드 분석 완료 대기
  useEffect(() => {
    const checkAnalysisComplete = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const pollInterval = setInterval(async () => {
        try {
          const response = await axios.get(
            `${API_BASE}/presentations/${prId}`,
            { withCredentials: true }
          );

          // feedbacks 데이터가 있으면 분석 완료
          if (response.data.success && response.data.data.feedbacks && response.data.data.feedbacks.length > 0) {
            clearInterval(pollInterval);
            
            if (!hasSkipped) {
              setProgress(100);
              setTimeout(() => {
                navigate(`/presentation/result/${prId}`, { replace: true });
              }, 1000);
            }
          }
        } catch (error) {
          console.error('분석 상태 확인 오류:', error);
        }
      }, 3000);

      return () => clearInterval(pollInterval);
    };

    checkAnalysisComplete();
  }, [prId, navigate, hasSkipped, API_BASE]);

  const handleSkip = () => {
    setHasSkipped(true);
    navigate('/history');
  };

  return (
    <PhoneFrame title="분석 중" contentClass="p-4 pb-6 bg-gradient-to-b from-blue-50 via-white to-indigo-50/40">
      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-slate-100 shadow-sm p-5 space-y-2 text-center">
          <p className="text-[12px] font-semibold text-blue-600/80 uppercase tracking-[0.16em]">
            Analyzing
          </p>
          <h1 className="text-lg font-semibold text-gray-900">발표 분석 중</h1>
          <p className="text-sm text-gray-600">AI가 당신의 발표를 분석하고 있습니다</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="space-y-8">
            <div className="text-center space-y-5">
              <div className="flex justify-center">
                <div className="relative w-14 h-14">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50"></div>
                  <div className="absolute inset-0 rounded-full border-[3px] border-blue-500 border-t-transparent animate-spin"></div>
                </div>
              </div>
            </div>
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
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-6 space-y-3">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  {progress >= step.percent ? (
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${progress >= step.percent ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                    {step.text}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-center py-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">예상 소요 시간:</span> 약 1-2분
              </p>
            </div>
            <button
              onClick={handleSkip}
              className="w-full py-4 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow"
            >
              나중에 확인하기 →
            </button>

            <p className="text-center text-xs text-gray-500 pt-2">
              완료되면 기록 탭에서 결과를 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
