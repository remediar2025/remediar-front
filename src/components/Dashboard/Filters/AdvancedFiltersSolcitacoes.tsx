import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Filter } from "lucide-react";
import { useState } from "react";

export interface FilterRuleSolicitacao {
  id: string;
  field: string;
  operator: string;
  value: string;
}

const FILTER_FIELDS = [
  { value: "id", label: "ID" },
  { value: "nomeSolicitante", label: "Nome do Solicitante" },
  { value: "medicamento", label: "Medicamento" },
  { value: "dataSolicitacao", label: "Data da Solicitação" },
];

const OPERATORS = [
  { value: "contains", label: "Contém" },
  { value: "equals", label: "Igual a" },
  { value: "startsWith", label: "Começa com" },
  { value: "endsWith", label: "Termina com" },
  { value: "gt", label: "Maior que" },
  { value: "lt", label: "Menor que" },
  { value: "gte", label: "Maior ou igual" },
  { value: "lte", label: "Menor ou igual" },
];

const getAvailableOperators = (field: string) => {
  if (field === "dataSolicitacao") {
    return OPERATORS.filter(op => ["equals", "gt", "lt", "gte", "lte"].includes(op.value));
  }
  return OPERATORS;
};

export default function AdvancedFiltersSolicitacoes({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
}: {
  filters: FilterRuleSolicitacao[];
  onFiltersChange: (filters: FilterRuleSolicitacao[]) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const addFilter = () => {
    onFiltersChange([
      ...filters,
      { id: Date.now().toString(), field: "nomeSolicitante", operator: "contains", value: "" },
    ]);
  };

  const updateFilter = (id: string, updates: Partial<FilterRuleSolicitacao>) => {
    onFiltersChange(filters.map(f => (f.id === id ? { ...f, ...updates } : f)));
  };

  const removeFilter = (id: string) => {
    onFiltersChange(filters.filter(f => f.id !== id));
  };

  const hasActiveFilters = filters.some(f => f.value.trim() !== "");

  return (
    <div className="mb-2">
      <Button variant="outline" onClick={() => setIsOpen(true)} className="relative">
        <Filter className="w-4 h-4 mr-2" />
        Filtros Avançados
        {hasActiveFilters && (
          <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {filters.filter(f => f.value.trim() !== "").length}
          </span>
        )}
      </Button>
      {isOpen && (
        <div className="absolute z-50 bg-white border rounded-lg shadow-lg p-4 w-96 mt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm">Filtros Avançados</span>
            <Button variant="ghost" size="sm" onClick={addFilter}>
              <Plus className="w-4 h-4 mr-1" /> Adicionar
            </Button>
          </div>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {filters.map((filter, idx) => (
              <div key={filter.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">Filtro {idx + 1}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeFilter(filter.id)} className="h-6 w-6 p-0 text-red-500 hover:text-red-700">
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <Select
                  value={filter.field}
                  onValueChange={value => updateFilter(filter.id, { field: value, operator: getAvailableOperators(value)[0].value })}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Campo" />
                  </SelectTrigger>
                  <SelectContent>
                    {FILTER_FIELDS.map(f => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filter.operator}
                  onValueChange={value => updateFilter(filter.id, { operator: value })}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Operador" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableOperators(filter.field).map(op => (
                      <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type={filter.field === "dataSolicitacao" ? "date" : "text"}
                  placeholder="Valor"
                  value={filter.value}
                  onChange={e => updateFilter(filter.id, { value: e.target.value })}
                  className="text-xs"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between gap-2 pt-2 border-t mt-2">
            <Button variant="outline" size="sm" onClick={onClearFilters} disabled={!hasActiveFilters}>Limpar</Button>
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>Fechar</Button>
            <Button size="sm" onClick={() => { onApplyFilters(); setIsOpen(false); }} className="bg-[#3FAFC3] hover:bg-cyan-700">Aplicar</Button>
          </div>
        </div>
      )}
    </div>
  );
}