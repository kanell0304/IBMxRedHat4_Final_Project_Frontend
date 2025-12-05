# 카카오 로그인 설정 가이드

## 1. 환경 변수 설정

`.env` 파일을 열어서 `VITE_KAKAO_CLIENT_ID`에 실제 카카오 REST API 키를 입력하세요.

```env
VITE_KAKAO_CLIENT_ID=여기에_실제_REST_API_키_입력
VITE_KAKAO_REDIRECT_URI=http://localhost:5173/user/kakao
VITE_API_BASE_URL=http://localhost:8000
```

## 2. 현재 상태 (라우터 없는 버전)

현재 `App.jsx`는 라우터 없이 카카오 로그인 버튼만 표시합니다.
- 카카오 로그인 버튼을 클릭하면 카카오 로그인 페이지로 이동합니다.
- 하지만 콜백을 처리할 페이지가 라우팅되지 않아 정상 작동하지 않습니다.

## 3. 완전한 기능을 위한 설정 (react-router-dom 설치 필요)

### 3-1. react-router-dom 설치

```bash
npm install react-router-dom
```

### 3-2. App.jsx 교체

`App.with-router.jsx` 파일의 내용을 `App.jsx`에 복사하거나, 파일명을 변경:

```bash
# 백업
mv src/App.jsx src/App.backup.jsx

# 라우터 버전으로 교체
mv src/App.with-router.jsx src/App.jsx
```

## 4. 실행

```bash
npm run dev
```

브라우저에서 http://localhost:5173 접속

## 5. 테스트 플로우

1. 카카오 로그인 버튼 클릭
2. 카카오 로그인 페이지에서 로그인
3. http://localhost:5173/user/kakao 로 리다이렉트
4. 백엔드 API 호출하여 토큰 받기
5. 토큰을 localStorage에 저장
6. 메인 페이지로 이동

## 6. 생성된 파일 목록

- `src/component/User/KakaoLoginButton.jsx` - 카카오 로그인 버튼 컴포넌트
- `src/pages/KakaoCallback.jsx` - 카카오 로그인 콜백 처리 페이지
- `.env` - 환경 변수 설정 파일
- `src/App.jsx` - 현재 버전 (라우터 없음)
- `src/App.with-router.jsx` - 라우터 포함 버전 (완전한 기능)

## 7. 카카오 개발자 콘솔 설정 확인

1. https://developers.kakao.com/ 접속
2. 내 애플리케이션 선택
3. Web 플랫폼 등록: http://localhost:5173
4. Redirect URI 등록: http://localhost:5173/user/kakao
5. 동의 항목 설정: 이메일(필수)

## 8. 백엔드 설정 확인

백엔드의 `.env` 파일도 확인:

```env
KAKAO_REDIRECT_URI=http://localhost:5173/user/kakao
```

주의: 백엔드와 프론트엔드의 REDIRECT_URI가 동일해야 합니다!
