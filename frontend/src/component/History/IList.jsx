export default function IList({ items, loading, error, onDelete, typeLabel, formatDate, onSelect }) {
  if (error) {
    return <div className="text-center text-sm text-red-600 py-10">{error}</div>;
  }

  if (!items.length) {
    return <div className="text-center text-sm text-gray-500 py-10">기록이 없습니다.</div>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.i_id} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4 shadow-sm">
          <button
            type="button"
            onClick={() => onSelect && onSelect(item)}
            className="flex-1 text-left space-y-1"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">{typeLabel(item.interview_type)}</span>
              <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 text-gray-600">질문 {item.total_questions}개</span>
            </div>
            <p className="text-xs text-gray-400">{formatDate(item.created_at)}</p>
          </button>
          <button
            onClick={() => onDelete(item.i_id)}
            className="text-sm text-red-600 border border-red-200 rounded-lg px-3 py-2 hover:bg-red-50"
          >
            삭제
          </button>
        </div>
      ))}
    </div>
  );
}
