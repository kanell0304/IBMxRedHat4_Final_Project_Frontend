import apiClient from './authApi';

export const adminApi = {
  // 전체 유저 목록 조회
  getUsers: () => apiClient.get('/users'),
  // 유저 삭제 (관리용)
  deleteUser: (userId) => apiClient.delete(`/users/${userId}`),
};

export default adminApi;
