import { Link } from 'react-router-dom';
import { useAdminProfile } from '../../hooks';

export const Navbar = () => {
  const { data: adminProfile } = useAdminProfile();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/login';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <h1>GymPoint Admin</h1>
        </Link>
        <div className="navbar-center">
          <Link to="/">Panel</Link>
          <Link to="/users">Usuarios</Link>
          <Link to="/gyms">Gimnasios</Link>
          <Link to="/routines">Rutinas</Link>
          <Link to="/exercises">Ejercicios</Link>
          <Link to="/reviews">Reviews</Link>
          <Link to="/transactions">Transacciones</Link>
          <Link to="/rewards">Recompensas</Link>
        </div>
        <div className="navbar-profile">
          {adminProfile && (
            <div className="admin-info">
              <span className="admin-name">
                {adminProfile.name} {adminProfile.lastname}
              </span>
              <span className="admin-role">{adminProfile.department || 'Administrador'}</span>
            </div>
          )}
          <button onClick={handleLogout} className="logout-btn">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
};
