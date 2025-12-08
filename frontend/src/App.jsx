import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import KakaoLoginButton from './component/User/KakaoLoginButton'
import KakaoCallback from './pages/KakaoCallback'
import Information from './component/Interview/Information';

function HomePage() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '30px'
    }}>
      <h1>TeamProject 로그인</h1>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '15px',
        alignItems: 'center' 
      }}>
        <KakaoLoginButton />
        
        <p style={{ color: '#666', fontSize: '14px' }}>
          또는
        </p>
        
        <button 
          style={{
            backgroundColor: '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '16px',
            cursor: 'pointer',
            minWidth: '200px'
          }}
        >
          일반 로그인
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/user/kakao" element={<KakaoCallback />} />
        <Route path="/interview/info" element={<Information />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
