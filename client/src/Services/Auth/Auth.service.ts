import { apiFetch, API_BASE_URLS } from "../apiClient";

export const AuthService = {
  signup: async (data: any) =>
    apiFetch(`${API_BASE_URLS.AUTH}/api/auth/signup`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: async (data: any) =>
    apiFetch(`${API_BASE_URLS.AUTH}/api/auth/login`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: async () =>
    apiFetch(`${API_BASE_URLS.AUTH}/api/auth/me`, {
      method: "GET",
    }),

  refresh: async () =>
    apiFetch(`${API_BASE_URLS.AUTH}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    }),

  forgotPassword: async (data: any) =>
    apiFetch(`${API_BASE_URLS.AUTH}/api/auth/forgot-password`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  resetPassword: async (token: string, data: any) =>
    apiFetch(`${API_BASE_URLS.AUTH}/api/auth/reset-password/${token}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifyEmail: async (token: string) =>
    apiFetch(`${API_BASE_URLS.AUTH}/api/auth/verify-email/${token}`, {
      method: "GET",
    }),

  resendVerification: async (data: any) =>
    apiFetch(`${API_BASE_URLS.AUTH}/api/auth/resend-verification`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logoutAll: async () =>
    apiFetch(`${API_BASE_URLS.AUTH}/api/auth/logout-all`, {
      method: "POST",
    }),
};
