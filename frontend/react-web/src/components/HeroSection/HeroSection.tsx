import './HeroSection.css';

function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">Entrena inteligente. Evoluciona cada día.</h1>
        <p className="hero-subtitle">Registra, analiza y comparte tu progreso con GymPoint.</p>
        <div className="hero-buttons">
          <button className="btn btn-try">Probar Demo</button>
          <button className="btn btn-download">Descargar App</button>
        </div>
        <div className="hero-mockup">
          <img src="https://s3u.tmimgcdn.com/u37752224/b1e630172f01beea978d7619f213e1f6.gif" alt="App Mockup" className="mockup-image" />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;