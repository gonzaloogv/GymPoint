// src/shared/services/api.ts
import axios, { AxiosInstance, AxiosRequestHeaders } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@shared/config/env';

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

const TOKEN_KEY = 'gp_access';
const REFRESH_KEY = 'gp_refresh';

export const tokenStorage = {
  getAccess: () => SecureStore.getItemAsync(TOKEN_KEY),
  setAccess: (v: string) => SecureStore.setItemAsync(TOKEN_KEY, v),
  delAccess: () => SecureStore.deleteItemAsync(TOKEN_KEY),
  getRefresh: () => SecureStore.getItemAsync(REFRESH_KEY),
  setRefresh: (v: string) => SecureStore.setItemAsync(REFRESH_KEY, v),
  delRefresh: () => SecureStore.deleteItemAsync(REFRESH_KEY),
};

api.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getAccess();
  if (token) {
    const headers = (config.headers ?? {}) as AxiosRequestHeaders;
    headers.Authorization = `Bearer ${token}`;
    config.headers = headers;
  }
  return config;
});

// Response → refresh con cola
let isRefreshing = false;
let queue: Array<() => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error?.response?.status;

    if (status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        await new Promise<void>((resolve) => queue.push(resolve));
        const token = await tokenStorage.getAccess();
        if (token) original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }

      try {
        isRefreshing = true;
        const refresh = await tokenStorage.getRefresh();
        if (!refresh) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {
          token: refresh,
        });

        await tokenStorage.setAccess(data.accessToken);
        if (data.refreshToken) await tokenStorage.setRefresh(data.refreshToken);

        queue.forEach((fn) => fn());
        queue = [];
        isRefreshing = false;

        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (e) {
        isRefreshing = false;
        queue = [];
        await tokenStorage.delAccess();
        await tokenStorage.delRefresh();
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  },
);
console.log('🌐 API_BASE_URL:', API_BASE_URL || api.defaults.baseURL);
