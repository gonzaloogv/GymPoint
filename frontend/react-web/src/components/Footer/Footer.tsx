import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">GymPoint</div>
        <ul className="footer-links">
          <li><a href="#about">Sobre Nosotros</a></li>
          <li><a href="#features">Funciones</a></li>
          <li><a href="#testimonials">Opiniones</a></li>
          <li><a href="#social">Redes</a></li>
        </ul>
        <div className="footer-info">
          <a href="#">Política de Privacidad</a> · <a href="#">Términos</a> · <a href="#">Contacto</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;