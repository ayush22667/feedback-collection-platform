import axios from 'axios';
import { ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: { email: string; password: string; businessName: string }) =>
    api.post<ApiResponse>('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse>('/auth/login', data),
  
  verify: () =>
    api.get<ApiResponse>('/auth/verify'),
  
  sendOTP: (data: { email: string }) =>
    api.post<ApiResponse>('/auth/send-otp', data),
  
  verifyOTP: (data: { email: string; otp: string; password: string; businessName: string }) =>
    api.post<ApiResponse>('/auth/verify-otp', data),
};

export const formsApi = {
  create: (data: any) =>
    api.post<ApiResponse>('/forms', data),
  
  getAll: (params?: any) =>
    api.get<ApiResponse>('/forms', { params }),
  
  getById: (id: string) =>
    api.get<ApiResponse>(`/forms/${id}`),
  
  update: (id: string, data: any) =>
    api.put<ApiResponse>(`/forms/${id}`, data),
  
  delete: (id: string) =>
    api.delete<ApiResponse>(`/forms/${id}`),
  
  getResponses: (id: string, params?: any) =>
    api.get<ApiResponse>(`/forms/${id}/responses`, { params }),
  
  getAnalytics: (id: string) =>
    api.get<ApiResponse>(`/forms/${id}/analytics`),
  
  export: (id: string, params?: any) =>
    api.get(`/forms/${id}/export`, { 
      params,
      responseType: 'blob',
      headers: {
        'Accept': 'text/csv'
      }
    }),
};

export const publicApi = {
  getForm: (publicUrl: string) =>
    api.get<ApiResponse>(`/public/forms/${publicUrl}`),
  
  submitResponse: (publicUrl: string, data: any) =>
    api.post<ApiResponse>(`/public/forms/${publicUrl}/submit`, data),
};

export default api;
