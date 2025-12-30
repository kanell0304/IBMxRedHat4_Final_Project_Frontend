import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import PhoneFrame from "../Layout/PhoneFrame";
import MainLayout from "../Layout/MainLayout";
import Header from "../Layout/Header";

const MainPageContent = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const presentation = () => {
    navigate("/presentation/info");
  };

  const interview = () => {
    navigate("/interview/info");
  };

  const communication = () => {
    navigate("/communication/info");
  };

  const minigame = () => {
    navigate("/minigame");
  };

  const featureCards = [
    {
      title: "모의 면접",
      subtitle: "직무/난이도별 질문 세트",
      icon: "🎤",
      iconBg: "bg-blue-50",
      iconText: "text-blue-600",
      badge: "LIVE",
      badgeColor: "bg-red-100 text-red-600",
      action: interview,
    },
    {
      title: "대화 분석",
      subtitle: "톤 · 속도 · 표현 분석",
      icon: "💬",
      iconBg: "bg-cyan-50",
      iconText: "text-cyan-600",
      badge: "Hot",
      badgeColor: "bg-orange-100 text-orange-600",
      action: communication,
    },
    {
      title: "발표 분석",
      subtitle: "음성 업로드 · 감정 분석",
      icon: "📊",
      iconBg: "bg-indigo-50",
      iconText: "text-indigo-600",
      badge: "Hot",
      badgeColor: "bg-orange-100 text-orange-600",
      action: presentation,
    },
    {
      title: "미니게임",
      subtitle: "미니게임으로 말하기 연습하기",
      icon: "🎮",
      iconBg: "bg-teal-50",
      iconText: "text-teal-600",
      badge: "New",
      badgeColor: "bg-teal-100 text-teal-700",
      action: minigame,
    },
  ];

  const upcomingCards = [
    {
      title: "AI 코치",
      subtitle: "AI 코치와 함께 말하기 연습하기",
      disabled: true,
    },
  ];

  return (
    <div>
      <div className="w-full max-w-full mx-auto bg-white px-0 pt-4 pb-2 space-y-5">
        <div className="rounded-3xl bg-gradient-to-br from-[#eef4ff] via-white to-[#effbff] shadow-sm p-6 flex gap-4 items-start border border-white/80">
          <div className="flex-1 space-y-3">
            <h1 className="text-[22px] font-extrabold text-gray-900 leading-snug">
              {isLoggedIn ? (
                <>지금의 말투를<br/>기록하세요</>
              ) : (
                <>오늘의 말투가,<br/>내일의 소통을 만들어요</>
              )}
            </h1>
            <p className="text-sm text-gray-600">
              {isLoggedIn
                ? "쌓일수록, 소통이 보이기 시작해요"
                : "말투를 이해하면 소통이 쉬워져요"}
            </p>
          </div>
          <div className="text-4xl" aria-hidden>
            🎁
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-[#f3f7ff] via-white to-[#f0fbff] shadow-sm p-5 space-y-4 border border-white/80">
          {featureCards.map((item, idx) => (
            <button
              key={item.title}
              onClick={item.action}
              className={`w-full flex items-center gap-4 rounded-2xl px-2 py-3 transition ${
                idx !== featureCards.length - 1 ? "border-b border-gray-100 pb-5" : ""
              }`}
            >
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-xl ${item.iconBg} ${item.iconText}`}>
                {item.icon}
              </div>
              <div className="flex-1 text-left space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-gray-900">{item.title}</span>
                  {item.badge && (
                    <span className={`text-[11px] font-semibold rounded-full px-2.5 py-1 ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{item.subtitle}</p>
              </div>
              <span className="text-gray-400">›</span>
            </button>
          ))}
        </div>

        <div className="rounded-2xl bg-sky-50 text-sky-900 px-4 py-3 flex items-center gap-2">
          <span className="text-lg">ℹ️</span>
          <span className="text-sm font-semibold">현재 준비중인 기능이에요</span>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-[#f3f7ff] via-white to-[#f0fbff] shadow-sm p-5 space-y-4 border border-white/80">
          {upcomingCards.map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-4 rounded-2xl px-2 opacity-60"
            >
              <div className="h-12 w-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center text-xl">⏳</div>
              <div className="flex-1 text-left space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-gray-500">{item.title}</span>
                  <span className="text-[11px] font-semibold rounded-full px-2.5 py-1 bg-gray-200 text-gray-500">준비중</span>
                </div>
                <p className="text-sm text-gray-400">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

const MainPage = () => {
  return (
    <PhoneFrame
      showTitleRow={false}
      contentClass="px-0 pt-[2px] pb-0"
      headerContent={<Header fullWidth dense />}
    >
      <MainLayout fullWidth showHeader={false}>
        <MainPageContent />
      </MainLayout>
    </PhoneFrame>
  );
};

export default MainPage;
