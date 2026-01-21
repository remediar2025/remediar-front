"use client";
import { ChangeEvent } from "react";
import { Filter, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
interface SearchBarEstoqueProps {
  setFiltro: (value: string) => void;
  setEstoqueSelecionado: (estoqueId: string) => void;
  estoques: { id: number; nome: string }[];
  onOpenModal: () => void;
  estoqueSelecionado?: string;
}
export function SearchBarEstoque({
  setFiltro,
  setEstoqueSelecionado,
  estoques,
  onOpenModal,
  estoqueSelecionado,
}: SearchBarEstoqueProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFiltro(e.target.value);
  };

  return (
    <div className="w-full flex justify-between items-center gap-2">

      {/* Selecionar Estoque */}
      <div className="hidden lg:flex flex-row gap-3 justify-center items-center">
        <span>Estoque:</span>
        <Select
          value={estoqueSelecionado}
          onValueChange={setEstoqueSelecionado}
        >
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Selecionar Estoque" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {estoques.map((estoque) => (
                <SelectItem key={estoque.id} value={String(estoque.id)}>
                  {estoque.nome}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {/* Botão Novo Estoque */}
      <div>
        <Button
          className="flex items-center gap-2 bg-[#3FAFC3] text-white hover:bg-[#3498a9] transition-all"
          onClick={onOpenModal} // Modificado aqui
        >
          Novo Item no Estoque
          <Plus size={18} />
        </Button>
      </div>
      {/* Filtros Mobile */}
      <div className="block lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter size={18} /> Filtros
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 mt-4">
              <span className="text-sm font-semibold">Selecionar Estoque:</span>
              <Select value={estoqueSelecionado} onValueChange={setEstoqueSelecionado}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecionar Estoque" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {estoques.map((estoque) => (
                      <SelectItem key={estoque.id} value={String(estoque.id)}>
                        {estoque.nome}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
