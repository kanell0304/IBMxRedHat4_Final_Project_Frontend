import React from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneFrame from '../Layout/PhoneFrame';
import { useAuth } from '../../hooks/useAuth';

const PresentationInformation = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  
  const infoItems = [
    { icon: '🎤', title: '발표 녹음/업로드', desc: '직접 녹음하거나 파일을 업로드해서 분석해요.' },
    { icon: '⏱️', title: '발표 시간 관리', desc: '설정한 목표 시간 대비 실제 발표 시간을 체크해요.' },
    { icon: '📈', title: 'AI 심층 분석', desc: '발음 정확도, 속도, 휴지 구간 등을 상세히 분석해요.' },
    { icon: '💡', title: '맞춤형 피드백', desc: '발표 습관 개선을 위한 구체적인 조언을 제공해요.' },
  ];

  if (!loading && !isAuthenticated) {
    return (
      <PhoneFrame title="발표 분석">
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
    <PhoneFrame title="발표 분석">
      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-slate-100 shadow-sm p-5 space-y-2">
          <p className="text-[12px] font-semibold text-blue-600/80 uppercase tracking-[0.16em]">
            Presentation Analysis
          </p>
          <p className="text-sm text-gray-600">
            AI가 당신의 발표를 분석해드려요.<br/>녹음 파일을 올리고 즉각적인 피드백을 받아보세요.
          </p>
        </div>

        <div className="rounded-3xl bg-white shadow-sm p-5 space-y-2 border border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-blue-600">Guide</span>
            <h2 className="text-lg font-semibold text-gray-900">서비스 안내</h2>
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
          <h3 className="text-base font-semibold text-gray-900">준비 되셨나요?</h3>
          <p className="text-sm text-gray-600">
            아래 버튼을 눌러 새로운 발표 분석을 시작해보세요.
          </p>
          <button
            type="button"
            onClick={() => navigate('/presentation/create')}
            className="w-full rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white py-3 font-semibold shadow-[0_8px_20px_rgba(37,99,235,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(37,99,235,0.3)]"
          >
            발표 분석 시작하기
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
};

export default PresentationInformation;
