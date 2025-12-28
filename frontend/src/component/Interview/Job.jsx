import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createInterview } from './JobAPI';
import { baseBtn, difficultyOptions, jobOptions, questionTypes, selectedBtn } from './options';
import PhoneFrame from '../Layout/PhoneFrame';

const Job = () => {
  const navigate = useNavigate();
  const [iForm, setIForm] = useState({ question_type: '', difficulty: '중간', job_group: '', job_role: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const selectQuestionType = (type) => {
    const isCommon = type === '공통질문만';
    setIForm({ question_type: type, difficulty: isCommon ? '' : '중간', job_group: '', job_role: '' });
    setErrorMsg('');
  };

  const selectDifficulty = (level) => {
    setIForm((prev) => ({ ...prev, difficulty: level }));
    setErrorMsg('');
  };

  const selectJobGroup = (group) => {
    setIForm((prev) => ({ ...prev, job_group: group, job_role: '' }));
    setErrorMsg('');
  };

  const selectJobRole = (role) => {
    setIForm((prev) => ({ ...prev, job_role: role }));
    setErrorMsg('');
  };

  const i_start = async () => {
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
      console.log('Interview created:', data);
    } catch (err) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;
      const msg = detail || err?.message || '면접 생성 중 오류가 발생했습니다.';
      const finalMsg = status ? `[${status}] ${msg}` : msg;
      console.error('Interview start error:', err?.response || err);
      setErrorMsg(finalMsg);
    } finally {
      setLoading(false);
    }
  };

  const groupKeys = Object.keys(jobOptions);
  const roleOptions = iForm.job_group ? jobOptions[iForm.job_group] : [];
  const isCommonOnly = iForm.question_type === '공통질문만';
  const canStart =
    iForm.question_type &&
    (isCommonOnly || iForm.difficulty) &&
    (isCommonOnly || (iForm.job_group && iForm.job_role));
  const difficultyIndex = difficultyOptions.findIndex((opt) => opt.key === iForm.difficulty);
  const difficultyValue = difficultyIndex >= 0 ? difficultyIndex : 1;
  const difficultyPercent =
    difficultyOptions.length > 1 ? (difficultyValue / (difficultyOptions.length - 1)) * 100 : 0;
  const stepJobGroup = isCommonOnly ? 2 : 3;
  const stepJobRole = isCommonOnly ? 3 : 4;

  return (
    <PhoneFrame title="모의 면접">
      <div className="space-y-5 pb-20">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-600/80">
            Question Type
          </p>
          <h1 className="text-xl font-black tracking-tight text-gray-900">질문 유형 & 직무</h1>
          <p className="text-[12px] text-gray-500">
            원하는 유형과 난이도를 고르고, 직무 기반 질문이 필요하면 직무를 선택하세요.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-5 space-y-7">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold inline-flex items-center justify-center">
                1
              </span>
              <span className="text-[13px] font-semibold text-gray-800">질문 유형</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {questionTypes.map((type) => (
                <button
                  key={type.key}
                  type="button"
                  onClick={() => selectQuestionType(type.key)}
                  className={`${baseBtn} ${iForm.question_type === type.key ? selectedBtn : ''}`}
                >
                  <div className="text-[15px] font-extrabold text-slate-900 whitespace-nowrap leading-tight">
                    {type.label}
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium leading-tight">
                    {type.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {iForm.question_type && !isCommonOnly && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold inline-flex items-center justify-center">
                  2
                </span>
                <span className="text-[13px] font-semibold text-gray-800">난이도</span>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                <div className="relative pt-2 pb-1">
                  <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-sky-400 via-indigo-400 to-blue-600"
                      style={{ width: `${difficultyPercent}%` }}
                    />
                  </div>
                  <div
                    className="absolute top-1/2 -translate-y-1/2 transition-all duration-200"
                    style={{ left: `calc(${difficultyPercent}% - 12px)` }}
                  >
                    <div className="w-6 h-6 rounded-full bg-white border-2 border-sky-400 shadow-lg shadow-sky-100" />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={difficultyOptions.length - 1}
                    step="1"
                    value={difficultyValue}
                    onChange={(e) =>
                      selectDifficulty(difficultyOptions[Number(e.target.value)].key)
                    }
                    className="absolute inset-0 w-full h-8 opacity-0 cursor-pointer"
                  />
                </div>
                <div className="mt-3 grid grid-cols-3 text-[11px] font-semibold text-gray-600">
                  {difficultyOptions.map((level) => (
                    <div
                      key={level.key}
                      className={`flex flex-col items-center gap-0.5 ${
                        iForm.difficulty === level.key ? 'text-blue-700' : ''
                      }`}
                    >
                      <span>{level.label}</span>
                      <span className="text-[10px] font-medium text-gray-500">{level.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {iForm.question_type && !isCommonOnly && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-[11px] font-bold inline-flex items-center justify-center">
                  {stepJobGroup}
                </span>
                <span className="text-sm font-semibold text-gray-800">메인 직무군</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {groupKeys.map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => selectJobGroup(group)}
                    className={`${baseBtn} ${iForm.job_group === group ? selectedBtn : ''}`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>
          )}

          {iForm.question_type && !isCommonOnly && iForm.job_group && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-[11px] font-bold inline-flex items-center justify-center">
                  {stepJobRole}
                </span>
                <span className="text-sm font-semibold text-gray-800">세부 직무</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {roleOptions.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => selectJobRole(role)}
                    className={`${baseBtn} ${iForm.job_role === role ? selectedBtn : ''}`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          )}

          {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
        </div>

        <div className="sticky bottom-0 left-0 right-0 -mx-4 px-4">
          <div className="bg-white/95 backdrop-blur pt-2 pb-4 border-t border-slate-100">
            <button
              type="button"
              onClick={i_start}
              disabled={!canStart || loading}
              className={`w-full px-4 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 text-white font-bold text-base shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-blue-200 active:translate-y-0 transition duration-150 ${
                canStart && !loading ? '' : 'opacity-60 cursor-not-allowed hover:translate-y-0 hover:shadow-none'
              }`}
            >
              {loading ? '시작 중...' : canStart ? '모의 면접 시작' : '옵션을 선택해 주세요'}
            </button>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
};

export default Job;
