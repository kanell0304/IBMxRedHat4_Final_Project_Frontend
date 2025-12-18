import React from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneFrame from '../Layout/PhoneFrame';

const CommunicationInformation = () => {
  const navigate = useNavigate();
  const guideItems = [
    { icon: '🎙️', title: '대화 녹음 분석', desc: '실제 대화 녹음 파일을 업로드하여 분석합니다.' },
    { icon: '👥', title: '화자 자동 감지', desc: '화자를 구분하고 분석 대상을 선택할 수 있어요.' },
    { icon: '📊', title: '종합 리포트', desc: '말투·속도·명료도 사용을 한눈에 확인합니다.' },
    { icon: '💡', title: '개선 가이드', desc: '바로 적용할 수 있는 개선 팁을 제시합니다.' },
    { icon: '📌', title: '시작 전 체크', desc: '배경 소음이 적은 녹음 파일을 준비해주세요.' },
  ];

  return (
    <PhoneFrame title="대화 분석" contentClass="p-5 pb-7 bg-gradient-to-b from-slate-50 via-white to-indigo-50/40">
      <div className="space-y-5">
        <div className="rounded-3xl bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-slate-100 shadow-sm p-5 space-y-2">
          <p className="text-[12px] font-semibold text-blue-600/80 uppercase tracking-[0.16em]">
            Communication
          </p>
          <h1 className="text-lg font-semibold text-gray-900">AI 대화 분석 서비스</h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            녹음 파일을 올리면 화자 분리부터 개선 포인트까지<br />한 번에 리포트로 받아보세요.
          </p>
        </div>

        <div className="rounded-3xl bg-white shadow-sm p-5 space-y-3 border border-slate-100">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            진행 안내
          </div>
          <div className="divide-y divide-slate-100">
            {guideItems.map((item) => (
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
          <h3 className="text-base font-semibold text-gray-900">준비가 끝났나요?</h3>
          <p className="text-sm text-gray-600">아래 버튼을 눌러 바로 파일 업로드를 시작하세요!</p>
          <button
            type="button"
            onClick={() => navigate('/communication/upload')}
            className="w-full rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white py-3 font-semibold shadow-[0_10px_24px_rgba(37,99,235,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(37,99,235,0.3)]"
          >
            대화 분석 시작하기
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
};

export default CommunicationInformation;
