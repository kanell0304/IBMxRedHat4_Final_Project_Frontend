import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './component/Auth/LoginPage.jsx';
import SignupPage from './component/Auth/SignupPage.jsx';
import FindPasswordRequestPage from './component/Auth/FindPasswordRequestPage.jsx';
import FindPasswordResetPage from './component/Auth/FindPasswordResetPage.jsx';
import MainPage from './component/Pages/MainPage.jsx';
import Mypage from './component/Pages/Mypage.jsx';
import KakaoCallback from './component/Pages/KakaoCallback.jsx';
import Information from './component/Interview/Information';
import MainLayout from './component/Layout/MainLayout.jsx';
import Job from './component/Interview/Job.jsx';
import JobEng from './component/Interview/JobEng.jsx';
import Interview from './component/Interview/Interview.jsx';
import History from './component/Pages/History.jsx';
import Profile from './component/Pages/Profile.jsx';
import PresentationCreate from './component/Presentation/PresentationCreate.jsx';
import PresentationUpload from './component/Presentation/PresentationUpload.jsx';
import PresentationResult from './component/Presentation/PresentationResult.jsx';
import PresentationDetail from './component/Presentation/PresentationDetail.jsx';
import CommunicationInformation from './component/Communication/CommunicationInformation.jsx';
import CommunicationList from './component/Communication/CommunicationList.jsx';
import CommunicationUpload from './component/Communication/CommunicationUpload.jsx';
import CommunicationSpeakerSelect from './component/Communication/CommunicationSpeakerSelect.jsx';
import CommunicationResult from './component/Communication/CommunicationResult.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 메인페이지 */}
        <Route path="/" element={<MainLayout><MainPage /></MainLayout>} />
        <Route path="/mypage" element={<MainLayout><Mypage /></MainLayout>} />
        <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
        <Route path="/history" element={<MainLayout><History /></MainLayout>} />

        {/* 로그인 페이지*/}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/user/kakao" element={<KakaoCallback />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/find-password" element={<FindPasswordRequestPage />} />
        <Route path="/reset-password" element={<FindPasswordResetPage />} />

        {/* 인터뷰 */}
        <Route path="/interview/info" element={<Information />} />
        <Route path="/interview/job" element={<Job/>} />
        <Route path="/interview/job-en" element={<JobEng />} />
        <Route path="/interview" element={<Interview />} />

        {/* 발표 분석 */}
        <Route path="/presentation/create" element={<PresentationCreate />} />
        <Route path="/presentation/upload/:prId" element={<PresentationUpload />} />
        <Route path="/presentation/result/:prId" element={<PresentationResult />} />
        <Route path="/presentation/detail/:prId" element={<PresentationDetail />} />

        {/* 대화 분석 */}
        <Route path="/communication/info" element={<MainLayout><CommunicationInformation /></MainLayout>} />
        <Route path="/communication" element={<MainLayout><CommunicationList /></MainLayout>} />
        <Route path="/communication/upload" element={<MainLayout><CommunicationUpload /></MainLayout>} />
        <Route path="/communication/speaker/:c_id" element={<MainLayout><CommunicationSpeakerSelect /></MainLayout>} />
        <Route path="/communication/result/:c_id" element={<MainLayout><CommunicationResult /></MainLayout>} />
      </Routes>
    </BrowserRouter>
  );
}
