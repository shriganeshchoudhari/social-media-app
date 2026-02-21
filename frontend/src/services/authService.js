import api from './api';

export const authService = {
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    return response.data;
  },
  
  login: async (data) => {
    const response = await api.post('/auth/login', data);
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};
