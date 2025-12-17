import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunication } from '../../hooks/useCommunication';
import api from '../../services/api';

export default function CommunicationUpload() {
  const navigate = useNavigate();
  const { uploadAudio } = useCommunication();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validFormats = ['.wav', '.mp3', '.m4a', '.ogg', '.flac'];
      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();

      if (!validFormats.includes(fileExtension)) {
        alert('지원하지 않는 파일 형식입니다.\n지원 형식: WAV, MP3, M4A, OGG, FLAC');
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(
        '/communication/upload',
        formData,
        {
          params: {
            user_id: 1
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      );

      if (response.data.c_id) {
        navigate(`/communication/speaker/${response.data.c_id}`);
      }
    } catch (error) {
      console.error('업로드 실패:', error);
      console.error('응답 데이터:', error.response?.data);
      const errorMessage = error.response?.data?.detail || '업로드 중 오류가 발생했습니다.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="min-h-screen w-full max-w-3xl mx-auto bg-gray-100 px-4 md:px-6 py-8 space-y-6">
        <header className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-lg"
          >
            ←
          </button>
          <div>
            <p className="text-xs font-semibold text-gray-500">대화 분석</p>
            <h1 className="text-xl font-bold text-gray-900">파일 업로드</h1>
            <p className="text-sm text-gray-500 mt-1">분석할 대화 파일을 업로드하세요</p>
          </div>
        </header>

        <div className="rounded-3xl bg-white shadow-sm p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                🎙️ 대화 녹음 파일
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-500 transition cursor-pointer">
                <input
                  type="file"
                  accept=".wav,.mp3,.m4a,.ogg,.flac"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {file ? (
                    <div>
                      <div className="text-4xl mb-2">✅</div>
                      <p className="text-base font-semibold text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setFile(null);
                        }}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        파일 변경
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl mb-2">📁</div>
                      <p className="text-base font-semibold text-gray-900">
                        파일을 선택하세요
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        WAV, MP3, M4A, OGG, FLAC
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {loading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span className="font-semibold">업로드 중...</span>
                  <span className="font-semibold">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full rounded-2xl bg-blue-600 text-white py-3 font-semibold shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? '업로드 중...' : '다음 단계'}
            </button>
          </form>
        </div>

        <div className="rounded-2xl bg-blue-50 text-blue-800 px-4 py-3 flex items-center gap-2">
          <span className="text-lg">ℹ️</span>
          <div className="text-sm">
            <p className="font-semibold">음질이 좋을수록 정확한 분석이 가능해요</p>
            <p className="text-blue-700">배경 소음이 적은 녹음 파일을 권장합니다</p>
          </div>
        </div>
      </div>
    </div>
  );
}
