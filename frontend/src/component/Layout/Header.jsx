import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import defaultProfile from '../../assets/defaultProfile.png';

export default function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nickname, setNickname] = useState("");
  const [image, setImage] = useState(defaultProfile);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8081';

  useEffect(() => {
    const checkLoginStatus = async () => {
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
    };

    checkLoginStatus();
  }, [API_BASE]);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8081/users/logout', {}, {
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

  const innerClasses = "flex justify-between items-center min-h-[68px]";

  if (loading) {
    return (
      <header className="w-full max-w-3xl mx-auto bg-gray-100 border-b border-gray-200">
        <div className="w-full max-w-3xl mx-auto">
          <div className={innerClasses}>
            <Link to="/">
              <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent tracking-tight">
                STEACH
              </span>
            </Link>
            <nav className="flex items-center space-x-4">
              <div className="animate-pulse flex space-x-4">
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
                <div className="h-8 w-20 bg-gray-200 rounded"></div>
              </div>
            </nav>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="w-full max-w-3xl mx-auto bg-gray-100 border-b border-gray-200">
      <div className="w-full max-w-2xl mx-auto">
        <div className={innerClasses}>
          <Link to="/">
            <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent tracking-tight">
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
                <span className="font-bold text-sm">{nickname}님</span>
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
      </div>
    </header>
  );
}