import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import defaultProfile from '../../assets/defaultProfile.png';
import PhoneFrame from '../Layout/PhoneFrame';
import MainLayout from '../Layout/MainLayout';
import Header from '../Layout/Header';

const sanitizePhone = (input) => (input || '').replace(/\D/g, '').slice(0, 11);
const formatPhone = (digits) => {
  if (!digits) return '';
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

const ProfileContent = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({nickname: '', email: '', phone: '', password: '', username: ''});
  const [image, setImage] = useState(defaultProfile);
  const [preview, setPreview] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://43.200.166.166:8081';

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE}/users/me`, {
          withCredentials: true,
        });
        setForm({
          nickname: res.data?.nickname || '',
          email: res.data?.email || '',
          phone: sanitizePhone(res.data?.phone_number || res.data?.phone || ''),
          username: res.data?.username || '',
          password: '',
        });
        if (res.data?.profile_image_url) {
          setImage(`${API_BASE}${res.data.profile_image_url}`);
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [API_BASE]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const prevDigits = form.phone;
      const digits = sanitizePhone(value);
      const prevFormatted = formatPhone(prevDigits);
      const tryingDeleteHyphen = value.length < prevFormatted.length && digits.length === prevDigits.length;
      const nextDigits = tryingDeleteHyphen ? digits.slice(0, -1) : digits;
      setForm((prev) => ({ ...prev, phone: nextDigits }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setSelectedFile(file);
    setImage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // 정보 업데이트
      const payload = {};
      if (form.nickname) payload.nickname = form.nickname;
      if (form.username) payload.username = form.username;
      if (form.email) payload.email = form.email;
      if (form.phone) payload.phone_number = form.phone; // 숫자만 전송
      if (form.password) payload.password = form.password;

      if (Object.keys(payload).length > 0) {
        await axios.patch(`${API_BASE}/users/me`, payload, { withCredentials: true });
      }

      // 프로필 이미지 업로드
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const res = await axios.post(`${API_BASE}/users/me/profile-image`, formData, {
          withCredentials: true
        });
        const url = res.data?.profile_image_url ? `${API_BASE}${res.data.profile_image_url}` : defaultProfile;
        setImage(url);
      }

      setPreview('');
      setSelectedFile(null);
      setForm((prev) => ({ ...prev, password: '' }));
      alert('프로필이 저장되었습니다.');
      window.dispatchEvent(new Event('profile-updated'));
      navigate(-1);
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || '프로필 저장에 실패했습니다.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const displayImage = preview || image || defaultProfile;

  return (
    <div className="w-full max-w-full mx-auto space-y-5 px-0 md:px-1">
      <div className="overflow-hidden border border-slate-100 bg-white rounded-[28px] shadow-[0_18px_60px_rgba(15,23,42,0.12)]">
        <div className="h-24 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400" />
        <div className="-mt-14 px-4 md:px-6 pb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex items-end gap-4">
              <label className="relative">
                <img
                  src={displayImage}
                  alt="프로필"
                  className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-lg"
                  onError={(e) => {
                    e.target.src = defaultProfile;
                  }}
                />
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" aria-label="프로필 이미지 업로드" />
                <span className="absolute bottom-2 right-2 inline-flex items-center justify-center h-8 w-8 rounded-full bg-white shadow-md text-blue-600 text-sm font-bold border border-gray-200">✎</span>
              </label>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Profile</p>
                <h1 className="text-3xl font-black text-gray-900">개인정보 수정</h1>
                <p className="text-sm text-gray-600">사진과 기본 정보를 업데이트하세요.</p>
              </div>
            </div>
        </div>

          <form id="profile-form" onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="p-5 rounded-2xl border border-slate-200 bg-gray-50/70 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                    Nickname
                  </p>
                  <h2 className="text-lg font-bold text-gray-900">닉네임</h2>
                </div>
                <span className="text-xs font-semibold text-gray-500">
                  {form.nickname.length || 0} / 20
                </span>
              </div>
              <input
                type="text"
                name="nickname"
                value={form.nickname}
                onChange={handleChange}
                placeholder="닉네임을 입력하세요"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                maxLength={20}
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                신고가 누적될 경우 이용 제한 등 조치가 있을 수 있으니 신중히 설정해주세요.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-[0_6px_18px_rgba(15,23,42,0.05)] space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Phone</p>
                <label className="block text-sm font-bold text-gray-900">휴대전화번호</label>
                <input
                  type="tel"
                  name="phone"
                  value={formatPhone(form.phone)}
                  onChange={handleChange}
                  placeholder="010-0000-0000"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition bg-white"
                />
                <p className="text-xs text-gray-500">연락처가 변경되었다면 업데이트하세요.</p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-[0_6px_18px_rgba(15,23,42,0.05)] space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Password</p>
                <label className="block text-sm font-bold text-gray-900">비밀번호</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="새 비밀번호 (미입력 시 변경 없음)"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition bg-white"
                />
                <p className="text-xs text-gray-500">비워두면 비밀번호는 변경되지 않습니다.</p>
              </div>
            </div>
          </form>
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={() => window.history.back()} className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm">취소</button>
            <button
              type="submit"
              form="profile-form"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 text-white text-sm font-semibold hover:shadow-[0_10px_30px_rgba(59,130,246,0.35)] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              저장하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Profile() {
  return (
    <PhoneFrame title="프로필 수정">
      <MainLayout showHeader={false} showFooter={false} fullWidth>
        <div className="px-0">
          <ProfileContent />
        </div>
      </MainLayout>
    </PhoneFrame>
  );
}
