import { api } from '@/services/api/api';
import ENDPOINTS from '@/services/endpoints';

import {AuthResponse, DadosCadastro, Endereco, RespostaCadastro, UsuarioInterno} from '@/types/auth';

export type PayloadPF = {
  usuario: {
    nome: string;
    documento: string;
    telefone: string;
    endereco: Endereco;
    user: UsuarioInterno;
  };
  dataNascimento: string;
  escolaridade: string;
  qtdPessoasCasa: number;
  rendaFamiliar: number;
  genero: string;
};

export type PayloadPJ = {
  nome: string;
  documento: string;
  telefone: string;
  endereco: Endereco;
  user: UsuarioInterno;
};


export const login = async (
    login: string,
    password: string
): Promise<AuthResponse> => {
  console.log("Iniciando login para:", login);
    const response = await api.post<AuthResponse>("/auth/login", {
        login,
        password,
    });

    console.log(response.data)
    return response.data;
};


export const registerUser = async (
  dados: PayloadPF | PayloadPJ,
  isPF: boolean
): Promise<RespostaCadastro> => {
  const endpoint = isPF ? "/usuarios/pf" : "/usuarios/pj";
  const resposta = await api.post(endpoint, dados);

    // Tenta primeiro pelo header
    const loc = resposta.headers["location"] || resposta.headers["Location"]
    if (loc) {
        const id = Number(loc.split("/").pop())
        if (!Number.isNaN(id)) {
            return { id }
        }
    }

    // Fallback: tenta extrair do corpo
    // Para PF, o body é um UsuarioComumPFDTO, que tem usuario.id
    if (isPF && resposta.data?.usuario?.id) {
        return { id: Number(resposta.data.usuario.id) }
    }
    // Para PJ, o body é um UsuarioComumDTO, que tem id direto
    if (!isPF && resposta.data?.id) {
        return { id: Number(resposta.data.id) }
    }

    throw new Error("Não foi possível extrair o ID do cadastro.")
}

export const forgotPassword = async (email: string) => {
    return await api.post(ENDPOINTS.FORGOT_PASS.CRUD, { login: email });
  };

