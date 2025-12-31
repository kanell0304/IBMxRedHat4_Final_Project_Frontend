import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getInterviewResults } from '../../api/interviewSessionApi';
import PhoneFrame from '../Layout/PhoneFrame';

const InterviewResultEnglish = () => {

    const {interviewId}=useParams();
    const navigate=useNavigate();

    const [results, setResults]=useState(null);
    const [loading, setLoading]=useState(true);
    const [error, setError]=useState(null);

    useEffect(()=>{
        const fetchResults=async()=>{
            try{
                setLoading(true);
                const data=await getInterviewResults(interviewId);
                setResults(data);
            } catch(err){
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (interviewId){
            fetchResults();
        }
        }, [interviewId]);

        if (loading){
            return(
                <PhoneFrame title="English Interview Results">
                    <div className='flex items-center justify-center py-20'>
                        <div className='text-center'>
                            <div className='animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4' />
                            <p className='text-gray-600'>Loading results...</p>
                        </div>
                    </div>
                </PhoneFrame>
            );
        }

        if (error || !results || !Array.isArray(results) || results.length === 0){
            return (
                <PhoneFrame title="English Interview Results">
                    <div className="flex items-center justify-center py-8">
                        <div className="w-full">
                            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
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
                                            Unable to load results
                                        </h2>
                                        <p className="text-sm text-gray-600">
                                            {error || 'Interview results not found.'}
                                        </p>
                                    </div>

                                    <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-4">
                                        <div className="space-y-2 text-xs text-gray-700">
                                            <div className="flex items-start gap-2">
                                                <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <span className="text-blue-600 text-[10px] font-bold">1</span>
                                                </div>
                                                <p className="text-left">Analysis may still be in progress.</p>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <span className="text-blue-600 text-[10px] font-bold">2</span>
                                                </div>
                                                <p className="text-left">Please check your network connection.</p>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <span className="text-blue-600 text-[10px] font-bold">3</span>
                                                </div>
                                                <p className="text-left">Try checking your history later.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 pt-2">
                                        <button
                                            onClick={() => navigate('/interview/job-en')}
                                            className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                                        >
                                            Try Again
                                        </button>
                                        <button
                                            onClick={() => navigate('/')}
                                            className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                        >
                                            Go to Main
                                        </button>
                                    </div>

                                    <p className="text-[10px] text-gray-500 pt-1">
                                        If the problem persists, please check your history or contact support.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </PhoneFrame>
            );
        }

        const overallResult=results.find((r)=>r.scope==='overall')?.report;

        return (
             <PhoneFrame title="English Interview Results">
      <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 -mx-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 pr-3">
            <h1 className="text-lg font-bold text-gray-900">Interview Results</h1>
            <p className="text-xs text-gray-500 mt-0.5">AI 기반 종합 분석</p>
          </div>
          <button
            onClick={() => navigate('/history')}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition whitespace-nowrap"
          >
            기록으로
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="py-2">
        {overallResult && (
          <EnglishResultSummary report={overallResult} />
        )}
      </div>
    </div>
    </PhoneFrame>
  );
};


const EnglishResultSummary = ({ report }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
        <h3 className="text-sm font-medium text-blue-900 mb-4">Overall Performance</h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Grade - Letter */}
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center mb-2">
              <div className="w-24 h-24 rounded-full bg-blue-100 border-4 border-blue-500 flex items-center justify-center">
                <span className="text-3xl font-bold text-blue-600">{report.grade || 'B'}</span>
              </div>
            </div>
            <div className="text-xs font-medium text-gray-600">Grade</div>
          </div>

          {/* Score - Progress Circle */}
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center mb-2">
              <svg className="w-24 h-24" viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  stroke="#dbeafe"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  stroke="#3b82f6"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray="276.46"
                  strokeDashoffset={276.46 * (1 - (report.score || 0) / 100)}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 leading-none">{report.score || 0}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">/ 100</div>
                </div>
              </div>
            </div>
            <div className="text-xs font-medium text-gray-600">Score</div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
        <h2 className="text-base font-bold text-green-900 mb-3">총평</h2>
        <div className="space-y-2">
          {Array.isArray(report.comments)
            ? report.comments.map((comment, idx) => (
                <p key={idx} className="text-gray-700 text-sm leading-relaxed">
                  • {comment}
                </p>
              ))
            : <p className="text-gray-700 text-sm">{report.comments || '총평이 없습니다.'}</p>
          }
        </div>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5">
        <h2 className="text-base font-bold text-amber-900 mb-3">개선사항</h2>
        <div className="space-y-2">
          {Array.isArray(report.improvements)
            ? report.improvements.map((improvement, idx) => (
                <p key={idx} className="text-gray-700 text-sm leading-relaxed">
                  • {improvement}
                </p>
              ))
            : <p className="text-gray-700 text-sm">{report.improvements || '개선사항이 없습니다.'}</p>
          }
        </div>
      </div>

      {report.stt_metrics && (
        <STTMetricsCard metrics={report.stt_metrics} />
      )}
    </div>
  );
};

// STT Metrics 카드
const STTMetricsCard = ({ metrics }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Speech Metrics</h2>

      <div className="space-y-3">
        {/* Speech Rate */}
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-blue-900">Speech Rate</h3>
                <p className="text-xs text-gray-600">분당 단어 수</p>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-blue-600">{metrics.speech_rate || 0}</span>
              <span className="text-sm font-medium text-gray-500">WPM</span>
            </div>
          </div>
        </div>

        {/* Pause Ratio */}
        <div className="bg-yellow-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-yellow-900">Pause Ratio</h3>
                <p className="text-xs text-gray-600">전체 중 침묵 비율</p>
              </div>
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-bold text-yellow-600">{((metrics.pause_ratio || 0) * 100).toFixed(1)}</span>
              <span className="text-lg font-medium text-gray-500">%</span>
            </div>
          </div>
        </div>

        {/* Fillers */}
        {metrics.filler && (
          <div className="bg-red-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-semibold text-red-900">Fillers</h3>
                  <p className="text-xs text-gray-600">추임새 사용 횟수</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">{metrics.filler.hard || 0}</p>
                  <p className="text-xs text-gray-500">Hard</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-600">{metrics.filler.soft || 0}</p>
                  <p className="text-xs text-gray-500">Soft</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewResultEnglish;
