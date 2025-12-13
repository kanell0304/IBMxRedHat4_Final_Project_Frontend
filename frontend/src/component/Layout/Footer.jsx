import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  const items = [
    { key: "home", label: "홈", icon: "🏠", action: () => navigate("/") },
    { key: "feedback", label: "기록", icon: "💬", action: () => navigate("/history") },
    { key: "center", label: "미정", icon: "＋", action: () => navigate("/") },
    { key: "community", label: "커뮤니티", icon: "👥", action: () => navigate("/") },
    { key: "more", label: "더보기", icon: "⋯", action: () => navigate("/mypage") },
  ];

  return (
    <footer className="sticky bottom-0 left-0 right-0 bg-transparent pointer-events-none">
      <div className="w-full max-w-3xl mx-auto">
        <div className="pointer-events-auto bg-gray-100 border border-gray-200 grid grid-cols-5 items-center text-center h-18 min-h-[68px]">
          {items.map((item) => {
            if (item.key === "center") {
              return (
                <div key={item.key} className="relative flex items-center justify-center">
                  <button
                    onClick={item.action}
                    className="h-14 w-14 -translate-y-2 rounded-full bg-gradient-to-b from-pink-500 to-orange-400 text-white text-sm font-bold shadow-md border-4 border-white flex items-center justify-center"
                  >
                    {item.label}
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
