"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Dashboard/layouts/dashboardLayout";
import { SearchBar } from "@/components/Dashboard/searchbar/searchbar-medicamento";
import { Boxes } from "lucide-react";
import { ConfiguracaoItems, menuPrincipalItems } from "@/utils/constants";
import { MedicamentosTable } from "@/components/Dashboard/medicalList";
import { api } from "@/services/api/api";
import ENDPOINTS from "@/services/endpoints";
import { Button } from "@/components/ui/button";

interface Medicamento {
  id: number;
  nomeComercial: string;
  apresentacao: string;
  laboratorio: string;
  statusProduto: string;
}

interface MedicamentosResponse {
  content: Medicamento[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export default function ListaMedicamentos() {
  const [filtro, setFiltro] = useState("");
  const [ordenacao, setOrdenacao] = useState<"nome" | "laboratorio" | "status">("nome");

  const [dados, setDados] = useState<Medicamento[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchMedicamentos = async (pageNumber = 0) => {
    try {
      const { data } = await api.get<MedicamentosResponse>(
        `${ENDPOINTS.MEDICAMENTOS.CRUD}?page=${pageNumber}&size=15`
      );
      setDados(data.content);
      setTotalPages(data.totalPages);
      setPage(data.number);
    } catch (error) {
      console.error("Erro ao buscar medicamentos:", error);
    }
  };
  useEffect(() => {
    fetchMedicamentos();
  }, []);

  const handleNextPage = () => {
    if (page + 1 < totalPages) {
      fetchMedicamentos(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 0) {
      fetchMedicamentos(page - 1);
    }
  };

  const dadosFiltrados = dados
    .filter((item) =>
      item.nomeComercial?.toLowerCase()?.includes(filtro?.toLowerCase())
    )
    .sort((a, b) => {
      if (ordenacao === "nome") {
        return a.nomeComercial.localeCompare(b.nomeComercial);
      }
      if (ordenacao === "laboratorio") {
        return a.laboratorio.localeCompare(b.laboratorio);
      }
      if (ordenacao === "status") {
        return a.statusProduto.localeCompare(b.statusProduto);
      }
      return 0;
    });

  return (
    <DashboardLayout
      title="Gerenciar Estoque"
      Icon={() => <Boxes />}
      menuPrincipalItems={menuPrincipalItems}
      configuracaoItems={ConfiguracaoItems}
    >
      <div className="flex flex-col gap-3">
        <div className="w-full mb-4">
          <SearchBar
            setFiltro={setFiltro}
            setEstoqueSelecionado={() => {}}
            setOrdenacao={setOrdenacao}
          />
        </div>
        <MedicamentosTable
          data={dadosFiltrados}
          onDelete={(medicamentoDeletado) => {
            setDados((prev) => prev.filter((m) => m.id !== medicamentoDeletado.id));
          }}
        />
        <div className="flex justify-between mt-4">
          <Button
            onClick={handlePreviousPage}
            disabled={page === 0}
            variant="outline"
          >
            Anterior
          </Button>
          <span className="text-sm text-gray-600 self-center">
            Página {page + 1} de {totalPages}
          </span>
          <Button
            onClick={handleNextPage}
            disabled={page + 1 >= totalPages}
            variant="outline"
          >
            Próxima
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
