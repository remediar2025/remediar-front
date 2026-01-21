"use client";

import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { ConfirmationModal } from "../modal/confirmationModal"; // Ajuste o import se necessário
import { toast } from "sonner"; // Se estiver usando sonner para toasts
import { api } from "@/services/api/api";
import ENDPOINTS from "@/services/endpoints";

interface Medicamento {
  id: number;
  nomeComercial: string;
  apresentacao: string;
  laboratorio: string;
  statusProduto: string;
}

interface MedicamentosTableProps {
  data: Medicamento[];
  onView?: (medicamento: Medicamento) => void;
  onEdit?: (medicamento: Medicamento) => void;
  onDelete?: (medicamento: Medicamento) => void;
}

export function MedicamentosTable({ data, onView, onEdit, onDelete }: MedicamentosTableProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [medicamentoSelecionado, setMedicamentoSelecionado] = useState<Medicamento | null>(null);

  const handleConfirmDelete = async () => {
    if (!medicamentoSelecionado) return;
    try {
      await api.delete(`${ENDPOINTS.MEDICAMENTOS.CRUD}/${medicamentoSelecionado.id}`);
      toast.success("Medicamento removido com sucesso!");
      onDelete?.(medicamentoSelecionado);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao remover o medicamento.");
    } finally {
      setModalOpen(false);
      setMedicamentoSelecionado(null);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome Comercial</TableHead>
              <TableHead>Apresentação</TableHead>
              <TableHead>Laboratório</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((medicamento) => (
                <TableRow key={medicamento.id}>
                  <TableCell className="max-w-[150px] truncate" title={medicamento.nomeComercial}>
                    {medicamento.nomeComercial}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate" title={medicamento.apresentacao}>
                    {medicamento.apresentacao}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate" title={medicamento.laboratorio}>
                    {medicamento.laboratorio}
                  </TableCell>
                  <TableCell>{medicamento.statusProduto}</TableCell>
                  <TableCell className="flex gap-2 justify-center">
                    <button
                      onClick={() => router.push(`/dashboard-funcionario/lista-medicamentos/view-remedio?id=${medicamento.id}`)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Nenhum medicamento encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Confirmação */}
      {medicamentoSelecionado && (
        <ConfirmationModal
          open={modalOpen}
          title={
            <>
              Deseja realmente remover o medicamento <br />
              <span className="font-bold">{medicamentoSelecionado.nomeComercial}</span>?
            </>
          }
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setModalOpen(false);
            setMedicamentoSelecionado(null);
          }}
        />
      )}
    </>
  );
}
