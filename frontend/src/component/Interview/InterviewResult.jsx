import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getInterviewResults } from '../../api/interviewSessionApi';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const calculateOverallQuality = (report) => {
  const scores = [
    report.non_standard?.score || 0,
    report.filler_words?.score || 0,
    report.discourse_clarity?.score || 0,
    report.content_overall?.score || 0
  ];
  return Math.round(scores.reduce((acc, score) => acc + score, 0) / scores.length);
};

const InterviewResult = () => {

    const {interviewId}=useParams();
    const navigate=useNavigate();

    const [results, setResults]=useState(null);
    const [loading, setLoading]=useState(true);
    const [error, setError]=useState(null);
    const [activeTab, setActiveTab]=useState('overall');

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
                        <p className='text-gray-600'>결과를 불러오는 중...</p>
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
                                {/* 아이콘 */}
                                <div className="flex justify-center">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
                                        <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold text-gray-900">
                                        결과를 불러올 수 없습니다.
                                    </h2>
                                    <p className="text-gray-600">
                                        {error || '면접 결과를 찾을 수 없습니다.'}
                                    </p>
                                </div>

                                <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-6">
                                    <div className="space-y-3 text-sm text-gray-700">
                                        <div className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <span className="text-blue-600 text-xs font-bold">1</span>
                                            </div>
                                            <p className="text-left">분석이 아직 완료되지 않았을 수 있습니다.</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <span className="text-blue-600 text-xs font-bold">2</span>
                                            </div>
                                            <p className="text-left">네트워크 연결 상태를 확인해주세요.</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <span className="text-blue-600 text-xs font-bold">3</span>
                                            </div>
                                            <p className="text-left">잠시 후 히스토리에서 다시 확인해주세요.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <button
                                        onClick={() => navigate('/interview/job')}
                                        className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                                    >
                                        다시 시도
                                    </button>
                                    <button
                                        onClick={() => navigate('/')}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        메인으로 이동
                                    </button>
                                </div>

                                <p className="text-xs text-gray-500 pt-2">
                                    문제가 계속되면 히스토리 페이지에서 결과를 확인하거나 고객센터에 문의해주세요.
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
            <h1 className="text-2xl font-bold text-gray-900">면접 결과</h1>
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

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('overall')}
              className={`px-6 py-3 font-semibold border-b-2 transition ${
                activeTab === 'overall'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              전체 평가
            </button>
            <button
              onClick={() => setActiveTab('per_question')}
              className={`px-6 py-3 font-semibold border-b-2 transition ${
                activeTab === 'per_question'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              질문별 평가
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {activeTab === 'overall' && overallResult && (
          <OverallSummary report={overallResult} />
        )}

        {activeTab === 'per_question' && overallResult && (
          <PerQuestionList report={overallResult} />
        )}
      </div>
    </div>
  );
};

// OverallSummary 컴포넌트
const OverallSummary = ({ report }) => {
  const radarData = [
    { subject: '언어 정확성', score: report.non_standard?.score || 0, fullMark: 100 },
    { subject: '발화 간결성', score: report.filler_words?.score || 0, fullMark: 100 },
    { subject: '구조 명확성', score: report.discourse_clarity?.score || 0, fullMark: 100 },
    { subject: '내용 적절성', score: report.content_overall?.score || 0, fullMark: 100 },
    { subject: '전반적 품질', score: calculateOverallQuality(report), fullMark: 100 }
  ];

  return (
    <div className="space-y-6">
      {/* 종합 코멘트 */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-blue-900 mb-3">총평</h2>
        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
          {report.overall_comment}
        </p>
      </div>

      {/* 오각형 레이더 차트 */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">종합 역량 분석</h2>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: '#9ca3af', fontSize: 11 }}
            />
            <Radar
              name="점수"
              dataKey="score"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
          {radarData.map((item, idx) => (
            <div key={idx} className="text-center">
              <p className="text-xs text-gray-500">{item.subject}</p>
              <p className="text-lg font-bold text-blue-600">{item.score}점</p>
            </div>
          ))}
        </div>
      </div>

      <AnalysisCard
        title="언어 정확성"
        data={report.non_standard}
        color="red"
      />

      <AnalysisCard
        title="발화 간결성"
        data={report.filler_words}
        color="yellow"
      />

      <AnalysisCard
        title="구조 명확성"
        data={report.discourse_clarity}
        color="green"
      />

      {/* 내용 적절성 */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">내용 적절성</h3>
          <div className="flex items-center gap-3">
            {report.content_overall?.grade && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                {report.content_overall.grade}
              </span>
            )}
            <div className="text-3xl font-bold text-blue-600">
              {report.content_overall?.score || 0}점
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {report.content_overall?.strengths && report.content_overall.strengths.length > 0 && (
            <div>
              <h4 className="font-semibold text-green-700 mb-2">잘한 점</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {report.content_overall.strengths.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {report.content_overall?.weaknesses && report.content_overall.weaknesses.length > 0 && (
            <div>
              <h4 className="font-semibold text-orange-700 mb-2">부족한 점</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {report.content_overall.weaknesses.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {report.content_overall?.summary && (
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <p className="text-sm text-gray-800 leading-relaxed">
                {report.content_overall.summary}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
        );
    };


    //AnanlysisCard 컴포넌트
    const AnalysisCard=({title, data, color})=>{
        const colorClasses={
            red: 'bg-red-50 border-red-200 text-red-900',
            yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
            green: 'bg-green-50 border-green-200 text-green-900',
        };

        return (
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <div className="flex items-center gap-3">
                        {data?.grade && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                                {data.grade}
                            </span>
                        )}
                        <div className="text-3xl font-bold text-blue-600">{data?.score || 0}점</div>
                    </div>
                </div>

                {data?.detected_examples && data.detected_examples.length > 0 && (
                    <div className={`rounded-lg p-4 mb-4 border ${colorClasses[color]}`}>
                        <h4 className="font-semibold mb-2">발견된 예시</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            {data.detected_examples.map((example, idx) => (
                                <li key={idx}>"{example}"</li>
                            ))}
                            </ul>
                        </div>
                    )}

                    <div className="space-y-3 text-sm text-gray-700">
                        {data?.reason && (
                            <div>
                                <span className="font-semibold text-gray-900">평가 이유:</span>
                                <p className="mt-1">{data.reason}</p>
                            </div>
                        )}

                        {data?.improvement && (
                            <div>
                                <span className="font-semibold text-gray-900">개선 방법:</span>
                                <p className="mt-1">{data.improvement}</p>
                            </div>
                        )}
                    </div>

                    {data?.revised_examples && data.revised_examples.length > 0 && (
                        <div className="mt-4 bg-blue-50 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-900 mb-2">개선 예시</h4>
                            <div className="space-y-2">
                                {data.revised_examples.map((item, idx) => (
                                    <div key={idx} className="text-sm">
                                        <div className="text-red-700">❌ {item.original}</div>
                                        <div className="text-green-700">✅ {item.revised}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        )}
                    </div>
                    );
                };


// PerQuestionList 컴포넌트
const PerQuestionList = ({ report }) => {
  if (!report.content_per_question || report.content_per_question.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 text-center">
        <p className="text-gray-500">질문별 평가 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {report.content_per_question.map((question, idx) => (
        <PerQuestionCard key={idx} data={question} />
      ))}
    </div>
  );
};

// PerQuestionCard 컴포넌트
const PerQuestionCard = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center">
            Q{data.q_index}
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{data.q_text}</h3>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {data.is_appropriate !== undefined && (
            <div className="group relative">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                data.is_appropriate
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {data.is_appropriate ? '적절' : '개선필요'}
              </span>
              <div className="invisible group-hover:visible absolute right-0 top-full mt-1 w-48 bg-gray-800 text-white text-xs rounded-lg p-2 z-10 shadow-lg">
                질문 의도에 {data.is_appropriate ? '부합' : '미흡'}
              </div>
            </div>
          )}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="px-6 pb-6 pt-2 border-t border-gray-100 space-y-4">
          {data.user_answer && (
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-semibold text-gray-900 mb-2 text-xs">내 답변</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{data.user_answer}</p>
            </div>
          )}

          {data.comment && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">평가</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{data.comment}</p>
            </div>
          )}

          {data.suggestion && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">개선 제안</h4>
              <p className="text-sm text-gray-800 leading-relaxed">{data.suggestion}</p>
            </div>
          )}

          {data.evidence_sentences && data.evidence_sentences.length > 0 && (
            <div className="bg-red-50 rounded-lg p-3">
              <h4 className="font-semibold text-red-700 mb-2 text-xs">문제가 된 표현</h4>
              <ul className="space-y-1">
                {data.evidence_sentences.map((sent, idx) => (
                  <li key={idx} className="text-sm text-gray-700">• {sent}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InterviewResult;