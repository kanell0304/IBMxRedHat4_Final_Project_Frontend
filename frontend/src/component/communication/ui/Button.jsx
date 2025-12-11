// Button: 모든 버튼 스타일 통합 컴포넌트
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  disabled = false,
  onClick,
  ...props
}) {
  // 기본 스타일 (둥근 모서리, 호버 시 살짝 올라감, disabled 시 반투명)
  const baseStyles = 'rounded-lg font-medium transition-all duration-200 cursor-pointer shadow-sm hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0'

  // 버튼 색상 테마
  const variants = {
    primary: 'bg-gradient-primary text-white hover:shadow-md',           // 초록 그라디언트
    ghost: 'bg-white text-text border border-primary-dark/20 hover:bg-primary-light/10', // 흰 배경 + 테두리
    danger: 'bg-gradient-danger text-white hover:shadow-md',             // 빨간 그라디언트
  }

  // 버튼 크기
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  // 스타일 합치기
  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`
  
  return (
    <button 
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}