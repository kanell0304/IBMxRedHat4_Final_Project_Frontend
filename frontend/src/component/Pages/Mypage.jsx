import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import defaultProfile from '../../assets/defaultProfile.png';

const Mypage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [image, setImage] = useState(defaultProfile);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await axios.get('http://localhost:8081/users/me', {
          withCredentials: true,
        });
        setUser(res.data);
        if (res.data?.profile_image_url) {
          setImage(`http://localhost:8081${res.data.profile_image_url}`);
        } else {
          setImage(defaultProfile);
        }
      } catch (err) {
        setIsGuest(true);
        setImage(defaultProfile);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);


  const supportLinks = [
    { label: '공지사항', note: '서비스 업데이트 소식' },
    { label: '문의하기', note: '불편 사항과 제안 보내기' },
    { label: '설정', note: '알림 · 약관 확인' },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">내 계정</p>
            <h1 className="text-2xl font-bold text-gray-900">
              {isLoading ? '불러오는 중...' : user?.nickname ? `${user.nickname} 님` : ''}
            </h1>
            {user?.email && <p className="text-sm text-gray-600">{user.email}</p>}
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <img src={image} alt="프로필" className="h-14 w-14 rounded-full border object-cover" onError={(e) => {
                  e.target.src = defaultProfile;
                }} />
            )}
            <button onClick={() => navigate('/profile')} className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
              개인정보 수정
            </button>
          </div>
        </div>

        {isGuest && (
          <button onClick={() => navigate('/login')} className="w-full rounded-xl bg-blue-600 text-white py-3 font-semibold shadow-sm hover:bg-blue-700 transition">로그인 / 회원가입 하기</button>
        )}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">최근 활동</h2>
          <div className="rounded-2xl border border-gray-200 p-4 text-sm text-gray-600 bg-gray-50">
            {user ? '최근 기록이 곧 여기에 표시됩니다.' : '로그인 후 이용 기록을 확인할 수 있습니다.'}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">고객센터</h2>
          <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
            {supportLinks.map((link) => (
              <div key={link.label} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-semibold text-gray-900">{link.label}</p>
                  <p className="text-sm text-gray-500">{link.note}</p>
                </div>
                <span className="text-gray-400">›</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mypage;
