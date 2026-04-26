/**
 * Centralized API client for Insta Salaries.
 * 
 * Exports an Axios instance pre-configured with:
 * - Base URL pointing to /api
 * - Auth interceptor (attaches Firebase token)
 * - Error normalization interceptor
 */
import axios from 'axios';
import { auth } from '../lib/firebase';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Firebase auth token
api.interceptors.request.use(async (config) => {
  if (auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor: normalize errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = {
      message: 'An unexpected error occurred',
      status: null,
      data: null,
    };

    if (error.response) {
      normalized.status = error.response.status;
      normalized.data = error.response.data;
      normalized.message = error.response.data?.error || error.response.data?.message || `Server error (${error.response.status})`;
    } else if (error.request) {
      normalized.message = 'Network error — please check your connection';
    } else {
      normalized.message = error.message;
    }

    return Promise.reject(normalized);
  }
);

export default api;
