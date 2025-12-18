import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8081',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const signup = (userData) => {
  return apiClient.post('/users/join', userData);
};

export const login = (credentials) => {
  const formData = new URLSearchParams();
  formData.append('username', credentials.email); // email을 username으로
  formData.append('password', credentials.password);
  
  return apiClient.post('/users/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};

export const requestPasswordReset = (reqData) => {
  return apiClient.post('/users/forgot-password', reqData);
};

export const resetPassword = (resetData) => {
  return apiClient.post('/users/reset-password', resetData);
};

export const getCurrentUser = () => {
  return apiClient.get('/users/me');
};

export default apiClient;