
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { signup } from '../../api/authApi.js'; 

export default function SignupPage() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  // const [role, setRole] = useState('USER');

  // 3. 'async' 함수로 변경
  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 4. API 명세서에 맞는 'userData' 객체를 만듭니다.
    const userData = {
      email: email,
      password: password,
      nickname: nickname,
      username: username,
      phone_number: phoneNumber
    };

    try {
   
      const response = await signup(userData);
      
      console.log('회원가입 성공:', response.data);
      alert('회원가입 완료! 로그인 페이지로 이동합니다.');
      navigate('/login');

    } catch (error) {
      console.error('회원가입 실패:', error);
      alert('회원가입 중 오류가 발생했습니다. (예: 이메일 중복)');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white border rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">회원가입</h2>
        
     
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <input type="email" placeholder="이메일 ex) user@aaa.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <input type="password" placeholder="비밀번호 확인" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <input type="text" placeholder="사용자 이름" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <input type="text" placeholder="닉네임" value={nickname} onChange={(e) => setNickname(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <input type="tel" placeholder="전화번호 ex) 010-0000-0000" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button type="submit" className="w-full px-4 py-2 font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600">
            회원가입
          </button>
        </form>
         <div className="text-sm text-center text-gray-500">
          계정이 이미 있으신가요? <Link to="/login" className="text-blue-500 hover:underline">로그인</Link>
        </div>
      </div>
    </div>
  );
}