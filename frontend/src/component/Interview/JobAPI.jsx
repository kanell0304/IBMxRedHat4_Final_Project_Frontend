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

export const startInterview = async ({ question_type, job_group, job_role, difficulty }) => {
  const isCommonOnly = question_type === '공통질문만';
  const userId = await getCurrentUserId();
  const payload = {
    user_id: userId,
    question_type,
    difficulty: isCommonOnly ? null : difficulty,
    job_group: job_group || null,
    job_role: isCommonOnly ? null : job_role,
    total_questions: 5,
  };

  try {
    const { data } = await api.post('/interview/start', payload);
    return data;
  } catch (err) {
    // axios 에러를 그대로 던지되, 메시지를 보강
    const status = err?.response?.status;
    const detail = err?.response?.data?.detail;
    const message = detail || err?.message || '인터뷰 생성에 실패했습니다.';
    const error = new Error(status ? `[${status}] ${message}` : message);
    error.response = err?.response;
    throw error;
  }
};

export const submitInterviewAnswer = async ({ interviewId, questionId, audioFile }) => {
  if (!interviewId || !questionId) {
    throw new Error('면접 정보가 없습니다.');
  }
  if (!audioFile) {
    throw new Error('녹음 파일을 선택해주세요.');
  }

  const formData = new FormData();
  formData.append('interview_id', interviewId);
  formData.append('question_id', questionId);
  formData.append('audio_file', audioFile);

  try {
    const { data } = await api.post('/interview/i_answer', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
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
