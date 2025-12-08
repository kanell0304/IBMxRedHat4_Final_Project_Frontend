import Input from './Input'

// FormField: label + input + error 조합
export default function FormField({
  label,
  error,
  required = false,
  className = '',
  children,
  ...inputProps
}) {
  return (
    <label className={`flex flex-col gap-2 text-sm font-semibold text-text ${className}`}>
      {/* 레이블 (있으면 표시) */}
      {label && (
        <span className="text-xs font-semibold text-text-soft">
          {label}
          {/* 필수 항목이면 빨간 별표 표시 */}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
      )}

      {/* children이 있으면 children, 없으면 기본 Input 사용 */}
      {children || <Input error={error} required={required} {...inputProps} />}

      {/* 에러 메시지 (있으면 표시) */}
      {error && (
        <span className="text-xs text-red-500 font-normal">{error}</span>
      )}
    </label>
  )
}