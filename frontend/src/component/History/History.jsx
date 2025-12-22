import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, get_I, delete_I, get_P, delete_P, get_C, delete_C } from '../History/HistoryAPI';
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
  const [uid, setUid] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        const res = await getMe();
        setUid(res.data.user_id);
      } catch (e) {
        setError('로그인이 필요합니다.');
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (tab === 'interview') {
      loadList('interview');
    } else if (tab === 'presentation') {
      loadList('presentation');
    } else if (tab === 'communication') {
      loadList('communication');
    }
  }, [tab, uid]);

  const loadList = async (type) => {
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
    } catch (e) {
      setError('조회 실패');
    } finally {
      setLoading(false);
    }
  };

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
    } catch (e) {
      alert('삭제에 실패했습니다.');
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

        <div className="grid grid-cols-3 gap-2">
          {tabs.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`rounded-full border px-3 py-3 text-sm font-semibold transition ${
                tab === item.key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="bg-gradient-to-br from-[#e8f2ff] via-white to-[#e6fff5] rounded-2xl p-4 border border-white">
          {loading ? (
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
            </>
          )}
        </div>
      </div>
    </div>
  );
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
