import { useNavigate } from 'react-router-dom';
import PhoneFrame from '../Layout/PhoneFrame';

const CommunicationInformation = () => {
  const nav = useNavigate();
  const items = [
    { icon: '🎙️', title: '대화 녹음 분석', desc: '통화 녹음 파일을 업로드하여 분석합니다.' },
    { icon: '👥', title: '화자 자동 감지', desc: '대화 참여자를 자동으로 구분합니다.' },
    { icon: '📊', title: '종합 리포트', desc: '말투, 속도, 발음 등을 상세히 분석합니다.' },
    { icon: '💡', title: '맞춤형 조언', desc: '더 나은 대화를 위한 개선점을 제안합니다.' },
  ];

  return (
    <PhoneFrame title="대화 분석" showTitleRow={true}>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="px-1 pt-4">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Communication AI</p>
          <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-3">
            내 말투를<br />
            <span className="text-blue-600">객관적으로</span>
            <br></br>
            <span className="text-blue-600">분석</span>해 보세요
          </h1>
          <p className="text-base text-gray-500 leading-relaxed">
            당신은 얼마나 잘 말하고 있을까요? AI 분석으로 알아보세요.
          </p>
        </div>

        {/* Feature List */}
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-3xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100">
              <div className="w-12 h-12 flex items-center justify-center text-xl flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-snug">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-2">📌 준비물</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-blue-500">✓</span> 통화 녹음 파일 (wav)
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-blue-500">✓</span> 1분 이하 대화 내용
            </li>
          </ul>
        </div>

        {/* Fixed Bottom Button */}
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent -mx-4">
          <button 
            onClick={() => nav('/communication/upload')}
            className="w-full max-w-[340px] mx-auto block py-4 rounded-full bg-blue-600 text-white font-bold text-lg shadow-xl shadow-blue-200 active:scale-95 transition-transform"
          >
            분석 시작하기
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
};

export default CommunicationInformation;
