import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/authService";
import Swal from 'sweetalert2';
import "./Login.css"; // We'll create this for styling the form
import { Link } from "react-router-dom";
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const data = await login(username, password);
      
      // Check if the API response indicates success
      if (data.metadata.code === 200 && data.response.token) {
        Swal.fire({
          icon: 'success',
          title: 'Login Berhasil!',
          timer: 1500,
          showConfirmButton: false,
        });
        // Redirect to the main application page
        navigate("/"); 
      } else {
        // Handle login failure from the API
        throw new Error(data.metadata.message || "Username atau Password salah");
      }
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: error.message || 'Terjadi kesalahan. Silakan coba lagi.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Masukkan username Anda"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Masukkan password Anda"
          required
        />
      </div>
      <button type="submit" className="btn-login" disabled={isLoading}>
        {isLoading ? "Loading..." : "Login"}
      </button>
      <p>
  Belum punya akun? <Link to="/register">Daftar</Link>
</p>
    </form>
  );
};

export default Login;
