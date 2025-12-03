import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [msg, setMsg] = useState("버튼 눌러서 작동을 확인해보셈");
  
  // 상태 관리
  const [healthStatus, setHealthStatus] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [estimatedSyllables, setEstimatedSyllables] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API 기본 URL
  const API_BASE_URL = 'http://43.200.166.166:8081';
  // const API_BASE_URL = '';

  // Health Check API 호출
  const handleHealthCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/voice/health`);
      setHealthStatus(response.data);
    } catch (err) {
      setError(`Health check 실패: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 파일 선택 핸들러
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setAnalysisResult(null);
    setError(null);
  };

  // 음성 분석 API 호출
  const handleAnalyzeVoice = async () => {
    if (!selectedFile) {
      setError('음성 파일을 선택해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append('audio_file', selectedFile);
      
      if (estimatedSyllables) {
        formData.append('estimated_syllables', estimatedSyllables);
      }

      const response = await axios.post(`${API_BASE_URL}/voice/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setAnalysisResult(response.data.data);
    } catch (err) {
      setError(`분석 실패: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>AWS Frontend 배포 테스트 화면</h2>
      
      <div className="card">
        <button onClick={() => setMsg("정상적으로 작동하는 중~")}>
          {msg}
        </button>
      </div>

      <div className="card">
        <h3>서버 상태 확인</h3>
        <button onClick={handleHealthCheck} disabled={loading}>
          Health Check
        </button>
        
        {healthStatus && (
          <div style={{ marginTop: '10px', textAlign: 'left' }}>
            <p><strong>Status:</strong> {healthStatus.status}</p>
            <p><strong>Analyzer:</strong> {healthStatus.analyzer}</p>
            <p><strong>Device:</strong> {healthStatus.device}</p>
            <p><strong>Emotions:</strong> {healthStatus.emotions?.join(', ')}</p>
          </div>
        )}
      </div>

      <div className="card">
        <h3>음성 파일 분석</h3>
        
        <div style={{ marginBottom: '10px' }}>
          <input 
            type="file" 
            accept=".wav,.mp3,.m4a,.ogg,.flac,.aac,.wma"
            onChange={handleFileChange}
            disabled={loading}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <input 
            type="number" 
            placeholder="추정 음절 수 (선택사항)"
            value={estimatedSyllables}
            onChange={(e) => setEstimatedSyllables(e.target.value)}
            disabled={loading}
            style={{ padding: '5px' }}
          />
        </div>

        <button 
          onClick={handleAnalyzeVoice} 
          disabled={loading || !selectedFile}
        >
          {loading ? '분석 중...' : '음성 분석'}
        </button>

        {selectedFile && (
          <p style={{ marginTop: '10px' }}>
            선택된 파일: {selectedFile.name}
          </p>
        )}

        {analysisResult && (
          <div style={{ marginTop: '15px', textAlign: 'left', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
            <h4>분석 결과</h4>
            <pre style={{ overflow: 'auto' }}>
              {JSON.stringify(analysisResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          {error}
        </div>
      )}
    </div>
  )
}

export default App