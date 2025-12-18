import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { resetPassword } from '../../api/authApi.js';
import PhoneFrame from '../Layout/PhoneFrame.jsx';

export default function FindPasswordResetPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email; 

  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      alert('잘못된 접근입니다. 이메일 인증부터 다시 시도해 주세요.');
      navigate('/find-password');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    setIsLoading(true);

    const resetData = {
      email: email,
      reset_code: resetCode, 
      new_password: newPassword,
    };
  
    console.log("백엔드로 전송할 데이터 (Body):", JSON.stringify(resetData, null, 2));

    try {
     
      const response = await resetPassword(resetData);

    
      console.log(response.data.message);
      alert('비밀번호가 성공적으로 변경되었습니다. 로그인 페이지로 이동합니다.');
      navigate('/login');

    } catch (error) {
    
      console.error('비밀번호 변경 실패:', error);
      
    
      if (error.response) {
       
        console.error("서버 응답 에러:", error.response.data);
        alert(`비밀번호 변경 실패: ${error.response.data.detail || '서버 오류'}`);
      } else if (error.request) {
       
        console.error("서버 응답 없음:", error.request);
        alert("서버에 연결할 수 없습니다. CORS 또는 네트워크를 확인하세요.");
      } else {
        
        console.error("요청 설정 에러:", error.message);
        alert(`오류 발생: ${error.message}`);
      }
      
      setIsLoading(false);
    }
  };

  return (
    <PhoneFrame
      title="비밀번호 변경"
      contentClass="p-5 pb-7 bg-gradient-to-b from-slate-50 via-white to-blue-50/40"
    >
      <div className="flex flex-col gap-5">
        <div className="rounded-3xl bg-white shadow-sm p-5 border border-slate-100 space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-blue-600">STEP 2</p>
            <h2 className="text-xl font-bold text-gray-900">새 비밀번호 설정</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {email ? `${email} 로 전송된 인증코드를 입력하고 새 비밀번호를 설정하세요.` : '인증 메일 정보를 확인 중입니다.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="인증코드 (reset_code)"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/80 text-gray-900 placeholder:text-gray-400"
            />
            <input
              type="password"
              placeholder="새 비밀번호 (new_password)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/80 text-gray-900 placeholder:text-gray-400"
            />
            <input
              type="password"
              placeholder="새 비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/80 text-gray-900 placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 font-semibold text-white rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 shadow-[0_10px_24px_rgba(37,99,235,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(37,99,235,0.3)] disabled:bg-gray-400 disabled:shadow-none"
            >
              {isLoading ? '변경 중...' : '비밀번호 변경'}
            </button>
          </form>
        </div>

        <div className="rounded-3xl bg-white shadow-sm p-4 border border-slate-100">
          <p className="text-sm text-gray-600 leading-relaxed">
            변경 완료 후 로그인 화면으로 이동해 새 비밀번호로 로그인할 수 있어요.
          </p>
        </div>
      </div>
    </PhoneFrame>
  );
}
