import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { uploadAnswer, getIDetail } from './JobAPI';

const Interview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialSession = useMemo(() => {
    const fromState = location.state;
    if (fromState?.questions?.length && fromState?.interviewId) {
      return fromState;
    }
    const saved = sessionStorage.getItem('interviewSession');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch (err) {
      console.error('Failed to parse interviewSession', err);
      return null;
    }
  }, [location.state]);

  const [questions, setQuestions] = useState(initialSession?.questions || []);
  const [interviewId, setInterviewId] = useState(initialSession?.interviewId || null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [answerMap, setAnswerMap] = useState({});
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    if (initialSession?.questions?.length && initialSession?.interviewId) {
      sessionStorage.setItem('interviewSession', JSON.stringify(initialSession));
      setQuestions(initialSession.questions);
      setInterviewId(initialSession.interviewId);
    }
  }, [initialSession]);

  const currentQuestion = questions[currentIndex];
  const currentAnswerId = currentQuestion ? answerMap[currentQuestion.q_id || currentQuestion.id] : null;

  useEffect(() => {
    return () => {
      if (recorderRef.current) {
        recorderRef.current.stream.getTracks().forEach((track) => track.stop());
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  useEffect(() => {
    const loadAnswers = async () => {
      if (!interviewId) return;
      try {
        const detail = await getIDetail(interviewId);
        const map = {};
        (detail.answers || []).forEach((ans) => {
          if (ans.q_id != null) {
            map[ans.q_id] = ans.i_answer_id;
          }
        });
        setAnswerMap(map);
      } catch (err) {
        setError('답변 정보를 불러오지 못했습니다.');
      }
    };
    loadAnswers();
  }, [interviewId]);

  const startRecording = async () => {
    setError('');
    setStatus('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setUploadedFile(null);
        setIsRecording(false);
        recorder.stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      recorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error('Recording error', err);
      setError('마이크 접근 권한을 확인해주세요.');
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && isRecording) {
      recorderRef.current.stop();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setRecordedBlob(null);
    setStatus('');
    setError('');
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
  };

  const submitAnswer = async () => {
    if (!currentQuestion || !currentAnswerId) {
      setError('질문 또는 답변 정보를 불러오지 못했습니다.');
      return;
    }
    const audioFile =
      uploadedFile ||
      (recordedBlob
        ? new File([recordedBlob], `answer-${currentAnswerId}.webm`, { type: recordedBlob.type || 'audio/webm' })
        : null);

    setError('');
    setStatus('');

    if (!audioFile) {
      setError('녹음 파일을 준비해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      await uploadAnswer({ answerId: currentAnswerId, audioFile });
      setStatus('답변이 전송되었습니다.');
      setRecordedBlob(null);
      setUploadedFile(null);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl('');
      setCurrentIndex((idx) => (idx + 1 < questions.length ? idx + 1 : idx));
    } catch (err) {
      console.error('Submit answer error', err?.response || err);
      setError(err?.message || '답변 전송 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!questions.length || !interviewId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow p-6 text-center space-y-4">
          <p className="text-lg font-semibold text-slate-800">인터뷰 정보를 불러올 수 없습니다.</p>
          <p className="text-sm text-slate-500">질문 선택 후 다시 시작해주세요.</p>
          <button
            type="button"
            onClick={() => navigate('/interview/job')}
            className="w-full rounded-xl bg-blue-600 text-white font-semibold py-3 hover:bg-blue-700 transition"
          >
            질문 선택하러 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600/80">Interview</p>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">답변 녹음 & 제출</h1>
            <p className="text-sm text-slate-500 mt-1">질문을 확인하고 녹음 파일을 업로드하거나 직접 녹음해 주세요.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/interview/job')}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            질문 다시 선택
          </button>
        </div>

        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 mb-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-700">
              Q{currentQuestion?.q_order || currentIndex + 1}. {currentQuestion?.question_text}
            </div>
            <div className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">
              {currentIndex + 1} / {questions.length}
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-800">직접 녹음</h2>
              {isRecording ? (
                <span className="text-xs text-red-500 font-semibold">녹음 중...</span>
              ) : (
                <span className="text-xs text-slate-500">마이크 필요</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex-1 rounded-xl px-4 py-3 font-semibold text-white transition ${
                  isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isRecording ? '녹음 종료' : '녹음 시작'}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-3">녹음이 끝나면 자동으로 파일이 준비됩니다.</p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-800">녹음 파일 업로드</h2>
              <span className="text-xs text-slate-500">audio/*</span>
            </div>
            <label className="block w-full">
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold hover:file:bg-slate-200 cursor-pointer"
              />
            </label>
            <p className="text-xs text-slate-500 mt-3">이미 녹음된 파일이 있다면 업로드하세요.</p>
          </div>
        </div>

        {audioUrl && (
          <div className="mt-6 rounded-2xl border border-slate-200 p-4 bg-slate-50 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800 mb-2">준비된 녹음</p>
              <audio controls src={audioUrl} className="w-full" />
            </div>
            <button
              type="button"
              onClick={() => {
                if (audioUrl) URL.revokeObjectURL(audioUrl);
                setAudioUrl('');
                setUploadedFile(null);
                setRecordedBlob(null);
              }}
              className="text-xs font-semibold text-red-500 hover:text-red-600"
            >
              제거
            </button>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            {status && <span className="text-green-600 font-semibold">{status}</span>}
            {error && <span className="text-red-500 font-semibold">{error}</span>}
            {!status && !error && <span>녹음 또는 업로드 후 제출하세요.</span>}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/interview/job')}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={submitAnswer}
              disabled={submitting || (!uploadedFile && !recordedBlob)}
              className={`rounded-xl px-4 py-3 text-sm font-semibold text-white transition ${
                submitting || (!uploadedFile && !recordedBlob)
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {submitting ? '전송 중...' : '답변 제출'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interview;
