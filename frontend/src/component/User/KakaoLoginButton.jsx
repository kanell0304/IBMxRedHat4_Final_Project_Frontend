const KakaoLoginButton = () => {
  const handleKakaoLogin = () => {
    const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
    const REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;
    
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    
    window.location.href = kakaoAuthUrl;
  };

  return (
    <button 
      onClick={handleKakaoLogin}
      className="w-full px-4 py-2 font-semibold text-black bg-[#FEE500] rounded-md hover:bg-[#FDD835] focus:outline-none flex items-center justify-center gap-2"
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