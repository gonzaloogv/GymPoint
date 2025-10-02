import axios from 'axios';
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
export const http = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });
