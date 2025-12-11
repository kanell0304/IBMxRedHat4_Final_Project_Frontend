import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../../assets/logo.jpg'
import defaultProfile from '../../assets/defaultProfile.png';

export default function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [profileImage, setProfileImage] = useState(defaultProfile);
  const [loading, setLoading] = useState(true);

  // 로그인 여부 확인 - 프로필 이미지 URL 포함
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const res = await axios.get('http://localhost:8081/users/me', {
          withCredentials: true
        });
        
        // 성공하면 로그인된 상태
        setIsLoggedIn(true);
        setUsername(res.data.username);
        
        // 프로필 이미지 URL이 있으면 설정
        if (res.data.profile_image_url) {
          setProfileImage(`http://localhost:8081${res.data.profile_image_url}`);
        } else {
          setProfileImage(defaultProfile);
        }
      } catch (err) {
        console.log("로그인되지 않은 상태");
        setIsLoggedIn(false);
        setUsername("");
        setProfileImage(defaultProfile);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8081/users/logout', {}, {
        withCredentials: true
      });
      
      setIsLoggedIn(false);
      setUsername("");
      setProfileImage(defaultProfile);
      alert('로그아웃 되었습니다.');
      navigate('/');
    } catch (err) {
      console.error("로그아웃 실패:", err);
      setIsLoggedIn(false);
      setUsername("");
      setProfileImage(defaultProfile);
      alert('로그아웃 처리 중 오류가 발생했습니다.');
      navigate('/');
    }
  };

  // 로딩 중
  if (loading) {
    return (
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/"><img src={logo} alt="formz logo" className='w-30 h-10' /></Link>
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
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/"><img src={logo} alt="formz logo" className='w-30 h-10' /></Link>

          <nav className="flex items-center space-x-4">
            {isLoggedIn ? (
              <div className='flex items-center gap-2'>
                <img 
                  src={profileImage} 
                  alt="프로필" 
                  className="w-8 h-8 rounded-full border object-cover cursor-pointer hover:opacity-80 transition-opacity" 
                  onClick={() => navigate('/profile')} 
                  onError={(e) => {
                    console.log("이미지 로드 실패, 기본 이미지 사용");
                    e.target.src = defaultProfile;
                  }}
                />
                <span className="font-bold text-sm">{username}님</span>
                <Link 
                  to="/my-surveys" 
                  className="hover:text-blue-600 font-medium px-3 py-2 text-sm transition-colors"
                >
                  나의 설문
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="px-3 py-2 text-sm font-medium hover:text-blue-600 cursor-pointer transition-colors"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-blue-600 font-medium px-3 py-2 text-sm transition-colors"
                >
                  로그인
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 shadow-sm text-sm transition-colors"
                >
                  회원가입
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}