import React from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneFrame from '../Layout/PhoneFrame';
import { useAuth } from '../../hooks/useAuth';

const Information = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const infoItems = [
    { icon: '📝', title: '가상 면접 환경', desc: '실제 면접 질문을 토대로 준비되어 있어요.' },
    { icon: '🎤', title: '음성 기반 분석', desc: '톤·속도·표현·논리 흐름까지 바로 분석해요.' },
    { icon: '📊', title: '즉시 리포트 제공', desc: '답변 직후 평가와 개선 포인트를 바로 보여드려요.' },
    { icon: '📌', title: '시작 전 체크', desc: '정확한 분석을 위해 조용한 공간에서 진행해 주세요.' },
  ];

  if (!loading && !isAuthenticated) {
    return (
      <PhoneFrame title="모의 면접">
        <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 rounded-3xl mx-4 p-6">
          <div className="text-center space-y-4">
            <p className="text-red-500 font-semibold text-lg">로그인이 필요한 서비스입니다.</p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full rounded-xl bg-blue-600 text-white py-3 font-semibold shadow-sm hover:bg-blue-700 transition"
              >
                로그인 하러 가기
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full rounded-xl bg-white text-gray-700 py-3 font-semibold border border-gray-200 hover:border-blue-200 transition"
              >
                메인으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame title="모의 면접">
      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-slate-100 shadow-sm p-5 space-y-2">
          <p className="text-[12px] font-semibold text-blue-600/80 uppercase tracking-[0.16em]">
            Mock Interview
          </p>
          <p className="text-sm text-gray-600">
            시작 전에 안내를 확인하세요.<br/>질문 유형과 직무만 선택하면 바로 시작할 수 있어요.
          </p>
        </div>

        <div className="rounded-3xl bg-white shadow-sm p-5 space-y-2 border border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-blue-600">Guide</span>
            <h2 className="text-lg font-semibold text-gray-900">진행 안내</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {infoItems.map((item) => (
              <div key={item.title} className="py-3.5 flex items-start gap-3">
                <span className="text-lg leading-tight">{item.icon}</span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="text-[13px] leading-snug text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white shadow-sm p-6 space-y-3 border border-slate-100">
          <h3 className="text-base font-semibold text-gray-900">이제 언어를 선택하고 시작하세요!</h3>
          <p className="text-sm text-gray-600">
            한국어/영어 중 원하는 언어를 선택해 시작하세요.<br/> 영어 면접은 공통 질문만 제공돼요.
          </p>
          <button
            type="button"
            onClick={() => navigate('/interview/job')}
            className="w-full rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white py-3 font-semibold shadow-[0_8px_20px_rgba(37,99,235,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(37,99,235,0.3)]"
          >
            한국어 면접 시작
          </button>
          <button
            type="button"
            onClick={() => navigate('/interview/job-en')}
            className="w-full rounded-2xl bg-white text-blue-700 py-3 font-semibold shadow-[0_6px_16px_rgba(59,130,246,0.15)] border border-blue-100 transition hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(59,130,246,0.2)] hover:border-blue-200"
          >
            영어 면접 시작
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
};

export default Information;
