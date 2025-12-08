import { useRef } from 'react'

// FileUpload: 파일 선택 버튼 + 파일명 표시 + 미리보기
export default function FileUpload({
  onChange,
  accept = 'image/*',
  fileName = '',
  preview,
  className = '',
}) {
  // 숨겨진 input을 참조하기 위한 ref
  const fileRef = useRef()

  // 파일 선택 시 실행되는 핸들러
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file && onChange) {
      onChange(file)
    }
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* 파일 선택 버튼 + 파일명 표시 영역 */}
      <div className="flex items-center gap-3 w-full max-w-[32rem]">
        {/* 파일 선택 버튼 (클릭 시 숨겨진 input 활성화) */}
        <button
          type="button"
          className="px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-xs font-semibold shadow-button hover:shadow-lg transition-all duration-200"
          onClick={() => fileRef.current?.click()}
        >
          파일 선택
        </button>

        {/* 선택된 파일명 표시 영역 */}
        <span className="flex-1 min-h-[2.5rem] flex items-center px-3 border border-primary-dark/20 rounded-lg bg-white text-text text-xs min-w-[14rem]">
          {fileName || '선택된 파일 없음'}
        </span>
      </div>

      {/* 숨겨진 파일 input */}
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 이미지 미리보기 (preview prop이 있으면 표시) */}
      {preview && (
        <img
          className="mt-2 max-h-[14rem] rounded-lg shadow"
          src={preview}
          alt="preview"
        />
      )}
    </div>
  )
}