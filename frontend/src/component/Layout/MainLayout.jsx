import React from 'react';
import Header from './Header.jsx';
import Footer from './Footer.jsx'; // Footer 컴포넌트도 추가합니다.

export default function MainLayout({ children, fullWidth = false, showHeader = true, showFooter = true }) {
  const containerWidth = fullWidth ? 'max-w-6xl' : 'max-w-4xl';

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {showHeader && <Header fullWidth={fullWidth} />}

      <main className="flex-grow">
        <div className={`w-full ${containerWidth} mx-auto py-0 px-4`}>
          {children}
        </div>
      </main>

      {showFooter && <Footer fullWidth={fullWidth} />}
    </div>
  );
}
