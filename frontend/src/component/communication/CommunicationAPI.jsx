import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8000',
  withCredentials: true,
});

const getCurrentUserId = async () => {
  const { data } = await api.get('/users/me');
  const userId = data?.user_id ?? data?.id;

  if (!userId) {
    throw new Error('로그인이 필요합니다.');
  }

  return userId;
};

export const uploadVoiceFile = async (audioFile) => {
  if (!audioFile) {
    throw new Error('녹음 파일을 선택해주세요.');
  }

  try {
    const userId = await getCurrentUserId();
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('file', audioFile);

    const { data } = await api.post('/communication/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (err) {
    const status = err?.response?.status;
    const detail = err?.response?.data?.detail;
    const message = detail || err?.message || '파일 업로드에 실패했습니다.';
    const error = new Error(status ? `[${status}] ${message}` : message);
    error.response = err?.response;
    throw error;
  }
};

export const processSTT = async (c_id) => {
  if (!c_id) {
    throw new Error('Communication ID가 없습니다.');
  }

  try {
    const { data } = await api.post(`/communication/${c_id}/stt`);
    return data;
  } catch (err) {
    const status = err?.response?.status;
    const detail = err?.response?.data?.detail;
    const message = detail || err?.message || 'STT 처리에 실패했습니다.';
    const error = new Error(status ? `[${status}] ${message}` : message);
    error.response = err?.response;
    throw error;
  }
};

export const getSTTResult = async (c_id) => {
  if (!c_id) {
    throw new Error('Communication ID가 없습니다.');
  }

  try {
    const { data } = await api.get(`/communication/${c_id}/stt`);
    return data;
  } catch (err) {
    const status = err?.response?.status;
    const detail = err?.response?.data?.detail;
    const message = detail || err?.message || 'STT 결과 조회에 실패했습니다.';
    const error = new Error(status ? `[${status}] ${message}` : message);
    error.response = err?.response;
    throw error;
  }
};

export const analyzeCommunication = async (c_id, target_speaker) => {
  if (!c_id) {
    throw new Error('Communication ID가 없습니다.');
  }

  try {
    const { data } = await api.post(`/communication/${c_id}/analyze`, null, {
      params: { target_speaker: target_speaker || '1' },
    });
    return data;
  } catch (err) {
    const status = err?.response?.status;
    const detail = err?.response?.data?.detail;
    const message = detail || err?.message || '분석에 실패했습니다.';
    const error = new Error(status ? `[${status}] ${message}` : message);
    error.response = err?.response;
    throw error;
  }
};

export default api;
