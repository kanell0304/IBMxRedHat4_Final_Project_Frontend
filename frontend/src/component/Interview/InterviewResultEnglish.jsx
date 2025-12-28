import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getInterviewResults } from '../../api/interviewSessionApi';

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
                <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
                    <div className='text-center'>
                        <div className='animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4' />
                        <p className='text-gray-600'>Loading results...</p>
                    </div>
                </div>
            );
        }

        if (error || !results || !Array.isArray(results) || results.length === 0){
            return (
                <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl">
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-12">
                            <div className="text-center space-y-6">
                                <div className="flex justify-center">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
                                        <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold text-gray-900">
                                        Unable to load results
                                    </h2>
                                    <p className="text-gray-600">
                                        {error || 'Interview results not found.'}
                                    </p>
                                </div>

                                <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-6">
                                    <div className="space-y-3 text-sm text-gray-700">
                                        <div className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <span className="text-blue-600 text-xs font-bold">1</span>
                                            </div>
                                            <p className="text-left">Analysis may still be in progress.</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <span className="text-blue-600 text-xs font-bold">2</span>
                                            </div>
                                            <p className="text-left">Please check your network connection.</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <span className="text-blue-600 text-xs font-bold">3</span>
                                            </div>
                                            <p className="text-left">Try checking your history later.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <button
                                        onClick={() => navigate('/interview/job-en')}
                                        className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                                    >
                                        Try Again
                                    </button>
                                    <button
                                        onClick={() => navigate('/')}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        Go to Main
                                    </button>
                                </div>

                                <p className="text-xs text-gray-500 pt-2">
                                    If the problem persists, please check your history or contact support.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        const overallResult=results.find((r)=>r.scope==='overall')?.report;

        return (
             <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">English Interview Results</h1>
            <p className="text-sm text-gray-500 mt-1">AI 기반 종합 분석 결과입니다.</p>
          </div>
          <button
            onClick={() => navigate('/history')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
          >
            기록으로
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {overallResult && (
          <EnglishResultSummary report={overallResult} />
        )}
      </div>
    </div>
  );
};


const EnglishResultSummary = ({ report }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-blue-900">Overall Score</h2>
          <div className="flex items-center gap-4">
            <span className="px-4 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-xl text-2xl font-black">
              {report.grade || 'B'}
            </span>
            <div className="text-5xl font-black text-blue-600">
              {report.score || 0}점
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-3">총평</h2>
        <div className="space-y-3">
          {Array.isArray(report.comments)
            ? report.comments.map((comment, idx) => (
                <p key={idx} className="text-gray-800 leading-relaxed">
                  • {comment}
                </p>
              ))
            : <p className="text-gray-800">{report.comments || '총평이 없습니다.'}</p>
          }
        </div>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-amber-900 mb-3">개선사항</h2>
        <div className="space-y-3">
          {Array.isArray(report.improvements)
            ? report.improvements.map((improvement, idx) => (
                <p key={idx} className="text-gray-800 leading-relaxed">
                  • {improvement}
                </p>
              ))
            : <p className="text-gray-800">{report.improvements || '개선사항이 없습니다.'}</p>
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Speech Rate */}
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className="text-sm font-semibold text-blue-900">Speech Rate</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {metrics.speech_rate || 0} <span className="text-sm font-normal">WPM</span>
          </p>
          <p className="text-xs text-gray-600 mt-1">분당 단어 수</p>
        </div>

        {/* Pause Ratio */}
        <div className="bg-yellow-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-sm font-semibold text-yellow-900">Pause Ratio</h3>
          </div>
          <p className="text-2xl font-bold text-yellow-600">
            {((metrics.pause_ratio || 0) * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-600 mt-1">전체 중 침묵 비율</p>
        </div>

        {/* Fillers */}
        {metrics.filler && (
          <div className="bg-red-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-semibold text-red-900">Fillers</h3>
            </div>
            <div className="flex gap-3">
              <div>
                <p className="text-lg font-bold text-red-600">{metrics.filler.hard || 0}</p>
                <p className="text-xs text-gray-600">Hard (uh, um)</p>
              </div>
              <div>
                <p className="text-lg font-bold text-orange-600">{metrics.filler.soft || 0}</p>
                <p className="text-xs text-gray-600">Soft (like, you know)</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewResultEnglish;
