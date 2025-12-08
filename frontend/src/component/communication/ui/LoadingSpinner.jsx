// LoadingSpinner: 로딩 표시
export default function LoadingSpinner({
  message = '로딩 중...',
  size = 'md',
  className = '',
}) {
  // 스피너 크기
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-8 ${className}`}>
      {/* 회전하는 원형 스피너 (위쪽만 진한 초록색) */}
      <div className={`${sizes[size]} border-4 border-primary-light border-t-primary rounded-full animate-spin`} />

      {/* 로딩 메시지 (있으면 표시) */}
      {message && <p className="text-sm text-text-soft">{message}</p>}
    </div>
  )
}