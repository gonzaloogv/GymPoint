import './Features.css';

function Features() {
  return (
    <section id="features" className="features-section">
      <div className="features-content">
        <h2 className="features-title">Funciones de la App</h2>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-video">🔍</div>
            <p className="feature-desc">Búsqueda de gimnasios en el mapa</p>
          </div>
          <div className="feature-item">
            <div className="feature-video">📝</div>
            <p className="feature-desc">Registro de rutina diaria</p>
          </div>
          <div className="feature-item">
            <div className="feature-video">📊</div>
            <p className="feature-desc">Visualización de estadísticas y evolución</p>
          </div>
          <div className="feature-item">
            <div className="feature-video">🔥</div>
            <p className="feature-desc">Sistema de racha + interacción con amigos</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Features;