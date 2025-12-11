import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './component/Pages/LoginPage.jsx';
import MainPage from './component/Pages/MainPage.jsx';
import KakaoCallback from './component/Pages/KakaoCallback.jsx';
import Information from './component/Interview/Information';
import MainLayout from './component/Layout/MainLayout.jsx';
import Test from './component/communication/test.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 메인페이지 */}
        <Route path="/" element={<MainLayout><MainPage /></MainLayout>} />

        {/* 로그인 페이지(임시) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/user/kakao" element={<KakaoCallback />} />

        <Route path="/interview/info" element={<MainLayout><Information /></MainLayout>}></Route>

        <Route path="/test" element={<MainLayout><Test /></MainLayout>}></Route>
      </Routes>
    </BrowserRouter>
  );
}
