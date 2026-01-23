//const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_BASE_URL = "https://remediar-api.mgioqc.easypanel.host";
// const API_BASE_URL = "http://localhost:8081";

export const ENDPOINTS = {
  MEDICAMENTOS: {
    CRUD: `${API_BASE_URL}/medicamentos`,
    COD_BARRAS: `${API_BASE_URL}/medicamentos/codigoBarras` ,
  },
  FUNCIONARIO: {
    CRUD: `${API_BASE_URL}/funcionarios`
  },
    USUARIOS: {
    CRUD: `${API_BASE_URL}/usuarios`,
    IS_VERIFICADO: `${API_BASE_URL}/usuarios/is-verificado`,
    VERIFICAR: `${API_BASE_URL}/usuarios/verificar`,
    REENVIAR_CODIGO: `${API_BASE_URL}/usuarios/reenviar-codigo`,
  },
  ESTOQUE: {
    CRUD: `${API_BASE_URL}/estoque`
  },
  ITENS_ESTOQUE: {
    CRUD: `${API_BASE_URL}/itens-estoque`,
    ESTOQUE_ID: `${API_BASE_URL}/itens-estoque/estoqueId`
  },
  PEDIDOS: {
    CRUD: `${API_BASE_URL}/solicitacoes/pedidos`
  },
  DOACOES: {
    CRUD: `${API_BASE_URL}/solicitacoes/doacoes`
  },
  FORGOT_PASS: {
    CRUD: `${API_BASE_URL}/password/forgot-password`,
  },
  RESET_PASS: {
    CRUD: `${API_BASE_URL}/password/reset-password`,
  },
  AUTH_LOGIN:{
    CRUD: `${API_BASE_URL}/auth/login`,
  },
  SOLICITACOES: {
    ASSUMIR_FUNCIONARIO: `${API_BASE_URL}/solicitacoes`,
    CONFIRMAR: `${API_BASE_URL}/solicitacoes`
  },
  DASHBOARD: {
    REMEDIOS_MAIS_DOADOS: `${API_BASE_URL}/dashboard/medicamentos-mais-doados`,
    TOTAL_MEDICAMENTOS_DOADOS: `${API_BASE_URL}/dashboard/total-medicamentos-doados`,
    TOTAL_SOLICITACOES_NAO_ATENDIDAS: `${API_BASE_URL}/dashboard/total-solicitacoes-nao-atendidas`,
    TOTAL_MEDICAMENTOS_VENCIDOS: `${API_BASE_URL}/dashboard/total-medicamentos-vencidos`,
    FAIXA_ETARIA_POR_SOLICITACAO: `${API_BASE_URL}/dashboard/solicitacoes-por-faixa-etaria`,
  },
  PIX: {
    GERAR: `${API_BASE_URL}/pix/gerar`,
    CONFIRMAR: `${API_BASE_URL}/pix/confirmar`,
  }
};

export default ENDPOINTS;