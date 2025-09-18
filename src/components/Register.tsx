import React, { useState } from "react";
import { registerUser, type DAOUser, type AppUserResponse } from "../api/registerService";
import "./Register.css";
import { useNavigate } from "react-router-dom";
const Register: React.FC = () => {
  const [formData, setFormData] = useState<DAOUser>({ username: "", password: "" });
  const [message, setMessage] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
const navigate = useNavigate();
   const goToLogin = () => {
    navigate("/newpx");
  };
   
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response: AppUserResponse = await registerUser(formData);
      setMessage(`Registrasi berhasil! UserKey: ${response.userKey ?? "Tidak ada token"}`);
      setIsError(false);
    } catch (error: any) {
      setMessage("Registrasi gagal. Coba lagi!");
      setIsError(true);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Registrasi Akun</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="username" className="register-label">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            className="register-input"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <label htmlFor="password" className="register-label">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            className="register-input"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button onClick={goToLogin} type="submit" className="register-btn">Daftar</button>
        </form>

        {message && (
          <p className={`register-message ${isError ? "error" : "success"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Register;
