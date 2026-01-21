"use client";
import { useEffect, useState, useRef } from "react";
import DashboardLayout from "@/components/Dashboard/layouts/dashboardLayout";
import { SearchBarEstoque } from "@/components/Dashboard/searchbar/searchbar-estoque";
import AdvancedFilters, {
  FilterRule,
} from "@/components/Dashboard/Filters/AdvancedFilters";
import { Boxes, Barcode } from "lucide-react";
import { ConfiguracaoItems, menuPrincipalItems } from "@/utils/constants";
import { api } from "@/services/api/api";
import ENDPOINTS from "@/services/endpoints";
import { ListaMedicacoes } from "@/components/Dashboard/estoqueList";
import {
  Info,
  FlaskConical,
  Package,
  ScanBarcode,
  Factory,
  DollarSign,
  ShieldCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { date } from "zod";
import { formatarDataParaBackend } from "@/utils/formatDate";
import { toast } from "sonner";
import { MedicacaoData } from "@/utils/types/Medicacao";

declare global {
  interface Window {
    todosRegistrosEstoque?: MedicacaoData[];
  }
}

interface Estoque {
  id: number;
  nome: string;
}

interface MedicamentoDetalhes {
  id: number;
  nomeComercial: string;
  principioAtivo: string;
  apresentacao: string;
  codigoBarras: string;
  laboratorio: string;
  precoMaximo: number;
  statusProduto: string;
}

// Adicionar interface para paginação
interface PageResponse {
  content: any[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export default function GerenciarEstoque() {
  const [estoques, setEstoques] = useState<Estoque[]>([]);
  const [filtro, setFiltro] = useState("");
  const [estoqueSelecionado, setEstoqueSelecionado] = useState<string>("");
  const [medicacoes, setMedicacoes] = useState<MedicacaoData[]>([]);
  const [isModalNovoEstoqueOpen, setIsModalNovoEstoqueOpen] = useState(false);
  const [isModalCodigoBarrasOpen, setIsModalCodigoBarrasOpen] = useState(false);
  const [novoEstoqueNome, setNovoEstoqueNome] = useState("");
  const [codigoBarrasInput, setCodigoBarrasInput] = useState("");
  const [medicamentoDetalhes, setMedicamentoDetalhes] =
    useState<MedicamentoDetalhes | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");

  // Estados para paginação
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const PAGE_SIZE = 10;

  const barcodeBuffer = useRef<string>("");
  const lastKeyTime = useRef<number>(0);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const ignoreEnterUntil = useRef<number>(0);

  const [formularioAdicao, setFormularioAdicao] = useState({
    medicamento: "",
    quantidade: "1",
    dataValidade: "",
    estoque: "",
  });

  // Novos estados para filtros
  const [filters, setFilters] = useState<FilterRule[]>([]);
  const [filteredMedicacoes, setFilteredMedicacoes] = useState<MedicacaoData[]>(
    []
  );

  // Adicionar estado para contagem total de registros filtrados
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);

  // NOVOS ESTADOS para gerenciar dataset completo
  const [todosMedicamentos, setTodosMedicamentos] = useState<MedicacaoData[]>([]);
  const [medicamentosFiltered, setMedicamentosFiltered] = useState<MedicacaoData[]>([]);

  const buscarEstoques = async () => {
    try {
      const { data } = await api.get(`${ENDPOINTS.ESTOQUE.CRUD}?size=100`);
      const estoques = data.content || [];
      setEstoques(estoques);

      const estoqueUniao = estoques.find(
        (estoque: { nome: string }) =>
          estoque.nome.toLowerCase().includes("uniao") ||
          estoque.nome.toLowerCase().includes("união")
      );

      if (estoqueUniao && !estoqueSelecionado) {
        setEstoqueSelecionado(String(estoqueUniao.id));
        setFormularioAdicao((prev) => ({
          ...prev,
          estoque: String(estoqueUniao.id),
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar estoques:", error);
    }
  };

  // NOVA FUNÇÃO: Buscar todos os medicamentos do estoque
  const buscarTodosMedicamentosEstoque = async (estoqueId: string) => {
    if (!estoqueId) return;

    try {
      // Buscar todos os dados sem paginação (ou com size muito grande)
      const { data } = await api.get(
        `${ENDPOINTS.ITENS_ESTOQUE.ESTOQUE_ID}/${estoqueId}?page=0&size=10000&sort=id,desc`
      );
      
      const todosMedicamentos: MedicacaoData[] = (data.content || []).map(
        (item: any) => ({
          itemEstoqueId: item.itemEstoqueId,
          produtoId: item.produtoId,
          nomeComercial: item.nomeComercial,
          principioAtivo: item.principioAtivo,
          apresentacao: item.apresentacao,
          quantidade: item.quantidade,
          dataValidade: [formatarData(item.dataValidade)],
          descricao: null,
          codigoBarras: "",
          laboratorio: "",
          precoMaximo: 0,
          statusProduto: "ATIVO",
        })
      );

      setTodosMedicamentos(todosMedicamentos);
      setTotalElements(todosMedicamentos.length);
      
      // Aplicar filtros iniciais
      applyAllFilters(todosMedicamentos);
      
    } catch (error) {
      console.error("Erro ao buscar todos os medicamentos:", error);
      toast.error("Erro ao carregar medicamentos do estoque");
    }
  };

  // NOVA FUNÇÃO: Aplicar todos os filtros ao dataset completo
  const applyAllFilters = (medicamentosCompletos: MedicacaoData[] = todosMedicamentos) => {
    let resultado = [...medicamentosCompletos];

    // 1. Aplicar filtros avançados
    if (filters.length > 0 && filters.some(filter => filter.value.trim() !== "")) {
      resultado = resultado.filter((medicacao) => {
        return filters.every((filter) => {
          if (!filter.value.trim()) return true;

          let fieldValue: string | number;
          let filterValue: string | number = filter.value;

          // Obter valor do campo
          switch (filter.field) {
            case "itemEstoqueId":
              fieldValue = Number(medicacao.itemEstoqueId);
              filterValue = Number(filter.value);
              if (isNaN(filterValue)) return false;
              break;
            case "nomeComercial":
              fieldValue = medicacao.nomeComercial?.toLowerCase() || "";
              filterValue = filter.value.toLowerCase();
              break;
            case "principioAtivo":
              fieldValue = medicacao.principioAtivo?.toLowerCase() || "";
              filterValue = filter.value.toLowerCase();
              break;
            case "quantidade":
              fieldValue = Number(medicacao.quantidade);
              filterValue = Number(filter.value);
              if (isNaN(filterValue)) return false;
              break;
            case "dataValidade":
              const dataArray = medicacao.dataValidade;
              if (Array.isArray(dataArray) && dataArray.length > 0) {
                const dataStr = dataArray[0];
                if (dataStr && dataStr.includes("/")) {
                  const [dia, mes, ano] = dataStr.split("/");
                  const diaFormatado = dia.padStart(2, "0");
                  const mesFormatado = mes.padStart(2, "0");
                  fieldValue = `${ano}-${mesFormatado}-${diaFormatado}`;
                } else {
                  fieldValue = "";
                }
              } else {
                fieldValue = "";
              }
              filterValue = filter.value;
              
              if (filter.operator !== "equals" && filter.operator !== "contains") {
                const fieldDate = new Date(fieldValue as string);
                const filterDate = new Date(filterValue as string);
                fieldValue = fieldDate.getTime();
                filterValue = filterDate.getTime();
                if (isNaN(fieldValue) || isNaN(filterValue)) return false;
              }
              break;
            default:
              return true;
          }

          // Aplicar operador
          switch (filter.operator) {
            case "contains":
              return String(fieldValue).includes(String(filterValue));
            case "equals":
              return fieldValue === filterValue;
            case "startsWith":
              return String(fieldValue).startsWith(String(filterValue));
            case "endsWith":
              return String(fieldValue).endsWith(String(filterValue));
            case "gt":
              return Number(fieldValue) > Number(filterValue);
            case "lt":
              return Number(fieldValue) < Number(filterValue);
            case "gte":
              return Number(fieldValue) >= Number(filterValue);
            case "lte":
              return Number(fieldValue) <= Number(filterValue);
            default:
              return true;
          }
        });
      });
    }

    // 2. Aplicar filtro de texto
    if (filtro.trim()) {
      resultado = resultado.filter(
        (med) =>
          med.nomeComercial
            ?.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .includes(
              filtro
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
            ) ||
          med.principioAtivo
            ?.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .includes(
              filtro
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
            ) ||
          med.apresentacao
            ?.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .includes(
              filtro
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
            )
      );
    }

    // 3. Salvar resultado filtrado
    setMedicamentosFiltered(resultado);
    setTotalFilteredRecords(resultado.length);

    // 4. Calcular paginação baseada no resultado filtrado
    const totalPagesFiltered = Math.ceil(resultado.length / PAGE_SIZE);
    setTotalPages(totalPagesFiltered);

    // 5. Se a página atual é maior que o total de páginas, voltar para a primeira
    if (page >= totalPagesFiltered && totalPagesFiltered > 0) {
      setPage(0);
    }

    // 6. Extrair dados da página atual
    updateCurrentPageData(resultado, totalPagesFiltered > 0 ? (page >= totalPagesFiltered ? 0 : page) : 0);
  };

  // NOVA FUNÇÃO: Atualizar dados da página atual
  const updateCurrentPageData = (filteredData: MedicacaoData[], currentPage: number) => {
    const startIndex = currentPage * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const currentPageData = filteredData.slice(startIndex, endIndex);
    
    setMedicacoes(currentPageData);
    setFilteredMedicacoes(currentPageData);
  };

  const buscarMedicacoesEstoque = async (
    estoqueId: string,
    pageNumber: number = 0
  ) => {
    if (!estoqueId) return;

    try {
      setIsLoading(true);
      setPage(pageNumber);
      
      // Se é a primeira carga ou mudou de estoque, buscar todos os dados
      if (pageNumber === 0 || todosMedicamentos.length === 0) {
        await buscarTodosMedicamentosEstoque(estoqueId);
      } else {
        // Se só mudou de página, usar dados já filtrados
        updateCurrentPageData(medicamentosFiltered, pageNumber);
      }
      
    } catch (error) {
      console.error("Erro ao buscar medicamentos:", error);
      toast.error("Erro ao carregar medicamentos do estoque");
    } finally {
      setIsLoading(false);
    }
  };

  const criarNovoEstoque = async () => {
    try {
      await api.post(ENDPOINTS.ESTOQUE.CRUD, { nome: novoEstoqueNome });
      await buscarEstoques();
      setIsModalNovoEstoqueOpen(false);
      setNovoEstoqueNome("");
      toast.success("Estoque criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar estoque:", error);
      toast.error("Erro ao criar estoque");
    }
  };

  const adicionarItemEstoque = async () => {
    try {
      await api.post(ENDPOINTS.ITENS_ESTOQUE.CRUD, {
        estoqueId: parseInt(formularioAdicao.estoque),
        produtoId: medicamentoDetalhes?.id
          ? Number(medicamentoDetalhes.id)
          : undefined,
        quantidade: parseInt(formularioAdicao.quantidade),
        dataValidade: formatarDataParaBackend(formularioAdicao.dataValidade),
      });

      if (estoqueSelecionado) {
        buscarMedicacoesEstoque(estoqueSelecionado, page);
      }

      toast.success("Medicamento adicionado com sucesso!");

      setFormularioAdicao({
        medicamento: "",
        quantidade: "1",
        dataValidade: "",
        estoque: estoqueSelecionado,
      });
      setMedicamentoDetalhes(null);
      setIsModalNovoEstoqueOpen(false);
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
      toast.error("Erro ao adicionar medicamento");
    }
  };

  // Funções de paginação
  const handleNextPage = () => {
    if (page + 1 < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      updateCurrentPageData(medicamentosFiltered, nextPage);
    }
  };

  const handlePreviousPage = () => {
    if (page > 0) {
      const prevPage = page - 1;
      setPage(prevPage);
      updateCurrentPageData(medicamentosFiltered, prevPage);
    }
  };

  // Reset página quando trocar estoque
  const handleEstoqueChange = (novoEstoqueId: string) => {
    setEstoqueSelecionado(novoEstoqueId);
    setPage(0);
    setTodosMedicamentos([]); // Limpar dados anteriores
    buscarMedicacoesEstoque(novoEstoqueId, 0);
  };

  useEffect(() => {
    if (!isModalCodigoBarrasOpen) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.altKey || event.metaKey) return;

      const now = Date.now();

      if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }

      if (now < ignoreEnterUntil.current) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }

      if (now - lastKeyTime.current > 100) {
        barcodeBuffer.current = "";
      }

      if (event.key.match(/^\d$/)) {
        barcodeBuffer.current += event.key;
        setCodigoBarrasInput(barcodeBuffer.current);
      }

      lastKeyTime.current = now;

      if (timeoutId.current) clearTimeout(timeoutId.current);

      timeoutId.current = setTimeout(() => {
        if (barcodeBuffer.current.length === 13) {
          handleBarcodeScan(barcodeBuffer.current);
          barcodeBuffer.current = "";
        }
      }, 50);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    window.addEventListener("keydown", handleKeyPress, true);
    window.addEventListener("keyup", handleKeyUp, true);

    return () => {
      window.removeEventListener("keydown", handleKeyPress, true);
      window.removeEventListener("keyup", handleKeyUp, true);
      if (timeoutId.current) clearTimeout(timeoutId.current);
    };
  }, [isModalCodigoBarrasOpen]);

  const handleBarcodeScan = async (code: string) => {
    try {
      setIsScanning(true);
      setScanError("");

      ignoreEnterUntil.current = Date.now() + 1000;

      const response = await axios.get(
        ENDPOINTS.MEDICAMENTOS.COD_BARRAS + `/${code}`
      );
      const dadosMedicamento = response.data;

      if (!dadosMedicamento?.id) {
        throw new Error("Medicamento não encontrado");
      }

      setMedicamentoDetalhes(dadosMedicamento);
      setFormularioAdicao((prev) => ({
        ...prev,
        medicamento: dadosMedicamento.nomeComercial,
      }));

      setTimeout(() => {
        setIsModalCodigoBarrasOpen(false);
      }, 1000);
    } catch (error) {
      setScanError(`Código não reconhecido: ${code}`);
      setCodigoBarrasInput(code);
      ignoreEnterUntil.current = Date.now() + 1000;
    } finally {
      setIsScanning(false);
      barcodeBuffer.current = "";
    }
  };

  useEffect(() => {
    buscarEstoques();
  }, []);

  useEffect(() => {
    if (estoqueSelecionado) {
      buscarMedicacoesEstoque(estoqueSelecionado, 0);
      setPage(0);
    }
  }, [estoqueSelecionado]);

  // Handlers para filtros
  const handleFiltersChange = (newFilters: FilterRule[]) => {
    setFilters(newFilters);
    setPage(0); // Voltar para primeira página quando aplicar filtros
  };

  const handleApplyFilters = () => {
    setPage(0); // Voltar para primeira página
    applyAllFilters();
  };

  const handleClearFilters = () => {
    setFilters([]);
    setFiltro("");
    setPage(0);
    applyAllFilters(todosMedicamentos);
  };

  // ATUALIZAR medicacoesFiltradas
  const medicacoesFiltradas = medicacoes; // Agora medicacoes já contém os dados filtrados da página atual

  return (
    <DashboardLayout
      title="Gerenciar Estoque"
      Icon={() => <Boxes />}
      menuPrincipalItems={menuPrincipalItems}
      configuracaoItems={ConfiguracaoItems}
    >
      <div className="w-full flex flex-col justify-center">
        <div className="w-full mb-4 flex px-2 mb-4 gap-4">
          <div className="flex flex-col">
            <AdvancedFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
            />

            {/* Informações sobre filtros ativos - ATUALIZADA */}
            {(filters.some((f) => f.value.trim() !== "") || filtro.trim() !== "") && (
              <div className="mt-2 text-xs text-gray-600">
                <div className="flex flex-col gap-1">
                  <div>
                    <span className="font-medium">{medicacoesFiltradas.length}</span> de{" "}
                    <span className="font-medium">{Math.min(PAGE_SIZE, totalFilteredRecords)}</span> (página atual)
                  </div>
                  <div className="text-blue-600">
                    <span className="font-medium">{totalFilteredRecords}</span> de{" "}
                    <span className="font-medium">{totalElements}</span> (total filtrado)
                  </div>
                  {filters.some((f) => f.value.trim() !== "") && (
                    <div className="text-green-600 text-xs">
                      {filters.filter((f) => f.value.trim() !== "").length} filtro(s) ativo(s)
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="w-full">
            <SearchBarEstoque
              setFiltro={setFiltro}
              setEstoqueSelecionado={handleEstoqueChange}
              estoques={estoques}
              onOpenModal={() => setIsModalNovoEstoqueOpen(true)}
              estoqueSelecionado={estoqueSelecionado}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3FAFC3]"></div>
            <span className="ml-3 text-gray-600">Carregando medicamentos...</span>
          </div>
        ) : (
          <>
            <ListaMedicacoes
              data={medicacoesFiltradas}
              onDataChange={() => {
                if (estoqueSelecionado) {
                  buscarMedicacoesEstoque(estoqueSelecionado, 0);
                }
              }}
            />

            {/* Controles de Paginação - ATUALIZADA */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <Button
                  onClick={handlePreviousPage}
                  disabled={page === 0 || isLoading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  ← Anterior
                </Button>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    Página {page + 1} de {totalPages}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({totalFilteredRecords} registros filtrados)
                  </span>
                </div>

                <Button
                  onClick={handleNextPage}
                  disabled={page + 1 >= totalPages || isLoading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  Próxima →
                </Button>
              </div>
            )}
          </>
        )}

        {/* Modais permanecem iguais... */}
        <Dialog
          open={isModalNovoEstoqueOpen}
          onOpenChange={setIsModalNovoEstoqueOpen}
        >
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg justify-center">
                <Boxes size={20} className="text-[#3FAFC3]" />
                <span className="text-gray-700">Adicionar Medicamento</span>
              </DialogTitle>
            </DialogHeader>
            <hr className="my-4 border-t border-gray-200" />
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Nome do Medicamento"
                  value={formularioAdicao.medicamento}
                  className="flex-1 bg-gray-100"
                  readOnly
                />
                <Button
                  onClick={() => setIsModalCodigoBarrasOpen(true)}
                  variant="outline"
                  size="icon"
                >
                  <Barcode size={18} />
                </Button>
              </div>

              {medicamentoDetalhes && (
                <div className="bg-gray-50 rounded-lg border p-4 mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-800">
                    <Info size={18} className="text-cyan-700" />
                    <strong className="min-w-[140px]">Nome Comercial:</strong>
                    {medicamentoDetalhes.nomeComercial}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-800">
                    <FlaskConical size={18} className="text-cyan-700" />
                    <strong className="min-w-[140px]">Princípio Ativo:</strong>
                    {medicamentoDetalhes.principioAtivo}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-800">
                    <Package size={18} className="text-cyan-700" />
                    <strong className="min-w-[140px]">Apresentação:</strong>
                    {medicamentoDetalhes.apresentacao}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-800">
                    <ScanBarcode size={18} className="text-cyan-700" />
                    <strong className="min-w-[140px]">Código de Barras:</strong>
                    {medicamentoDetalhes.codigoBarras}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-800">
                    <Factory size={18} className="text-cyan-700" />
                    <strong className="min-w-[140px]">Laboratório:</strong>
                    {medicamentoDetalhes.laboratorio}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-800">
                    <DollarSign size={18} className="text-cyan-700" />
                    <strong className="min-w-[140px]">Preço Máximo:</strong>
                    R$ {medicamentoDetalhes.precoMaximo.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-800">
                    <ShieldCheck size={18} className="text-cyan-700" />
                    <strong className="min-w-[140px]">Status:</strong>
                    {medicamentoDetalhes.statusProduto}
                  </div>
                </div>
              )}

              <div className="flex gap-4 justify-between">
                <Input
                  type="number"
                  placeholder="Qtd. (Unidade)"
                  value={formularioAdicao.quantidade}
                  onChange={(e) =>
                    setFormularioAdicao({
                      ...formularioAdicao,
                      quantidade: e.target.value,
                    })
                  }
                  min="1"
                />

                <Input
                  type="date"
                  placeholder="Data de Validade"
                  value={formularioAdicao.dataValidade}
                  onChange={(e) =>
                    setFormularioAdicao({
                      ...formularioAdicao,
                      dataValidade: e.target.value,
                    })
                  }
                  className="text-gray-500 text-end text-base"
                  min="1"
                />

                <Select
                  value={formularioAdicao.estoque}
                  onValueChange={(value) =>
                    setFormularioAdicao({ ...formularioAdicao, estoque: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar Estoque" />
                  </SelectTrigger>
                  <SelectContent>
                    {estoques.map((estoque) => (
                      <SelectItem key={estoque.id} value={String(estoque.id)}>
                        {estoque.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsModalNovoEstoqueOpen(false);
                    setFormularioAdicao({
                      medicamento: "",
                      quantidade: "1",
                      dataValidade: "",
                      estoque: estoqueSelecionado,
                    });
                    setMedicamentoDetalhes(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  className="bg-[#3FAFC3] hover:bg-cyan-800"
                  onClick={adicionarItemEstoque}
                  disabled={!formularioAdicao.estoque || !medicamentoDetalhes}
                >
                  Confirmar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isModalCodigoBarrasOpen}
          onOpenChange={setIsModalCodigoBarrasOpen}
        >
          <DialogContent
            className="sm:max-w-[425px]"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 justify-center">
                <Barcode size={20} className="text-[#3FAFC3]" />
                <span className="text-gray-700">
                  Leitor de Código de Barras
                </span>
              </DialogTitle>
              <DialogDescription className="text-center">
                {isScanning
                  ? "Processando código..."
                  : "Aponte a pistola para esta janela"}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center gap-6">
              <div
                className={`w-full h-40 flex flex-col items-center justify-center gap-2 
                bg-gray-50 rounded-lg border-2 border-dashed transition-all relative overflow-hidden
                ${
                  isScanning ? "border-blue-400 bg-blue-50" : "border-gray-300"
                }`}
              >
                {!isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse opacity-60"></div>
                    <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-ping"></div>
                  </div>
                )}

                <div
                  className={`flex items-center justify-center text-4xl transition-all duration-300 ${
                    isScanning ? "animate-pulse scale-110" : "animate-bounce"
                  }`}
                >
                  {isScanning ? (
                    <div className="flex items-center gap-2">
                      <Barcode
                        size={32}
                        className="text-blue-600 animate-pulse"
                      />
                      <span>⏳</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Barcode size={32} className="text-gray-600" />
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-500 text-center px-4 z-10">
                  {isScanning
                    ? `Lendo código: ${codigoBarrasInput}`
                    : "Aguardando leitura da pistola..."}
                </p>

                {!isScanning && (
                  <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-blue-400 to-transparent animate-ping opacity-40"></div>
                )}
                {!isScanning && (
                  <div className="absolute right-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent animate-pulse opacity-40"></div>
                )}
              </div>

              {scanError && (
                <div className="w-full p-3 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">
                  {scanError}
                </div>
              )}

              {medicamentoDetalhes && (
                <div className="w-full p-3 text-center text-green-600 bg-green-50 rounded-lg border border-green-200">
                  <p className="font-medium">✅ Medicamento encontrado!</p>
                  <p className="text-sm">{medicamentoDetalhes.nomeComercial}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function formatarData(data: string | [number, number, number]): string {
  if (!data) return "";
  if (typeof data === "string") {
    // Se já está no formato dd/MM/yyyy, retorna direto
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) return data;
    // Se está no formato yyyy-MM-dd, converte
    if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      const [ano, mes, dia] = data.split("-");
      return `${dia}/${mes}/${ano}`;
    }
    // Se está no formato yyyy-MM-ddTHH:mm:ss, pega só a data
    if (/^\d{4}-\d{2}-\d{2}T/.test(data)) {
      const [dataParte] = data.split("T");
      const [ano, mes, dia] = dataParte.split("-");
      return `${dia}/${mes}/${ano}`;
    }
    return data;
  }
  // Array [ano, mes, dia]
  const [ano, mes, dia] = data;
  if (!ano || !mes || !dia) return "";
  return `${dia.toString().padStart(2, "0")}/${mes
    .toString()
    .padStart(2, "0")}/${ano}`;
}
