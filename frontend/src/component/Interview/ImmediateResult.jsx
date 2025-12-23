import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getImmediateResult } from '../../api/interviewSessionApi';

const ImmediateResult = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const data = await getImmediateResult(interviewId);
        setResult(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (interviewId) {
      fetchResult();
    }
  }, [interviewId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
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
                <h2 className="text-3xl font-bold text-gray-900">결과를 불러올 수 없습니다</h2>
                <p className="text-gray-600">{error || '분석 결과가 아직 준비되지 않았습니다.'}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={() => navigate('/interview/job')}
                  className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                >
                  다시 시작
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg"
                >
                  메인으로
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { overall_report, question_details, similar_hint } = result;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6 shadow-sm">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600/80">
            Mock Interview
          </p>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 mt-1">
            면접 결과 요약
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        
        {/* 유사 답변 힌트 (조건부 표시) */}
        {similar_hint && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-yellow-900 mb-1">💡 유사 답변 패턴 발견</h3>
                <p className="text-yellow-800 text-sm">{similar_hint.message}</p>
                <p className="text-yellow-600 text-xs mt-2">
                  유사도: {Math.round(similar_hint.similarity * 100)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 총평 요약 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            총평
          </h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {overall_report?.overall_comment || '총평이 준비 중입니다.'}
          </p>

          {/* 내용 적절성 요약 */}
          {overall_report?.content_overall && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl font-bold text-blue-600">
                  {overall_report.content_overall.score}점
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  {overall_report.content_overall.grade}
                </span>
              </div>
              <p className="text-gray-600 text-sm">{overall_report.content_overall.summary}</p>
            </div>
          )}
        </div>

        {/* 질문별 간단 피드백 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            질문별 평가
          </h2>

          <div className="space-y-4">
            {question_details && question_details.length > 0 ? (
              question_details.map((q, idx) => (
                <QuestionCard key={idx} question={q} />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">질문별 평가 데이터가 없습니다.</p>
            )}
          </div>
        </div>

        {/* 상세 결과 보기 버튼 */}
        <button
          onClick={() => navigate(`/interview/result/${interviewId}`)}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          상세 결과 보기 →
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/history')}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
          >
            히스토리
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
          >
            메인으로
          </button>
        </div>
      </div>
    </div>
  );
};


// 질문 카드 컴포넌트
const QuestionCard = ({ question }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm flex items-center justify-center">
            Q{question.q_index}
          </div>
          <span className="text-left font-medium text-gray-900 text-sm line-clamp-1">
            {question.q_text}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* 적절성 배지 */}
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            question.is_appropriate 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {question.is_appropriate ? '적절' : '개선필요'}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-3">
          {/* 사용자 답변 */}
          {question.user_answer && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-500 mb-1">내 답변</p>
              <p className="text-sm text-gray-700">{question.user_answer}</p>
            </div>
          )}

          {/* 질문 의도 */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">질문 의도</p>
            <p className="text-sm text-gray-700">{question.question_intent}</p>
          </div>

          {/* 피드백 */}
          {question.feedback && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-700 mb-1">피드백</p>
              <p className="text-sm text-gray-700">{question.feedback}</p>
            </div>
          )}

          {/* 증거 문장 */}
          {question.evidence_sentences && question.evidence_sentences.length > 0 && (
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-red-700 mb-1">주요 발견</p>
              <ul className="space-y-1">
                {question.evidence_sentences.map((sent, idx) => (
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

export default ImmediateResult;
