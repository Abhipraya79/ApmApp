import "./Header.css";

const Header = () => {
  return (
    <header className="header">
      <img
        src="/assets/logo-klinik.png"
        alt="Logo Klinik"
        className="header-logo"
      />
      <div className="header-title">
        <h1>KLINIK MUHAMMADIYAH LAMONGAN</h1>
        <p>Jl. KH. Ahmad Dahlan No 26, Sidorukun, Sidoharjo Lamongan</p>
      </div>
    </header>
  );
};

export default Header;
