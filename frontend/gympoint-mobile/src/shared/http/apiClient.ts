import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../config/env';


export const api = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });


api.interceptors.request.use(async (config) => {
const token = await SecureStore.getItemAsync('accessToken');
if (token) config.headers.Authorization = `Bearer ${token}`;
return config;
});


let isRefreshing = false;
let queue: Array<() => void> = [];


api.interceptors.response.use(
(r) => r,
async (error) => {
const original = error.config as any;
if (error.response?.status === 401 && !original._retry) {
if (isRefreshing) {
await new Promise<void>((res) => queue.push(res));
return api(original);
}
original._retry = true;
isRefreshing = true;
try {
const refreshToken = await SecureStore.getItemAsync('refreshToken');
if (!refreshToken) throw new Error('No refresh token');
const { data } = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, { refreshToken });
await SecureStore.setItemAsync('accessToken', data.accessToken);
queue.forEach((fn) => fn());
queue = [];
return api(original);
} catch (e) {
await SecureStore.deleteItemAsync('accessToken');
await SecureStore.deleteItemAsync('refreshToken');
queue = [];
throw e;
} finally {
isRefreshing = false;
}
}
throw error;
}
);