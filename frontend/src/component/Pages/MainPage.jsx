import { useNavigate } from "react-router-dom";

const MainPage = () => {
  const navigate = useNavigate();

  const login = () => {
    navigate("/login");
  };

  const presentation = () => {
    navigate("/presentation/create");
  };

  const interview = () => {
    navigate("/interview/info");
  };

  const communication = () => {
    navigate("/communication/info");
  };

  const featureCards = [
    {
      title: "모의 면접",
      subtitle: "직무/난이도별 질문 세트",
      icon: "🎤",
      iconBg: "bg-indigo-50",
      iconText: "text-indigo-600",
      badge: "LIVE",
      badgeColor: "bg-red-100 text-red-600",
      action: interview,
    },
    {
      title: "대화 분석",
      subtitle: "톤 · 속도 · 표현 분석",
      icon: "💬",
      iconBg: "bg-blue-50",
      iconText: "text-amber-600",
      badge: "Hot",
      badgeColor: "bg-orange-100 text-orange-600",
      action: communication,
    },
    {
      title: "발표 분석",
      subtitle: "음성 업로드 · 감정 분석",
      icon: "📊",
      iconBg: "bg-amber-50",
      iconText: "text-amber-600",
      badge: "Hot",
      badgeColor: "bg-orange-100 text-orange-600",
      action: presentation,
    },
  ];

  const upcomingCards = [
    {
      title: "미니게임",
      subtitle: "미니게임으로 말하기 연습하기",
      disabled: true,
    },
    {
      title: "AI 코치",
      subtitle: "AI 코치와 함께 말하기 연습하기",
      disabled: true,
    },
  ];

  return (
    <div>
      <div className="min-h-screen w-full max-w-3xl mx-auto bg-gray-100 px-4 md:px-6 py-8 space-y-6 border border-gray-200">
        <div className="rounded-3xl bg-white shadow-sm p-6 flex gap-4 items-start">
          <div className="flex-1 space-y-3">
            <h1 className="text-2xl font-extrabold text-gray-900 leading-snug">
              STEACH, <br/> 말투 분석은 스티치!
            </h1>
            <p className="text-sm text-gray-600">하루 10분도 좋아요. AI가 바로 점검해 성장 기록을 남깁니다.</p>
            <button
              // onClick={}
              className="w-full rounded-2xl bg-blue-600 text-white py-3 font-semibold shadow-sm transition hover:bg-blue-700"
            >
              바로 연습 시작
            </button>
          </div>
          <div className="text-4xl" aria-hidden>
            🎁
          </div>
        </div>

        <div className="rounded-3xl bg-white shadow-sm p-5 space-y-4">
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

        <div className="rounded-2xl bg-blue-50 text-blue-800 px-4 py-3 flex items-center gap-2">
          <span className="text-lg">ℹ️</span>
          <span className="text-sm font-semibold">현재 준비중인 기능이에요</span>
        </div>

        <div className="rounded-3xl bg-white shadow-sm p-5 space-y-4">
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

export default MainPage;
