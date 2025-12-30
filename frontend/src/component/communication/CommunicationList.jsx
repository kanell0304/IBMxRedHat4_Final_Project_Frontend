import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import PhoneFrame from '../Layout/PhoneFrame';

export default function CommunicationList() {
  const nav = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/communication/users/1/communications');
        setList(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatDate = (d) => new Date(d).toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  
  const statusConfig = {
    in_progress: { text: '분석 중', color: 'bg-yellow-100 text-yellow-700' },
    completed: { text: '완료됨', color: 'bg-blue-100 text-blue-700' },
    stopped: { text: '중단됨', color: 'bg-gray-100 text-gray-600' },
    failed: { text: '실패', color: 'bg-red-100 text-red-600' }
  };

  if (loading) return (
    <PhoneFrame title="대화 분석">
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <p className="text-sm font-semibold text-gray-900">목록을 불러오는 중...</p>
      </div>
    </PhoneFrame>
  );

  return (
    <PhoneFrame title="대화 분석" showTitleRow={true}>
      <div className="space-y-6 pb-24">
        {/* Header */}
        <div className="px-1 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">내 분석 목록</h1>
            <p className="text-sm text-gray-500 mt-1">지금까지 분석한 대화 기록입니다.</p>
          </div>
        </div>

        {/* New Analysis Button */}
        <button 
          onClick={() => nav('/communication/info')}
          className="w-full py-4 rounded-3xl bg-blue-600 text-white font-bold text-lg shadow-xl shadow-blue-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span className="text-2xl font-light">+</span> 새 분석 시작
        </button>

        {/* List */}
        {list.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 mt-4">
            <div className="text-5xl mb-4 opacity-20">💬</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">아직 분석한 대화가 없어요</h2>
            <p className="text-sm text-gray-500">첫 대화 분석을 시작해보세요!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {list.map(c => {
              const cfg = statusConfig[c.status] || statusConfig.in_progress;
              return (
                <button 
                  key={c.c_id}
                  onClick={() => nav(c.status === 'completed' ? `/communication/result/${c.c_id}` : `/communication/speaker/${c.c_id}`)}
                  className="w-full bg-white rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex items-center gap-4 transition-all hover:bg-gray-50 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${c.status === 'completed' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                    {c.status === 'completed' ? '📊' : '⏳'}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-bold text-gray-900 truncate">대화 #{c.c_id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>
                        {cfg.text}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">{formatDate(c.created_at)}</p>
                  </div>
                  <span className="text-gray-300 text-xl">›</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}
