import axios from "axios";
import type { AuthResponse, DashboardStats, Product, Sale } from "@/types/app";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mini-erp-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("mini-erp-token");
      window.location.assign("/login");
    }
    return Promise.reject(error);
  }
);

export const setAuth = (auth: AuthResponse) => {
  localStorage.setItem("mini-erp-token", auth.accessToken);
  localStorage.setItem("mini-erp-user", JSON.stringify(auth.user));
};

export const getStoredAuth = () => localStorage.getItem("mini-erp-token");
export const getStoredUser = () => {
  const user = localStorage.getItem("mini-erp-user");
  return user ? JSON.parse(user) : null;
};

export const clearAuth = () => {
  localStorage.removeItem("mini-erp-token");
  localStorage.removeItem("mini-erp-user");
};

const unwrap = <T>(response: { data: { data?: T; message?: string; meta?: unknown } }) => response.data.data as T;

export const authApi = {
  login: async (payload: { email: string; password: string }) => {
    const response = await api.post<{ data: AuthResponse }>('/auth/login', payload);
    return unwrap<AuthResponse>(response);
  },
  me: async () => {
    const response = await api.get<{ data: { _id: string; name: string; email: string; role: string } }>('/auth/me');
    return response.data.data;
  },
};

export const dashboardApi = {
  stats: async () => {
    const response = await api.get<{ data: DashboardStats }>('/dashboard');
    return response.data.data;
  },
};

export const productApi = {
  list: async (params?: Record<string, unknown>) => {
    const response = await api.get<{ data: Product[]; meta?: unknown }>('/products', { params });
    return { items: response.data.data, meta: response.data.meta };
  },
  create: async (payload: FormData) => {
    const response = await api.post<{ data: Product }>('/products', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },
  update: async (id: string, payload: FormData) => {
    const response = await api.patch<{ data: Product }>(`/products/${id}`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },
  remove: async (id: string) => {
    await api.delete(`/products/${id}`);
  },
};

export const saleApi = {
  create: async (payload: { items: Array<{ product: string; quantity: number }> }) => {
    const response = await api.post<{ data: Sale }>('/sales', payload);
    return response.data.data;
  },
};

export default api;
