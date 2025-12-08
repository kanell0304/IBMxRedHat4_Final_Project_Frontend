// IconButton: 아이콘 전용 정사각형 버튼
export default function IconButton({
  children,
  onClick,
  size = 'md',
  className = '',
  title,
  type = 'button',
  ...props
}) {
  // 기본 스타일 (정사각형 버튼, 호버 시 살짝 올라감)
  const baseStyles = 'grid place-items-center rounded-xl bg-surface border border-primary-dark/15 cursor-pointer text-text transition-all duration-200 hover:bg-primary-light/10 hover:-translate-y-px'

  // 버튼 크기 (정사각형)
  const sizes = {
    sm: 'w-9 h-9 text-sm',
    md: 'w-12 h-12 text-base',
  }

  // 스타일 합치기
  const classes = `${baseStyles} ${sizes[size]} ${className}`
  
  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      title={title}
      {...props}
    >
      {children}
    </button>
  )
}