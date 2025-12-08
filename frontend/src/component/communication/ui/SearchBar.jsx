// SearchBar: 검색 입력 + 버튼 조합
export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = 'Search...',
  className = '',
}) {
  // form 제출 시 실행 (Enter 키 또는 버튼 클릭)
  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSearch) onSearch(value)
  }

  return (
    <form
      className={`flex items-center gap-3 flex-1 min-w-[26rem] ${className}`}
      onSubmit={handleSubmit}
    >
      {/* 검색 입력창 */}
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="flex-1 h-12 px-5 rounded-xl bg-white text-text border border-primary-dark/20 text-sm transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-[0_0_0_0.25rem_rgba(16,185,129,0.15)] placeholder:text-text-soft"
      />

      {/* 검색 버튼 */}
      <button
        type="submit"
        className="h-12 px-6 rounded-xl bg-gradient-primary text-white font-semibold cursor-pointer text-sm transition-all duration-200 shadow-button hover:-translate-y-px hover:shadow-lg"
      >
        Search
      </button>
    </form>
  )
}