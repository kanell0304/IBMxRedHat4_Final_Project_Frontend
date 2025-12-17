export const jobOptions = {
   'AI·개발·데이터': ['백엔드개발', '프론트엔드개발'],
  // 'AI·개발·데이터': ['백엔드개발', '프론트엔드개발', '웹개발자', '앱개발자', '시스템엔지니어', '네트워크엔지니어', '데이터엔지니어', '데이터사이언티스트', '보안엔지니어', '소프트웨어개발자', '게임개발자', '하드웨어개발자', 'AI/ML엔지니어', '데이터분석가', '프롬프트엔지니어', 'AI서비스개발자'],
  // '기획·전략': ['경영·비즈니스기획', '웹기획', '마케팅기획', 'AI기획자'],
  // '디자인': ['그래픽디자이너', '3D디자이너', '제품디자이너', '산업디자이너', '광고디자이너', '시각디자이너', '영상디자이너', '웹디자이너', 'UI·UX디자이너', '패션디자이너'],
  // '인사·HR': ['인사담당자', '헤드헌터', 'HRM', 'HRD'],
  // '마케팅·광고·MD': ['브랜드마케터', '퍼포먼스마케터', 'CRM마케터', '온라인마케터', '콘텐츠마케팅', 'MD', '홍보', '크리에이티브디렉터'],
  // '금융·보험': ['금융사무', '보험설계사', '은행원·텔러', '펀드매니저', '애널리스트'],
  // '영업': ['제품영업', '서비스영업', '해외영업', 'IT·기술영업', '광고영업', '금융영업'],
};

export const questionTypes = [
  { key: '공통질문만', label: '공통질문만', desc: '자기소개, 장단점 등 공통 질문' },
  { key: '직무관련', label: '직무 관련만', desc: '선택 직무 기반 질문' },
  { key: '섞어서', label: '섞어서', desc: '공통 + 직무 질문' },
];

export const difficultyOptions = [
  { key: '쉬움', label: '쉬움', desc: '신입' },
  { key: '중간', label: '중간', desc: '경력 1~3년' },
  { key: '어려움', label: '어려움', desc: '경력 3년 이상' },
];

export const baseBtn =
  'w-full min-h-[80px] px-3.5 py-2 rounded-xl border border-slate-200/80 bg-white text-sm font-semibold text-slate-900 shadow-sm shadow-slate-200/60 hover:-translate-y-[1px] hover:shadow-md hover:border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-100 active:translate-y-0 transition duration-150 inline-flex flex-col items-center justify-center gap-1 text-center leading-tight';

export const selectedBtn =
  'bg-white text-sky-900 border-2 border-sky-300 shadow-md shadow-sky-100 ring-2 ring-offset-1 ring-offset-white ring-sky-100';
