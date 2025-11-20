// api.js - API utility functions
import axios from 'axios';
import { getToken } from './storage';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// Auth API
export const login = (email, password) => {
  return api.post('/auth/login', { email, password });
};

export const register = (username, email, password) => {
  return api.post('/auth/register', { username, email, password });
};

export const getMe = () => {
  return api.get('/auth/me');
};

// Posts API
export const getPosts = (params = {}) => {
  return api.get('/posts', { params });
};

export const getPost = (id) => {
  return api.get(`/posts/${id}`);
};

export const createPost = (postData) => {
  return api.post('/posts', postData);
};

export const updatePost = (id, postData) => {
  return api.put(`/posts/${id}`, postData);
};

export const deletePost = (id) => {
  return api.delete(`/posts/${id}`);
};

// Users API
export const getUsers = (params = {}) => {
  return api.get('/users', { params });
};

export const getUser = (id) => {
  return api.get(`/users/${id}`);
};

export const updateUser = (id, userData) => {
  return api.put(`/users/${id}`, userData);
};

export const deleteUser = (id) => {
  return api.delete(`/users/${id}`);
};

export default api;

