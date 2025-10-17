import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Login con el backend real
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        password,
      });

      const { accessToken, user } = response.data;

      // Verificar que el usuario tenga rol de ADMIN
      if (!user.roles || !user.roles.includes('ADMIN')) {
        setError('Acceso denegado. Se requieren privilegios de administrador.');
        setLoading(false);
        return;
      }

      // Guardar el token de acceso
      localStorage.setItem('admin_token', accessToken);

      // Redirigir al dashboard
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.response?.status === 401) {
        setError('Credenciales inválidas. Verifica tu email y contraseña.');
      } else if (err.response?.data?.error?.message) {
        setError(err.response.data.error.message);
      } else {
        setError('Error al iniciar sesión. Por favor intenta de nuevo.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>GymPoint Admin</h1>
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="administrador@administrador.com"
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Ingresa tu contraseña"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>

          <div className="login-info">
            <p className="info-text">
              Usa tus credenciales de administrador para iniciar sesión.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
