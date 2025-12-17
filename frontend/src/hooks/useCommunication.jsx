import { useState } from 'react';
import api from '../services/api';

export const useCommunication = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [communicationData, setCommunicationData] = useState(null);
  const [sttResult, setSttResult] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  const uploadAudio = async (userId, audioFile) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', audioFile);

      const response = await api.post('/communication/upload', formData, {
        params: {
          user_id: userId
        }
      });

      setCommunicationData(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const processSTT = async (communicationId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(`/communication/${communicationId}/stt`);
      setSttResult(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const analyzeCommunication = async (communicationId, targetSpeaker = '1') => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(
        `/communication/${communicationId}/analyze`,
        null,
        {
          params: {
            target_speaker: targetSpeaker,
          },
        }
      );

      setAnalysisResult(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const processFullAnalysis = async (userId, audioFile, targetSpeaker = '1') => {
    setLoading(true);
    setError(null);

    try {
      const uploadResult = await uploadAudio(userId, audioFile);
      if (!uploadResult.success) {
        throw new Error(uploadResult.error);
      }

      const communicationId = uploadResult.data.c_id;

      const sttResult = await processSTT(communicationId);
      if (!sttResult.success) {
        throw new Error(sttResult.error);
      }

      const analysisResult = await analyzeCommunication(
        communicationId,
        targetSpeaker
      );
      if (!analysisResult.success) {
        throw new Error(analysisResult.error);
      }

      return {
        success: true,
        data: {
          communicationId,
          sttResult: sttResult.data,
          analysisResult: analysisResult.data,
        },
      };
    } catch (err) {
      const errorMessage = err.message;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getCommunication = async (communicationId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/communication/${communicationId}`);
      setCommunicationData(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || '데이터 조회 실패';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getUserCommunications = async (userId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/communication/users/${userId}/communications`);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || '목록 조회 실패';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const healthCheck = async () => {
    try {
      const response = await api.get('/communication/health');
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail;
      return { success: false, error: errorMessage };
    }
  };

  const reset = () => {
    setCommunicationData(null);
    setSttResult(null);
    setAnalysisResult(null);
    setError(null);
  };

  return {
    loading,
    error,
    communicationData,
    sttResult,
    analysisResult,

    uploadAudio,
    processSTT,
    analyzeCommunication,
    processFullAnalysis,
    getCommunication,
    getUserCommunications,
    healthCheck,
    reset,
  };
};
