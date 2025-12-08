// Badge: 작은 라벨/태그
export default function Badge({
  children,
  variant = 'default',
  className = '',
}) {
  // 기본 스타일 (작고 둥근 라벨)
  const baseStyles = 'inline-flex items-center px-2 py-1 rounded-xl text-xs font-semibold'

  // 배지 색상 테마
  const variants = {
    default: 'bg-primary/15 text-text',        // 연한 초록 배경
    purple: 'bg-primary-light/15 text-text',   // 연한 보라 배경
    dark: 'bg-black/65 text-white backdrop-blur', // 반투명 검정 배경
  }

  // 스타일 합치기
  const classes = `${baseStyles} ${variants[variant]} ${className}`
  
  return (
    <span className={classes}>
      {children}
    </span>
  )
}