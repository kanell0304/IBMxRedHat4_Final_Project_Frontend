import { useNavigate } from "react-router-dom";

const LoginPage = () => {

    const navigate = useNavigate()

    const handleClickLoginButton = () => {
        navigate("/login");
    }

    return (
        <div style={{display: "flex", flexDirection: 'column', alignItems: 'center', justifyContent: 'center',minHeight: '100vh', gap: '30px'}}>
            <h2>MainPage</h2>
            <button onClick={handleClickLoginButton}>로그인</button>
        </div>
    );
}

export default LoginPage;
