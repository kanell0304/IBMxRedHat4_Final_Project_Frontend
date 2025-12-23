import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import defaultProfile from '../../assets/defaultProfile.png';

export default function Header({ fullWidth = false, dense = false }) {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nickname, setNickname] = useState("");
  const [image, setImage] = useState(defaultProfile);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://43.200.166.166:8081';

  const loadUser = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/users/me`, {
        withCredentials: true
      });
      setIsLoggedIn(true);
      setNickname(res.data.nickname || res.data.username || '');
      if (res.data.profile_image_url) {
        const url = `${API_BASE}${res.data.profile_image_url}`;
        setImage(url);
      } else {
        setImage(defaultProfile);
      }
    } catch (err) {
      setIsLoggedIn(false);
      setNickname("");
      setImage(defaultProfile);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    loadUser();
    window.addEventListener('profile-updated', loadUser);
    return () => {
      window.removeEventListener('profile-updated', loadUser);
    };
  }, [loadUser]);

  const handleLogout = async () => {
    try {
      await axios.post('http://api.st-each.com/users/logout', {}, {
        withCredentials: true
      });
      setIsLoggedIn(false);
      setNickname("");
      setImage(defaultProfile);
      alert('로그아웃 되었습니다.');
      navigate('/');
    } catch (err) {
      setIsLoggedIn(false);
      setNickname("");
      setImage(defaultProfile);
      alert('로그아웃 처리 중 오류가 발생했습니다.');
      navigate('/');
    }
  };

  const innerClasses = dense
    ? 'flex justify-between items-center min-h-[56px] py-1'
    : 'flex justify-between items-center min-h-[68px]';

  const Content = () => (
    <div className={innerClasses}>
      <Link to="/">
        <span className="text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent tracking-tight ml-1">
          STEACH
        </span>
      </Link>

      <nav className="flex items-center space-x-4">
        {isLoggedIn ? (
          <div className="flex items-center gap-2">
            <img
              src={image}
              alt="프로필"
              className="w-8 h-8 rounded-full border object-cover cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/profile')}
              onError={(e) => {
                e.target.src = defaultProfile;
              }}
            />
            <span className="font-bold text-[13px]">{nickname}님</span>
            <button onClick={handleLogout} className="px-3 py-2 text-sm font-medium hover:text-blue-600 cursor-pointer transition-colors">
              로그아웃
            </button>
          </div>
        ) : (
          <Link to="/login" className="rounded-full bg-gray-900 text-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-gray-800 transition-colors">
            로그인
          </Link>
        )}
      </nav>
    </div>
  );

  const wrapperClass = fullWidth ? 'w-full mx-auto bg-white border-b border-gray-100' : 'w-full max-w-3xl mx-auto bg-white border-b border-gray-100';
  const innerWidth = fullWidth ? 'w-full mx-auto' : 'w-full max-w-2xl mx-auto';

  if (loading) {
    return (
      <header className={wrapperClass}>
        <div className={innerWidth}>
          <Content />
        </div>
      </header>
    );
  }

  return (
    <header className={wrapperClass}>
      <div className={innerWidth}>
        <Content />
      </div>
    </header>
  );
}
