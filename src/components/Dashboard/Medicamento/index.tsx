"use client";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from "@/components/ui/select";

import { useEffect, useState } from "react";
import { medicacaoStep1Schema, medicacaoStep2Schema, medicacaoSchema } from "@/utils/validations/ZodSchema";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
// import { ConfirmationModal } from "@/components/Dashboard/modal/confirmationModal";
import { api } from "@/services/api/api";
import ENDPOINTS from "@/services/endpoints";
import { toast } from "sonner";

interface Medicamento {
    id: number;
    nomeComercial: string;
    principioAtivo: string;
    apresentacao: string;
    codigoBarras: string;
    laboratorio: string;
    precoMaximo: number;
    statusProduto: string;
}
interface VisualizarMedicamentoProps {
    medicamento?: Medicamento; 
}

export default function VisualizarMedicamento({ medicamento: propMedicamento }: VisualizarMedicamentoProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [medicamento, setMedicamento] = useState<Medicamento | null>(
        propMedicamento ? { ...propMedicamento } : null
    );
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Medicamento | null>(
        propMedicamento ? { ...propMedicamento } : null
    );
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [stepError, setStepError] = useState<string | null>(null);
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        if (!propMedicamento) {
            const medParam = searchParams.get("medicamento");
            if (medParam) {
                try {
                    const parsedMed = JSON.parse(decodeURIComponent(medParam));
                    setMedicamento({ ...parsedMed });
                    setFormData({ ...parsedMed });
                } catch (error) {
                    console.error("Erro ao parsear medicamento:", error);
                }
            }
        }
    }, [searchParams, propMedicamento]);

    if (!medicamento || !formData) {
        return <div className="flex justify-center items-center h-96">Carregando...</div>;
    }

    const handleInputChange = async (field: keyof Medicamento, value: string) => {
        setFormData((prev) => prev ? { ...prev, [field]: value } : prev);

        if (field === "nomeComercial" && value.trim() !== "" && isEditing) {
            try {
                const { data } = await api.get<Medicamento[]>(
                    `${ENDPOINTS.MEDICAMENTOS.CRUD}/pesquisar/principioAtivoOrNomeComercial/${encodeURIComponent(value)}`
                );

            } catch (error) {
            }
        }
    };

    const handleSave = async () => {
        if (!formData) return;
        setTouched(true);
        const dataToSend = {
            ...formData,
            precoMaximo: typeof formData.precoMaximo === 'string'
                    ? Number(String(formData.precoMaximo).replace(/\./g, '').replace(',', '.'))
                    : typeof formData.precoMaximo === 'number'
                        ? formData.precoMaximo
                        : 0
        };
        const result = medicacaoSchema.safeParse(dataToSend);
        if (!result.success) {
            setStepError("Preencha todos os campos obrigatórios corretamente para salvar.");
            return;
        }
        try {
            await api.put(`${ENDPOINTS.MEDICAMENTOS.CRUD}/${formData.id}`, dataToSend);
            toast.success("Medicamento atualizado com sucesso!");
            setIsEditing(false);
            setMedicamento({ ...formData, precoMaximo: dataToSend.precoMaximo });
        } catch (error) {
            console.error(error);
            toast.error("Erro ao atualizar medicamento.");
        } finally {
            setModalOpen(false);
        }
    };

    const handleDelete = async () => {
        if (!medicamento) return;
        try {
            await api.delete(`${ENDPOINTS.MEDICAMENTOS.CRUD}/${medicamento.id}`);
            setDeleteModalOpen(false);
            setTimeout(() => {
                toast.success("Medicamento excluído com sucesso!");
            }, 300);
            router.push("/dashboard-funcionario/lista-medicamentos");
        } catch (error) {
            toast.error("Erro ao excluir medicamento.");
            setDeleteModalOpen(false);
        }
    };

    const handleBack = () => {
        router.back();
    };


    return (
        <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#3FAFC3]">Visualização - Medicamento</h1>
                    <p className="text-gray-500 text-sm">{isEditing ? `Editando informações` : "Campos bloqueados para visualização."}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleBack}>
                        Voltar
                    </Button>
                    {!isEditing ? (
                        <>
                            <Button className="bg-[#3FAFC3] hover:bg-[#2e8a9c] text-white" onClick={() => { setIsEditing(true); setStepError(null); }}>
                                Editar
                            </Button>
                            <Button variant="destructive" onClick={() => setDeleteModalOpen(true)} title="Excluir">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => { setIsEditing(false); setStepError(null); }}>
                                Cancelar
                            </Button>
                            <Button className="bg-[#3FAFC3] hover:bg-[#2e8a9c] text-white" onClick={() => setModalOpen(true)}>
                                Salvar
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {stepError && (
                <div className="text-red-500 text-center font-medium mt-2">{stepError}</div>
            )}

            <section className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Nome Comercial" value={formData.nomeComercial} editable={isEditing} onChange={(v) => handleInputChange("nomeComercial", v)} showError={touched && (!formData.nomeComercial || String(formData.nomeComercial).trim() === "")} />
                    <Field label="Princípio Ativo" value={formData.principioAtivo} editable={isEditing} onChange={(v) => handleInputChange("principioAtivo", v)} showError={touched && (!formData.principioAtivo || String(formData.principioAtivo).trim() === "")} />
                    <Field label="Apresentação" value={formData.apresentacao} editable={isEditing} onChange={(v) => handleInputChange("apresentacao", v)} showError={touched && (!formData.apresentacao || String(formData.apresentacao).trim() === "")} />
                    <Field label="Código de Barras" value={formData.codigoBarras} editable={isEditing} onChange={(v) => handleInputChange("codigoBarras", v)} showError={touched && (!formData.codigoBarras || String(formData.codigoBarras).trim() === "")} />
                    <Field label="Laboratório" value={formData.laboratorio} editable={isEditing} onChange={(v) => handleInputChange("laboratorio", v)} showError={touched && (!formData.laboratorio || String(formData.laboratorio).trim() === "")} />
                    <Field 
                        label="Preço Máximo" 
                        value={formData.precoMaximo ? formatCurrencyInput(formData.precoMaximo) : ""} 
                        editable={isEditing} 
                        onChange={(v) => handleInputChange("precoMaximo", maskCurrencyInput(v))} 
                        showError={touched && (!formData.precoMaximo || String(formData.precoMaximo).trim() === "")} 
                    />
                    {/* Status do Produto com Select */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700">Status do Produto</label>
                        {isEditing ? (
                            <Select onValueChange={value => handleInputChange("statusProduto", value)} value={formData.statusProduto || ""}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione o status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SEM_STATUS">Sem status</SelectItem>
                                    <SelectItem value="BIOLOGICO">Biológico</SelectItem>
                                    <SelectItem value="ESPECIFICO">Específico</SelectItem>
                                    <SelectItem value="FITOTERAPICO">Fitoterápico</SelectItem>
                                    <SelectItem value="GENERICO">Genérico</SelectItem>
                                    <SelectItem value="NOVO">Novo</SelectItem>
                                    <SelectItem value="PRODUTO_TERAPIA_AVANCADA">Produto de Terapia Avançada</SelectItem>
                                    <SelectItem value="RADIOFARMACO">Radiofármaco</SelectItem>
                                    <SelectItem value="SIMILAR">Similar</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <Input value={formData.statusProduto} readOnly className="bg-gray-100 cursor-not-allowed" />
                        )}
                        {touched && (!formData.statusProduto || String(formData.statusProduto).trim() === "") && (
                            <p className="text-red-500 text-sm mt-1">Campo obrigatório</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Modal de Confirmação de Edição */}
            <CustomConfirmationModal
                open={modalOpen}
                title="Deseja realmente salvar as alterações?"
                onConfirm={handleSave}
                onCancel={() => setModalOpen(false)}
            />
            {/* Modal de Confirmação de Exclusão */}
            <CustomConfirmationModal
                open={deleteModalOpen}
                title="Deseja realmente excluir este medicamento?"
                description="Esta ação não poderá ser desfeita."
                onConfirm={handleDelete}
                onCancel={() => setDeleteModalOpen(false)}
                confirmText="Excluir"
                confirmColor="destructive"
            />
        </div>
    );
}

import React from "react";

type ButtonVariant = "default" | "link" | "destructive" | "outline" | "secondary" | "ghost";
interface CustomConfirmationModalProps {
  open: boolean;
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  confirmColor?: ButtonVariant;
}

function CustomConfirmationModal(props: CustomConfirmationModalProps) {
  if (!props.open) {
    return null;
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-2">{props.title}</h2>
        {props.description && <p className="mb-4 text-gray-600">{props.description}</p>}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={props.onCancel}>Cancelar</Button>
          <Button variant={props.confirmColor ?? "default"} onClick={props.onConfirm}>
            {props.confirmText || "Confirmar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function maskCurrencyInput(value: number | string): string {
    let val = String(value ?? "").replace(/\D/g, "");
    if (!val) return "";
    while (val.length < 3) val = "0" + val;
    let masked = val.replace(/(\d+)(\d{2})$/, "$1,$2");
    masked = masked.replace(/^(0+)(\d)/, "$2");
    masked = masked.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return masked;
}

function formatCurrencyInput(value: number | string): string {
    const num = typeof value === "string" ? parseFloat(value.replace(/\./g, '').replace(',', '.')) : value;    if (typeof num !== "number" || isNaN(num)) return "";
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function Field({ label, value, editable, onChange, showError }: { label: string; value: string; editable: boolean; onChange?: (value: string) => void; showError?: boolean }) {
    return (
        <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">{label}</label>
            <Input
                value={value}
                readOnly={!editable}
                onChange={editable && onChange ? (e) => onChange(e.target.value) : undefined}
                className={editable ? "" : "bg-gray-100 cursor-not-allowed"}
            />
            {showError && (
                <span className="text-red-500 text-xs mt-1">Campo obrigatório</span>
            )}
        </div>
    );
}
