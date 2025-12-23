const API_BASE_URL = 'http://43.200.166.166:8081/api/minigame';

export const minigameAPI = {
  startGame: async (difficulty, mode, value) => {
    const formData = new FormData();
    formData.append('difficulty', difficulty);
    formData.append('mode', mode);
    
    if (mode === 'target_count') {
      formData.append('target_count', value);
    } else {
      formData.append('time_limit', value);
    }
    
    const response = await fetch(`${API_BASE_URL}/start`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('게임 시작 실패');
    }
    
    return await response.json();
  },
  
  getNextSentence: async (sessionId) => {
    const response = await fetch(`${API_BASE_URL}/sentence/${sessionId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('NO_MORE_SENTENCES');
      }
      throw new Error('문제 가져오기 실패');
    }
    
    return await response.json();
  },
  
  submitAudio: async (sessionId, audioBlob) => {
    const getFileExtension = (mimeType) => {
      const mimeToExt = {
        'audio/webm': 'webm',
        'audio/webm;codecs=opus': 'webm',
        'audio/ogg': 'ogg',
        'audio/ogg;codecs=opus': 'ogg',
        'audio/mp4': 'mp4',
        'audio/mpeg': 'mp3',
        'audio/wav': 'wav'
      };
      
      if (mimeToExt[mimeType]) {
        return mimeToExt[mimeType];
      }
      
      for (const [key, ext] of Object.entries(mimeToExt)) {
        if (mimeType.startsWith(key)) {
          return ext;
        }
      }
      
      return 'webm';
    };
    
    const extension = getFileExtension(audioBlob.type);
    const filename = `recording.${extension}`;
    
    const formData = new FormData();
    formData.append('session_id', sessionId);
    formData.append('audio_file', audioBlob, filename);
    
    const response = await fetch(`${API_BASE_URL}/evaluate`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('음성 제출 실패');
    }
    
    return await response.json();
  },
  
  getGameStatus: async (sessionId) => {
    const response = await fetch(`${API_BASE_URL}/status/${sessionId}`);
    
    if (!response.ok) {
      throw new Error('상태 확인 실패');
    }
    
    return await response.json();
  },
  
  finishGame: async (sessionId) => {
    const response = await fetch(`${API_BASE_URL}/finish/${sessionId}`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error('게임 종료 실패');
    }
    
    return await response.json();
  }
};
