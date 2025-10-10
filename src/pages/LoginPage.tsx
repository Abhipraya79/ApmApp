import Login from "../components/Login";
import "./LoginPage.css";

const LoginPage = () => {
  return (
    <div className="login-page-container">
      <div className="login-card">
        <div className="login-header">
          <img src="/assets/logo-klinik.png" alt="Klinik Logo" className="login-logo" />
          <h2>APM App Login</h2>
          <p>Klinik Muhammadiyah Lamongan</p>
        </div>
        <Login />
      </div>
    </div>
  );
};

export default LoginPage;