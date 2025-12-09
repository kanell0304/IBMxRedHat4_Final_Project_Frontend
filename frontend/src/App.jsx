import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './component/Pages/LoginPage.jsx';
import MainPage from './component/Pages/MainPage.jsx';
import KakaoCallback from './component/Pages/KakaoCallback.jsx';
import Information from './component/Interview/Information';
import MainLayout from './component/Layout/MainLayout.jsx';
import Job from './component/Interview/Job.jsx';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 메인페이지 */}
        <Route path="/" element={<MainLayout><MainPage /></MainLayout>}></Route>

        {/* 로그인 페이지(임시) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/user/kakao" element={<KakaoCallback />} />
        <Route path="/interview/info" element={<Information />}></Route>

        {/* 인터뷰 */}
        <Route path="/interview/info" element={<Information />}></Route>
        <Route path="interview/job" element={<Job/>} />

      </Routes>
    </BrowserRouter>
  );
}