import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import PhoneFrame from '../Layout/PhoneFrame';

export default function PresentationUpload() {
  const navigate = useNavigate();
  const { prId } = useParams();
  const [file, setFile] = useState(null);
  const [inputMode, setInputMode] = useState('script'); // 'script' 또는 'manual'
  const [scriptText, setScriptText] = useState(''); // 스크립트 텍스트
  const [estimatedSyllables, setEstimatedSyllables] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.st-each.com'

  // 한국어 음절 수 계산
  const calculateSyllables = (text) => {
    if (!text) return 0;
    
    // 한글 유니코드 범위: 가(0xAC00) ~ 힣(0xD7A3)
    const koreanRegex = /[가-힣]/g;
    const koreanChars = text.match(koreanRegex);
    const koreanCount = koreanChars ? koreanChars.length : 0;
    
    // 영어 단어 계산 (선택적, 단어당 평균 1.5 음절로 추정)
    const englishRegex = /[a-zA-Z]+/g;
    const englishWords = text.match(englishRegex);
    const englishCount = englishWords ? Math.round(englishWords.length * 1.5) : 0;
    
    return koreanCount + englishCount;
  };

  // 스크립트 텍스트 변경 시 음절 수 자동 계산
  const handleScriptChange = (e) => {
    const text = e.target.value;
    setScriptText(text);
    const syllables = calculateSyllables(text);
    setEstimatedSyllables(syllables.toString());
  };

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
    
    if (!file) {
      alert('음성 파일을 선택해주세요.');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('audio_file', file);
      if (estimatedSyllables) {
        formData.append('estimated_syllables', estimatedSyllables);
      }

      // 업로드 및 분석 시작 (백그라운드에서 처리)
      axios.post(
        `${API_BASE}/presentations/${prId}/analyze`,
        formData,
        {
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
            
            // 업로드가 100% 완료되면 즉시 분석 로딩 화면으로 이동
            if (progress === 100) {
              setTimeout(() => {
                navigate(`/presentation/analyzing/${prId}`);
              }, 500); // 0.5초 후 이동 (사용자가 100% 확인할 수 있도록)
            }
          }
        }
      ).catch(error => {
        console.error('분석 중 오류:', error);
      });

    } catch (error) {
      console.error('업로드 실패:', error);
      const errorMessage = error.response?.data?.detail || '업로드 중 오류가 발생했습니다.';
      alert(errorMessage);
      setLoading(false);
    }
  };

  return (
    <PhoneFrame title="음성 업로드" contentClass="p-4 pb-6 bg-gradient-to-b from-blue-50 via-white to-indigo-50/40">
      <div className="space-y-5">
        <div className="rounded-3xl bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-slate-100 shadow-sm p-5 space-y-2">
          <p className="text-[12px] font-semibold text-blue-600/80 uppercase tracking-[0.16em]">
            Upload Audio
          </p>
          <h1 className="text-lg font-semibold text-gray-900">음성 파일 업로드</h1>
          <p className="text-sm text-gray-600">
            분석할 발표 녹음 파일을 업로드해주세요
          </p>
        </div>

        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
              ✓
            </div>
            <div className="w-24 h-1 bg-blue-600"></div>
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div className="w-24 h-1 bg-gray-300"></div>
            <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">
              3
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                음성 파일 선택 <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer">
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
                      <div className="text-4xl mb-2">🎤</div>
                      <p className="text-lg font-medium text-gray-800">{file.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setFile(null);
                        }}
                        className="mt-3 text-sm text-red-600 hover:text-red-700"
                      >
                        파일 변경
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl mb-2">📁</div>
                      <p className="text-lg text-gray-600">
                        파일을 선택하거나 드래그하세요
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        지원 형식: WAV, MP3, M4A, OGG, FLAC
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                발화 속도 분석 방법 (선택)
              </label>
              
              {/* 선택 버튼 */}
              <div className="flex gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setInputMode('script');
                    setEstimatedSyllables('');
                  }}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                    inputMode === 'script'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  스크립트 입력
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputMode('manual');
                    setScriptText('');
                    setEstimatedSyllables('');
                  }}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                    inputMode === 'manual'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  음절 수 입력
                </button>
              </div>

              {/* 스크립트 입력 모드 */}
              {inputMode === 'script' && (
                <div className="space-y-3">
                  <textarea
                    value={scriptText}
                    onChange={handleScriptChange}
                    placeholder="발표 스크립트를 입력하시면 자동으로 음절 수가 계산됩니다."
                    rows="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                  />
                  {scriptText && (
                    <div className="flex items-center justify-between bg-blue-50 px-4 py-3 rounded-lg">
                      <div>
                        <p className="text-xs text-blue-600 font-medium mb-1">자동 계산된 음절 수</p>
                        <p className="text-2xl font-bold text-blue-700">{estimatedSyllables} <span className="text-sm font-normal text-blue-600">음절</span></p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setScriptText('');
                          setEstimatedSyllables('');
                        }}
                        className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        초기화
                      </button>
                    </div>
                  )}
                  <p className="text-sm text-gray-500">
                    • 스크립트를 입력하면 더 정확한 발화 속도 분석이 가능합니다
                  </p>
                </div>
              )}

              {/* 직접 입력 모드 */}
              {inputMode === 'manual' && (
                <div className="space-y-3">
                  <input
                    type="number"
                    value={estimatedSyllables}
                    onChange={(e) => setEstimatedSyllables(e.target.value)}
                    placeholder="예: 1000"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                  <p className="text-sm text-gray-500">
                    • 조금 더 정확한 분석을 위해 대략적인 음절 수를 입력해주세요
                  </p>
                </div>
              )}
            </div>

            {loading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>업로드 중...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={loading}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              <button
                type="submit"
                disabled={loading || !file}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? '분석 중...' : '분석 시작'}
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl bg-blue-50 text-blue-800 p-4 space-y-2">
          <h3 className="font-semibold text-blue-900">안내사항</h3>
          <ul className="text-sm space-y-1">
            <li>• 분석에는 1-2분 정도 소요될 수 있습니다</li>
            <li>• 음질이 좋을수록 더 정확한 분석 결과를 얻을 수 있습니다</li>
            <li>• 배경 소음이 적은 녹음 파일을 권장합니다</li>
            <li>• 스크립트를 입력하면 발화 속도를 더 정확하게 분석합니다</li>
          </ul>
        </div>
      </div>
    </PhoneFrame>
  );
}