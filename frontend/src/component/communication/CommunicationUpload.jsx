import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import PhoneFrame from '../Layout/PhoneFrame';
import axios from 'axios';

export default function CommunicationUpload() {
  const nav = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [userId, setUserId] = useState(null);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.st-each.com';
  
  const validFormats = ['.wav', '.mp3', '.m4a', '.ogg', '.flac']; 

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const ext = f.name.substring(f.name.lastIndexOf('.')).toLowerCase();
    if (!validFormats.includes(ext)) {
      alert('지원하지 않는 파일 형식입니다.\n지원 형식: WAV, MP3, M4A, OGG, FLAC');
      return;
    }
    setFile(f);
  };

  useEffect(() => {
  const loadUser = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users/me`, {
        withCredentials: true
      });
      setUserId(res.data.user_id);
    } catch (error) {
      console.error('유저 정보 로드 실패', error);
    }
  };
  loadUser();
}, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProgress(0);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await api.post('/communication/upload', formData, {
        params: { user_id: userId },
        onUploadProgress: (p) => setProgress(Math.round((p.loaded * 100) / p.total))
      });
      if (data.c_id) nav(`/communication/speaker/${data.c_id}`);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || '파일 업로드 중 오류가 발생했습니다.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PhoneFrame title="대화 분석">
      <div className="space-y-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-500">대화 분석</p>
          <h1 className="text-xl font-extrabold text-gray-900">파일 업로드</h1>
          <p className="text-sm text-gray-600">분석할 대화 파일을 업로드하세요</p>
        </div>
        <div className="rounded-3xl bg-white shadow-sm p-6 space-y-6 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-500 transition cursor-pointer">
                <input type="file" accept=".wav,.mp3,.m4a,.ogg,.flac" onChange={handleFile} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {file ? (
                    <div>
                      <div className="text-4xl mb-2">✅</div>
                      <p className="text-sm font-semibold text-gray-900">{file.name}</p>
                      <p className="text-[13px] text-gray-600 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <button type="button" onClick={(e) => { e.preventDefault(); setFile(null); }}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-semibold">파일 변경</button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl mb-2">📁</div>
                      <p className="text-sm font-semibold text-gray-900">파일을 선택하세요</p>
                      <p className="text-[13px] text-gray-600 mt-2">WAV 파일만 분석이 가능합니다.</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
            {loading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span className="font-semibold">업로드 중...</span>
                  <span className="font-semibold">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
            <button type="submit" disabled={loading || !file}
              className="w-full rounded-2xl bg-blue-600 text-white py-3 font-semibold shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:translate-y-0">
              {loading ? '업로드 중...' : '다음 단계'}
            </button>
          </form>
        </div>
        <div className="rounded-2xl bg-blue-50 text-blue-800 px-4 py-3 flex items-center gap-2">
          <span className="text-lg text-blue-800 px-2">!</span>
          <div className="text-sm">
            <p className="font-semibold text-xs">음질이 좋을수록 정확한 분석이 가능해요</p>
            <p className="text-[13px] text-blue-500">배경 소음이 적은 녹음 파일을 권장합니다</p>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
