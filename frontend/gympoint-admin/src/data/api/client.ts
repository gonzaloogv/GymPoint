import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Variable para trackear si ya hay un refresh en progreso
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores y refresh automático
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Si es 401 y no es un retry, intentar refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Ya hay un refresh en progreso, poner en cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('admin_refresh_token');

      if (!refreshToken) {
        // No hay refresh token, redirigir a login
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Llamar al endpoint de refresh
        const response = await axios.post('http://localhost:3000/api/auth/refresh-token', {
          refreshToken,
        });

        const { token: accessToken, refreshToken: newRefreshToken } = response.data;

        // Guardar nuevos tokens
        localStorage.setItem('admin_token', accessToken);
        if (newRefreshToken) {
          localStorage.setItem('admin_refresh_token', newRefreshToken);
        }

        // Actualizar el header del request original
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Procesar la cola con el nuevo token
        processQueue(null, accessToken);

        // Reintentar el request original
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh falló, limpiar y redirigir
        processQueue(refreshError, null);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
