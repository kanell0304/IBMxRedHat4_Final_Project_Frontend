import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getInterviewResults } from '../../api/interviewSessionApi';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import PhoneFrame from '../Layout/PhoneFrame';

const calculateAnswerCompleteness = (report) => {
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
                <PhoneFrame title="AI 답변 전달력 분석">
                    <div className='flex items-center justify-center py-20'>
                        <div className='text-center'>
                            <div className='animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4' />
                            <p className='text-gray-600'>결과를 불러오는 중...</p>
                        </div>
                    </div>
                </PhoneFrame>
            );
        }

        if (error || !results || !Array.isArray(results) || results.length === 0){
            return (
                <PhoneFrame title="AI 답변 전달력 분석">
                    <div className="flex items-center justify-center py-8">
                        <div className="w-full">
                            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
                                <div className="text-center space-y-6">
                                    {/* 아이콘 */}
                                    <div className="flex justify-center">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
                                            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            결과를 불러올 수 없습니다.
                                        </h2>
                                        <p className="text-sm text-gray-600">
                                            {error || '면접 결과를 찾을 수 없습니다.'}
                                        </p>
                                    </div>

                                    <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-4">
                                        <div className="space-y-2 text-xs text-gray-700">
                                            <div className="flex items-start gap-2">
                                                <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <span className="text-blue-600 text-[10px] font-bold">1</span>
                                                </div>
                                                <p className="text-left">분석이 아직 완료되지 않았을 수 있습니다.</p>
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
                                                <p className="text-left">잠시 후 히스토리에서 다시 확인해주세요.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 pt-2">
                                        <button
                                            onClick={() => navigate('/interview/job')}
                                            className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                                        >
                                            다시 시도
                                        </button>
                                        <button
                                            onClick={() => navigate('/')}
                                            className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                        >
                                            메인으로 이동
                                        </button>
                                    </div>

                                    <p className="text-[10px] text-gray-500 pt-1">
                                        문제가 계속되면 기록 페이지에서 결과를 확인하거나 고객센터에 문의해주세요.
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
             <PhoneFrame title="AI 답변 전달력 분석">
      <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 -mx-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900">답변 전달력 종합 분석</h2>
            <p className="text-xs text-gray-500 mt-0.5">AI 기반 종합 분석 결과입니다</p>
          </div>
          <button
            onClick={() => navigate('/history')}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
          >
            기록으로
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 -mx-4">
        <div className="px-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('overall')}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
                activeTab === 'overall'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              전체 평가
            </button>
            <button
              onClick={() => setActiveTab('per_question')}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
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
      <div className="py-2">
        {activeTab === 'overall' && overallResult && (
          <OverallSummary report={overallResult} />
        )}

        {activeTab === 'per_question' && overallResult && (
          <PerQuestionList report={overallResult} />
        )}
      </div>
    </div>
    </PhoneFrame>
  );
};

// OverallSummary 컴포넌트
const OverallSummary = ({ report }) => {
  const [activeTab, setActiveTab] = useState('analysis');

  const radarData = [
    { subject: '언어 정확성', fullName: '언어 정확성', score: report.non_standard?.score || 0, fullMark: 100 },
    { subject: '발화 간결성', fullName: '발화 간결성', score: report.filler_words?.score || 0, fullMark: 100 },
    { subject: '구조 명확성', fullName: '구조 명확성', score: report.discourse_clarity?.score || 0, fullMark: 100 },
    { subject: '내용 적절성', fullName: '내용 적절성', score: report.content_overall?.score || 0, fullMark: 100 },
    { subject: '답변 완성도', fullName: '답변 완성도', score: calculateAnswerCompleteness(report), fullMark: 100 }
  ];

  const avgScore = Math.round(radarData.reduce((acc, item) => acc + item.score, 0) / radarData.length);
  const gradeMap = {
    A: { min: 90, max: 100 },
    B: { min: 80, max: 89 },
    C: { min: 70, max: 79 },
    D: { min: 60, max: 69 },
    F: { min: 0, max: 59 }
  };
  const grade = Object.keys(gradeMap).find(g => avgScore >= gradeMap[g].min && avgScore <= gradeMap[g].max) || 'F';

  return (
    <div className="space-y-6">
      {/* Overall Performance */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
        <h3 className="text-sm font-medium text-blue-900 mb-4">Overall Performance</h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Grade */}
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center mb-2">
              <div className="w-24 h-24 rounded-full bg-blue-100 border-4 border-blue-500 flex items-center justify-center">
                <span className="text-3xl font-bold text-blue-600">{grade}</span>
              </div>
            </div>
            <div className="text-xs font-medium text-gray-600">Grade</div>
          </div>

          {/* Score */}
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
                  strokeDashoffset={276.46 * (1 - avgScore / 100)}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 leading-none">{avgScore}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">/ 100</div>
                </div>
              </div>
            </div>
            <div className="text-xs font-medium text-gray-600">Score</div>
          </div>
        </div>
      </div>

      {/* 종합 역량 분석 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-base font-bold text-gray-900 mb-4">종합 역량 분석</h2>
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#374151', fontSize: 10, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: '#9ca3af', fontSize: 10 }}
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
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex gap-1 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('comment')}
          className={`flex-1 py-2.5 text-xs font-semibold transition-all ${
            activeTab === 'comment'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          총평
        </button>
        <button
          onClick={() => setActiveTab('language')}
          className={`flex-1 py-2.5 text-xs font-semibold transition-all ${
            activeTab === 'language'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          언어
        </button>
        <button
          onClick={() => setActiveTab('filler')}
          className={`flex-1 py-2.5 text-xs font-semibold transition-all ${
            activeTab === 'filler'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          발화
        </button>
        <button
          onClick={() => setActiveTab('structure')}
          className={`flex-1 py-2.5 text-xs font-semibold transition-all ${
            activeTab === 'structure'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          구조
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 py-2.5 text-xs font-semibold transition-all ${
            activeTab === 'content'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          내용
        </button>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="mt-4">
        {activeTab === 'comment' && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
            <h2 className="text-base font-bold text-green-900 mb-3">총평</h2>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {report.overall_comment}
            </p>
          </div>
        )}

        {activeTab === 'language' && (
          <AnalysisCard
            title="언어 정확성"
            data={report.non_standard}
            color="red"
          />
        )}

        {activeTab === 'filler' && (
          <AnalysisCard
            title="발화 간결성"
            data={report.filler_words}
            color="yellow"
          />
        )}

        {activeTab === 'structure' && (
          <AnalysisCard
            title="구조 명확성"
            data={report.discourse_clarity}
            color="green"
          />
        )}

        {activeTab === 'content' && (
          <ContentAnalysis title="내용 적절성" data={report.content_overall} />
        )}
      </div>
    </div>
        );
    };

// ContentAnalysis 컴포넌트
const ContentAnalysis = ({ title, data }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        <div className="flex items-center gap-3">
          {data?.grade && (
            <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
              {data.grade}
            </span>
          )}
          <div className="text-3xl font-bold text-blue-600">
            {data?.score || 0}<span className="text-xl text-gray-500">점</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {data?.strengths && data.strengths.length > 0 && (
          <div>
            <h4 className="font-semibold text-green-700 mb-2 text-sm">잘한 점</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              {data.strengths.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {data?.weaknesses && data.weaknesses.length > 0 && (
          <div>
            <h4 className="font-semibold text-orange-700 mb-2 text-sm">부족한 점</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              {data.weaknesses.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {data?.summary && (
          <div className="bg-gray-50 rounded-lg p-3 mt-3">
            <p className="text-sm text-gray-800 leading-relaxed">
              {data.summary}
            </p>
          </div>
        )}
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
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-gray-900">{title}</h3>
                    <div className="flex items-center gap-3">
                        {data?.grade && (
                            <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                                {data.grade}
                            </span>
                        )}
                        <div className="text-3xl font-bold text-blue-600">{data?.score || 0}<span className="text-xl text-gray-500">점</span></div>
                    </div>
                </div>

                {data?.detected_examples && data.detected_examples.length > 0 && (
                    <div className={`rounded-lg p-3 mb-3 border ${colorClasses[color]}`}>
                        <h4 className="font-semibold mb-2 text-sm">발견된 예시</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            {data.detected_examples.map((example, idx) => (
                                <li key={idx}>"{example}"</li>
                            ))}
                            </ul>
                        </div>
                    )}

                    <div className="space-y-2 text-sm text-gray-700">
                        {data?.reason && (
                            <div>
                                <span className="font-semibold text-gray-900 text-sm">평가 이유:</span>
                                <p className="mt-1">{data.reason}</p>
                            </div>
                        )}

                        {data?.improvement && (
                            <div>
                                <span className="font-semibold text-gray-900 text-sm">개선 방법:</span>
                                <p className="mt-1">{data.improvement}</p>
                            </div>
                        )}
                    </div>

                    {data?.revised_examples && data.revised_examples.length > 0 && (
                        <div className="mt-3 bg-blue-50 rounded-lg p-3">
                            <h4 className="font-semibold text-blue-900 mb-2 text-sm">개선 예시</h4>
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
        <div className="flex items-center gap-4 flex-1">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center">
            Q{data.q_index}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              {data.is_appropriate !== undefined && (
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                  data.is_appropriate
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {data.is_appropriate ? '✓ 적절' : '보완'}
                </span>
              )}
            </div>
          </div>
        </div>
        <svg
          className={`w-6 h-6 text-gray-400 transition-transform flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="px-6 pb-6 pt-2 border-t border-gray-100 space-y-4">
          {/* 질문 텍스트 */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <h4 className="font-semibold text-blue-900 mb-2 text-sm">질문</h4>
            <p className="text-gray-800 text-sm leading-relaxed">{data.q_text}</p>
          </div>

          {data.user_answer && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">내 답변</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{data.user_answer}</p>
            </div>
          )}

          {data.comment && (
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">평가</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{data.comment}</p>
            </div>
          )}

          {data.suggestion && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2 text-sm">개선 제안</h4>
              <p className="text-sm text-gray-800 leading-relaxed">{data.suggestion}</p>
            </div>
          )}

          {data.evidence_sentences && data.evidence_sentences.length > 0 && (
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 border border-red-200">
              <h4 className="font-semibold text-red-700 mb-2 text-sm">문제가 된 표현</h4>
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