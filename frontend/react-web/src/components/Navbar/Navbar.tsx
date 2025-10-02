import './Navbar.css';
import ThemeToggle from '../ThemeToggle/ThemeToggle';

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">GymPoint</div>
        <nav className="navbar-links">
          <a href="#about">Sobre Nosotros</a>
          <a href="#features">Funciones</a>
          <a href="#testimonials">Opiniones</a>
          <a href="#social">Redes</a>
        </nav>
        <div className="navbar-buttons">
          <button className="btn btn-download">Descargar App</button>
        </div>
        <div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export default Navbar;