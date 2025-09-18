import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "./api/authService";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import AppointmentPage from "./pages/AppointmentPage";
import NewPxPage from "./pages/NewPx";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage"; // <- import baru
import "./App.css";

// Layout untuk halaman private
const ProtectedLayout = () => {
  if (!isAuthenticated()) {
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
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

const App: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} /> {/* <- route baru */}
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<AppointmentPage />} />
        <Route path="/newpx" element={<NewPxPage />} />
      </Route>

      {/* Catch-all */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated() ? "/" : "/login"} replace />}
      />
    </Routes>
  );
};

export default App;
