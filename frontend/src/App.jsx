import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './component/Pages/LoginPage.jsx';
import MainPage from './component/Pages/MainPage.jsx';
import KakaoCallback from './component/Pages/KakaoCallback.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 메인페이지 */}
        <Route path="/" element={<MainPage />}></Route>

        {/* 로그인 페이지(임시) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/user/kakao" element={<KakaoCallback />} />
      </Routes>
    </BrowserRouter>
  );
}
