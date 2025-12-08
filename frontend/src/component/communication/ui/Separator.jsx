// Separator: 구분선
export default function Separator({ className = '' }) {
  // 얇은 수평선 (높이 1px, 연한 초록색, 위아래 여백)
  return <div className={`h-px bg-primary-dark/10 my-4 ${className}`} />
}