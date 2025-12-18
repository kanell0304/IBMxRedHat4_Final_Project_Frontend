import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createInterview } from './JobAPI';
import { baseBtn, selectedBtn } from './options';
import PhoneFrame from '../Layout/PhoneFrame';

const JobEng = () => {
  const navigate = useNavigate();
  const [iForm, setIForm] = useState({
    question_type: '공통질문만',
    difficulty: '',
    job_group: '',
    job_role: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const startInterview = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await createInterview(iForm);
      const resolvedInterviewId = data.i_id || data.interview_id || data.interviewId;
      const payload = {
        interviewId: resolvedInterviewId,
        questions: data.questions || [],
        interviewForm: iForm,
      };
      sessionStorage.setItem('interviewSession', JSON.stringify(payload));
      navigate('/interview', { state: payload });
    } catch (err) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;
      const msg = detail || err?.message || 'Failed to start the interview.';
      const finalMsg = status ? `[${status}] ${msg}` : msg;
      setErrorMsg(finalMsg);
    } finally {
      setLoading(false);
    }
  };

  const commonType = {
    key: '공통질문만',
    label: 'Common Questions Only',
    desc: 'Intro, strengths, weaknesses, and general questions',
  };

  const canStart = Boolean(iForm.question_type);

  return (
    <PhoneFrame title="English Mock Interview">
      <div className="space-y-5">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-600/80">
            Questions Type
          </p>
          <h1 className="text-xl font-black tracking-tight text-gray-900">English Interview</h1>
          <p className="text-[12px] text-gray-500">
            영어 공통 질문 세트만 제공돼요. 바로 시작해보세요.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold inline-flex items-center justify-center">
                1
              </span>
              <span className="text-sm font-semibold text-gray-800">Select Question Type</span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => setIForm((prev) => ({ ...prev, question_type: commonType.key }))}
                className={`${baseBtn} ${iForm.question_type === commonType.key ? selectedBtn : ''}`}
              >
                <div className="text-sm font-bold">{commonType.label}</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  {commonType.desc}
                </div>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={startInterview}
              disabled={!canStart || loading}
              className={`w-full px-4 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 text-white font-bold text-base shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-blue-200 active:translate-y-0 transition duration-150 ${
                canStart && !loading ? '' : 'opacity-60 cursor-not-allowed hover:translate-y-0 hover:shadow-none'
              }`}
            >
              {loading ? 'Starting...' : 'Start Interview'}
            </button>
          </div>

          {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
        </div>
      </div>
    </PhoneFrame>
  );
};

export default JobEng;
