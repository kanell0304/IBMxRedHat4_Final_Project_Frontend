// Input: 텍스트, 이메일, 비밀번호, 날짜 입력 컴포넌트
export default function Input({
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  error,
  ...props
}) {
  // 기본 스타일 (모든 입력에 공통 적용)
  const baseStyles = 'w-full border rounded-lg bg-white text-text transition-all duration-200 focus:outline-none'

  // 일반 상태 스타일 (포커스 시 초록색 외곽선)
  const normalStyles = 'border-primary-dark/20 focus:border-primary focus:shadow-[0_0_0_0.25rem_rgba(16,185,129,0.15)]'

  // 에러 상태 스타일 (포커스 시 빨간색 외곽선)
  const errorStyles = 'border-red-500 focus:border-red-500 focus:shadow-[0_0_0_0.25rem_rgba(239,68,68,0.15)]'

  // 날짜 타입 > 패딩 살짝 작게
  const sizeStyles = type === 'date' ? 'px-3 py-2 text-sm' : 'px-3 py-2.5 text-sm'

  // error prop 유무에 따라 스타일 분기
  const classes = `${baseStyles} ${error ? errorStyles : normalStyles} ${sizeStyles} ${className}`
  
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={classes}
      {...props}
    />
  )
}