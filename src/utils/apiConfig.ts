// src/config/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  BOOKS: `${API_BASE_URL}/books`,
  REFRESH: `${API_BASE_URL}/refresh`,
  LOGIN: `${API_BASE_URL}/login`
} as const;

export default API_ENDPOINTS;