import { useState } from 'react'
import './App.css'

function App() {
  const [msg, setMst] = useState("버튼 눌러서 작동을 확인해보셈");

  return (
    <div>
      <h2>
        AWS Frontend 배포 테스트
      </h2>
      <div className="card">
        <button onClick={() => setMst("정상적으로 작동하는 중~")}>{msg}</button>
      </div>
    </div>
  )
}

export default App
