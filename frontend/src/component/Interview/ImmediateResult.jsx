import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getImmediateResult } from '../../api/interviewSessionApi';
import PhoneFrame from '../Layout/PhoneFrame';

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
      <PhoneFrame title="한눈에 보기">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">결과를 불러오는 중...</p>
          </div>
        </div>
      </PhoneFrame>
    );
  }

  if (error || !result) {
    return (
      <PhoneFrame title="한눈에 보기">
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
                  <h2 className="text-2xl font-bold text-gray-900">결과를 불러올 수 없습니다</h2>
                  <p className="text-sm text-gray-600">{error || '분석 결과가 아직 준비되지 않았습니다.'}</p>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={() => navigate('/interview/job')}
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                  >
                    다시 시작
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg"
                  >
                    메인으로
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PhoneFrame>
    );
  }

  const { overall_report, question_details, similar_hint } = result;

  const isEnglish = overall_report && 'comments' in overall_report;

  // 전체 평균 점수 계산
  const averageScore = question_details && question_details.length > 0
    ? Math.round(question_details.reduce((sum, q) => sum + (q.score || 0), 0) / question_details.length)
    : 0;

  return (
    <PhoneFrame title={isEnglish ? 'Quick Summary' : '한눈에 보기'}>
      <div className="space-y-6">

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

        {/* 전체 점수 대시보드 */}
        <div className="bg-blue-500 rounded-2xl shadow-lg p-8 text-white">
          <div className="text-center space-y-4">
            <p className="text-blue-100 text-sm font-semibold">전체 평균</p>
            <div className="text-7xl font-black">
              {isEnglish
                ? (overall_report.score || averageScore)
                : (overall_report?.content_overall?.score || averageScore)
              }
              <span className="text-4xl">점</span>
            </div>
            <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
              <span className="text-lg font-bold">
                {isEnglish
                  ? overall_report.grade
                  : (overall_report?.content_overall?.grade || '평가 중')
                }
              </span>
            </div>
          </div>
        </div>

        {/* 질문별 스코어카드 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </span>
            질문별 점수
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {question_details && question_details.length > 0 ? (
              question_details.map((q, idx) => (
                <ScoreCard key={idx} question={q} />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">평가 데이터가 없습니다.</p>
            )}
          </div>
        </div>

        {/* 상세 결과 보기 버튼 */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
          <div className="text-center space-y-3">
            <p className="text-gray-700 font-medium">더 자세한 분석이 궁금하신가요?</p>
            <button
              onClick={() => navigate(`/interview/result/${interviewId}`)}
              className="w-full py-4 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              상세 분석 리포트 보기
            </button>
          </div>
        </div>

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
    </PhoneFrame>
  );
};


// 스코어카드 컴포넌트 - 확장 불가, 점수/배지만 표시
const ScoreCard = ({ question }) => {
  return (
    <div className="group relative flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200 hover:shadow-md transition">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold text-sm flex items-center justify-center flex-shrink-0">
          Q{question.q_index}
        </div>
        <span className="font-medium text-gray-900 text-sm truncate">
          {question.q_text}
        </span>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {/* 점수 표시 */}
        {question.score !== undefined && (
          <div className="text-right">
            <span className="text-2xl font-bold text-blue-600">{question.score}</span>
            <span className="text-sm text-gray-500">점</span>
          </div>
        )}

        {/* 적절성 배지 */}
        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
          question.is_appropriate
            ? 'bg-green-100 text-green-700'
            : 'bg-orange-100 text-orange-700'
        }`}>
          {question.is_appropriate ? '✓ 적절' : '보완'}
        </span>
      </div>

      {/* 툴팁 - 전체 카드에 hover 시 표시 */}
      <div className="invisible group-hover:visible absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-2 bg-slate-700 text-white text-xs rounded-lg z-10 shadow-lg pointer-events-none whitespace-nowrap">
        <div className="text-center">
          질문 의도에 {question.is_appropriate ? '부합' : '미흡'}
        </div>
      </div>
    </div>
  );
};

export default ImmediateResult;
