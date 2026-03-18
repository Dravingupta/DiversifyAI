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
export const searchIndianStocks = async (query) => {
  const response = await api.get(`/portfolio/search?q=${query}`);
  return response.data;
};

export const getPortfolio = async () => {
  const response = await api.get('/portfolio');
  return response.data;
};

export const addStockToPortfolio = async (stockSymbol, quantity, buyPrice, sector) => {
  const response = await api.post('/portfolio/add', {
    stockSymbol,
    quantity,
    buyPrice,
    sector
  });
  return response.data;
};

// Sector APIs
export const getSectorDistribution = async () => {
  const response = await api.get('/portfolio/sectors');
  return response.data;
};

// Analysis APIs
export const analyzePortfolio = async () => {
  const response = await api.post('/analysis/portfolio');
  return response.data;
};

// Payment APIs
export const createPaymentOrder = async (amount, advisorId) => {
  const response = await api.post('/payment/create-order', { amount, advisorId });
  return response.data;
};

export const verifyPayment = async (paymentPayload) => {
  const response = await api.post('/payment/verify', paymentPayload);
  return response.data;
};

export default api;

export const removeStockFromPortfolio = async (symbol) => {
  const response = await api.delete(`/portfolio/remove/${symbol}`);
  return response.data;
};
