import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "./api/authService";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import AppointmentPage from "./pages/AppointmentPage";
import NewPxPage from "./pages/NewPx";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import "./App.css";

const ProtectedLayout = () => {
  const authenticated = isAuthenticated();
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

const PublicLayout = () => {
  const authenticated = isAuthenticated();
  if (authenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/appointment" element={<AppointmentPage />} />
        <Route path="/newpx" element={<NewPxPage />} />
        <Route path="/newpx/edit/:regNum" element={<NewPxPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
