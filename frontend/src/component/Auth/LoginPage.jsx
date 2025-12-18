import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../api/authApi.js';
import KakaoLoginButton from '../User/KakaoLoginButton.jsx';
import PhoneFrame from '../Layout/PhoneFrame.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login({ email, password });
      console.log('로그인 성공:', response.data);
      navigate('/');
    } catch (error) {
      console.error('로그인 실패:', error);
      alert('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <PhoneFrame title="로그인" contentClass="p-5 pb-7 bg-gradient-to-b from-slate-50 via-white to-indigo-50/40">
      <div className="flex flex-col gap-5">
        <form
          onSubmit={handleLogin}
          className="space-y-4 rounded-3xl bg-white shadow-sm p-5 border border-slate-100"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            계정 정보
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-900">안녕하세요!</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              메일과 비밀번호로 로그인하거나<br />카카오 계정으로 바로 시작할 수 있어요.
            </p>
          </div>
          <div className="space-y-3">
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/80 text-gray-900 placeholder:text-gray-400"
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/80 text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-3 font-semibold text-white rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 shadow-[0_10px_24px_rgba(37,99,235,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(37,99,235,0.3)]"
          >
            로그인
          </button>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span className="h-px flex-1 bg-slate-200" />
            또는
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          <KakaoLoginButton />
        </form>

        <div className="rounded-3xl bg-white shadow-sm p-4 border border-slate-100 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-gray-900">계정이 없으신가요?</p>
            <p className="text-xs text-gray-500">1분 만에 회원가입하고 모든 기능을 이용하세요.</p>
          </div>
          <Link
            to="/signup"
            className="px-3 py-2 text-sm font-semibold text-blue-600 rounded-xl border border-blue-100 hover:border-blue-200 hover:bg-blue-50"
          >
            회원가입
          </Link>
        </div>

        <div className="text-sm text-center text-gray-500">
          <Link to="/find-password" className="text-blue-600 font-semibold hover:underline">비밀번호 찾기</Link>
        </div>
      </div>
    </PhoneFrame>
  );
}
