export interface MedicacaoData {
    itemEstoqueId: number;
    produtoId: number;
    nomeComercial: string;
    descricao: string | null;
    principioAtivo: string;
    apresentacao: string;
    codigoBarras: string;
    laboratorio: string;
    precoMaximo: number;
    statusProduto: string;
    quantidade: number;
    dataValidade: string[];
  }
  