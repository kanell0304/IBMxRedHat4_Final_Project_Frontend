import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PhoneFrame from '../Layout/PhoneFrame';

export default function PresentationCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_duration: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('발표 제목을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      // FormData 형태로 변경
      const formDataToSend = new FormData();
      formDataToSend.append('user_id', '1'); // 현재 로그인한 사용자의 user_id로 변경이 필요 향후 작업 예정
      formDataToSend.append('title', formData.title);
      
      if (formData.description) {
        formDataToSend.append('description', formData.description);
      }
      
      if (formData.target_duration) {
        const targetDurationInSeconds = parseInt(formData.target_duration) * 60;
        formDataToSend.append('target_duration', targetDurationInSeconds.toString());
      }

      const response = await axios.post(
        'http://localhost:8081/presentations/create',
        formDataToSend,
        {
          withCredentials: true
        }
      );

      if (response.data.success) {
        const prId = response.data.pr_id;
        navigate(`/presentation/upload/${prId}`);
      }
    } catch (error) {
      console.error('발표 생성 실패:', error);
      alert('발표 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PhoneFrame title="발표 분석" contentClass="p-4 pb-6 bg-gradient-to-b from-blue-50 via-white to-indigo-50/40">
      <div className="space-y-5">
        <div className="text-center py-2">
          <p className="text-sm font-medium text-gray-500">새로운 분석 시작</p>
          <h2 className="text-xl font-bold text-gray-800">발표 정보 입력</h2>
        </div>

        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div className="w-24 h-1 bg-blue-600"></div>
            <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div className="w-24 h-1 bg-gray-300"></div>
            <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">
              3
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                발표 제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="예: 2024년 4분기 매출 보고"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                발표 설명 (선택)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="발표에 대한 간단한 설명을 입력하세요"
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                목표 발표 시간 (선택)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="target_duration"
                  value={formData.target_duration}
                  onChange={handleChange}
                  placeholder="5"
                  min="1"
                  max="60"
                  className="w-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
                <span className="text-gray-600">분</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                설정하지 않으면 분석 시 참고하지 않습니다
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? '처리 중...' : '다음 단계'}
              </button>
            </div>
          </form>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>다음 단계에서 음성 파일을 업로드하실 수 있습니다</p>
        </div>
      </div>
    </PhoneFrame>
  );
}