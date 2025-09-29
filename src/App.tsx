import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "./api/authService";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import AppointmentPage from "./pages/AppointmentPage";
import NewPxPage from "./pages/NewPx";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import "./App.css";

// Layout untuk halaman private
const ProtectedLayout = () => {
  const authenticated = isAuthenticated();
  console.log("ProtectedLayout - isAuthenticated:", authenticated); // Debug log
  
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="page-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

// Layout untuk halaman publik
const PublicLayout = () => {
  const authenticated = isAuthenticated();
  console.log("PublicLayout - isAuthenticated:", authenticated); // Debug log
  
  if (authenticated) {
    return <Navigate to="/appointment" replace />;
  }
  return <Outlet />;
};

const App: React.FC = () => {
  // Debug: cek localStorage saat app dimuat
  console.log("App loaded - localStorage token:", localStorage.getItem("api_token"));
  
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<AppointmentPage />} />
        <Route path="/appointment" element={<AppointmentPage />} />
        <Route path="/newpx" element={<NewPxPage />} />
      </Route>

      {/* Catch-all untuk route yang tidak dikenal */}
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
};

export default App;