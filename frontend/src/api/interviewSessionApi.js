import axios from 'axios'


const api=axios.create({
    baseURL: import.meta.env.VITE_API_BASE || 'http://43.200.166.166:8081',
    withCredentials: true,
});

// 답변 row 생성
export const createAnswerRow = async(i_id, q_id, q_order) => {
    const{data}=await api.post(`/interview/${i_id}/answers`, {
        q_id,
        q_order,
    });
    return data;
};

// 오디오 업로드 + STT + BERT 분석
export const uploadAndAnalyze = async(answer_id, audioBlob) => {
    const formData=new FormData();
    formData.append('file', audioBlob, 'recording.webm');

    try {
        const{data}=await api.post(`/interview/answers/${answer_id}/upload_process`,
            formData,
            {
                timeout: 60000,
            }
        );
        return data;
    } catch(err){
        const status=err?.response?.status;
        const detail=err?.response?.data?.detail;
        const message=detail || err?.message || '업로드 및 분석에 실패했습니다.';
        throw new Error(status ? `[${status}] ${message}` : message);
    }
};


// 전체 인터뷰 종합 분석(LLM)
export const analyzeFullInterview = async(i_id) => {
    try{
        const{data}=await api.post(`/interview/${i_id}/analyze_full`, null, {
            timeout: 120000,
        });
        return data;
    } catch(err){
        const status=err?.response?.status;
        const detail=err?.response?.data?.detail;
        const message=detail || err?.message || '종합 분석에 실패했습니다.';
        throw new Error(status ? `[${status}] ${message}` : message);
    }
};


// 결과 조회
export const getInterviewResults = async(i_id) => {
    const{data}=await api.get(`/interview/${i_id}/results`);
    return data
};


