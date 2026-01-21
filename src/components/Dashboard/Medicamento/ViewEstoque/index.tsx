"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MedicacaoData } from "@/utils/types/Medicacao";
import { toast } from "sonner";
import { api } from "@/services/api/api";
import { formatarDataParaBackend } from "@/utils/formatDate";
import { Edit, Save, X } from "lucide-react";

const formatarDataParaInput = (
  dataValidade: string | string[] | null | undefined
): string => {
  if (!dataValidade) return "";

  if (Array.isArray(dataValidade)) {
    const primeiraData = dataValidade[0];
    if (!primeiraData) return "";
    return primeiraData.split("/").reverse().join("-");
  }

  if (typeof dataValidade === "string") {
    return dataValidade.split("/").reverse().join("-");
  }

  return "";
};

export default function VisualizarEstoque() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [medicacao, setMedicacao] = useState<MedicacaoData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    quantidade: "",
    dataValidade: "",
  });

  const formatarDataParaExibicao = (
    dataValidade: string | string[] | null | undefined
  ): string => {
    if (!dataValidade) return "Não informado";

    if (Array.isArray(dataValidade)) {
      return dataValidade[0] || "Não informado";
    }

    if (typeof dataValidade === "string") {
      return dataValidade;
    }

    return "Não informado";
  };

  useEffect(() => {
    const medParam = searchParams.get("medicamento");
    if (medParam) {
      const parsedMed: MedicacaoData = JSON.parse(decodeURIComponent(medParam));
      setMedicacao(parsedMed);

      const dataFormatada = formatarDataParaInput(parsedMed.dataValidade);

      setFormData({
        quantidade: String(parsedMed.quantidade || ""),
        dataValidade: dataFormatada,
      });
    }
  }, [searchParams]);

  if (!medicacao) {
    return (
      <div className="flex justify-center items-center h-96">Carregando...</div>
    );
  }

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Resetar valores originais usando a função helper
    const dataFormatada = formatarDataParaInput(medicacao?.dataValidade);

    setFormData({
      quantidade: String(medicacao?.quantidade || ""),
      dataValidade: dataFormatada,
    });
  };

  const handleSave = async () => {
    if (!medicacao.itemEstoqueId) {
      toast.error("ID do item de estoque não encontrado");
      return;
    }

    if (!formData.quantidade || !formData.dataValidade) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);

    try {
      await api.put(`/itens-estoque/${medicacao.itemEstoqueId}`, {
        produtoId: medicacao.produtoId,
        quantidade: parseInt(formData.quantidade),
        dataValidade: formatarDataParaBackend(formData.dataValidade),
        estoqueId: (
          await api.get(`/estoque/findByItemEstoque/${medicacao.itemEstoqueId}`)
        ).data.id,
      });

      // Atualizar dados locais - corrigido para manter o tipo array
      setMedicacao((prev) => ({
        ...prev!,
        quantidade: parseInt(formData.quantidade),
        dataValidade: [formData.dataValidade.split("-").reverse().join("/")],
      }));

      setIsEditing(false);
      toast.success("Item do estoque atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      toast.error("Erro ao atualizar item do estoque");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#3FAFC3]">
            Detalhes do Medicamento
          </h1>
        </div>

        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleEdit}
                className="flex items-center gap-2"
              >
                <Edit size={16} />
                Editar
              </Button>
              <Button variant="outline" onClick={handleBack}>
                Voltar
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 bg-[#3FAFC3] hover:bg-cyan-700"
              >
                <Save size={16} />
                {loading ? "Salvando..." : "Salvar"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <X size={16} />
                Cancelar
              </Button>
            </>
          )}
        </div>
      </div>

      <section className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nome Comercial" value={medicacao.nomeComercial} />
          <Field label="Laboratório" value={medicacao.laboratorio} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Princípio Ativo" value={medicacao.principioAtivo} />
          <Field label="Apresentação" value={medicacao.apresentacao} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Código de Barras" value={medicacao.codigoBarras} />
          <Field
            label="Preço Máximo"
            value={
              medicacao.precoMaximo?.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              }) || "Não informado"
            }
          />
          <Field label="Status" value={medicacao.statusProduto} />
        </div>

        {medicacao.descricao && (
          <div className="grid grid-cols-1">
            <Field label="Descrição" value={medicacao.descricao} />
          </div>
        )}

        {/* Campos Editáveis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isEditing ? (
            <>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">
                  Quantidade *
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData.quantidade}
                  onChange={(e) =>
                    setFormData({ ...formData, quantidade: e.target.value })
                  }
                  className="border-[#3FAFC3] focus:ring-[#3FAFC3]"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">
                  Data de Validade *
                </label>
                <Input
                  type="date"
                  value={formData.dataValidade}
                  onChange={(e) =>
                    setFormData({ ...formData, dataValidade: e.target.value })
                  }
                  className="border-[#3FAFC3] focus:ring-[#3FAFC3]"
                  required
                />
              </div>
            </>
          ) : (
            <>
              <Field label="Quantidade" value={String(medicacao.quantidade)} />
              <Field
                label="Data de Validade"
                value={formatarDataParaExibicao(medicacao.dataValidade)}
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-600 mb-1">{label}</label>
      <Input
        value={value}
        readOnly
        className="bg-gray-100 cursor-not-allowed"
      />
    </div>
  );
}
