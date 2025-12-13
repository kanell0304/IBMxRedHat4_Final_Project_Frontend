import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createInterview } from './JobAPI';
import { baseBtn, selectedBtn } from './options';

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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50 px-4 py-8">
      <div className="w-full max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-700 flex items-center justify-center shadow-sm hover:bg-gray-50 transition"
            aria-label="Go back"
          >
            ←
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600/80">
              Mock Interview
            </p>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">Common Questions</h1>
            <p className="text-xs text-gray-500 mt-1">
              Practice general interview questions in English.
            </p>
          </div>
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
    </div>
  );
};

export default JobEng;
