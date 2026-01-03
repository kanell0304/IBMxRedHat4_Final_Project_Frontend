import React from 'react';
import { useNavigate } from 'react-router-dom';

const PhoneFrame = ({
  title,
  children,
  onBack,
  frameHeight = 740,
  frameMaxHeight = null,
  showTitleRow = true,
  contentClass = 'p-4 pb-6',
  headerContent = null,
  footerContent = null,
  fullWidth = false,
}) => {
  const navigate = useNavigate();
  const containerWidthClass = fullWidth ? 'max-w-6xl' : 'max-w-4xl';

  const handleBack = () => {
    if (typeof onBack === 'function') {
      onBack();
      return;
    }
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-white">
      <div
        className={`mx-auto w-full ${containerWidthClass} flex flex-col min-h-screen`}
        style={{
          minHeight: frameHeight,
          maxHeight: frameMaxHeight || 'none',
        }}
      >
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-gray-100 px-4">
          <div
            className={`pt-2 pb-2 ${
              headerContent ? 'h-[96px]' : showTitleRow ? 'h-[64px]' : 'h-[44px]'
            }`}
          >
            {headerContent ? (
              <div className="h-full flex items-center">{headerContent}</div>
            ) : showTitleRow ? (
              <div className="flex items-center h-full">
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-10 h-10 flex items-center justify-center text-lg text-gray-600 -ml-1"
                  aria-label="뒤로"
                >
                  ←
                </button>
                <div className="flex-1 text-center text-sm font-semibold text-gray-800">{title}</div>
                <div className="w-10" aria-hidden />
              </div>
            ) : null}
          </div>
        </header>

        <div className={`flex-1 overflow-y-auto scrollbar-hide pb-24 ${contentClass}`}>{children}</div>
        {footerContent ? (
          <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur border-t border-gray-100">
            {footerContent}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PhoneFrame;
