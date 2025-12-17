import React from 'react';
import Header from './Header.jsx';
import Footer from './Footer.jsx'; // Footer 컴포넌트도 추가합니다.

export default function MainLayout({ children, fullWidth = false, showHeader = true, showFooter = true }) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {showHeader && <Header fullWidth={fullWidth} />}

      {/* main 태그가 남은 공간을 모두 차지하도록 flex-grow를 사용합니다.
        이렇게 하면 페이지 내용이 짧아도 푸터가 딸려 올라오지 않습니다.
      */}
      <main className="flex-grow">
        <div className={fullWidth ? 'w-full mx-auto' : 'w-full max-w-7xl mx-auto py-0 px-4 sm:px-6 lg:px-8'}>
          {children}
        </div>
      </main>

      {showFooter && <Footer fullWidth={fullWidth} />}
    </div>
  );
}
