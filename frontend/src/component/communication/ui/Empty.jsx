// Empty: 빈 상태 표시
export default function Empty({
  message = '데이터가 없습니다',
  icon,
  className = '',
}) {
  return (
    <div className={`text-center py-8 px-4 text-text-soft text-sm ${className}`}>
      {/* 아이콘이 있으면 표시 (큰 크기 + 반투명) */}
      {icon && <div className="text-4xl mb-3 opacity-50">{icon}</div>}

      {/* 빈 상태 메시지 */}
      <p>{message}</p>
    </div>
  )
}