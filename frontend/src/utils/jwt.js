// JWT 토큰에서 payload 추출
export const decodeJWT = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // payload 디코딩 (base64)
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (e) {
    console.error('JWT 디코딩 실패:', e);
    return null;
  }
};

// 쿠키에서 access_token 가져오기
export const getAccessTokenFromCookie = () => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'access_token') {
      return value;
    }
  }
  return null;
};

// 쿠키의 JWT에서 user 정보 추출
export const getUserFromToken = () => {
  const token = getAccessTokenFromCookie();
  if (!token) {
    return null;
  }
  
  const payload = decodeJWT(token);
  if (!payload) {
    return null;
  }
  
  // JWT payload에서 user 정보 추출
  return {
    user_id: payload.sub || payload.user_id,
    username: payload.username,
    email: payload.email,
    nickname: payload.nickname,
  };
};
