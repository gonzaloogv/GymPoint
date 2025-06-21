import './SocialLinks.css';

export default function SocialLinks() {
  return (
    <section id="social" className="social-section">
      <div className="social-content">
        <h2 className="social-title">Seguinos en redes</h2>
        <p className="social-text">Sumate a la comunidad GymPoint y enterate de cada actualización.</p>
        <div className="social-icons">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">📸 Instagram</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">💼 LinkedIn</a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">💻 GitHub</a>
        </div>
      </div>
    </section>
  );
}