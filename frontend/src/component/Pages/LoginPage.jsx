import KakaoLoginButton from '../User/KakaoLoginButton'
import { useState } from 'react';
import axios from 'axios';

const LoginPage = () => {

  const [serverStatus, setServerStatus] = useState("버튼을 눌러주세요");

  const handleClickHealthCheck = async () => {
    try {
      const response = await axios.get(`http://localhost:8081/health`);

      if (response) {
        setServerStatus(response.statusText);
      }

    } catch (error) {
      console.log(error);
    }
  }

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
        <button onClick={handleClickHealthCheck}>HealthCheck</button>
        <p>서버상태: {serverStatus}</p>
      </div>
    </div>
  );
}

export default LoginPage;
