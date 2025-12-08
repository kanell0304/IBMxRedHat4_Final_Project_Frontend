import React from 'react';

const Information = () => {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <header className="mb-6 text-center">
          <button type="button" className="text-2xl mb-3">←</button>
          <div className="text-sm font-semibold">모의 면접</div>
          <h1 className="text-2xl font-bold mt-4">AI서비스개발자</h1>
          <h2 className="text-xl font-semibold mt-1">모의 면접 안내</h2>
        </header>

        <ul className="space-y-4">
          <li>
            <div className="font-semibold">📝 가상 면접 환경</div>
            <p className="text-sm">실제 면접 질문을 기반으로 자동 생성된 인터뷰입니다.</p>
          </li>
          <li>
            <div className="font-semibold">🎤 음성 기반 분석</div>
            <p className="text-sm">말투·속도·표현·비표준어·논리 흐름 등을 분석합니다.</p>
          </li>
          <li>
            <div className="font-semibold">📊 즉시 리포트 제공</div>
            <p className="text-sm">답변 후 평가와 개선점이 담긴 리포트를 제공합니다.</p>
          </li>
          <li>
            <div className="font-semibold">📌 시작 전 체크</div>
            <p className="text-sm">조용한 환경에서 마이크 연결을 확인해주세요.</p>
          </li>
        </ul>

        <footer className="mt-8 text-center">
          <p className="text-sm mb-3">준비가 되면 아래 버튼을 눌러주세요.</p>
          <button type="button" className="w-full rounded-md bg-black px-4 py-3 text-white">시작하기</button>
        </footer>
      </div>
    </section>
  );
};

export default Information;
