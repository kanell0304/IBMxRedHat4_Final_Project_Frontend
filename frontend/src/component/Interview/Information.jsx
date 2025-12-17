import React from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneFrame from '../Layout/PhoneFrame';

const Information = () => {
  const navigate = useNavigate();
  const infoItems = [
    { icon: '📝', title: '가상 면접 환경', desc: '실제 면접 질문을 기반으로 자동 생성된 인터뷰입니다.' },
    { icon: '🎤', title: '음성 기반 분석', desc: '말투·속도·표현·비표준어·논리 흐름 등을 분석합니다.' },
    { icon: '📊', title: '즉시 리포트 제공', desc: '답변 후 평가와 개선점이 담긴 리포트를 제공합니다.' },
    { icon: '📌', title: '시작 전 체크', desc: '조용한 환경에서 마이크 연결을 확인해주세요.' },
  ];

  return (
    <PhoneFrame title="모의 면접">
      <div className="space-y-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-500">모의 면접</p>
          <h1 className="text-2xl font-extrabold text-gray-900">AI 서비스 개발자</h1>
          <p className="text-sm text-gray-600">시작 전에 안내를 확인하세요.</p>
        </div>

        <div className="rounded-3xl bg-white shadow-sm p-6 space-y-3 border border-slate-100">
          <h2 className="text-lg font-semibold text-gray-900">진행 안내</h2>
          <div className="divide-y divide-slate-100">
            {infoItems.map((item) => (
              <div key={item.title} className="py-3 flex items-start gap-3">
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
          <h3 className="text-base font-semibold text-gray-900">준비가 끝났나요?</h3>
          <p className="text-sm text-gray-600">아래 버튼을 누르면 바로 질문 구성을 시작해요.</p>
          <button
            type="button"
            onClick={() => navigate('/interview/job')}
            className="w-full rounded-2xl bg-blue-600 text-white py-3 font-semibold shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            모의면접 시작하기
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
};

export default Information;
