"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X, Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface FilterRule {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface AdvancedFiltersProps {
  filters: FilterRule[];
  onFiltersChange: (filters: FilterRule[]) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

const FILTER_FIELDS = [
  // { value: "itemEstoqueId", label: "Item ID" },
  { value: "nomeComercial", label: "Nome Comercial" },
  { value: "principioAtivo", label: "Princípio Ativo" },
  { value: "quantidade", label: "Quantidade" },
  { value: "dataValidade", label: "Data de Validade" },
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
  if (field === "quantidade") {
    return OPERATORS.filter((op) =>
      ["equals", "gt", "lt", "gte", "lte"].includes(op.value)
    );
  }
  if (field === "dataValidade") {
    return OPERATORS.filter((op) =>
      ["equals", "gt", "lt", "gte", "lte"].includes(op.value)
    );
  }
  if (field === "itemEstoqueId") {
    return OPERATORS.filter((op) =>
      ["equals", "gt", "lt", "gte", "lte"].includes(op.value)
    );
  }
  return OPERATORS.filter((op) =>
    ["contains", "equals", "startsWith", "endsWith"].includes(op.value)
  );
};

export default function AdvancedFilters({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const addFilter = () => {
    const newFilter: FilterRule = {
      id: Date.now().toString(),
      field: "nomeComercial",
      operator: "contains",
      value: "",
    };
    onFiltersChange([...filters, newFilter]);
  };

  const updateFilter = (id: string, updates: Partial<FilterRule>) => {
    const updatedFilters = filters.map((filter) =>
      filter.id === id ? { ...filter, ...updates } : filter
    );
    onFiltersChange(updatedFilters);
  };

  const removeFilter = (id: string) => {
    const updatedFilters = filters.filter((filter) => filter.id !== id);
    onFiltersChange(updatedFilters);
  };

  const hasActiveFilters = filters.some((filter) => filter.value.trim() !== "");

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`relative ${
            hasActiveFilters ? "border-blue-500 bg-blue-50" : ""
          }`}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtros Avançados
          {hasActiveFilters && (
            <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {filters.filter((f) => f.value.trim() !== "").length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Filtros Avançados</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={addFilter}
              className="text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>

          {filters.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              Nenhum filtro adicionado.
              <br />
              Clique em "Adicionar" para começar.
            </div>
          )}

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {filters.map((filter, index) => (
              <div key={filter.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">
                    Filtro {index + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFilter(filter.id)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    {/* Campo */}
                    <Select
                      value={filter.field}
                      onValueChange={(value) =>
                        updateFilter(filter.id, {
                          field: value,
                          operator:
                            getAvailableOperators(value)[0]?.value ||
                            "contains",
                        })
                      }
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Selecione o campo" />
                      </SelectTrigger>
                      <SelectContent>
                        {FILTER_FIELDS.map((field) => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Operador */}
                    <Select
                      value={filter.operator}
                      onValueChange={(value) =>
                        updateFilter(filter.id, { operator: value })
                      }
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Operador" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableOperators(filter.field).map((operator) => (
                          <SelectItem
                            key={operator.value}
                            value={operator.value}
                          >
                            {operator.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Valor */}
                  <Input
                    type={
                      filter.field === "quantidade"
                        ? "number"
                        : filter.field === "dataValidade"
                        ? "date"
                        : filter.field === "itemEstoqueId"
                        ? "number"
                        : "text"
                    }
                    placeholder="Digite o valor..."
                    value={filter.value}
                    onChange={(e) =>
                      updateFilter(filter.id, { value: e.target.value })
                    }
                    className="text-xs"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              disabled={!hasActiveFilters}
            >
              Limpar Todos
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Fechar
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onApplyFilters();
                  setIsOpen(false);
                }}
                className="bg-[#3FAFC3] hover:bg-cyan-700"
              >
                Aplicar
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
