export default function PList({ items, loading, error, onDelete, formatDate, onSelect }) {
  const canDelete = typeof onDelete === 'function';

  if (error) {
    return <div className="text-center text-sm text-red-600 py-10">{error}</div>;
  }

  if (!items.length) {
    return <div className="text-center text-sm text-gray-500 py-10">기록이 없습니다.</div>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.pr_id} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4 shadow-sm">
          <button
            type="button"
            onClick={() => onSelect && onSelect(item)}
            className="flex-1 text-left space-y-1"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">{item.title || '제목 없음'}</span>
            </div>
            {item.description && <p className="text-sm text-gray-600 truncate">{item.description}</p>}
            <p className="text-xs text-gray-400">{formatDate(item.created_at)}</p>
          </button>
          {canDelete && (
            <button
              onClick={() => onDelete(item.pr_id)}
              className="text-sm text-red-600 border border-red-200 rounded-lg px-3 py-2 hover:bg-red-50"
            >
              삭제
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
