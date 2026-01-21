"use client";

import { Delete, Edit, Eye, Pencil, Trash } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/services/api/api";
import { MedicacaoData } from "@/utils/types/Medicacao";

interface ListaMedicacoesProps {
  data: MedicacaoData[];
  onDataChange?: () => void;
}

const handleDeleteMedicamento = (id: number, onDataChange?: () => void) => {
  return async () => {
    if (confirm("Você tem certeza que deseja excluir este medicamento?")) {
      try {
        await api.delete(`/itens-estoque/${id}`);
        toast.success("Medicamento excluído com sucesso!");
        if (onDataChange) {
          onDataChange();
        }

      } catch (error) {
        toast.error("Erro ao excluir medicamento.");
      }
    }
  };
};

export function ListaMedicacoes({ data, onDataChange }: ListaMedicacoesProps) {
  const router = useRouter();

  const handleView = async (medicacao: MedicacaoData) => {
    try {
      // Buscar dados completos do medicamento
      const responseMedicamento = await api.get(`/medicamentos/${medicacao.produtoId}`);
      
      // Combinar dados do estoque com dados completos do medicamento
      const dadosCombinados = {
        // Dados do item de estoque
        itemEstoqueId: medicacao.itemEstoqueId,
        quantidade: medicacao.quantidade,
        dataValidade: medicacao.dataValidade,
        
        // Dados completos do medicamento
        ...responseMedicamento.data,
        
        // Sobrescrever com dados do estoque se necessário
        nomeComercial: medicacao.nomeComercial,
        principioAtivo: medicacao.principioAtivo,
        apresentacao: medicacao.apresentacao
      };
      
      router.push(
        `/dashboard-funcionario/gerenciar-estoque/view-estoque?medicamento=${encodeURIComponent(
          JSON.stringify(dadosCombinados)
        )}`
      );
    } catch (error) {
      toast.error("Erro ao carregar dados do medicamento");
      console.error("Erro:", error);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item ID</TableHead>
            <TableHead>Nome Comercial</TableHead>
            <TableHead>Princípio Ativo</TableHead>
            <TableHead>Apresentação</TableHead>
            <TableHead>Quantidade</TableHead>
            <TableHead>Data de Validade</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((medicacao) => (
              <TableRow key={medicacao.itemEstoqueId}>
                <TableCell className="font-medium">{medicacao.itemEstoqueId}</TableCell>
                <TableCell className="max-w-[200px] truncate" title={medicacao.nomeComercial}>
                  {medicacao.nomeComercial}
                </TableCell>
                <TableCell className="max-w-[250px] truncate" title={medicacao.principioAtivo}>
                  {medicacao.principioAtivo}
                </TableCell>
                <TableCell className="max-w-[250px] truncate" title={medicacao.apresentacao}>
                  {medicacao.apresentacao}
                </TableCell>
                <TableCell>{medicacao.quantidade}</TableCell>
                <TableCell>
                  {Array.isArray(medicacao.dataValidade) 
                    ? medicacao.dataValidade[0] 
                    : medicacao.dataValidade}
                </TableCell>
                <TableCell className="flex justify-center space-x-1.5">
                  <button
                    onClick={() => handleView(medicacao)}
                    className="text-blue-500 hover:text-blue-700" title="Visualizar"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleDeleteMedicamento(medicacao.itemEstoqueId, onDataChange)}
                    className="text-red-500 hover:text-red-700" title="Excluir"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                Nenhum medicamento encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
