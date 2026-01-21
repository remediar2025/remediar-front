import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";


const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

const baseUrl = process.env.NEXT_PUBLIC_API_URL;
//const baseUrlNoApi = process.env.NEXT_PUBLIC_BASE_URL;

export const api = axios.create({
  baseURL: baseUrl,
  timeout: 10000, 
  withCredentials: true
});

interface DecodedToken {
  id: string;
  sub: string;
  role: string;
  nome: string;
  exp: number;
}

/*
export const req = axios.create({
  baseURL: baseUrlNoApi,
  timeout: 10000, 
  withCredentials: true
});
*/

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Função para fazer logout
const handleLogout = () => {
  localStorage.removeItem("token");
  toast.error("Sua sessão expirou. Você será redirecionado para o login.");
  setTimeout(() => {
    window.location.href = "/login";
  }, 2000);
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    
    if (token) {
      if (isTokenExpired(token)) {
        handleLogout();
        return Promise.reject(new Error("Token expirado"));
      }
      
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Verificar se o erro é devido a token expirado
    if (error.response?.status === 401 || error.response?.status === 403) {
      const token = localStorage.getItem("token");
      
      if (token && isTokenExpired(token)) {
        handleLogout();
        return Promise.reject(new Error("Token expirado"));
      }
      
      // Se não for token expirado, mas ainda é 401/403, também deslogar
      if (token) {
        handleLogout();
        return Promise.reject(new Error("Acesso não autorizado"));
      }
    }
    
    return Promise.reject(error);
  }
);