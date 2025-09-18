import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { logout } from "../api/authService";
import { Calendar, UserPlus, LogOut } from "lucide-react"; // ✅ Icon elegan
import "./Sidebar.css";

const MySwal = withReactContent(Swal);

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const goToAppointment = () => navigate("/");
  const goToNewPx = () => navigate("/newpx");

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
        <h2 className="sidebar-title">APM APP</h2>
      </div>

      <nav className="sidebar-menu">
        <button className="sidebar-btn active" onClick={goToAppointment}>
          <Calendar size={20} className="sidebar-icon" />
          <span>Appointment</span>
        </button>
        <button className="sidebar-btn" onClick={goToNewPx}>
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
