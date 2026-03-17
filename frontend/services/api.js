import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const persistAuthSession = (payload) => {
  if (payload?.token) {
    localStorage.setItem(TOKEN_KEY, payload.token);
  }
  if (payload?.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
  }
};

export const registerUser = async (name, email, password) => {
  const response = await api.post('/auth/register', {
    name,
    email,
    password,
  });

  persistAuthSession(response.data);
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', {
    email,
    password,
  });

  persistAuthSession(response.data);
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = () => {
  const rawUser = localStorage.getItem(USER_KEY);
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch (error) {
    return null;
  }
};

// Portfolio APIs
export const getPortfolio = async () => {
  const response = await api.get('/portfolio');
  return response.data;
};

export const addStockToPortfolio = async (stockSymbol, quantity, buyPrice) => {
  const response = await api.post('/portfolio/add', {
    stockSymbol,
    quantity,
    buyPrice,
  });
  return response.data;
};

export default api;
