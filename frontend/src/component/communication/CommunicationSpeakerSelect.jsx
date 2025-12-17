import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCommunication } from '../../hooks/useCommunication';
import api from '../../services/api';

export default function CommunicationSpeakerSelect() {
  const navigate = useNavigate();
  const { c_id } = useParams();
  const { processSTT, analyzeCommunication } = useCommunication();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [speakers, setSpeakers] = useState([]);
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);
  const [sttProcessing, setSttProcessing] = useState(true);

  useEffect(() => {
    processStt();
  }, [c_id]);

  const processStt = async () => {
    try {
      setSttProcessing(true);
      const response = await api.post(`/communication/${c_id}/stt`, {});

      if (response.data.c_sr_id) {
        await extractSpeakers(c_id);
      }
    } catch (error) {
      console.error('STT 처리 실패:', error);
      alert('음성 인식 처리 중 오류가 발생했습니다.');
      navigate('/communication');
    } finally {
      setSttProcessing(false);
      setLoading(false);
    }
  };

  const extractSpeakers = async (c_id) => {
    try {
      const response = await api.get(`/communication/${c_id}`);

      const sttResult = response.data?.stt_results?.[0];
      if (!sttResult || !sttResult.json_data) {
        throw new Error('STT 결과를 찾을 수 없습니다.');
      }

      const speakerMap = {};
      const words = sttResult.json_data?.results?.[0]?.alternatives?.[0]?.words || [];

      words.forEach((word) => {
        const speakerTag = word.speakerLabel || word.speakerTag || '1';
        if (!speakerMap[speakerTag]) {
          speakerMap[speakerTag] = {
            speaker: speakerTag,
            firstUtterance: word.word || '',
            wordCount: 0
          };
        }
        speakerMap[speakerTag].wordCount++;
      });

      const speakerList = Object.values(speakerMap).sort((a, b) => {
        return parseInt(a.speaker) - parseInt(b.speaker);
      });

      setSpeakers(speakerList);
    } catch (error) {
      console.error('화자 정보 추출 실패:', error);
      alert('화자 정보를 불러오는 중 오류가 발생했습니다.');
      navigate('/communication');
    }
  };

  const handleSpeakerSelect = (speaker) => {
    setSelectedSpeaker(speaker);
  };

  const handleAnalyze = async () => {
    if (!selectedSpeaker) {
      alert('분석할 화자를 선택해주세요.');
      return;
    }

    setAnalyzing(true);

    try {
      const response = await api.post(
        `/communication/${c_id}/analyze`,
        null,
        {
          params: {
            target_speaker: selectedSpeaker
          }
        }
      );

      if (response.data.c_result_id) {
        navigate(`/communication/result/${c_id}`);
      }
    } catch (error) {
      console.error('분석 실패:', error);
      const errorMessage = error.response?.data?.detail || '분석 중 오류가 발생했습니다.';
      alert(errorMessage);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading || sttProcessing) {
    return (
      <div className="min-h-screen bg-white">
        <div className="min-h-screen w-full max-w-3xl mx-auto bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-base font-semibold text-gray-900">음성 인식 처리 중...</p>
            <p className="text-sm text-gray-500 mt-2">1-2분 정도 소요될 수 있습니다</p>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="text-xl font-bold text-gray-900">화자 선택</h1>
            <p className="text-sm text-gray-500 mt-1">분석할 화자를 선택하세요</p>
          </div>
        </header>

        <div className="rounded-3xl bg-white shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">👥 감지된 화자 목록</h2>

          {speakers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">화자를 감지하지 못했습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {speakers.map((speaker) => (
                <button
                  key={speaker.speaker}
                  onClick={() => handleSpeakerSelect(speaker.speaker)}
                  className={`w-full rounded-2xl p-4 transition ${
                    selectedSpeaker === speaker.speaker
                      ? 'bg-blue-50 border-2 border-blue-600'
                      : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-xl font-bold ${
                      selectedSpeaker === speaker.speaker
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {speaker.speaker}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-gray-900">
                          화자 {speaker.speaker}
                        </h3>
                        {selectedSpeaker === speaker.speaker && (
                          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                            선택됨
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        발화 단어 수: {speaker.wordCount}개
                      </p>
                      <div className="bg-white rounded-lg p-2 border border-gray-200">
                        <p className="text-xs text-gray-600">첫 번째 발언</p>
                        <p className="text-sm text-gray-900">
                          "{speaker.firstUtterance}..."
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={analyzing || !selectedSpeaker}
            className="w-full rounded-2xl bg-blue-600 text-white py-3 font-semibold shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {analyzing ? '분석 중...' : '분석 시작'}
          </button>
        </div>

        {analyzing && (
          <div className="rounded-2xl bg-blue-50 text-blue-800 px-4 py-3 flex items-center gap-2">
            <span className="text-lg">⏳</span>
            <div className="text-sm">
              <p className="font-semibold">분석 중입니다...</p>
              <p className="text-blue-700">대화 내용을 분석하고 있습니다. 잠시만 기다려주세요.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
