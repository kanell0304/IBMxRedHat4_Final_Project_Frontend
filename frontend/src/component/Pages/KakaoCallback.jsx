import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const KakaoCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('처리 중...');
  const [isError, setIsError] = useState(false);
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const handleKakaoCallback = async () => {
      const code = searchParams.get('code');

      if (!code) {
        setStatus('카카오 로그인 실패: 인가 코드가 없습니다.');
        setIsError(true);
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      try {
        const API_BASE =
          import.meta.env.VITE_API_BASE ||
          import.meta.env.VITE_API_BASE_URL ||
          'http://43.200.166.166:8081';

        const response = await fetch(`${API_BASE}/users/kakao/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ code }),
        });
        
        if (!response.ok) {
          let errorData = null;
          let errorMessage = '로그인 실패';
          
          try {
            errorData = await response.json();
            console.log('에러 응답:', errorData);
            
            if (errorData?.detail) {
              if (typeof errorData.detail === 'object') {
                errorMessage = errorData.detail.message || errorData.detail.error || errorMessage;
                
                // 이메일 비동의 시 에러 발생
                if (errorData.detail.error === 'EMAIL_REQUIRED') {
                  setStatus('이메일 제공 동의가 필요합니다');
                  setIsError(true);
                  alert('카카오 로그인 시 이메일 제공 동의가 필요합니다.\n\n다시 시도해주세요.');
                  setTimeout(() => navigate('/login'), 2000);
                  return;
                }
              } 
              else if (typeof errorData.detail === 'string') {
                errorMessage = errorData.detail;
              }
            }
          } catch (e) {
            console.error('에러 응답 파싱 실패:', e);
          }
          
          throw new Error(`[${response.status}] ${errorMessage}`);
        }

        const data = await response.json();
        
        setStatus(data.is_new_user 
          ? '카카오 회원가입이 완료되었습니다. 메인 페이지로 이동합니다...' 
          : '로그인 성공 메인 페이지로 이동합니다...'
        );
        
        setTimeout(() => navigate('/'), 1000);
        
      } catch (error) {
        console.error('카카오 로그인 에러:', error);
        setStatus(`로그인 중 오류가 발생했습니다`);
        setIsError(true);
        
        const errorMsg = error.message || '알 수 없는 오류가 발생했습니다.';
        alert(errorMsg);
        
        setTimeout(() => navigate('/login'), 2000);
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
      gap: '20px',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '5px solid #f3f3f3',
        borderTop: isError ? '5px solid #ef4444' : '5px solid #FEE500',
        borderRadius: '50%',
        animation: isError ? 'none' : 'spin 1s linear infinite'
      }} />
      <p style={{ 
        fontSize: '18px', 
        color: isError ? '#ef4444' : '#333',
        fontWeight: '500',
        textAlign: 'center',
        padding: '0 20px'
      }}>
        {status}
      </p>
      {isError && (
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          textAlign: 'center',
          padding: '0 20px'
        }}>
          잠시 후 로그인 페이지로 이동합니다...
        </p>
      )}
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