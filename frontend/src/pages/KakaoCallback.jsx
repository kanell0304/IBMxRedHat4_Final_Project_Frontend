import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const KakaoCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('처리 중...');
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const handleKakaoCallback = async () => {
      const code = searchParams.get('code');

      if (!code) {
        setStatus('카카오 로그인 실패: 인가 코드가 없습니다.');
        setTimeout(() => navigate('/'), 2000);
        return;
      }

      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        
        const response = await fetch(`${API_BASE_URL}/users/kakao/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || '로그인 실패');
        }

        const data = await response.json();
        
        // 토큰 저장
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);

        setStatus(data.is_new_user 
          ? '카카오 회원가입 완료! 메인 페이지로 이동합니다...' 
          : '로그인 성공! 메인 페이지로 이동합니다...'
        );
        
        setTimeout(() => navigate('/'), 1000);
      } catch (error) {
        setStatus(`로그인 중 오류가 발생했습니다: ${error.message}`);
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleKakaoCallback();
  }, [navigate, searchParams]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '20px'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '5px solid #f3f3f3',
        borderTop: '5px solid #FEE500',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <p style={{ fontSize: '18px', color: '#333' }}>{status}</p>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default KakaoCallback;
