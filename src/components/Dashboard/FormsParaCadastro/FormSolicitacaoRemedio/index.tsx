"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { solicitacaoSchema } from "@/utils/validations/ZodSchema";
import { Button } from "@/components/ui/button";
import FormInput from "../FormInput";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { api } from "@/services/api/api";
import ENDPOINTS from "@/services/endpoints";
import moment from "moment";
import {
  CalendarIcon,
  ClipboardList,
  Package,
  Hash,
  User,
  Stethoscope,
  BadgePlus,
  Fingerprint,
  Phone,
  Image,
} from "lucide-react";
import { cpfMask, phoneMask } from "@/utils/masks/masks";
import { useState, useEffect, useRef, ChangeEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMedicamentos } from "@/hooks/useMedicamento";

export default function SolicitacaoForm({ closeModal }: { closeModal: () => void }) {
  const { user } = useAuth();

  const methods = useForm({
    resolver: zodResolver(solicitacaoSchema),
    mode: "onSubmit",
    defaultValues: {
      item: { nomeComercialOrPrincipioAtivo: "", quantidade: 1 },
      modoEntrega: "RETIRADA",
      usuarioId: user?.id ? Number(user.id) : 0,
      prescricaoMedica: {
        dataEmissao: "",
        dispensada: false,
        usoContinuo: false,
        imageUrl: "",
        nomeMedico: "",
        crmMedico: "",
        idadePaciente: 0,
        generoPaciente: "MASCULINO",
        cpfPaciente: "",
        contato: "",
      },
    },
  });

  const {
    register,
    setValue,
    watch,
    formState: { errors },
    handleSubmit,
  } = methods;

  const [usoContinuo, setUsoContinuo] = useState(false);
  const [dispensada, setDispensada] = useState(false);
  const [imagemBase64, setImagemBase64] = useState<string>("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  type Medicamento = {
    id: number;
    nomeComercial: string;
    principioAtivo: string;
  };

  const [inputValue, setInputValue] = useState("");
  const {
    loading,
    results,
    showDropdown,
    setShowDropdown,
  }: {
    loading: boolean;
    results: Medicamento[];
    showDropdown: boolean;
    setShowDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  } = useMedicamentos(inputValue);

  useEffect(() => {
    if (user?.id) {
      setValue("usuarioId", Number(user.id));
    }
  }, [user, setValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        event.target instanceof Node &&
        !wrapperRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagemBase64(reader.result as string);
      setValue("prescricaoMedica.imageUrl", reader.result as string); // Salva no form
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([campo, erro]: [string, any]) => {
        if (erro?.message) {
          toast.error(erro.message);
        } else if (typeof erro === "object") {
          Object.entries(erro).forEach(([subcampo, suberro]: [string, any]) => {
            if (suberro?.message) {
              toast.error(suberro.message);
            }
          });
        }
      });
    }
  }, [errors]);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(async (data) => {
          try {
            const cleanNumber = (val: string) => val.replace(/\D/g, "");
            const formatDate = (val: string) => moment(val).format("DD/MM/YYYY");

            const payload = {
              item: {
                nomeComercialOrPrincipioAtivo: data.item.nomeComercialOrPrincipioAtivo,
                quantidade: data.item.quantidade,
              },
              modoEntrega: data.modoEntrega,
              usuarioId: data.usuarioId,
              prescricaoMedica: {
                ...data.prescricaoMedica,
                nomePaciente: user?.nome || "",
                cpfPaciente: cleanNumber(data.prescricaoMedica.cpfPaciente),
                contato: cleanNumber(data.prescricaoMedica.contato),
                dataEmissao: formatDate(data.prescricaoMedica.dataEmissao),
                usoContinuo,
                dispensada,
              },
            };

            await api.post(ENDPOINTS.PEDIDOS.CRUD, payload);
            toast.success("Solicitação cadastrada com sucesso!");
            closeModal();
          } catch (error: any) {
            if (
              error?.response?.status === 422 &&
              Array.isArray(error?.response?.data?.errors)
            ) {
              error.response.data.errors.forEach((err: any) => {
                toast.error(err.message || "Erro de validação.");
              });
            } else if (
              error?.response?.status === 422 &&
              error?.response?.data?.message?.toLowerCase().includes("image")
            ) {
              toast.error("A imagem enviada está muito grande. O tamanho máximo permitido é 2MB.");
            } else {
              toast.error("Erro ao enviar solicitação.");
            }
            console.error(error);
          }
        })}
        className="max-w-4xl w-full"
      >
        <ScrollArea className="h-[80vh] p-2 md:p-4 flex flex-col gap-5">
          <h2 className="text-xl font-semibold border-b pb-2">Nova Solicitação</h2>

          {/* INFORMAÇÕES PESSOAIS */}
          <h3 className="text-lg font-semibold mt-4">Informações Pessoais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold">Nome do Usuário</label>
              <div className="border border-gray-300 rounded-md px-3 py-2 h-10 flex items-center bg-gray-100 text-sm text-gray-700">
                {user?.nome || "Desconhecido"}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold">CPF</label>
              <FormInput
                icon={Fingerprint}
                type="text"
                placeholder="123.456.789-00"
                mask={cpfMask}
                {...register("prescricaoMedica.cpfPaciente")}
                error={errors.prescricaoMedica?.cpfPaciente?.message}
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Telefone</label>
              <FormInput
                icon={Phone}
                type="text"
                placeholder="(00) 91234-5678"
                mask={phoneMask}
                {...register("prescricaoMedica.contato")}
                error={errors.prescricaoMedica?.contato?.message}
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Idade do Paciente</label>
              <FormInput
                icon={Hash}
                type="number"
                placeholder="Ex: 30"
                {...register("prescricaoMedica.idadePaciente", { valueAsNumber: true })}
                error={errors.prescricaoMedica?.idadePaciente?.message}
              />
            </div>
          </div>

          {/* INFORMAÇÕES DO REMÉDIO */}
          <h3 className="text-lg font-semibold mt-8">Informações do Remédio</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative" ref={wrapperRef}>
              <label className="text-sm font-semibold">Medicamento</label>
              <input
                type="text"
                placeholder="Ex: Baycuten N"
                className={`w-full border border-gray-300 rounded-md px-3 py-2 ${
                  errors.item?.nomeComercialOrPrincipioAtivo ? "border-red-500" : ""
                }`}
                value={inputValue}
                autoComplete="off"
                {...register("item.nomeComercialOrPrincipioAtivo")}
                onChange={(e) => {
                  setInputValue(e.target.value);
                }}
                onFocus={() => {
                  if (inputValue.length >= 3 && results.length > 0) setShowDropdown(true);
                }}
              />

              {loading && <p className="text-sm text-gray-500 mt-1">Buscando medicamentos...</p>}
              {errors.item?.nomeComercialOrPrincipioAtivo && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.item?.nomeComercialOrPrincipioAtivo.message}
                </p>
              )}

              {showDropdown && results.length > 0 && (
                <ul className="absolute z-10 bg-white border border-gray-200 w-full mt-1 rounded shadow max-h-60 overflow-y-auto">
                  {results.map((item) => (
                    <li
                      key={item.id}
                      onClick={() => {
                        setInputValue(item.nomeComercial);
                        setValue("item.nomeComercialOrPrincipioAtivo", item.nomeComercial);
                        setShowDropdown(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      <span className="font-medium">{item.nomeComercial}</span>{" "}
                      <span className="text-gray-500">({item.principioAtivo})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold">Quantidade</label>
              <FormInput
                icon={ClipboardList}
                type="number"
                placeholder="Ex: 2"
                {...register("item.quantidade", { valueAsNumber: true })}
                error={errors.item?.quantidade?.message}
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Modo de Entrega</label>
              <Select
                onValueChange={(value) => setValue("modoEntrega", value as "RETIRADA" | "ENVIO")}
                value={watch("modoEntrega")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o modo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RETIRADA">Retirada</SelectItem>
                  <SelectItem value="ENVIO">Envio</SelectItem>
                </SelectContent>
              </Select>
              {errors.modoEntrega && (
                <p className="text-red-500">{errors.modoEntrega.message}</p>
              )}
            </div>
          </div>

          {/* INFORMAÇÕES DO MÉDICO */}
          <h3 className="text-lg font-semibold mt-8">Informações do Médico</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
          <label className="text-sm font-semibold">Data de emissao (Receita)</label>
              <FormInput
                icon={CalendarIcon}
                type="date"
                placeholder="Data de Emissão"
                {...register("prescricaoMedica.dataEmissao")}
                error={errors.prescricaoMedica?.dataEmissao?.message}
              />
            </div>
            <div>
          <label className="text-sm font-semibold">Nome do médico</label>
            <FormInput
              icon={Stethoscope}
              type="text"
              placeholder="João"
              {...register("prescricaoMedica.nomeMedico")}
              error={errors.prescricaoMedica?.nomeMedico?.message}
            />
            </div>
            <div>
              <label className="text-sm font-semibold">CRM do Médico</label>
              <FormInput
                icon={BadgePlus}
                type="text"
                placeholder="CRM Médico"
                {...register("prescricaoMedica.crmMedico")}
                error={errors.prescricaoMedica?.crmMedico?.message}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Receita (imagem)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              {imagemBase64 && (
                <img src={imagemBase64} alt="Pré-visualização" className="mt-2 max-h-32" />
              )}
            </div>
          </div>

          <div className="flex gap-6 mt-6">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={usoContinuo}
                onChange={(e) => setUsoContinuo(e.target.checked)}
                className="accent-[#3FAFC3]"
              />
              Uso contínuo
            </label>

            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={dispensada}
                onChange={(e) => setDispensada(e.target.checked)}
                className="accent-[#3FAFC3]"
              />
              Dispensada
            </label>
          </div>
        </ScrollArea>

        <div className="flex justify-between px-6 pb-6 pt-3">
          <Button variant="outline" onClick={closeModal}>
            Cancelar
          </Button>
          <Button className="bg-[#3FAFC3] text-white" type="submit">
            Confirmar
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
