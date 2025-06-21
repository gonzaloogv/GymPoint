import './Testimonials.css';

export default function Testimonials() {
  return (
    <section id="testimonials" className="testimonials-section">
      <div className="testimonials-content">
        <h2 className="testimonials-title">Opiniones de Usuarios</h2>
        <div className="testimonials-grid">
          <div className="testimonial-item">
            <p className="testimonial-text">“GymPoint me motivó a mantener mis entrenamientos constantes. ¡La racha me impulsa a no abandonar!”</p>
            <span className="testimonial-author">— Juan P., Tester</span>
          </div>
          <div className="testimonial-item">
            <p className="testimonial-text">“Me encanta cómo puedo ver mi progreso semana a semana, ¡es muy visual e intuitivo!”</p>
            <span className="testimonial-author">— María L., Estudiante</span>
          </div>
        </div>
      </div>
    </section>
  );
}