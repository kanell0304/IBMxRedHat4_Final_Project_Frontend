import React from 'react';
import { useNavigate } from 'react-router-dom';

const Information = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center py-10 px-4">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-black via-gray-900 to-black rounded-[30px] p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] border border-gray-900">
        {/* 베젤 하이라이트 & 사이드 버튼 느낌 */}
        <div className="pointer-events-none absolute inset-0 rounded-[30px] shadow-[inset_0_1px_4px_rgba(255,255,255,0.12)]" />
        <div className="pointer-events-none absolute right-0 top-16 h-8 w-1 rounded-l-full bg-gray-700/70" />
        <div className="pointer-events-none absolute left-0 top-24 h-6 w-1 rounded-r-full bg-gray-700/70" />

        <div className="bg-white rounded-[30px] overflow-hidden min-h-[680px] border border-slate-100">
          {/* 상단 상태바 */}
          <div className="relative px-5 pt-5 pb-2 text-[12px] text-gray-900">
            <div className="flex items-center justify-between">
              <span className="font-semibold tracking-tight text-[13px]">8:48</span>
              <div className="flex items-center gap-3 text-gray-800">
                <svg aria-hidden className="h-3.5 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M2 16c4-4 16-4 20 0" />
                  <path d="M5 16c3-3 11-3 14 0" />
                  <path d="M8 16c2-2 6-2 8 0" />
                </svg>
                <div className="flex items-center">
                  <div className="h-3.5 w-7 rounded-[6px] border-2 border-gray-900 flex items-center px-0.5">
                    <div className="h-2.5 flex-1 rounded-[4px] bg-gray-200" />
                  </div>
                  <div className="h-2.5 w-0.5 rounded-sm bg-gray-900 ml-0.5" />
                </div>
              </div>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 top-[14px] h-8 w-28 bg-black rounded-full z-20 shadow-[0_2px_10px_rgba(0,0,0,0.35)]" />
          </div>

          <div className="px-4 pb-5 max-h-[760px] overflow-y-auto space-y-5">
            <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100 mb-1">
              <div className="flex items-center h-11">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-10 h-10 flex items-center justify-center text-lg text-gray-600"
                  aria-label="뒤로"
                >
                  ←
                </button>
                <div className="flex-1 text-center text-sm font-semibold text-gray-800">
                  모의 면접
                </div>
                <div className="w-10" aria-hidden />
              </div>
            </header>

            <div className="rounded-3xl bg-white shadow-sm p-6 space-y-4 border border-slate-100">
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
        </div>
      </div>
    </div>
  );
};

export default Information;
