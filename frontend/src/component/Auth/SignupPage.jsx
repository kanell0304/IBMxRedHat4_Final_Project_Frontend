
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PhoneFrame from '../Layout/PhoneFrame.jsx';
import { signup } from '../../api/authApi.js';

const sanitizePhone = (input) => (input || '').replace(/\D/g, '').slice(0, 11);
const formatPhone = (digits) => {
  if (!digits) return '';
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

export default function SignupPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handlePhoneChange = (value) => {
    const prevDigits = phoneNumber;
    const digits = sanitizePhone(value);
    const prevFormatted = formatPhone(prevDigits);
    const tryingDeleteHyphen = value.length < prevFormatted.length && digits.length === prevDigits.length;
    const nextDigits = tryingDeleteHyphen ? digits.slice(0, -1) : digits;
    setPhoneNumber(nextDigits);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

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
    <PhoneFrame title="회원가입" contentClass="p-5 pb-7 bg-gradient-to-b from-slate-50 via-white to-indigo-50/40">
      <div className="space-y-4">
          <p className="text-[12px] font-semibold text-blue-700 uppercase tracking-[0.14em]">Create Account</p>

        <div className="rounded-3xl bg-white shadow-sm p-5 border border-slate-100">
          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800">이메일</label>
              <input
                type="email"
                placeholder="이메일을 입력해 주세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800">비밀번호</label>
              <input
                type="password"
                placeholder="비밀번호를 입력해 주세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                placeholder="비밀번호를 다시 입력해 주세요"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800">이름</label>
              <input
                type="text"
                placeholder="이름을 입력해 주세요"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800">닉네임</label>
              <input
                type="text"
                placeholder="닉네임을 입력해 주세요"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800">전화번호</label>
              <input
                type="tel"
                placeholder="전화번호 ex) 010-0000-0000"
                value={formatPhone(phoneNumber)}
                onChange={(e) => handlePhoneChange(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-500">숫자만 입력하세요.</p>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 shadow-[0_10px_24px_rgba(37,99,235,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(37,99,235,0.3)]"
            >
              회원가입
            </button>
          </form>
        </div>

        <div className="text-sm text-center text-gray-500">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">로그인</Link>
        </div>
      </div>
    </PhoneFrame>
  );
}
