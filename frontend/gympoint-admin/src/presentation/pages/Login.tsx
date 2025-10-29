import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks';
import Button from '../components/ui/Button';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const loginMutation = useLogin();

  useEffect(() => {
    if (!loginMutation.isError) {
      return;
    }

    const err = loginMutation.error as AxiosError<{ error: { message: string } }>;
    if (err.response?.status === 401) {
      setErrorMessage('Credenciales invalidas. Verifica tu email y contrasena.');
      return;
    }

    if (err.response?.data?.error?.message) {
      setErrorMessage(err.response.data.error.message);
      return;
    }

    setErrorMessage('Error al iniciar sesion. Por favor intenta de nuevo.');
  }, [loginMutation.error, loginMutation.isError]);

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          const { tokens, user } = data;

          if (!user.roles || !user.roles.includes('ADMIN')) {
            setErrorMessage('Acceso denegado. Se requieren privilegios de administrador.');
            return;
          }

          localStorage.setItem('admin_token', tokens.accessToken);
          localStorage.setItem('admin_refresh_token', tokens.refreshToken);
          navigate('/');
        },
      },
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg dark:bg-bg-dark">
      <div className="w-full max-w-[420px] rounded-xl border border-border bg-card p-12 shadow-lg dark:border-border-dark dark:bg-card-dark">
        <h1 className="mb-8 text-center text-2xl font-bold text-primary">GymPoint Admin</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text dark:text-text-dark">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="administrador@administrador.com"
              className="rounded-lg border border-input-border bg-input-bg px-4 py-[0.85rem] text-text focus:border-primary focus:outline-none dark:border-input-border-dark dark:bg-input-bg-dark dark:text-text-dark"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text dark:text-text-dark">Contrasena</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              placeholder="Ingresa tu contrasena"
              className="rounded-lg border border-input-border bg-input-bg px-4 py-[0.85rem] text-text focus:border-primary focus:outline-none dark:border-input-border-dark dark:bg-input-bg-dark dark:text-text-dark"
            />
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-danger/30 bg-danger/15 px-[0.85rem] py-[0.85rem] text-center text-sm text-danger">
              {errorMessage}
            </div>
          )}

          <Button type="submit" disabled={loginMutation.isPending} className="w-full">
            {loginMutation.isPending ? 'Ingresando...' : 'Ingresar'}
          </Button>

          <div className="mt-2 text-center">
            <p className="text-sm text-text-muted">
              Usa tus credenciales de administrador para iniciar sesion.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
