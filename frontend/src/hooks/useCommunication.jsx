import { useState } from 'react';
import api from '../services/api';

export const useCommunication = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const exec = async (fn) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      return { success: true, data: result };
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || '오류 발생';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const uploadAudio = (userId, audioFile) => exec(async () => {
    const formData = new FormData();
    formData.append('file', audioFile);
    const { data } = await api.post('/communication/upload', formData, { params: { user_id: userId } });
    return data;
  });

  const processSTT = (cId) => exec(async () => {
    const { data } = await api.post(`/communication/${cId}/stt`);
    return data;
  });

  const analyzeCommunication = (cId, targetSpeaker = '1') => exec(async () => {
    const { data } = await api.post(`/communication/${cId}/analyze`, null, { params: { target_speaker: targetSpeaker } });
    return data;
  });

  const getCommunication = (cId) => exec(async () => {
    const { data } = await api.get(`/communication/${cId}`);
    return data;
  });

  const getUserCommunications = (userId) => exec(async () => {
    const { data } = await api.get(`/communication/users/${userId}/communications`);
    return data;
  });

  const processFullAnalysis = async (userId, audioFile, targetSpeaker = '1') => {
    const upload = await uploadAudio(userId, audioFile);
    if (!upload.success) return upload;
    const stt = await processSTT(upload.data.c_id);
    if (!stt.success) return stt;
    const analysis = await analyzeCommunication(upload.data.c_id, targetSpeaker);
    if (!analysis.success) return analysis;
    return { success: true, data: { communicationId: upload.data.c_id, sttResult: stt.data, analysisResult: analysis.data } };
  };

  const healthCheck = async () => {
    try {
      const { data } = await api.get('/communication/health');
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.response?.data?.detail };
    }
  };

  return { loading, error, uploadAudio, processSTT, analyzeCommunication, getCommunication, getUserCommunications, processFullAnalysis, healthCheck };
};
