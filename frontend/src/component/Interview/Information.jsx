import React from 'react';
import { useNavigate } from 'react-router-dom';

const Information = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <div className="min-h-screen w-full max-w-3xl mx-auto bg-gray-100 px-4 md:px-6 py-8 space-y-6">
        <header className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-lg"
          >
            ←
          </button>
          <div>
            <p className="text-xs font-semibold text-gray-500">모의 면접</p>
            <h1 className="text-xl font-bold text-gray-900">AI 서비스 개발자</h1>
            <p className="text-sm text-gray-500 mt-1">시작 전에 안내를 확인하세요.</p>
          </div>
        </header>

        <div className="rounded-3xl bg-white shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">진행 안내</h2>
          <ul className="space-y-4 text-sm text-gray-600">
            <li>
              <div className="font-semibold text-gray-900">📝 가상 면접 환경</div>
              <p className="mt-1">실제 면접 질문을 기반으로 자동 생성된 인터뷰입니다.</p>
            </li>
            <li>
              <div className="font-semibold text-gray-900">🎤 음성 기반 분석</div>
              <p className="mt-1">말투·속도·표현·비표준어·논리 흐름 등을 분석합니다.</p>
            </li>
            <li>
              <div className="font-semibold text-gray-900">📊 즉시 리포트 제공</div>
              <p className="mt-1">답변 후 평가와 개선점이 담긴 리포트를 제공합니다.</p>
            </li>
            <li>
              <div className="font-semibold text-gray-900">📌 시작 전 체크</div>
              <p className="mt-1">조용한 환경에서 마이크 연결을 확인해주세요.</p>
            </li>
          </ul>
        </div>

        <div className="rounded-3xl bg-white shadow-sm p-6 space-y-3">
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
    </div>
  );
};

export default Information;
