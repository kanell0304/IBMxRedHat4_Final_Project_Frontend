import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInterviewStatus } from '../../api/interviewSessionApi';

const InterviewNotificationContext = createContext();

export const useInterviewNotification = () => {
  const context = useContext(InterviewNotificationContext);
  if (!context) {
    throw new Error('useInterviewNotification must be used within InterviewNotificationProvider');
  }
  return context;
};

export const InterviewNotificationProvider = ({ children }) => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [pendingInterviewId, setPendingInterviewId] = useState(null);

  // DB 상태를 주기적으로 체크 (백그라운드 분석 감지)
  useEffect(() => {
    if (!pendingInterviewId) return;

    const checkInterval = setInterval(async () => {
      try {
        const statusData = await getInterviewStatus(pendingInterviewId);

        // status=2는 분석 완료
        if (statusData.status === 2) {
          // 알림 표시
          setNotification({
            interviewId: pendingInterviewId,
            message: '모의면접 분석이 완료되었어요!',
          });

          // 폴링 중지
          setPendingInterviewId(null);
        }
      } catch (err) {
        console.error('상태 체크 실패:', err);
        // 에러 발생 시에도 계속 폴링 (네트워크 일시 오류 대비)
      }
    }, 3000); // 3초마다 체크

    return () => clearInterval(checkInterval);
  }, [pendingInterviewId]);

  const dismissNotification = () => {
    setNotification(null);
  };

  const goToResult = () => {
    if (notification?.interviewId) {
      navigate(`/interview/immediate/${notification.interviewId}`);
      dismissNotification();
    }
  };

  const registerPendingAnalysis = (interviewId) => {
    setPendingInterviewId(interviewId);
  };

  return (
    <InterviewNotificationContext.Provider
      value={{
        notification,
        dismissNotification,
        goToResult,
        registerPendingAnalysis,
      }}
    >
      {children}
      {notification && <InterviewResultModal />}
    </InterviewNotificationContext.Provider>
  );
};

// 결과 알림 모달
const InterviewResultModal = () => {
  const { notification, dismissNotification, goToResult } = useInterviewNotification();

  if (!notification) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md mx-4 p-8 space-y-6 transform transition-all">
        {/* 아이콘 */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* 메시지 */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">
            분석 완료!
          </h3>
          <p className="text-gray-600">
            {notification.message}
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex flex-col gap-3">
          <button
            onClick={goToResult}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            결과 확인하러 가기 →
          </button>
          <button
            onClick={dismissNotification}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
          >
            나중에 보기
          </button>
        </div>
      </div>
    </div>
  );
};