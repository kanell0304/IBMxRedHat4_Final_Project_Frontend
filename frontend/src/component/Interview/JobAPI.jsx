import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8081',
  withCredentials: true,
});

const getUserId = async () => {
  const { data } = await api.get('/users/me');
  const userId = data?.user_id ?? data?.id;
  if (!userId) throw new Error('로그인이 필요합니다.');
  return userId;
};

export const createInterview = async ({question_type, job_group, job_role, difficulty}) => {
  const isCommonOnly = question_type === '공통질문만';
  const userId = await getUserId();
  const payload = {
    user_id: userId,
    question_type,
    difficulty: isCommonOnly ? null : difficulty,
    job_group: job_group || null,
    job_role: isCommonOnly ? null : job_role,
    total_questions: 5,
  };

  const { data } = await api.post('/interview/start', payload);
  return data;
};

export const getIDetail = async (interviewId) => {
  if (!interviewId) throw new Error('면접 정보가 없습니다.');
  const { data } = await api.get(`/interview/${interviewId}`);
  return data;
};

export const uploadAnswer = async ({ answerId, audioFile }) => {
  if (!answerId) throw new Error('답변 ID가 없습니다.');
  if (!audioFile) throw new Error('녹음 파일을 선택해주세요.');

  const formData = new FormData();
  formData.append('file', audioFile);

  try {
    const { data } = await api.post(`/interview/answers/${answerId}/upload`, formData);
    return data;
  } catch (err) {
    const status = err?.response?.status;
    const detail = err?.response?.data?.detail;
    const message = detail || err?.message || '답변 전송에 실패했습니다.';
    const error = new Error(status ? `[${status}] ${message}` : message);
    error.response = err?.response;
    throw error;
  }
};

export default api;
