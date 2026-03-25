// services/api.js - Centralized Axios API client
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally (token expired)
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

// ─── Auth ────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update', data),
};

// ─── Service Requests ────────────────────────────────────────
export const requestsAPI = {
  create: (data) => api.post('/requests/create', data),
  getAll: (params) => api.get('/requests', { params }),
  getById: (id) => api.get(`/requests/${id}`),
  update: (id, data) => api.put(`/requests/${id}`, data),
  delete: (id) => api.delete(`/requests/${id}`),
};

// ─── Proposals ───────────────────────────────────────────────
export const proposalsAPI = {
  send: (data) => api.post('/proposals/send', data),
  getForRequest: (requestId) => api.get(`/proposals/request/${requestId}`),
  getMy: () => api.get('/proposals/my'),
  accept: (id) => api.put(`/proposals/accept/${id}`),
  reject: (id) => api.put(`/proposals/reject/${id}`),
};

// ─── Messages ────────────────────────────────────────────────
export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (conversationId, params) => api.get(`/messages/${conversationId}`, { params }),
  send: (data) => api.post('/messages/send', data),
};

// ─── Payments ────────────────────────────────────────────────
export const paymentsAPI = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verify: (data) => api.post('/payments/verify', data),
  getHistory: () => api.get('/payments/history'),
};

// ─── Admin ───────────────────────────────────────────────────
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getAllUsers: () => api.get('/admin/users'),
  getAgencies: (params) => api.get('/admin/agencies', { params }),
  approveAgency: (id) => api.put(`/admin/agencies/approve/${id}`),
  rejectAgency: (id) => api.put(`/admin/agencies/reject/${id}`),
};

export default api;
