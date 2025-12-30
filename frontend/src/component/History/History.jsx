import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, get_I, delete_I, get_P, delete_P, get_C, delete_C } from '../History/HistoryAPI';
import { getUserWeaknesses, getUserMetricChanges } from '../../api/interviewSessionApi';
import IList from '../History/IList';
import PList from '../History/PList';
import CList from '../History/CList';
import PhoneFrame from '../Layout/PhoneFrame';
import MainLayout from '../Layout/MainLayout';
import Header from '../Layout/Header';

const tabs = [
  { key: 'interview', label: '모의면접' },
  { key: 'presentation', label: '발표분석' },
  { key: 'communication', label: '대화분석' },
  { key: 'analysis', label: '인사이트' },
];

const typeLabel = (type) => {
  if (type === 'common') return '공통 질문';
  if (type === 'job') return '직무 질문';
  if (type === 'comprehensive') return '종합';
  return '기타';
};

const formatDate = (value) => {
  const date = new Date(value);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const HistoryContent = () => {
  const [tab, setTab] = useState('interview');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [uid, setUid] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [weaknesses, setWeaknesses] = useState(null);
  const [metricChanges, setMetricChanges] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await getMe();
        setUid(res.data.user_id);
      } catch {
        setError('로그인이 필요합니다.');
      }
    };
    init();
  }, []);

  const loadList = useCallback(async (type) => {
    if (!uid) return;
    setLoading(true);
    setError('');
    try {
      if (type === 'interview') {
        const res = await get_I(uid);
        setItems(res.data);
      } else if (type === 'presentation') {
        const res = await get_P(uid);
        setItems(res.data?.data || []);
      } else if (type === 'communication') {
        const res = await get_C(uid);
        setItems(res.data || []);
      }
    } catch {
      setError('조회 실패');
    } finally {
      setLoading(false);
    }
  }, [uid]);

  const loadAnalysisData = useCallback(async () => {
    if (!uid) return;
    setAnalysisLoading(true);
    try {
      const [weaknessData, metricData] = await Promise.all([
        getUserWeaknesses(uid),
        getUserMetricChanges(uid),
      ]);
      setWeaknesses(weaknessData);
      setMetricChanges(metricData);
    } catch (err) {
      console.error('성장분석 데이터 로드 실패:', err);
      // 에러 시 빈 데이터로 설정 (has_enough_data: false 상태로 표시)
      setWeaknesses({ has_enough_data: false, total_interviews: 0 });
      setMetricChanges({ has_enough_data: false, total_interviews: 0 });
    } finally {
      setAnalysisLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    if (tab === 'interview') {
      loadList('interview');
    } else if (tab === 'presentation') {
      loadList('presentation');
    } else if (tab === 'communication') {
      loadList('communication');
    } else if (tab === 'analysis') {
      loadAnalysisData();
    }
  }, [tab, uid, loadList, loadAnalysisData]);

  const deleteItem = async (id) => {
    const ok = window.confirm('이 기록을 삭제할까요?');
    if (!ok) return;

    try {
      if (tab === 'interview') {
        await delete_I(id);
        setItems((prev) => prev.filter((item) => item.i_id !== id));
      } else if (tab === 'presentation') {
        await delete_P(id);
        setItems((prev) => prev.filter((item) => item.pr_id !== id));
      } else if (tab === 'communication') {
        await delete_C(id);
        setItems((prev) => prev.filter((item) => item.c_id !== id));
      }
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  // 전체 삭제 함수
  const deleteAll = async () => {
    if (items.length === 0) {
      alert('삭제할 항목이 없습니다.');
      return;
    }

    const tabLabel = tab === 'interview' ? '모의면접' : 
                     tab === 'presentation' ? '발표분석' : '대화분석';
    
    const ok = window.confirm(
      `정말로 ${tabLabel} 기록 ${items.length}개를 모두 삭제하시겠습니까?\n\n⚠️ 이 작업은 되돌릴 수 없습니다.`
    );
    if (!ok) return;

    setLoading(true);
    try {
      if (tab === 'interview') {
        await Promise.all(items.map(item => delete_I(item.i_id)));
      } else if (tab === 'presentation') {
        await Promise.all(items.map(item => delete_P(item.pr_id)));
      } else if (tab === 'communication') {
        await Promise.all(items.map(item => delete_C(item.c_id)));
      }
      setItems([]);
      alert(`${tabLabel} 기록이 모두 삭제되었습니다.`);
    } catch (err) {
      console.error('전체 삭제 실패:', err);
      alert('일부 항목 삭제에 실패했습니다. 다시 시도해주세요.');
      // 목록 새로고침
      loadList(tab);
    } finally {
      setLoading(false);
    }
  };

  const openItem = (item) => {
    if (tab === 'communication') {
      navigate(`/communication/result/${item.c_id}`);
    } else if (tab === 'interview') {
      navigate(`/interview/result/${item.i_id}`);
    } else if (tab === 'presentation') {
      navigate(`/presentation/result/${item.pr_id}`);
    }
  };

  return (
    <div className="w-full max-w-full mx-auto bg-white px-0 pt-4 pb-2">
      <div className="px-4 space-y-4">
        <h1 className="text-xl font-bold text-gray-900">기록</h1>

        <div className="grid grid-cols-4 gap-2">
          {tabs.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`rounded-full border px-2 py-3 text-xs font-semibold transition ${
                tab === item.key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === 'interview' && (
          <div className="flex gap-2">
            {['all', 'ko', 'en'].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguageFilter(lang)}
                className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  languageFilter === lang
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {lang === 'all' ? '전체' : lang === 'ko' ? '한국어' : 'English'}
              </button>
            ))}
          </div>
        )}

        {tab !== 'analysis' && items.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={deleteAll}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              전체 삭제
            </button>
          </div>
        )}

        <div className="bg-gradient-to-br from-[#e8f2ff] via-white to-[#e6fff5] rounded-2xl p-4 border border-white">
          {loading || analysisLoading ? (
            <div className="text-center text-sm text-gray-500 py-10">불러오는 중...</div>
          ) : (
            <>
              {tab === 'interview' && (
                <IList
                  items={items}
                  loading={loading}
                  error={error}
                  onDelete={deleteItem}
                  typeLabel={typeLabel}
                  formatDate={formatDate}
                  onSelect={openItem}
                  languageFilter={languageFilter}
                />
              )}
              {tab === 'presentation' && (
                <PList
                  items={items}
                  loading={loading}
                  error={error}
                  onDelete={deleteItem}
                  formatDate={formatDate}
                  onSelect={openItem}
                />
              )}
              {tab === 'communication' && (
                <CList
                  items={items}
                  loading={loading}
                  error={error}
                  onDelete={deleteItem}
                  formatDate={formatDate}
                  onSelect={openItem}
                />
              )}
              {tab === 'analysis' && (
                <AnalysisSection 
                  weaknesses={weaknesses} 
                  metricChanges={metricChanges} 
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};


// 성장분석 섹션 컴포넌트
const AnalysisSection = ({ weaknesses, metricChanges }) => {
  return (
    <div className="space-y-6">
      {/* 약점 분석 섹션 */}
      <WeaknessSection data={weaknesses} />
      
      {/* 지표 변화 섹션 */}
      <MetricChangeSection data={metricChanges} />
    </div>
  );
};


// 약점 분석 컴포넌트
const WeaknessSection = ({ data }) => {
  if (!data) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span className="text-lg">🎯</span> 말버릇/약점 분석
        </h3>
        <p className="text-gray-500 text-sm text-center py-4">데이터를 불러오는 중...</p>
      </div>
    );
  }

  if (!data.has_enough_data) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span className="text-lg">🎯</span> 말버릇/약점 분석
        </h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800 text-sm font-medium">
            📊 최소 3회 이상의 모의면접이 필요합니다
          </p>
          <p className="text-yellow-600 text-xs mt-1">
            현재 {data.total_interviews}회 완료
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
        <span className="text-lg">🎯</span> 말버릇/약점 분석
      </h3>
      
      {/* 요약 */}
      <p className="text-gray-700 text-sm mb-4">{data.summary}</p>

      {/* TOP 약점 리스트 */}
      <div className="space-y-4">
        {data.top_weaknesses && data.top_weaknesses.map((weakness, idx) => (
          <WeaknessCard key={idx} weakness={weakness} rank={idx + 1} />
        ))}
      </div>
    </div>
  );
};


// 개별 약점 카드
const WeaknessCard = ({ weakness, rank }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
            rank === 1 ? 'bg-red-100 text-red-600' :
            rank === 2 ? 'bg-orange-100 text-orange-600' :
            'bg-yellow-100 text-yellow-600'
          }`}>
            {rank}
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900 text-sm">{weakness.label_display_name}</p>
            <p className="text-xs text-gray-500">
              {weakness.occurrence_count}회 발생 · 평균 {weakness.avg_score.toFixed(2)}점
              <span className="text-gray-400 ml-1">(낮을수록 좋음)</span>
            </p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-3">
          {/* 증거 문장 */}
          {weakness.evidence_sentences && weakness.evidence_sentences.length > 0 && (
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-red-700 mb-2">발견된 문장</p>
              <ul className="space-y-1">
                {weakness.evidence_sentences.map((sent, idx) => (
                  <li key={idx} className="text-sm text-gray-700">
                    • "{sent.text || sent.sentence}"
                    {sent.created_at ? (
                      <span className="text-gray-400 text-xs ml-1">
                        ({formatDateShort(sent.created_at)})
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 개선 가이드 */}
          {weakness.improvement_guide && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-700 mb-1">개선 방법</p>
              <p className="text-sm text-gray-700">{weakness.improvement_guide}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


// 지표 변화 컴포넌트
const MetricChangeSection = ({ data }) => {
  if (!data) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span className="text-lg">📈</span> 지표 변화 추이
        </h3>
        <p className="text-gray-500 text-sm text-center py-4">데이터를 불러오는 중...</p>
      </div>
    );
  }

  if (!data.has_enough_data) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span className="text-lg">📈</span> 지표 변화 추이
        </h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800 text-sm font-medium">
            📊 최소 6회 이상의 모의면접이 필요합니다
          </p>
          <p className="text-yellow-600 text-xs mt-1">
            현재 {data.total_interviews}회 완료 · ({6 - data.total_interviews}회 더 필요)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
        <span
          className="text-lg"
          title="해석 가이드: 상승이 긍정적 - 발화 속도(WPM), STT 신뢰도. 하락이 긍정적 - 침묵 횟수, 침묵 비율, 격식 불일치"
        >
          📈
        </span> 지표 변화 추이
      </h3>

      {/* 요약 */}
      <p className="text-gray-700 text-sm mb-4">{data.summary}</p>

      {/* 변화가 큰 지표 TOP 5 */}
      <div className="space-y-3">
        {data.significant_changes && data.significant_changes.map((change, idx) => (
          <MetricChangeCard key={idx} change={change} />
        ))}
      </div>

      {data.significant_changes && data.significant_changes.length === 0 && (
        <p className="text-gray-500 text-sm text-center py-4">
          아직 유의미한 변화가 감지되지 않았습니다.
        </p>
      )}
    </div>
  );
};


// 개별 지표 변화 카드
const MetricChangeCard = ({ change }) => {
  const isPositive = change.is_positive;
  const changePercent = change.change_percent;
  const metricHints = {
    '발화 속도(WPM)': '올라갈수록 좋습니다. 너무 느리면 개선 필요',
    '침묵 횟수': '내려갈수록 좋습니다. 침묵이 많으면 주의',
    '침묵 비율': '내려갈수록 좋습니다. 침묵 구간이 많으면 주의',
    'STT 신뢰도': '올라갈수록 좋습니다. 낮으면 정확도 주의',
    '격식 불일치': '내려갈수록 좋습니다. 반말/격식 불일치는 줄이는 게 좋습니다.',
  };
  const hint = metricHints[change.metric_name] || '변화율이 높으면 성능에 영향이 크니 확인하세요.';
  
  return (
    <div
      className={`rounded-lg p-3 border ${
      isPositive 
        ? 'bg-green-50 border-green-200' 
        : 'bg-red-50 border-red-200'
    }`}
      title={hint}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`font-semibold text-sm ${isPositive ? 'text-green-800' : 'text-red-800'}`}>
            {change.metric_name}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-600">
              {change.previous_avg.toFixed(2)}
            </span>
            <span className="text-gray-400">→</span>
            <span className="text-xs text-gray-600">
              {change.recent_avg.toFixed(2)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%
          </p>
          <div className="flex items-center justify-end">
            <span className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '개선' : '주의'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};


// 날짜 간단 포맷
const formatDateShort = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};


export default function History() {
  return (
    <PhoneFrame
      showTitleRow={false}
      contentClass="px-0 pt-[2px] pb-0"
      headerContent={<Header fullWidth dense />}
    >
      <MainLayout fullWidth showHeader={false}>
        <HistoryContent />
      </MainLayout>
    </PhoneFrame>
  );
}
