// Avatar: 프로필 아바타 (이미지 또는 이니셜)
export default function Avatar({
  src,   // 이미지 링크
  name = 'USER',   // 이름(기본값 USER)
  size = 'md',   // 사이즈(기본값 md)
  clickable = false,   // 클릭 가능 여부 (가능 시 hover스타일 추가)
  onClick,
  className = '',
}) {
  const baseStyles = 'rounded-full bg-gradient-primary grid place-items-center font-semibold text-white border-primary/20 transition-all duration-200'
  
  // 아바타 이미지 사이즈
  const sizes = {
    sm: 'w-8 h-8 text-sm border-2',
    md: 'w-10 h-10 text-base border-2',
    lg: 'w-16 h-16 text-xl border-[3px]',
    xl: 'w-20 h-20 text-2xl border-[3px]',
  }
  
  // clickable이 
  // true면 > 호버 시 커짐 + 커서 포인터로 변경
  // false면 > '' (스타일 없음)
  const clickableStyles = clickable ? 'cursor-pointer hover:scale-105' : ''

  // 위에서 정의한 스타일들 한 줄로 합침
  const classes = `${baseStyles} ${sizes[size]} ${clickableStyles} ${className}`
  
  // name의 첫 번째 문자 대문자로 반환 (없으면 User의 U)
  const initial = name?.[0]?.toUpperCase() || 'U'
  
  if (src) {
    return (
      <div className={classes} onClick={onClick}>
        <img 
          src={src} 
          alt={name} 
          className="w-full h-full rounded-full object-cover"
        />
      </div>
    )
  }
  
  return (
    <div className={classes} onClick={onClick}>
      {initial}
    </div>
  )
}