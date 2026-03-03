import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cosvir_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as any;
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;
    const refreshToken = localStorage.getItem("cosvir_refresh_token");
    if (!refreshToken) return Promise.reject(error);

    try {
      const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
      const nextAccess = refreshResponse.data.accessToken ?? refreshResponse.data.token;
      const nextRefresh = refreshResponse.data.refreshToken;

      localStorage.setItem("cosvir_token", nextAccess);
      localStorage.setItem("cosvir_refresh_token", nextRefresh);
      original.headers.Authorization = `Bearer ${nextAccess}`;

      return api(original);
    } catch (refreshError) {
      localStorage.removeItem("cosvir_token");
      localStorage.removeItem("cosvir_refresh_token");
      localStorage.removeItem("cosvir_email");
      return Promise.reject(refreshError);
    }
  }
);

