import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DeviceFrameset } from 'react-device-frameset';
import 'react-device-frameset/styles/marvel-devices.min.css';

const PhoneFrame = ({ title, children, onBack, frameWidth = 358, frameHeight = 740 }) => {
  const navigate = useNavigate();
  const handleBack = () => {
    if (typeof onBack === 'function') {
      onBack();
      return;
    }
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-8 px-3">
      <DeviceFrameset device="iPhone X" color="black" width={frameWidth} height={frameHeight}>
        <div className="relative h-full w-full bg-white overflow-hidden">
          <div className="relative h-full w-full overflow-y-auto scrollbar-hide">
            <header className="sticky top-0 z-20 bg-white/95 backdrop-blur">
              <div className="relative px-4 pt-2.5 pb-3 h-[96px]">
                <div className="absolute top-[18px] left-0 right-0 px-5 flex items-center justify-between text-[13px] text-gray-900 font-semibold">
                  <span className="tracking-tight text-[14px] ml-3">8:48</span>
                  <div className="flex items-center gap-2.5 text-black">
                    <svg
                      aria-hidden
                      className="h-[20px] w-[20px] -mt-0.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                    >
                      <path d="M4 10c4.7-4.2 11.3-4.2 16 0" />
                      <path d="M7 13.5c3.2-2.8 6.8-2.8 10 0" />
                      <path d="M10.5 17c1.1-1 1.9-1 3 0" />
                      <circle cx="12" cy="19" r="1.35" fill="currentColor" stroke="none" />
                    </svg>
                    <svg
                      aria-hidden
                      className="h-[18px] w-[24px]"
                      viewBox="0 0 32 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="1.5" y="3" width="24" height="10" rx="3" />
                      <rect x="4" y="5" width="16" height="6" rx="2" fill="currentColor" stroke="none" />
                      <rect x="26.5" y="6" width="3" height="4" rx="1" fill="currentColor" stroke="none" />
                    </svg>
                  </div>
                </div>
                <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-[12px] h-7 w-28 bg-black rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.35)]" />
                <div className="absolute left-0 right-0 bottom-2 flex items-center h-11 px-4 border-b border-gray-200">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="w-10 h-10 flex items-center justify-center text-lg text-gray-600 -ml-1"
                    aria-label="뒤로"
                  >
                    ←
                  </button>
                  <div className="flex-1 text-center text-sm font-semibold text-gray-800">
                    {title}
                  </div>
                  <div className="w-10" aria-hidden />
                </div>
              </div>
            </header>

            <div className="p-4 pb-6">{children}</div>
          </div>
        </div>
      </DeviceFrameset>
    </div>
  );
};

export default PhoneFrame;
