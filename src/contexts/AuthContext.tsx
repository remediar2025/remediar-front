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
};

const AuthContext = createContext({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  type DecodedToken = {
    id: string;
    sub: string;
    role: string;
    nome: string;
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

      // 2. Login normal
      const resposta = await api.post(`${ENDPOINTS.AUTH_LOGIN.CRUD}`, {
        login,
        password,
      });

      console.log("Resposta do login:", resposta);

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
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setUser({
          id: decoded.id,
          role: decoded.role,
          login: decoded.sub,
          nome: decoded.nome,
        });
      } catch (err) {
        console.error("Erro ao decodificar token no carregamento:", err);
        logout(); // remove token inválido
      }
    }
  }, []);

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
