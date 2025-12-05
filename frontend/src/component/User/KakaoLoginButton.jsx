import React from 'react';

const KakaoLoginButton = () => {
  const handleKakaoLogin = () => {
    const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
    const REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;
    
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    
    // 카카오 로그인 페이지로 이동
    window.location.href = kakaoAuthUrl;
  };

  return (
    <button 
      onClick={handleKakaoLogin}
      style={{
        backgroundColor: '#FEE500',
        color: '#000000',
        border: 'none',
        borderRadius: '12px',
        padding: '12px 24px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        minWidth: '200px',
        justifyContent: 'center',
        transition: 'all 0.2s ease'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = '#FDD835';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = '#FEE500';
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path 
          d="M9 0C4.029 0 0 3.314 0 7.4c0 2.774 1.877 5.205 4.688 6.513-.202.74-.738 2.758-.846 3.162-.13.48.174.473.37.343.147-.098 2.35-1.597 3.348-2.283.472.065.957.099 1.44.099 4.971 0 9-3.314 9-7.4S13.971 0 9 0z" 
          fill="#000000"
        />
      </svg>
      카카오 로그인
    </button>
  );
};

export default KakaoLoginButton;
