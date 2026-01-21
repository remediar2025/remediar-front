
export type Solicitation = {
  id: string;
  dadosPessoais?: {
    nome?: string;
    email?: string;
    endereco?: string;
    telefone?: string;
  };
  itemSolicitacao?: {
    medicamento?: string;
    quantidade?: string;
    modoEntrega?: string;
    dataSolicitacao?: string;
  };
  prescricaoMedica?: {
    data?: string;
    nomePaciente?: string;
    idadePaciente?: string;
    genero?: string;
    cpf?: string;
    contato?: string;
    dispensada?: string;
    usoContinuo?: string;
    nomeMedico?: string;
    crm?: string;
    imagemReceita?: string;
  };
  status?: "PENDENTE" | "EM_ANALISE" | "APROVADA" | "REJEITADA" | "CONCLUIDA" | "CANCELADA" | "EM_SEPARACAO" | "AGUARDANDO_RETIRADA";
  responsavel?: string;
};

export type StatusKeys = Exclude<Solicitation['status'], undefined>;

export interface FuncionarioResponse {
  id: number
  nome: string
  email: string
  telefone: string
  cpf: string
  }

export interface FuncionarioRequest {
    nome: string;
    cpf: string;
    telefone: string;
    genero: string;
    dataNascimento: string; // Formato: dd/MM/yyyy 
    endereco: {
      rua: string;
      numero: string;
      complemento?: string;
      bairro: string;
      cidade: string;
      estado: string;
      cep: string;
    };
    usuario: {
      login: string;
      password: string;
      role: "FUNCIONARIO"; // Literal type para garantir que o papel seja sempre "FUNCIONARIO"
    };
  }