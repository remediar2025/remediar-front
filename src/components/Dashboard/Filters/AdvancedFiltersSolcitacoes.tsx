import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Filter } from "lucide-react";
import { useEffect, useState } from "react";

export interface SolicitacaoFiltros {
  id: string;
  nomeSolicitante: string;
  medicamento: string;
  status: string;
  dataSolicitacaoInicio: string;
  dataSolicitacaoFim: string;
}

export const FILTROS_SOLICITACAO_VAZIOS: SolicitacaoFiltros = {
  id: "",
  nomeSolicitante: "",
  medicamento: "",
  status: "",
  dataSolicitacaoInicio: "",
  dataSolicitacaoFim: "",
};

// Enum real do backend — não inclui REJEITADA.
export const STATUS_OPTIONS = [
  { value: "PENDENTE", label: "Pendente" },
  { value: "ALTERADA_PELO_USUARIO", label: "Alterada pelo Usuário" },
  { value: "EM_ANALISE", label: "Em Análise" },
  { value: "APROVADA", label: "Aprovada" },
  { value: "EM_SEPARACAO", label: "Em Separação" },
  { value: "SEPARADA", label: "Separada" },
  { value: "AGUARDANDO_RETIRADA", label: "Aguardando Retirada" },
  { value: "AGUARDANDO_ENTREGA", label: "Aguardando Entrega" },
  { value: "EM_TRANSPORTE", label: "Em Transporte" },
  { value: "CONCLUIDA", label: "Concluída" },
  { value: "CANCELADA", label: "Cancelada" },
  { value: "SEM_ESTOQUE", label: "Sem Estoque" },
  { value: "AGUARDANDO_USUARIO", label: "Aguardando Usuário" },
];

function countActive(filters: SolicitacaoFiltros) {
  return Object.values(filters).filter(v => v.trim() !== "").length;
}

export default function AdvancedFiltersSolicitacoes({
  value,
  onApply,
  onClear,
}: {
  value: SolicitacaoFiltros;
  onApply: (filters: SolicitacaoFiltros) => void;
  onClear: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<SolicitacaoFiltros>(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const activeCount = countActive(value);

  const update = (updates: Partial<SolicitacaoFiltros>) => {
    setDraft(prev => ({ ...prev, ...updates }));
  };

  const handleApply = () => {
    onApply(draft);
    setIsOpen(false);
  };

  const handleClear = () => {
    setDraft(FILTROS_SOLICITACAO_VAZIOS);
    onClear();
    setIsOpen(false);
  };

  return (
    <div className="relative mb-2">
      <Button variant="outline" onClick={() => setIsOpen(o => !o)} className="relative">
        <Filter className="w-4 h-4 mr-2" />
        Filtros Avançados
        {activeCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </Button>
      {isOpen && (
        <div className="absolute z-50 bg-white border rounded-lg shadow-lg p-4 w-96 mt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm">Filtros Avançados</span>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-6 w-6 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">ID</label>
              <Input
                placeholder="ID exato da solicitação"
                value={draft.id}
                onChange={e => update({ id: e.target.value })}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Nome do Solicitante</label>
              <Input
                placeholder="Contém..."
                value={draft.nomeSolicitante}
                onChange={e => update({ nomeSolicitante: e.target.value })}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Medicamento</label>
              <Input
                placeholder="Contém..."
                value={draft.medicamento}
                onChange={e => update({ medicamento: e.target.value })}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Status</label>
              <Select
                value={draft.status || "todos"}
                onValueChange={value => update({ status: value === "todos" ? "" : value })}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {STATUS_OPTIONS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-medium">Data Início</label>
                <Input
                  type="date"
                  value={draft.dataSolicitacaoInicio}
                  onChange={e => update({ dataSolicitacaoInicio: e.target.value })}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-medium">Data Fim</label>
                <Input
                  type="date"
                  value={draft.dataSolicitacaoFim}
                  onChange={e => update({ dataSolicitacaoFim: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-between gap-2 pt-2 border-t mt-2">
            <Button variant="outline" size="sm" onClick={handleClear} disabled={activeCount === 0 && countActive(draft) === 0}>
              Limpar
            </Button>
            <Button size="sm" onClick={handleApply} className="bg-[#3FAFC3] hover:bg-cyan-700">
              Aplicar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
