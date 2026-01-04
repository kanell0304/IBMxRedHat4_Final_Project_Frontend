import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Footer({ fullWidth = false }) {
  const navigate = useNavigate();
  const [isRadialOpen, setIsRadialOpen] = useState(false);
  const { user } = useAuth();

  const roles = user?.roles || [];
  const isAdmin = roles.some((role) => role?.role_name === "ADMIN" || role === "ADMIN");
  const centerLabel = isAdmin ? "관리" : "+";

  const items = [
    { key: "home", label: "홈", icon: "🏠", action: () => navigate("/") },
    { key: "feedback", label: "기록", icon: "💬", action: () => navigate("/history") },
    {
      key: "center",
      label: centerLabel,
      icon: "＋",
      action: () => {
        if (isAdmin) {
          navigate("/admin");
          return;
        }
        setIsRadialOpen(!isRadialOpen);
      },
    },
    { key: "community", label: "커뮤니티", icon: "👥", action: () => navigate("/community") },
    { key: "more", label: "더보기", icon: "⋯", action: () => navigate("/mypage") },
  ];

  const radialItems = [
    { label: "대화분석", icon: "대화", color: "bg-blue-500", path: "/communication/info" },
    { label: "면접", icon: "면접", color: "bg-purple-500", path: "/interview/info" },
    { label: "발표분석", icon: "발표", color: "bg-green-500", path: "/presentation/info" },
  ];

  const handleRadialClick = (path) => {
    setIsRadialOpen(false);
    navigate(path);
  };

  const containerWidth = fullWidth ? 'max-w-6xl' : 'max-w-4xl';

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 bg-transparent pointer-events-none">
      <div className={`w-full ${containerWidth} mx-auto px-4 pb-0`}>
        <div className="pointer-events-auto bg-white/95 backdrop-blur border-t border-gray-200 shadow-sm grid grid-cols-5 items-center text-center h-18 min-h-[68px]">
          {items.map((item) => {
            if (item.key === "center") {
              return (
                <div key={item.key} className="relative flex items-center justify-center">
                  {/* Radial Menu Items */}
                  {radialItems.map((radialItem, index) => {
                    const angle = -90 + ((index - 1) * 40);
                    const distance = 80;
                    const x = Math.cos((angle * Math.PI) / 180) * distance;
                    const y = Math.sin((angle * Math.PI) / 180) * distance;

                    return (
                      <button
                        key={index}
                        onClick={() => handleRadialClick(radialItem.path)}
                        className={`absolute h-12 w-12 rounded-full ${radialItem.color} text-white shadow-lg border-2 border-white flex items-center justify-center text-lg transition-all duration-300 ${
                          isRadialOpen
                            ? 'opacity-100 pointer-events-auto scale-100'
                            : 'opacity-0 pointer-events-none scale-50'
                        }`}
                        style={{
                          transform: isRadialOpen
                            ? `translate(${x}px, ${y}px)`
                            : 'translate(0, 0)',
                        }}
                        title={radialItem.label}
                      >
                        {radialItem.icon}
                      </button>
                    );
                  })}

                  {/* Center Button */}
                  <button
                    onClick={item.action}
                    className={`h-14 w-14 -translate-y-2 rounded-full text-white text-sm font-bold shadow-md border-4 border-white flex items-center justify-center transition-all duration-300 ${
                      isRadialOpen
                        ? 'bg-gray-600'
                        : 'bg-gradient-to-b from-pink-500 to-orange-400'
                    }`}
                  >
                    {isRadialOpen ? 'close' : item.label}
                  </button>
                </div>
              );
            }

            return (
              <button
                key={item.key}
                onClick={item.action}
                className="flex flex-col items-center justify-center gap-1 text-[13px] font-semibold py-2 w-full"
              >
                <span className="text-xl text-gray-600">{item.icon}</span>
                <span className="text-gray-700">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
