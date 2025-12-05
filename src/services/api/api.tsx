import axios from "axios";


const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// const baseUrl = process.env.NEXT_PUBLIC_API_URL;
const baseUrl = "https://remediar-api.mgioqc.easypanel.host/api";

export const api = axios.create({
  baseURL: baseUrl,
  timeout: 10000, 
  withCredentials: true
});


api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      
      
      if (status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          window.location.href = '/login'; 
        }
      }
      

      const errorMessage = error.response.data?.message || 
                         error.response.data?.error || 
                         'Erro desconhecido na requisição';
      
      return Promise.reject(new Error(errorMessage));
    }
    
    if (error.request) {
      return Promise.reject(new Error('Sem resposta do servidor'));
    }
    
    return Promise.reject(error);
  }
);