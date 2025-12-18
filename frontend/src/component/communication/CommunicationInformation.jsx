import React from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneFrame from '../Layout/PhoneFrame';

const CommunicationInformation = () => {
  const navigate = useNavigate();

  return (
    <PhoneFrame title="대화 분석">
      <div className="space-y-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-500">대화 분석</p>
          <h1 className="text-2xl font-extrabold text-gray-900">AI 대화 분석 서비스</h1>
          <p className="text-sm text-gray-600">시작 전에 안내를 확인하세요.</p>
        </div>

        <div className="rounded-3xl bg-white shadow-sm p-6 space-y-3 border border-slate-100">
          <h2 className="text-lg font-semibold text-gray-900">진행 안내</h2>
          <div className="divide-y divide-slate-100">
            <div className="py-3 flex items-start gap-3">
              <span className="text-lg leading-tight">🎙️</span>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-900">대화 녹음 분석</p>
                <p className="text-[13px] leading-snug text-gray-600">실제 대화 녹음 파일을 업로드하여 분석합니다.</p>
              </div>
            </div>
            <div className="py-3 flex items-start gap-3">
              <span className="text-lg leading-tight">👥</span>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-900">화자 자동 감지</p>
                <p className="text-[13px] leading-snug text-gray-600">AI가 대화 속 화자를 자동으로 구분하고, 분석 대상을 선택할 수 있습니다.</p>
              </div>
            </div>
            <div className="py-3 flex items-start gap-3">
              <span className="text-lg leading-tight">📊</span>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-900">종합 분석 리포트</p>
                <p className="text-[13px] leading-snug text-gray-600">말투·속도·명료도·표준어 사용 등을 종합적으로 분석합니다.</p>
              </div>
            </div>
            <div className="py-3 flex items-start gap-3">
              <span className="text-lg leading-tight">💡</span>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-900">개선 방안 제시</p>
                <p className="text-[13px] leading-snug text-gray-600">분석 결과와 함께 구체적인 개선 방안을 제공합니다.</p>
              </div>
            </div>
            <div className="py-3 flex items-start gap-3">
              <span className="text-lg leading-tight">📌</span>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-900">시작 전 체크</p>
                <p className="text-[13px] leading-snug text-gray-600">음질이 좋고 배경 소음이 적은 녹음 파일을 준비해주세요.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white shadow-sm p-6 space-y-3 border border-slate-100">
          <h3 className="text-base font-semibold text-gray-900">준비가 끝났나요?</h3>
          <p className="text-sm text-gray-600">아래 버튼을 누르면 바로 파일 업로드를 시작해요.</p>
          <button
            type="button"
            onClick={() => navigate('/communication/upload')}
            className="w-full rounded-2xl bg-blue-600 text-white py-3 font-semibold shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            대화 분석 시작하기
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
};

export default CommunicationInformation;
