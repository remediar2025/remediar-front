"use client";

import { createContext, useState, useContext, useEffect } from "react";
import { User } from "@/types/auth";
import ENDPOINTS from "@/services/endpoints";
import { api } from "@/services/api/api";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (login: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  verificarCodigo: (email: string, codigo: string) => Promise<void>;
  reenviarCodigo: (email: string) => Promise<void>;
  isVerificado: (login: string) => Promise<boolean>;
  checkTokenExpiration: () => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  type DecodedToken = {
    id: string;
    sub: string;
    role: string;
    nome: string;
    exp: number;
  };

  const checkTokenExpiration = (): boolean => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000; // Converter para segundos
      
      if (decoded.exp < currentTime) {
        // Token expirado
        logout();
        toast.error("Sua sessão expirou. Faça login novamente.");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Erro ao verificar token:", error);
      logout();
      return false;
    }
  };

  const login = async (login: string, password: string) => {
    setLoading(true);
    try {
      if (!isVerificado(login)) {
        window.location.href = `/login/verificacao?email=${encodeURIComponent(
          login
        )}`;
        return;
      }

      const resposta = await api.post(`${ENDPOINTS.AUTH_LOGIN.CRUD}`, {
        login,
        password,
      });

      const token = resposta.data?.Token;
      if (!token) throw new Error("Token não recebido");

      localStorage.setItem("token", token);

      const decoded = jwtDecode<DecodedToken>(token);

      setUser({
        id: decoded.id,
        role: decoded.role,
        login: decoded.sub,
        nome: decoded.nome,
      });

      if (decoded.role === "USER" || decoded.role === "CLIENTE") {
        window.location.href = "/dashboard-cliente";
      } else if (decoded.role === "FUNCIONARIO" || decoded.role === "ADMIN") {
        window.location.href = "/dashboard-funcionario";
      } else {
        throw new Error("Gentileza entrar em contato com o suporte.");
      }
    } catch (error) {
      console.error("Erro ao logar:", error);

      if (error instanceof Error && error.message === "Token não recebido") {
        throw new Error("Token não recebido. Entre em contato com o suporte.");
      }

      throw new Error("Credenciais inválidas");
    } finally {
      setLoading(false);
    }
  };

  const verificarCodigo = async (
    email: string,
    codigo: string
  ): Promise<void> => {
    setLoading(true);
    try {
      const response = await api.post(`${ENDPOINTS.USUARIOS.VERIFICAR}`, null, {
        params: { email, codigo },
      });

      if (response.status !== 200) {
        throw new Error(response.data || "Código inválido");
      }
    } catch (error: any) {
      console.error("Erro ao verificar código:", error);
      throw new Error(error.response?.data || "Erro ao verificar código");
    } finally {
      setLoading(false);
    }
  };

  const isVerificado = async (login: string): Promise<boolean> => {
    try {
      const response = await api.post(
        `${ENDPOINTS.USUARIOS.IS_VERIFICADO}`,
        null,
        {
          params: { login },
        }
      );
      return response.data === true;
    } catch (error) {
      console.error("Erro ao verificar se usuário está verificado:", error);
      return false;
    }
  };

  const reenviarCodigo = async (email: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await api.post(
        `${ENDPOINTS.USUARIOS.REENVIAR_CODIGO}`,
        null,
        { params: { email } }
      );

      if (response.status !== 200) {
        throw new Error(response.data || "Erro ao reenviar código");
      }

      toast.success("Código reenviado com sucesso! Verifique seu e-mail.");
    } catch (error: any) {
      console.error("Erro ao reenviar código:", error);
      toast.error(error.response?.data || "Erro ao reenviar código");
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await api.post(
        ENDPOINTS.FORGOT_PASS.CRUD,
        null,
        { params: { email } }
      );

      if (response.status !== 200) {
        throw new Error(
          response.data || "Erro ao solicitar redefinição de senha"
        );
      }

      toast.success("Email para redefinição de senha enviado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao solicitar redefinição de senha:", error);
      toast.error(
        error.response?.data || "Erro ao solicitar redefinição de senha"
      );
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          // Token expirado
          logout();
          return;
        }
        
        setUser({
          id: decoded.id,
          role: decoded.role,
          login: decoded.sub,
          nome: decoded.nome,
        });
      } catch (err) {
        console.error("Erro ao decodificar token no carregamento:", err);
        logout();
      }
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      checkTokenExpiration();
    }, 60000); // Verificar a cada minuto

    return () => clearInterval(interval);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        verificarCodigo,
        isVerificado,
        reenviarCodigo,
        forgotPassword,
        logout,
        checkTokenExpiration,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};