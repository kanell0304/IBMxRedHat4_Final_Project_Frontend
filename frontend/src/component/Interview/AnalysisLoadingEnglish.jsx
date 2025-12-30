import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeFullInterview } from '../../api/interviewSessionApi';
import { useInterviewNotification } from './InterviewNotificationContext';



const AnalysisLoadingEnglish = ({ interviewId }) => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState({ text: 'Collecting answers' });
  const [hasSkipped, setHasSkipped] = useState(false);
  const [error, setError] = useState(null);

  const steps = [
    { percent: 15, text: 'Collecting answers' },
    { percent: 30, text: 'Analyzing speech quality' },
    { percent: 50, text: 'Analyzing content' },
    { percent: 70, text: 'Generating feedback' },
    { percent: 90, text: 'Creating final report' },
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

  // 실제 분석 실행
  useEffect(() => {
    const runAnalysis = async () => {
      try {
        await analyzeFullInterview(interviewId);

        // "나중에 보기"를 눌렀다면 navigate 하지 않음
        if (hasSkipped) {
          return;
        }

        // 분석 완료 - 100% 표시 후 영어 결과 페이지로 이동
        setProgress(100);
        setTimeout(() => {
          navigate(`/interview/english/result/${interviewId}`);
        }, 1000);
      } catch (err) {
        console.error('Analysis failed:', err);
        setError(err.message || 'Analysis failed');

      }
    };

    runAnalysis();
  }, [interviewId, navigate, hasSkipped]);

  const { registerPendingAnalysis } = useInterviewNotification();

  const handleSkip = () => {
    setHasSkipped(true);
    registerPendingAnalysis(interviewId);
    navigate('/');
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  // error
  if (error) {
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
              <div className="bg-blue-50 h-[694px] overflow-hidden">
                <div className="bg-white rounded-t-3xl rounded-b-3xl border border-gray-200 p-8 m-4">
                  <div className="text-center space-y-6">
                    <div className="flex justify-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
                        <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Analysis Failed
                      </h2>
                      <p className="text-sm text-gray-600">
                        {error}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-4">
                      <div className="space-y-2 text-xs text-gray-700">
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-blue-600 text-[10px] font-bold">1</span>
                          </div>
                          <p className="text-left">서버에 일시적인 문제가 발생했을 수 있습니다.</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-blue-600 text-[10px] font-bold">2</span>
                          </div>
                          <p className="text-left">네트워크 연결 상태를 확인해주세요.</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-blue-600 text-[10px] font-bold">3</span>
                          </div>
                          <p className="text-left">잠시 후 다시 시도해주세요.</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                      <button
                        onClick={handleRetry}
                        className="w-full py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm"
                      >
                        다시 시도
                      </button>
                      <button
                        onClick={handleGoHome}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
                      >
                        메인으로 이동
                      </button>
                    </div>

                    <p className="text-[10px] text-gray-500 pt-2">
                      문제가 계속되면 히스토리 페이지에서 결과를 확인하거나 고객센터에 문의해주세요.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <div className="bg-blue-50 h-[694px] overflow-hidden">
              {/* 메인 카드 */}
              <div className="bg-white rounded-t-3xl rounded-b-3xl border border-gray-200 p-8 m-4">
                <div className="space-y-8">
                  {/* 제목과 스피너 */}
                  <div className="text-center space-y-5">
                    <h2 className="text-xl font-bold text-gray-900">
                      Analyzing Interview Results
                    </h2>

                    {/* 로딩 */}
                    <div className="flex justify-center">
                      <div className="relative w-14 h-14">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50"></div>
                        <div className="absolute inset-0 rounded-full border-[3px] border-blue-500 border-t-transparent animate-spin"></div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600">
                      AI is comprehensively analyzing your answers.
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
                      <span className="font-semibold">Estimated time:</span> About 1-2 minutes
                    </p>
                  </div>

                  {/* 나중에 보기 버튼 */}
                  <button
                    onClick={handleSkip}
                    className="w-full py-4 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow"
                  >
                    Check later →
                  </button>

                  <p className="text-center text-xs text-gray-500 pt-2">
                    Results can be checked in the History tab.
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

export default AnalysisLoadingEnglish;
