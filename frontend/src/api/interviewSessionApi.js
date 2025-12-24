import axios from 'axios'


const api=axios.create({
    baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8081',
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


// 인터뷰 직후 즉시 결과 조회 (총평 + 질문별 평가 + 유사답변 힌트)
export const getImmediateResult = async(i_id) => {
    try {
        const{data}=await api.get(`/interview/${i_id}/immediate_result`);
        return data;
    } catch(err) {
        const status=err?.response?.status;
        const detail=err?.response?.data?.detail;
        const message=detail || err?.message || '즉시 결과 조회에 실패했습니다.';
        throw new Error(status ? `[${status}] ${message}` : message);
    }
};


// 개별 답변 상세 결과 조회
export const getAnswerResult = async(answer_id) => {
    try {
        const{data}=await api.get(`/interview/answers/${answer_id}/result`);
        return data;
    } catch(err) {
        const status=err?.response?.status;
        const detail=err?.response?.data?.detail;
        const message=detail || err?.message || '답변 결과 조회에 실패했습니다.';
        throw new Error(status ? `[${status}] ${message}` : message);
    }
};


// 사용자 약점 분석 조회
export const getUserWeaknesses = async(user_id) => {
    try {
        const{data}=await api.get(`/interview/users/${user_id}/weaknesses`);
        return data;
    } catch(err) {
        const status=err?.response?.status;
        const detail=err?.response?.data?.detail;
        const message=detail || err?.message || '약점 분석 조회에 실패했습니다.';
        throw new Error(status ? `[${status}] ${message}` : message);
    }
};


// 사용자 지표 변화 조회
export const getUserMetricChanges = async(user_id) => {
    try {
        const{data}=await api.get(`/interview/users/${user_id}/metric_changes`);
        return data;
    } catch(err) {
        const status=err?.response?.status;
        const detail=err?.response?.data?.detail;
        const message=detail || err?.message || '지표 변화 조회에 실패했습니다.';
        throw new Error(status ? `[${status}] ${message}` : message);
    }
};

// 인터뷰 상태 조회
export const getInterviewStatus=async(i_id)=>{
    try {
        const{data}=await api.get(`/interview/${i_id}/status`);
        return data
    } catch(err) {
        const status=err?.response?.status;
        const datail=err?.response?.data?.datail;
        const message=datail || err?.message || '상태 조회에 실패했습니다.';
    throw new Error(status ? `[${status}] ${message}` : message);
    }
};

