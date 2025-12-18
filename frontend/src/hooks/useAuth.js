import { useState, useEffect } from 'react';
import { getCurrentUser } from '../api/authApi';
import { getUserFromToken } from '../utils/jwt';

// JWT 토큰에서 user 정보를 가져오고 싶다면 useAuth(true) 그렇지 않고 api로 안전하게 가져오고 싶다면 useAuth(false)
export const useAuth = (useJWT = false) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (useJWT) { // user를 가져오는 방식에 따라 실행
      // JWT에서 직접 user 정보 추출
      loadUserFromJWT();
    } else {
      // API로 user 정보 가져오기
      loadUserFromAPI();
    }
  }, [useJWT]);

  const loadUserFromJWT = () => {
    try {
      const userData = getUserFromToken();
      if (userData && userData.user_id) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const loadUserFromAPI = async () => {
    try {
      const response = await getCurrentUser();
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    refreshUser: useJWT ? loadUserFromJWT : loadUserFromAPI,
  };
};
