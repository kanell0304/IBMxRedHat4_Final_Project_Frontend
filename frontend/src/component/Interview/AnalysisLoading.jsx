import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeFullInterview } from '../../api/interviewSessionApi';
import { useInterviewNotification } from './InterviewNotificationContext';



const AnalysisLoading = ({ interviewId }) => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState({ text: '답변 수집 중' });
  const [hasSkipped, setHasSkipped] = useState(false);

  const steps = [
    { percent: 15, text: '답변 수집 중' },
    { percent: 30, text: '음성 품질 분석 중' },
    { percent: 50, text: '답변 내용 분석 중' },
    { percent: 70, text: '피드백 생성 중' },
    { percent: 90, text: '최종 리포트 작성 중' },
  ];

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

  useEffect(() => {
    const runAnalysis = async () => {
      try {
        await analyzeFullInterview(interviewId);

        // Skip한 경우 notification이 처리하도록 함
        if (hasSkipped) {
          return;
        }

        // Skip 안 한 경우에만 직접 결과 페이지로 이동
        setProgress(100);
        setTimeout(() => {
          navigate(`/interview/immediate/${interviewId}`, { replace: true });
        }, 1000);
      } catch (err) {
        console.error('분석 실패:', err);
        if (!hasSkipped) {
          setTimeout(() => {
            navigate(`/interview/immediate/${interviewId}`, { replace: true });
          }, 2000);
        }
      }
    };

    runAnalysis();
  }, [interviewId, navigate, hasSkipped]);

  const { registerPendingAnalysis }=useInterviewNotification();

  const handleSkip = () => {
    setHasSkipped(true);
    registerPendingAnalysis(interviewId);
    navigate('/history');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md mx-auto">
        {/* Phone frame */}
        <div className="relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
          {/* Phone screen */}
          <div className="bg-blue-50 rounded-[2.5rem] overflow-hidden">
            {/* Notch */}
            <div className="bg-gray-900 h-6 rounded-b-3xl mx-auto w-40"></div>

            {/* Screen content */}
            <div className="bg-blue-50 h-[694px] overflow-y-auto scrollbar-hide">
              {/* 메인 카드 */}
              <div className="bg-white rounded-t-3xl rounded-b-3xl border border-gray-200 p-8 m-4 mb-8">
                <div className="space-y-8">
                  {/* 제목과 스피너 */}
                  <div className="text-center space-y-5">
                    <h2 className="text-xl font-bold text-gray-900">
                      면접 결과 분석 중
                    </h2>

                    {/* 로딩 */}
                    <div className="flex justify-center">
                      <div className="relative w-14 h-14">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50"></div>
                        <div className="absolute inset-0 rounded-full border-[3px] border-blue-500 border-t-transparent animate-spin"></div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600">
                      AI가 답변을 종합 분석하고 있습니다.
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

                  {/* 예상 시간 */}
                  <div className="text-center py-4 bg-blue-50 rounded-xl">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">예상 소요 시간:</span> 약 1-2분
                    </p>
                  </div>

                  {/* 나중에 보기 버튼 */}
                  <button
                    onClick={handleSkip}
                    className="w-full py-4 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow"
                  >
                    나중에 확인하기 →
                  </button>

                  <p className="text-center text-xs text-gray-500 pt-2">
                    완료되면 히스토리에서 결과를 확인할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisLoading;
