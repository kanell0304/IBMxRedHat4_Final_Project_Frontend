import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestPasswordReset } from '../../api/authApi.js';
import PhoneFrame from '../Layout/PhoneFrame.jsx';

const sanitizePhone = (input) => (input || '').replace(/\D/g, '').slice(0, 11);
const formatPhone = (digits) => {
  if (!digits) return '';
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

export default function FindPasswordRequestPage() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneChange = (value) => {
    const prevDigits = phoneNumber;
    const digits = sanitizePhone(value);
    const prevFormatted = formatPhone(prevDigits);
    const tryingDeleteHyphen = value.length < prevFormatted.length && digits.length === prevDigits.length;
    const nextDigits = tryingDeleteHyphen ? digits.slice(0, -1) : digits;
    setPhoneNumber(nextDigits);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const reqData = {
      email: email,
      username: username,
      phone_number: phoneNumber,
    };

    try {
      const response = await requestPasswordReset(reqData);
      console.log(response.data.message);
      alert('인증코드가 이메일로 전송되었습니다. 다음 단계로 이동합니다.');
      navigate('/reset-password', { state: { email: email } });
    } catch (error) {
      console.error('인증코드 요청 실패:', error);
      const serverMessage = error?.response?.data?.detail;
      if (serverMessage) {
        const friendlyMessage =
          serverMessage === 'User Not Found'
            ? '이메일, 이름, 전화번호를 다시 확인해 주세요.'
            : serverMessage;
        alert(`인증코드 요청 실패: ${friendlyMessage}`);
      } else if (error?.message === 'Network Error') {
        alert('서버에 연결할 수 없습니다. 네트워크 또는 서버 상태를 확인해 주세요.');
      } else {
        alert('인증코드 요청에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      }
      setIsLoading(false);
    }
  };

  return (
    <PhoneFrame
      title="비밀번호 찾기"
      contentClass="p-5 pb-7 bg-gradient-to-b from-slate-50 via-white to-blue-50/40"
    >
      <div className="flex flex-col gap-5">
        <div className="rounded-3xl bg-white shadow-sm p-5 border border-slate-100 space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-blue-600">STEP 1</p>
            <h2 className="text-xl font-bold text-gray-900">인증코드 요청</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              가입 시 등록한 정보로 본인 확인 후 이메일로 인증코드를 보내드려요.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              placeholder="이메일 (email)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/80 text-gray-900 placeholder:text-gray-400"
            />
            <input
              type="text"
              placeholder="사용자 이름 (username)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/80 text-gray-900 placeholder:text-gray-400"
            />
            <input
              type="tel"
              placeholder="전화번호 (phone_number)"
              value={formatPhone(phoneNumber)}
              onChange={(e) => handlePhoneChange(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/80 text-gray-900 placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 font-semibold text-white rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 shadow-[0_10px_24px_rgba(37,99,235,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(37,99,235,0.3)] disabled:bg-gray-400 disabled:shadow-none"
            >
              {isLoading ? '전송 중...' : '인증코드 전송'}
            </button>
          </form>
        </div>

        <div className="rounded-3xl bg-white shadow-sm p-4 border border-slate-100">
          <p className="text-sm text-gray-600 leading-relaxed">
            인증코드를 받은 뒤, 다음 화면에서 새 비밀번호를 설정할 수 있어요.
          </p>
        </div>
      </div>
    </PhoneFrame>
  );
}
