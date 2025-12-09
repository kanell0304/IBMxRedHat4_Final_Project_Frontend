import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startInterview } from './JobAPI';
import { baseBtn, difficultyOptions, jobOptions, questionTypes, selectedBtn } from './options';

const Job = () => {
  const navigate = useNavigate();
  const [selectedJob, setSelectedJob] = useState({ question_type: '', difficulty: '중간', job_group: '', job_role: '' });
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');

  const chooseType = (type) => {
    const isCommon = type === '공통질문만';
    setSelectedJob({ question_type: type, difficulty: isCommon ? '' : '중간', job_group: '', job_role: '' });
    setQuestions([]);
    setError('');
  };

  const chooseDifficulty = (level) => {
    setSelectedJob((prev) => ({ ...prev, difficulty: level }));
    setError('');
  };

  const chooseGroup = (group) => {
    setSelectedJob((prev) => ({ ...prev, job_group: group, job_role: '' }));
    setQuestions([]);
    setError('');
  };

  const chooseRole = (role) => {
    setSelectedJob((prev) => ({ ...prev, job_role: role }));
    setError('');
  };

  // 인터뷰 시작
  const beginInterview = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await startInterview(selectedJob);
      setQuestions(data.questions || []);
      console.log('Interview created:', data);
    } catch (err) {
      const msg = err?.response?.data?.detail || '면접 생성 중 오류가 발생했습니다.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const groupKeys = Object.keys(jobOptions);
  const roleOptions = selectedJob.job_group ? jobOptions[selectedJob.job_group] : [];
  const isCommonOnly = selectedJob.question_type === '공통질문만';
  const canStart =
    selectedJob.question_type &&
    (isCommonOnly || selectedJob.difficulty) &&
    (isCommonOnly || (selectedJob.job_group && selectedJob.job_role));
  const difficultyIndex = difficultyOptions.findIndex((opt) => opt.key === selectedJob.difficulty);
  const difficultyValue = difficultyIndex >= 0 ? difficultyIndex : 1;
  const difficultyPercent =
    difficultyOptions.length > 1 ? (difficultyValue / (difficultyOptions.length - 1)) * 100 : 0;
  const stepJobGroup = isCommonOnly ? 2 : 3;
  const stepJobRole = isCommonOnly ? 3 : 4;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8 font-sans">
      <div className="w-full max-w-[420px] mx-auto bg-[#f8fafc] rounded-[28px] border border-slate-200 shadow-lg px-5 py-7 max-h-[844px] min-h-[720px] overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shadow-sm hover:bg-slate-200 transition"
            aria-label="뒤로가기"
          >
            ←
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600/80">Mock Interview</p>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">질문 유형 & 직무</h1>
            <p className="text-xs text-slate-500 mt-1">원하는 유형과 난이도를 고르고, 직무 기반 질문이 필요하면 직무를 선택하세요.</p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold inline-flex items-center justify-center shadow-sm shadow-blue-200">1</span>
              <span className="text-sm font-semibold text-slate-800">질문 유형</span>
            </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {questionTypes.map((type) => (
                  <button
                    key={type.key}
                    type="button"
                    onClick={() => chooseType(type.key)}
                    className={`${baseBtn} ${selectedJob.question_type === type.key ? selectedBtn : ''}`}
                >
                  <div className="text-sm font-bold">{type.label}</div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">{type.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {selectedJob.question_type && !isCommonOnly && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold inline-flex items-center justify-center shadow-sm shadow-blue-200">2</span>
                <span className="text-sm font-semibold text-slate-800">난이도</span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-4 py-4">
                <div className="relative pt-2 pb-1">
                  <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
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
                    onChange={(e) => chooseDifficulty(difficultyOptions[Number(e.target.value)].key)}
                    className="absolute inset-0 w-full h-8 opacity-0 cursor-pointer"
                  />
                </div>
                <div className="mt-3 grid grid-cols-3 text-[11px] font-semibold text-slate-600">
                  {difficultyOptions.map((level) => (
                    <div
                      key={level.key}
                      className={`flex flex-col items-center gap-0.5 ${selectedJob.difficulty === level.key ? 'text-sky-700' : ''}`}
                    >
                      <span>{level.label}</span>
                      <span className="text-[10px] font-medium text-slate-500">{level.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedJob.question_type && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold inline-flex items-center justify-center shadow-sm shadow-blue-200">
                  {stepJobGroup}
                </span>
                <span className="text-sm font-semibold text-slate-800">메인 직무군</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {groupKeys.map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => chooseGroup(group)}
                    className={`${baseBtn} ${selectedJob.job_group === group ? selectedBtn : ''}`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedJob.question_type && !isCommonOnly && selectedJob.job_group && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold inline-flex items-center justify-center shadow-sm shadow-blue-200">{stepJobRole}</span>
                <span className="text-sm font-semibold text-slate-800">세부 직무</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {roleOptions.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => chooseRole(role)}
                    className={`${baseBtn} ${selectedJob.job_role === role ? selectedBtn : ''}`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedJob.question_type && (
            <div className="pt-2">
              <button
                type="button"
                onClick={beginInterview}
                disabled={!canStart || loading}
                className={`w-full px-4 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 text-white font-bold text-base shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-blue-200 active:translate-y-0 transition duration-150 ${
                  canStart && !loading ? '' : 'opacity-60 cursor-not-allowed hover:translate-y-0 hover:shadow-none'
                }`}
              >
                {loading ? '시작 중...' : canStart ? '모의 면접 시작' : '옵션을 선택해 주세요'}
              </button>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          {questions.length > 0 && (
            <div className="space-y-3">
              {questions.map((q) => (
                <div key={q.q_id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 shadow-sm">
                  <div className="text-xs font-semibold text-blue-600 mb-1">Q{q.q_order}</div>
                  <div className="text-sm text-slate-800">{q.question_text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Job;
