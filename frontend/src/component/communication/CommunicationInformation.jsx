import React from 'react';
import { useNavigate } from 'react-router-dom';

const CommunicationInformation = () => {
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
            <p className="text-xs font-semibold text-gray-500">대화 분석</p>
            <h1 className="text-xl font-bold text-gray-900">AI 대화 분석 서비스</h1>
            <p className="text-sm text-gray-500 mt-1">시작 전에 안내를 확인하세요.</p>
          </div>
        </header>

        <div className="rounded-3xl bg-white shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">진행 안내</h2>
          <ul className="space-y-4 text-sm text-gray-600">
            <li>
              <div className="font-semibold text-gray-900">🎙️ 대화 녹음 분석</div>
              <p className="mt-1">실제 대화 녹음 파일을 업로드하여 분석합니다.</p>
            </li>
            <li>
              <div className="font-semibold text-gray-900">👥 화자 자동 감지</div>
              <p className="mt-1">AI가 대화 속 화자를 자동으로 구분하고, 분석 대상을 선택할 수 있습니다.</p>
            </li>
            <li>
              <div className="font-semibold text-gray-900">📊 종합 분석 리포트</div>
              <p className="mt-1">말투·속도·명료도·표준어 사용 등을 종합적으로 분석합니다.</p>
            </li>
            <li>
              <div className="font-semibold text-gray-900">💡 개선 방안 제시</div>
              <p className="mt-1">분석 결과와 함께 구체적인 개선 방안을 제공합니다.</p>
            </li>
            <li>
              <div className="font-semibold text-gray-900">📌 시작 전 체크</div>
              <p className="mt-1">음질이 좋고 배경 소음이 적은 녹음 파일을 준비해주세요.</p>
            </li>
          </ul>
        </div>

        <div className="rounded-3xl bg-white shadow-sm p-6 space-y-3">
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

        <div className="rounded-2xl bg-blue-50 text-blue-800 px-4 py-3 flex items-center gap-2">
          <span className="text-lg">ℹ️</span>
          <div className="text-sm">
            <p className="font-semibold">지원 형식</p>
            <p className="text-blue-700">WAV, MP3, M4A, OGG, FLAC</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationInformation;
