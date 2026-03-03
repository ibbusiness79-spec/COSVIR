import { create } from "zustand";

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  email: string | null;
  setAuth: (token: string, refreshToken: string, email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("cosvir_token"),
  refreshToken: localStorage.getItem("cosvir_refresh_token"),
  email: localStorage.getItem("cosvir_email"),
  setAuth: (token, refreshToken, email) => {
    localStorage.setItem("cosvir_token", token);
    localStorage.setItem("cosvir_refresh_token", refreshToken);
    localStorage.setItem("cosvir_email", email);
    set({ token, refreshToken, email });
  },
  logout: () => {
    localStorage.removeItem("cosvir_token");
    localStorage.removeItem("cosvir_refresh_token");
    localStorage.removeItem("cosvir_email");
    set({ token: null, refreshToken: null, email: null });
  }
}));
