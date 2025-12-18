import apiClient from '../../api/authApi';

export const getMe = () => apiClient.get('/users/me');

export const get_I = (userId) =>
  apiClient.get(`/interview/users/${userId}/interviews`);

export const delete_I = (interviewId) =>
  apiClient.delete(`/interview/${interviewId}`);

export const get_P = (userId) =>
  apiClient.get(`/presentations/user/${userId}`);

export const delete_P = (presentationId) =>
  apiClient.delete(`/presentations/${presentationId}`);

export const get_C = (userId) =>
  apiClient.get(`/communication/users/${userId}/communications`);

export const delete_C = (communicationId) =>
  apiClient.delete(`/communication/${communicationId}`);
