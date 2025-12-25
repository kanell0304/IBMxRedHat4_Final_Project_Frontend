import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useRecorder from './useRecorder.js';
import { createAnswerRow, uploadAndAnalyze } from './../../api/interviewSessionApi';
import Waveform from './Waveform.jsx';
import AnalysisLoading from './AnalysisLoading.jsx';
import PhoneFrame from '../Layout/PhoneFrame.jsx';

const InterviewEnglish = () => {

  const location=useLocation();
  const navigate=useNavigate();

  const {interviewId, questions=[]}=location.state || {};

  const [currentQuestionIndex, setCurrentQuestionIndex]=useState(0);
  const [answers, setAnswer]=useState([])
  const [uploadStatus, setUploadStatus]=useState('idle') //idle, uploading, analyzing, done, error
  const [error, setError]=useState(null);
  const [showExitModal, setShowExitModal]=useState(false);
  const [preparingCountdown, setPreparingCountdown]=useState(10)
  const [showAnalysisLoading, setShowAnalysisLoading]=useState(false)

  // record hook
  const {
    isRecording,
    recordingTime,
    audioBlob,
    audioUrl,
    audioData,
    startRecording,
    stopRecording,
    resetRecording,
    formatTime,
  }=useRecorder();


  // 데이터 검증
  useEffect(()=>{
    if (!interviewId || !questions.length){
      alert('Interview information is missing. Please start again.');
      navigate('/interview/job-en');
    }
  }, [interviewId, questions, navigate]);


  // 뒤로가기/새로고침 방지
  useEffect(()=>{
    const handleBeforeUnload=(e)=>{
      e.preventDefault();
      e.returnValue='';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return ()=> window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // 10초 자동 카운트다운 시작
  useEffect(()=>{
    if (preparingCountdown > 0 && !isRecording && !audioBlob) {
      const timer = setTimeout(() => {
        setPreparingCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (preparingCountdown === 0 && !isRecording && !audioBlob) {
      // 카운트다운 종료 시 자동 녹음 시작
      setTimeout(() => {
        startRecording();
        setPreparingCountdown(null);
      }, 1000);
    }
  }, [preparingCountdown, isRecording, audioBlob, startRecording]);

  const currentQuestion=questions[currentQuestionIndex];
  const totalQuestions=questions.length;
  const progress=((currentQuestionIndex+1)/totalQuestions)*100;

  // Skip 카운트다운
  const handleSkipCountdown = () => {
    setPreparingCountdown(null);
    startRecording();
  };

  const MIN_RECORDING_TIME=5;

  // 녹음 시간 유효 확인
  const isRecordingValid=recordingTime>=MIN_RECORDING_TIME;

  const handleStopRecording=()=>{
    if(recordingTime<MIN_RECORDING_TIME){
      setError(`Recording is too short. Please record at least ${MIN_RECORDING_TIME} seconds.`);
      return;
    }

    stopRecording();
  };

  // 백그라운드 업로드
  const handleBackgroundUpload = async () => {
    if (!audioBlob) return;

    const isLastQuestion = currentQuestionIndex >= totalQuestions - 1;

    try {
      // 1. 답변 row 생성
      const answerRow = await createAnswerRow(
        interviewId,
        currentQuestion.q_id,
        currentQuestion.q_order,
      );

      // 2. 백그라운드 업로드 시작
      uploadAndAnalyze(answerRow.i_answer_id, audioBlob).catch((err) => {
        console.error('Background upload failed:', err);
      });

      // 3. answer_id 저장
      setAnswer((prev) => [...prev, answerRow.i_answer_id]);

      // 4. 바로 다음 질문으로 넘어감
      if (!isLastQuestion) {
        setTimeout(() => {
          setCurrentQuestionIndex((prev) => prev + 1);
          resetRecording();
          setUploadStatus('idle');
          setPreparingCountdown(10);
        }, 500);
      } else {
        // 마지막 질문: 로딩 화면 표시
        setShowAnalysisLoading(true);
      }
    } catch (err) {
      console.error('Answer processing failed:', err);
      setError(err.message);
      setUploadStatus('error');
    }
  };

  // audioBlob 생성 완료 시 백그라운드 업로드
  useEffect(()=>{
    if (audioBlob && !isRecording && uploadStatus === 'idle') {
      handleBackgroundUpload();
    }
  }, [audioBlob, isRecording, uploadStatus]);



  // 나가기
  const handleExit=()=>{
    setShowExitModal(true);
  };

  const confirmExit=()=>{
    navigate('/');
  };

  if (!interviewId || !questions.length){
    return null;
  }

  // 로딩 화면 표시
  if (showAnalysisLoading) {
    return <AnalysisLoading interviewId={interviewId} />;
  }

  return (
    <PhoneFrame title="English Interview" contentClass="p-4 pb-8 bg-gradient-to-b from-blue-50 via-white to-indigo-50/40">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExit}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-700 flex items-center justify-center shadow-sm hover:bg-gray-50 transition"
            aria-label="Exit"
          >
            ←
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600/80">
              Mock Interview
            </p>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">
              Question {currentQuestionIndex + 1} / {totalQuestions}
            </h1>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-3">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 via-indigo-400 to-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold inline-flex items-center justify-center">
              Q{currentQuestionIndex + 1}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 leading-relaxed">
                {currentQuestion.question_text}
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                Please answer for at least {MIN_RECORDING_TIME} seconds.
              </p>
            </div>
          </div>
        </div>

        {/* Recorder Panel */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
          {/* 10초 준비 카운트다운 */}
          {preparingCountdown !== null && (
            <div className="text-center py-16 space-y-6">
              <div className="text-9xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent mb-4">
                {preparingCountdown}
              </div>
              <div className="space-y-2">
                <p className="text-xl text-gray-800 font-bold">Preparation Time</p>
                <p className="text-sm text-gray-600">
                  Read the question and prepare your answer.
                </p>
              </div>
              <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 via-indigo-500 to-blue-600 transition-all duration-1000 ease-linear"
                  style={{ width: `${((10 - preparingCountdown) / 10) * 100}%` }}
                />
              </div>
              <button
                onClick={handleSkipCountdown}
                className="mt-6 px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow"
              >
                Skip →
              </button>
            </div>
          )}

          {/* 녹음 중 */}
          {preparingCountdown === null && isRecording && (
            <div className="space-y-6">
              {/* 상단 - REC 표시와 타이머 */}
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-lg font-mono font-bold text-gray-800">
                    REC {formatTime(recordingTime)}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Min <span className="font-semibold text-gray-800">{MIN_RECORDING_TIME}s</span>
                </div>
              </div>

              {/* 중앙 - 파형 (크게) */}
              <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 rounded-2xl p-6 shadow-inner">
                <Waveform audioData={audioData} height={140} />
              </div>

              {/* 하단 - 정지 버튼 */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleStopRecording}
                  disabled={recordingTime < MIN_RECORDING_TIME}
                  className="group px-16 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  <span className="flex items-center gap-3">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"/>
                    </svg>
                    Finish Answer
                  </span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700 font-medium mb-2">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-xs text-red-600 underline hover:text-red-800"
            >
              Close
            </button>
          </div>
        )}

        {/* Exit Modal */}
        {showExitModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Exit the interview?</h3>
              <p className="text-sm text-gray-600 mb-6">Your progress may not be saved.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExitModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmExit}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                >
                  Exit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PhoneFrame>
  );
};

export default InterviewEnglish;
