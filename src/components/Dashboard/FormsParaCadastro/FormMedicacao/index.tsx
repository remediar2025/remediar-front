import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { medicacaoSchema } from "@/utils/validations/ZodSchema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { PresentationIcon, BriefcaseMedical, Package, Pill, HouseIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { api } from "@/services/api/api";
import ENDPOINTS from "@/services/endpoints";

type MedicacaoData = z.infer<typeof medicacaoSchema>;

interface FormMedicacaoProps {
  closeModal: () => void;
}

export default function FormMedicacao({ closeModal }: FormMedicacaoProps) {
    // Removido step, não é mais necessário
    const [loading, setLoading] = useState<boolean>(false);

    const methods = useForm<MedicacaoData>({
        resolver: zodResolver(medicacaoSchema),
        mode: "onTouched",
        shouldUnregister: true,
    });
    

    async function onSubmit(data: MedicacaoData) {
        setLoading(true);
        try {
            await api.post(ENDPOINTS.MEDICAMENTOS.CRUD, data);
            toast.success("Medicamento cadastrado com sucesso!");
            closeModal();
        } catch (error) {
            console.error("Erro ao cadastrar medicamento:", error);
            alert("Erro ao cadastrar medicamento. Tente novamente.");
            closeModal();
        } finally {
            setLoading(false);
        }
    }


    return (
        <FormProvider {...methods}>
            <form
                onSubmit={methods.handleSubmit(onSubmit)}
                className="flex flex-col gap-5 max-w-md mx-auto bg-white p-6 rounded-lg shadow-md"
                autoComplete="off"
            >
                <div className="flex flex-row gap-3 justify-center border-b">
                    <Pill />
                    <h2 className="text-xl font-semibold text-center mb-4">Cadastrar Medicamento</h2>
                </div>

                {/* Todos os campos juntos */}
                <div className="space-y-4">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Pill className="w-4 h-4" /> Nome Comercial</label>
                        <Input type="text" placeholder="Nome Comercial" {...methods.register("nomeComercial")} className="mt-1" />
                        {methods.formState.errors.nomeComercial && <p className="text-red-500 text-sm mt-1">{methods.formState.errors.nomeComercial.message}</p>}
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><BriefcaseMedical className="w-4 h-4" /> Princípio Ativo</label>
                        <Input type="text" placeholder="Princípio Ativo" {...methods.register("principioAtivo")} className="mt-1" />
                        {methods.formState.errors.principioAtivo && <p className="text-red-500 text-sm mt-1">{methods.formState.errors.principioAtivo.message}</p>}
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><PresentationIcon className="w-4 h-4" /> Apresentação</label>
                        <Input type="text" placeholder="Apresentação" {...methods.register("apresentacao")} className="mt-1" />
                        {methods.formState.errors.apresentacao && <p className="text-red-500 text-sm mt-1">{methods.formState.errors.apresentacao.message}</p>}
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Package className="w-4 h-4" /> Código de Barras</label>
                        <Input type="text" placeholder="Código de Barras" {...methods.register("codigoBarras")} className="mt-1" />
                        {methods.formState.errors.codigoBarras && <p className="text-red-500 text-sm mt-1">{methods.formState.errors.codigoBarras.message}</p>}
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><HouseIcon className="w-4 h-4" /> Laboratório</label>
                        <Input type="text" placeholder="Laboratório" {...methods.register("laboratorio")} className="mt-1" />
                        {methods.formState.errors.laboratorio && <p className="text-red-500 text-sm mt-1">{methods.formState.errors.laboratorio.message}</p>}
                    </div>
                    <div className="flex flex-col">
                        <Controller
                            name="precoMaximo"
                            control={methods.control}
                            defaultValue={0}
                            render={({ field }) => {
                                let displayValue = "";
                                if (typeof field.value === "number" && !isNaN(field.value)) {
                                    displayValue = field.value.toFixed(2).replace('.', ',');
                                } else if (typeof field.value === "string" && field.value !== "") {
                                    displayValue = String(field.value).replace('.', ',');
                                }
                                return (
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Preço Máximo</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                                            <Input
                                                type="text"
                                                inputMode="decimal"
                                                placeholder="0,00"
                                                className="pl-10 mt-1"
                                                value={displayValue}
                                                onChange={e => {
                                                    let val = e.target.value.replace(/\D/g, "");
                                                    val = val.replace(/^0+(?!$)/, "");
                                                    while (val.length < 3) val = "0" + val;
                                                    let masked = val.replace(/(\d+)(\d{2})$/, "$1,$2");
                                                    masked = masked.replace(/^(0+)(\d)/, "$2");
                                                    field.onChange(masked.replace(",", "."));
                                                }}
                                                maxLength={15}
                                            />
                                        </div>
                                        {methods.formState.errors.precoMaximo && (
                                            <p className="text-red-500 text-sm mt-1">{methods.formState.errors.precoMaximo.message}</p>
                                        )}
                                    </div>
                                );
                            }}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700">Status do Produto</label>
                        <Select onValueChange={value => methods.setValue("statusProduto", value)} value={methods.watch("statusProduto") || ""}>
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
                        {methods.formState.errors.statusProduto && <p className="text-red-500 text-sm mt-1">{methods.formState.errors.statusProduto.message}</p>}
                    </div>
                </div>

                <div className="flex justify-between mt-6">
                    <Button variant="outline" type="button" onClick={closeModal}>
                        Cancelar
                    </Button>
                    <Button className="bg-[#3FAFC3] text-white" type="submit" disabled={loading}>
                        {loading ? "Cadastrando..." : "Concluir"}
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}