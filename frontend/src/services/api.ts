import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Direct backend URL for Google OAuth and YouTube data
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000 // 10 second timeout
});

// Add request interceptor for handling tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      config: {
        url: error.config?.url,
        method: error.config?.method
      }
    });

    // Handle network errors
    if (!error.response) {
      console.error('Network Error - Server might be down or unreachable');
      return Promise.reject({
        message: 'Unable to connect to the server. Please check your internet connection.',
        originalError: error
      });
    }

    // Handle 401 Unauthorized
    if (error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      window.location.href = '/login';
    }

    // Handle other errors
    return Promise.reject({
      message: error.response.data?.message || error.message,
      status: error.response.status,
      data: error.response.data
    });
  }
);

// Test server connection
export const testServerConnection = async () => {
  try {
    const response = await api.get('/test');
    console.log('Server connection test:', response.data);
    return true;
  } catch (error) {
    console.error('Server connection test failed:', error);
    return false;
  }
};

export default api;
