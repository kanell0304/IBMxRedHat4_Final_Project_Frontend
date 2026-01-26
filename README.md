<div align="center">

# 🎤 STEACH - Frontend

### **"Your Personal Voice Coach"**

AI 기반 음성 분석 및 발표 코칭 플랫폼

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.2.2-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/React_Router-7.10.1-CA4245?style=flat-square&logo=reactrouter)](https://reactrouter.com/)

[Backend Repository](https://github.com/kanell0304/IBMxRedHat4_Final_Project_Backend)

</div>

---

## 📌 프로젝트 소개

**STEACH**는 음성 인식 AI를 활용하여 사용자의 말투, 억양, 말하기 속도, 감정 등을 종합적으로 분석하고 맞춤형 피드백을 제공하는 음성 코칭 서비스입니다. 면접 준비, 발표 연습, 일상 대화 분석 등 다양한 상황에서 활용할 수 있습니다.

### 🎯 해결하고자 한 문제

| 문제점 | 솔루션 |
|--------|--------|
| 면접이나 발표 연습 시 객관적인 피드백을 받기 어려움 | AI 기반 실시간 음성 분석 및 즉각적인 피드백 제공 |
| 말하기 습관과 패턴을 스스로 파악하기 힘듦 | 음성 특징(속도, 억양, 감정) 자동 추출 및 시각화 |
| 부적절한 표현 사용을 인지하지 못함 | BERT 기반 언어 분석으로 부적절한 표현 자동 감지 |
| 발음 연습을 혼자 하기 어려움 | 게이미피케이션을 통한 재미있는 발음 정확도 트레이닝 |

---

## ✨ 주요 기능

### 🎙️ 모의 면접 (Interview Practice)
- 실시간 음성 녹음 및 질문별 답변 기록
- Google STT 기반 음성-텍스트 변환
- BERT 모델을 통한 부적절한 표현 자동 감지
- OpenAI GPT를 활용한 맞춤형 피드백 생성
- 세션 기록 및 이력 관리

### 💬 대화 분석 (Communication Analysis)
- 음성 파일 업로드 및 화자 자동 분류
- 특정 화자 선택 후 집중 분석
- 말투, 어휘 선택, 대화 패턴 분석
- AI 기반 개선 제안

### 📊 발표 분석 (Presentation Analysis)
**음향 특징 분석 (Librosa)**
- 말하기 속도 (Speech Rate)
- 발화 속도 (Articulation Rate)
- 억양 변화 (Pitch Variation)
- 음높이 범위 (Pitch Range)

**감정 분석 (Wav2Vec2 + SVM)**
- 음성에서 감정 벡터 추출
- 사전 학습된 감정 분류 모델 적용
- 감정 상태 점수화

**종합 피드백**
- 각 지표별 점수 산출
- OpenAI 기반 종합 코칭 메시지

### 🎮 미니게임 (Pronunciation Game)
- 난이도별 문장 제시 (쉬움/보통/어려움)
- 게임 모드 선택 (문제 수/시간 제한)
- 실시간 발음 정확도 측정
- 게임 결과 점수 기록

### 💬 커뮤니티 (Community)
- 자유 게시판 글 작성 및 조회
- 댓글 및 대댓글 시스템
- 좋아요 기능
- 사용자 간 정보 공유

---

## 🏗️ 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
│   - React Router DOM (페이지 라우팅)                              │
│   - Axios (API 통신)                                             │
│   - Recharts (데이터 시각화)                                      │
│   - Web Audio API (실시간 녹음)                                  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │   FastAPI Backend Server   │
         │   - STT (Google/Whisper)   │
         │   - BERT (언어 분석)        │
         │   - Wav2Vec2 (감정 분석)   │
         │   - OpenAI GPT (피드백)    │
         └────────────────────────────┘
```

---

## 🛠️ 기술 스택

| 분류 | 기술 |
|------|------|
| **Core** | React 18.3.1, Vite 7.2.2 |
| **라우팅** | React Router DOM 7.10.1 |
| **스타일링** | Tailwind CSS 3.4.17, PostCSS, Autoprefixer |
| **HTTP 통신** | Axios 1.13.2 |
| **데이터 시각화** | Recharts 3.5.1 |
| **인증** | JWT (localStorage 기반), Kakao OAuth 2.0 |
| **오디오 처리** | Web Audio API (MediaRecorder) |
| **UI/UX** | React Device Frameset (모바일 프레임) |
| **코드 품질** | ESLint 9.39.1 |

---

## 📁 프로젝트 구조

```
frontend/
├── public/                    # 정적 파일
├── src/
│   ├── api/                   # API 통신 모듈
│   │   ├── authApi.js         # 인증 관련 API
│   │   ├── interviewSessionApi.js  # 면접 세션 API
│   │   ├── communityApi.js    # 커뮤니티 API
│   │   ├── minigameApi.js     # 미니게임 API
│   │   └── adminApi.js        # 관리자 API
│   ├── component/
│   │   ├── Auth/              # 로그인, 회원가입, 비밀번호 찾기
│   │   ├── Interview/         # 모의 면접 컴포넌트
│   │   │   ├── Interview.jsx
│   │   │   ├── InterviewResult.jsx
│   │   │   ├── AnalysisLoading.jsx
│   │   │   └── useRecorder.js  # 녹음 커스텀 훅
│   │   ├── communication/     # 대화 분석 컴포넌트
│   │   │   ├── CommunicationUpload.jsx
│   │   │   ├── CommunicationSpeakerSelect.jsx
│   │   │   └── CommunicationResult.jsx
│   │   ├── Presentation/      # 발표 분석 컴포넌트
│   │   │   ├── PresentationUpload.jsx
│   │   │   ├── PresentationAnalysisLoading.jsx
│   │   │   └── PresentationResult.jsx
│   │   ├── Minigame/          # 미니게임 컴포넌트
│   │   │   ├── MiniGameMain.jsx
│   │   │   ├── GamePlay.jsx
│   │   │   ├── Timer.jsx
│   │   │   └── RecordingButton.jsx
│   │   ├── Community/         # 커뮤니티 컴포넌트
│   │   │   ├── CommunityList.jsx
│   │   │   ├── CommunityDetail.jsx
│   │   │   └── CommunityWrite.jsx
│   │   ├── History/           # 분석 히스토리
│   │   ├── Layout/            # 공통 레이아웃
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── MainLayout.jsx
│   │   │   └── PhoneFrame.jsx
│   │   ├── Pages/             # 메인 페이지
│   │   │   ├── MainPage.jsx
│   │   │   ├── Mypage.jsx
│   │   │   └── AdminPage.jsx
│   │   └── User/              # 사용자 관련
│   │       └── KakaoLoginButton.jsx
│   ├── hooks/                 # 커스텀 훅
│   │   ├── useAuth.js         # 인증 상태 관리
│   │   └── useCommunication.jsx
│   ├── services/              # 공통 서비스
│   │   └── api.js             # Axios 인스턴스
│   ├── utils/                 # 유틸리티
│   │   └── jwt.js             # JWT 토큰 관리
│   ├── App.jsx                # 메인 앱 컴포넌트
│   └── main.jsx               # 진입점
├── .env                       # 환경 변수
├── vite.config.js             # Vite 설정
├── tailwind.config.js         # Tailwind CSS 설정
└── package.json               # 의존성 관리
```

---

## 🚀 실행 방법

### 환경 요구사항
- Node.js 18.x 이상
- npm 또는 yarn

### 로컬 개발 환경

```bash
# 1. 저장소 클론
git clone https://github.com/kanell0304/IBMxRedHat4_Final_Project_Frontend .
cd TeamProject_Frontend/frontend

# 2. 의존성 설치
npm install

# 3. 환경변수 설정
cp frontend/ 경로에 .env 생성
''' .env
VITE_KAKAO_CLIENT_ID=954a35de48d932b17dd074183a7e6987
VITE_KAKAO_REDIRECT_URI=http://localhost:5173/user/kakao
VITE_API_BASE_URL=http://localhost:8081
VITE_API_URL=http://localhost:8081
'''

# 4. 개발 서버 실행
npm run dev

# 5. 브라우저에서 접속
http://localhost:5173
```

---

## 🔧 주요 기능 구현

### 실시간 음성 녹음

```javascript
// useRecorder.js
const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);
  
  mediaRecorder.ondataavailable = (e) => {
    chunks.current.push(e.data);
  };
  
  mediaRecorder.start();
};
```

### JWT 인증 관리

```javascript
// utils/jwt.js
export const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

export const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};
```

### API 통신

```javascript
// services/api.js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 📊 주요 화면

### 메인 페이지
- 서비스 소개 및 주요 기능 안내
- 로그인/회원가입 진입

### 모의 면접
- 질문 선택 및 실시간 녹음
- 분석 진행 상황 표시
- 결과 및 피드백 확인

### 대화 분석
- 화자 선택
- 채팅창 형태의 대화 기록 제공
- 통합 분석 제공

### 발표 분석
- 음성 파일 업로드
- 음향 특징 및 감정 분석
- 통합, 상세 피드백 제공

### 미니게임
- 난이도 및 게임 모드 선택
- 실시간 발음 정확도(%) 측정
- 최고 점수 기록

---

## 🎨 디자인 시스템

### 컬러 팔레트 (Tailwind CSS 기반)
- Primary: Blue-500
- Secondary: Gray-600
- Success: Green-500
- Warning: Yellow-500
- Danger: Red-500

### 타이포그래피
- 기본 폰트: system-ui
- 헤딩: 볼드 (font-bold)
- 본문: 레귤러 (font-normal)

---

## 📝 라이선스

This project is licensed under the MIT License.

---

## 👥 팀원

| 이름 | 역할 | <br>
| 이경준 | PL, Presentation Service, Authentication, Minigame, Community, UI/UX | <br>
| 하태호 | Interview Service, History, MainPage, UI/UX | <br>
| 김가현 | Interview Service, UI/UX | <br>
| 손연서 | Commuincation service, UI/UX | <br>

---

## 📞 문의

프로젝트 관련 문의사항이 있으시면 kanell0304@gmail.com 로 이메일을 보내주세요.
