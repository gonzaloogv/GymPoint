import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '../components/ui/Button';

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
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        password,
      });

      const { accessToken, user } = response.data;

      if (!user.roles || !user.roles.includes('ADMIN')) {
        setError('Acceso denegado. Se requieren privilegios de administrador.');
        setLoading(false);
        return;
      }

      localStorage.setItem('admin_token', accessToken);

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
    <div className="min-h-screen flex items-center justify-center bg-bg dark:bg-bg-dark">
      <div className="bg-card dark:bg-card-dark p-12 rounded-xl border border-border dark:border-border-dark shadow-lg max-w-[420px] w-full">
        <h1 className="text-primary text-center mb-8 font-bold text-2xl">GymPoint Admin</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-text dark:text-text-dark font-medium text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="administrador@administrador.com"
              className="px-4 py-[0.85rem] border border-input-border dark:border-input-border-dark rounded-lg bg-input-bg dark:bg-input-bg-dark text-text dark:text-text-dark focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-text dark:text-text-dark font-medium text-sm">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Ingresa tu contraseña"
              className="px-4 py-[0.85rem] border border-input-border dark:border-input-border-dark rounded-lg bg-input-bg dark:bg-input-bg-dark text-text dark:text-text-dark focus:outline-none focus:border-primary"
            />
          </div>

          {error && <div className="bg-danger/15 text-danger px-[0.85rem] py-[0.85rem] rounded-lg text-center border border-danger/30 text-sm">{error}</div>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>

          <div className="mt-2 text-center">
            <p className="text-text-muted text-sm">
              Usa tus credenciales de administrador para iniciar sesión.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
