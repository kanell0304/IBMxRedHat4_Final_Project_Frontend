import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// 목업 데이터 사용 여부 (개발 중에는 true로 설정)
const USE_MOCK_DATA = true;

// 목업 데이터
const MOCK_COMMUNICATIONS = [
  {
    c_id: 1,
    user_id: 1,
    status: 'completed',
    created_at: '2025-12-15T10:30:00'
  },
  {
    c_id: 2,
    user_id: 1,
    status: 'completed',
    created_at: '2025-12-14T15:20:00'
  },
  {
    c_id: 3,
    user_id: 1,
    status: 'in_progress',
    created_at: '2025-12-13T09:10:00'
  },
  {
    c_id: 4,
    user_id: 1,
    status: 'failed',
    created_at: '2025-12-12T14:00:00'
  }
];

export default function CommunicationList() {
  const navigate = useNavigate();
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunications();
  }, []);

  const fetchCommunications = async () => {
    if (USE_MOCK_DATA) {
      // 목업 데이터 사용
      setTimeout(() => {
        setCommunications(MOCK_COMMUNICATIONS);
        setLoading(false);
      }, 500); // 로딩 시뮬레이션
      return;
    }

    // 실제 API 호출
    try {
      const userId = '1'; // 추후 로그인한 사용자 ID로 변경 필요
      const response = await axios.get(
        `http://localhost:8081/communication/users/${userId}/communications`,
        { withCredentials: true }
      );

      setCommunications(response.data);
    } catch (error) {
      console.error('목록 조회 실패:', error);
      alert('목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
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
      <div className="min-h-screen bg-white">
        <div className="min-h-screen w-full max-w-3xl mx-auto bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">목록을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="min-h-screen w-full max-w-3xl mx-auto bg-gray-100 px-4 md:px-6 py-8 space-y-6">
        <header className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="h-10 w-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-lg"
          >
            ←
          </button>
          <div>
            <p className="text-xs font-semibold text-gray-500">대화 분석</p>
            <h1 className="text-xl font-bold text-gray-900">내 분석 목록</h1>
            <p className="text-sm text-gray-500 mt-1">지금까지 분석한 대화 기록이에요</p>
          </div>
        </header>

        <button
          onClick={() => navigate('/communication/info')}
          className="w-full rounded-2xl bg-blue-600 text-white py-3 font-semibold shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700"
        >
          + 새 대화 분석하기
        </button>

        {communications.length === 0 ? (
          <div className="rounded-3xl bg-white shadow-sm p-12 text-center space-y-4">
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
                    <span className="text-base font-bold text-gray-900">대화 #{comm.c_id}</span>
                    {getStatusBadge(comm.status)}
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatDate(comm.created_at)}
                  </p>
                </div>
                <span className="text-gray-400">›</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
