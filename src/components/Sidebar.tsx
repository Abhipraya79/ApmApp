import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { logout } from "../api/authService";
import { Calendar, UserPlus, LogOut } from "lucide-react";
import "./Sidebar.css";

const MySwal = withReactContent(Swal);

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState<string>("appointment");

  // Update active menu berdasarkan path saat ini
  useEffect(() => {
    if (location.pathname === "/" || location.pathname === "/appointment") {
      setActiveMenu("appointment");
    } else if (location.pathname === "/newpx") {
      setActiveMenu("newpx");
    }
  }, [location.pathname]);

  const goToAppointment = () => {
    setActiveMenu("appointment");
    navigate("/");
  };

  const goToNewPx = () => {
    setActiveMenu("newpx");
    navigate("/newpx");
  };

  const handleLogout = () => {
    MySwal.fire({
      title: "Konfirmasi Logout",
      text: "Apakah Anda yakin ingin keluar dari aplikasi?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Logout!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate("/login");
      }
    });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img
          src="/assets/logo-klinik.png"
          alt="Logo Klinik"
          className="sidebar-logo"
        />
        <div className="sidebar-clinic-info">
          <h2 className="sidebar-clinic-title">KLINIK MUHAMMADIYAH LAMONGAN</h2>
          <p className="sidebar-clinic-address">Jl. KH. Ahmad Dahlan No 26, Sidorukun, Sidoharjo Lamongan</p>
        </div>
      </div>

      <nav className="sidebar-menu">
        <button 
          className={`sidebar-btn ${activeMenu === "appointment" ? "active" : ""}`} 
          onClick={goToAppointment}
        >
          <Calendar size={20} className="sidebar-icon" />
          <span>Appointment</span>
        </button>
        <button 
          className={`sidebar-btn ${activeMenu === "newpx" ? "active" : ""}`} 
          onClick={goToNewPx}
        >
          <UserPlus size={20} className="sidebar-icon" />
          <span>Pasien Baru</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <LogOut size={20} className="sidebar-icon" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;