import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { analyzeCommunication } from './CommunicationAPI';
import api from './CommunicationAPI';

const Communication = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialData = useMemo(() => {
    const fromState = location.state;
    if (fromState?.c_id && fromState?.target_speaker) {
      return fromState;
    }
    const saved = sessionStorage.getItem('communicationSession');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch (err) {
      console.error('Failed to parse communicationSession', err);
      return null;
    }
  }, [location.state]);

  const [c_id] = useState(initialData?.c_id || null);
  const [targetSpeaker] = useState(initialData?.target_speaker || '1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [scriptSentences, setScriptSentences] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // overview, detail, script

  useEffect(() => {
    if (initialData?.c_id && initialData?.target_speaker) {
      sessionStorage.setItem('communicationSession', JSON.stringify(initialData));
    }
  }, [initialData]);

  useEffect(() => {
    if (c_id && targetSpeaker) {
      performAnalysis();
    }
  }, [c_id, targetSpeaker]);

  const performAnalysis = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await analyzeCommunication(c_id, targetSpeaker);
      setAnalysisResult(data);
      console.log('Analysis result:', data);

      // 스크립트 문장 가져오기
      await fetchScriptSentences();
    } catch (err) {
      console.error('Analysis error', err?.response || err);
      setError(err?.message || '분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchScriptSentences = async () => {
    try {
      const { data } = await api.get(`/communication/${c_id}/script`);
      setScriptSentences(data || []);
    } catch (err) {
      console.error('Failed to fetch script', err);
      // 스크립트 조회 실패는 치명적이지 않으므로 에러만 로깅
    }
  };

  if (!c_id || !targetSpeaker) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow p-6 text-center space-y-4">
          <p className="text-lg font-semibold text-slate-800">분석 정보를 불러올 수 없습니다.</p>
          <p className="text-sm text-slate-500">화자 선택 후 다시 시작해주세요.</p>
          <button
            type="button"
            onClick={() => navigate('/communication/start')}
            className="w-full rounded-xl bg-blue-600 text-white font-semibold py-3 hover:bg-blue-700 transition"
          >
            다시 시작하기
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-slate-800">말투를 분석하고 있습니다...</p>
          <p className="text-sm text-slate-500 mt-2">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow p-6 text-center space-y-4">
          <p className="text-lg font-semibold text-red-600">오류 발생</p>
          <p className="text-sm text-slate-600">{error}</p>
          <button
            type="button"
            onClick={() => navigate('/communication/start')}
            className="w-full rounded-xl bg-blue-600 text-white font-semibold py-3 hover:bg-blue-700 transition"
          >
            다시 시작하기
          </button>
        </div>
      </div>
    );
  }

  if (!analysisResult) {
    return null;
  }

  const metrics = [
    { key: 'speed', label: '말하기 속도', score: analysisResult.speed },
    { key: 'speech_rate', label: '발화 비율', score: analysisResult.speech_rate },
    { key: 'silence', label: '침묵 처리', score: analysisResult.silence },
    { key: 'clarity', label: '발음 명확성', score: analysisResult.clarity },
    { key: 'meaning_clarity', label: '의미 명확성', score: analysisResult.meaning_clarity },
  ];

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 8) return 'bg-green-100';
    if (score >= 6) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const targetScriptSentences = scriptSentences.filter(
    (s) => s.speaker_label === targetSpeaker
  );

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="w-full max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600/80">
                Communication Analysis
              </p>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">말투 분석 결과</h1>
              <p className="text-sm text-slate-500 mt-1">
                화자 {targetSpeaker}의 말투를 분석한 결과입니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/communication/start')}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              다시 분석하기
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              종합 요약
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('detail')}
              className={`px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'detail'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              세부 지표
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('script')}
              className={`px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'script'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              전체 스크립트
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 점수 카드 */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-4">말투 지표</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {metrics.map((metric) => (
                  <div
                    key={metric.key}
                    className="rounded-xl border border-slate-200 p-4 bg-slate-50"
                  >
                    <p className="text-xs font-semibold text-slate-600 mb-2">{metric.label}</p>
                    <div className="flex items-baseline gap-2">
                      <span
                        className={`text-3xl font-black ${getScoreColor(metric.score)}`}
                      >
                        {metric.score.toFixed(1)}
                      </span>
                      <span className="text-sm text-slate-500">/ 10</span>
                    </div>
                  </div>
                ))}
                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                  <p className="text-xs font-semibold text-slate-600 mb-2">말 끊김 횟수</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">
                      {analysisResult.cut}
                    </span>
                    <span className="text-sm text-slate-500">회</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 요약 */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-4">종합 요약</h2>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {analysisResult.summary}
              </p>
            </div>

            {/* 조언 */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-4">개선 조언</h2>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {analysisResult.advice}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'detail' && (
          <div className="space-y-6">
            {metrics.map((metric) => {
              const detailJson = analysisResult[`${metric.key}_json`];
              if (!detailJson || !detailJson.detected_examples?.length) {
                return (
                  <div
                    key={metric.key}
                    className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-slate-900">{metric.label}</h2>
                      <span
                        className={`text-2xl font-black ${getScoreColor(metric.score)}`}
                      >
                        {metric.score.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">문제가 발견되지 않았습니다.</p>
                  </div>
                );
              }

              return (
                <div
                  key={metric.key}
                  className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-900">{metric.label}</h2>
                    <span
                      className={`text-2xl font-black ${getScoreColor(metric.score)}`}
                    >
                      {metric.score.toFixed(1)}
                    </span>
                  </div>

                  {detailJson.reason && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-slate-700 mb-2">문제점</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {detailJson.reason}
                      </p>
                    </div>
                  )}

                  {detailJson.detected_examples?.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-slate-700 mb-2">
                        문제 구간
                      </h3>
                      <div className="space-y-2">
                        {detailJson.detected_examples.map((example, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg border border-red-200 bg-red-50 p-3"
                          >
                            <p className="text-sm text-slate-800">{example}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {detailJson.improvement && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-slate-700 mb-2">개선 방안</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {detailJson.improvement}
                      </p>
                    </div>
                  )}

                  {detailJson.revised_examples?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-2">
                        개선 예시
                      </h3>
                      <div className="space-y-2">
                        {detailJson.revised_examples.map((example, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg border border-green-200 bg-green-50 p-3"
                          >
                            <p className="text-sm text-slate-800">{example}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* 말 끊김 상세 */}
            {analysisResult.cut_json?.detected_examples?.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900">말 끊김 구간</h2>
                  <span className="text-2xl font-black text-slate-900">
                    {analysisResult.cut}회
                  </span>
                </div>

                {analysisResult.cut_json.reason && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">분석</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {analysisResult.cut_json.reason}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  {analysisResult.cut_json.detected_examples.map((example, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-orange-200 bg-orange-50 p-3"
                    >
                      <p className="text-sm text-slate-800">{example}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'script' && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              화자 {targetSpeaker}의 발화 내용
            </h2>
            {targetScriptSentences.length === 0 ? (
              <p className="text-sm text-slate-500">스크립트를 불러올 수 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {targetScriptSentences.map((sentence) => (
                  <div
                    key={sentence.c_ss_id}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold px-2 py-1 rounded bg-blue-100 text-blue-700">
                        #{sentence.sentence_index + 1}
                      </span>
                      {sentence.start_time && (
                        <span className="text-xs text-slate-500">
                          {sentence.start_time} ~ {sentence.end_time}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed">{sentence.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Communication;
