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
  const [dadosFiltradosFull, setDadosFiltradosFull] = useState<MedicamentosResponse>();
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isFiltrando, setIsFiltrando] = useState(false);

  const PAGE_SIZE = 15;

  const fetchMedicamentos = async (pageNumber = 0, filtroBusca?: string) => {

    const filtroAtivo = typeof filtroBusca === 'string' ? filtroBusca : filtro;
    if (filtroAtivo.trim() === "") {
      setIsFiltrando(false);
      const { data } = await api.get<MedicamentosResponse>(
        `${ENDPOINTS.MEDICAMENTOS.CRUD}?page=${pageNumber}&size=${PAGE_SIZE}`
      );
      setDados(data.content);
      setTotalPages(data.totalPages);
      setPage(data.number);
    } else {
      setIsFiltrando(true);
      const { data } = await api.get<MedicamentosResponse>(
        `${ENDPOINTS.MEDICAMENTOS.CRUD}/pesquisar/principioAtivoOrNomeComercial/${encodeURIComponent(filtroAtivo)}`
      );
      setDadosFiltradosFull(data);
      setTotalPages(data.totalPages);
      setPage(data.number);
      setDados(data.content);
      //setDados(data.slice(pageNumber * PAGE_SIZE, (pageNumber + 1) * PAGE_SIZE));
    }
  };

  
  useEffect(() => {
    if (filtro.trim() === "") {
      fetchMedicamentos(0, "");
      return;
    }
    const timeout = setTimeout(() => {
      fetchMedicamentos(0, filtro);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [filtro]);

const handleNextPage = () => {
  if (page + 1 < totalPages) {
    if (isFiltrando) {
      setPage(page + 1);
      if (dadosFiltradosFull && dadosFiltradosFull.content) {
        setDados(
          dadosFiltradosFull.content.slice(
            (page + 1) * PAGE_SIZE,
            (page + 2) * PAGE_SIZE
          )
        );
      }
    } else {
      fetchMedicamentos(page + 1, filtro);
    }
  }
};

const handlePreviousPage = () => {
  if (page > 0) {
    if (isFiltrando) {
      setPage(page - 1);
      if (dadosFiltradosFull && dadosFiltradosFull.content) {
        setDados(
          dadosFiltradosFull.content.slice(
            (page - 1) * PAGE_SIZE,
            page * PAGE_SIZE
          )
        );
      }
    } else {
      fetchMedicamentos(page - 1, filtro);
    }
  }
};

  // Quando está filtrando, não aplicar filtro local, só ordenação
  const dadosFiltrados = isFiltrando
    ? dados.sort((a, b) => {
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
      })
    : dados
        .filter(
          (item) =>
            item &&
            typeof item.nomeComercial === "string" &&
            item.nomeComercial.toLowerCase().includes(filtro.toLowerCase())
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
