import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunication } from '../../hooks/useCommunication';
import PhoneFrame from '../Layout/PhoneFrame';

export default function CommunicationList() {
  const navigate = useNavigate();
  const { getUserCommunications, loading } = useCommunication();
  const [communications, setCommunications] = useState([]);

  const fetchCommunications = async () => {
    const userId = '1';
    const result = await getUserCommunications(userId);

    if (result.success) {
      setCommunications(result.data);
    } else {
      console.error('목록 조회 실패:', result.error);
      alert(result.error || '목록을 불러오는 중 오류가 발생했습니다.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      in_progress: { text: '진행중', color: 'bg-yellow-100 text-yellow-800' },
      completed: { text: '완료', color: 'bg-green-100 text-green-800' },
      stopped: { text: '중단', color: 'bg-gray-100 text-gray-800' },
      failed: { text: '실패', color: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status] || statusConfig.in_progress;
    return (
      <span className={`text-[11px] font-semibold rounded-full px-2.5 py-1 ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <PhoneFrame title="대화 분석">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">목록을 불러오는 중...</p>
          </div>
        </div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame title="대화 분석">
      <div className="space-y-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-500">대화 분석</p>
          <h1 className="text-2xl font-extrabold text-gray-900">내 분석 목록</h1>
          <p className="text-sm text-gray-600">지금까지 분석한 대화 기록이에요</p>
        </div>

        <button
          onClick={() => navigate('/communication/info')}
          className="w-full rounded-2xl bg-blue-600 text-white py-3 font-semibold shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700"
        >
          + 새 대화 분석하기
        </button>

        {communications.length === 0 ? (
          <div className="rounded-3xl bg-white shadow-sm p-12 text-center space-y-4 border border-slate-100">
            <div className="text-6xl">💬</div>
            <h2 className="text-lg font-bold text-gray-900">
              아직 분석한 대화가 없어요
            </h2>
            <p className="text-sm text-gray-600">
              첫 대화 분석을 시작해보세요!
            </p>
            <button
              onClick={() => navigate('/communication/info')}
              className="rounded-2xl bg-blue-600 text-white px-6 py-2.5 font-semibold shadow-sm transition hover:bg-blue-700"
            >
              분석 시작하기
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {communications.map((comm) => (
              <button
                key={comm.c_id}
                onClick={() => {
                  if (comm.status === 'completed') {
                    navigate(`/communication/result/${comm.c_id}`);
                  } else if (comm.status === 'in_progress') {
                    navigate(`/communication/speaker/${comm.c_id}`);
                  }
                }}
                className="w-full rounded-3xl bg-white shadow-sm p-5 flex items-center gap-4 transition hover:shadow-md"
              >
                <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                  💬
                </div>
                <div className="flex-1 text-left space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">대화 #{comm.c_id}</span>
                    {getStatusBadge(comm.status)}
                  </div>
                  <p className="text-[13px] text-gray-600">
                    {formatDate(comm.created_at)}
                  </p>
                </div>
                <span className="text-gray-400">›</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}
