"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { funcionarioSchema } from "@/utils/validations/ZodSchema";
import { Button } from "../../../ui/button";
import { User, CalendarIcon, CreditCard, Mail, Phone, User2, MapPin, Landmark, Building, Home, ClipboardList, Lock, LockKeyhole } from "lucide-react";
import { cpfMask, phoneMask, formatCEP } from "@/utils/masks/masks";
import FormInput from "../FormInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/services/api/api";
import ENDPOINTS from "@/services/endpoints";
import { toast } from "sonner";

interface FuncionarioFormProps {
  closeModal: () => void;
}

export default function FuncionarioForm({ closeModal }: FuncionarioFormProps) {
  const [step, setStep] = useState<number>(1);

  const methods = useForm({
    resolver: zodResolver(funcionarioSchema),
    mode: "onBlur",
    defaultValues: {
      nome: "",
      cpf: "",
      telefone: "",
      genero: "",
      dataNascimento: "",
      endereco: {
        rua: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
        cep: "",
      },
      usuario: {
        login: "",
        password: "",
        role: "ADMIN",
      },
      confirmarSenha: "",
    },
  });

  const { register, setValue, watch, formState: { errors } } = methods;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(async (data) => {
            try {
              // Utilitários simples
              const cleanNumber = (val: string) => val.replace(/\D/g, '');
              const formatDate = (val: string) => {
                const [year, month, day] = val.split("-");
                return `${day}/${month}/${year}`; // dd/MM/yyyy
              };
          
              const payload = {
                nome: data.nome,
                cpf: cleanNumber(data.cpf),
                telefone: cleanNumber(data.telefone),
                genero: data.genero,
                dataNascimento: formatDate(data.dataNascimento),
                endereco: {
                  rua: data.endereco.rua,
                  numero: data.endereco.numero,
                  complemento: data.endereco.complemento,
                  bairro: data.endereco.bairro,
                  cidade: data.endereco.cidade,
                  estado: data.endereco.estado,
                  cep: cleanNumber(data.endereco.cep),
                },
                usuario: {
                  login: data.usuario.login,
                  password: data.usuario.password,
                  role: "ADMIN", // ou "FUNCIONARIO", dependendo do contexto
                },
              };
          
              await api.post(ENDPOINTS.FUNCIONARIO.CRUD, payload);
              toast.success("Funcionário cadastrado com sucesso!");
              closeModal();
            } catch (error: any) {
              const msg = error?.response?.data?.message || "Erro ao cadastrar funcionário.";
              toast.error(msg);
              console.error("Erro detalhado:", error?.response?.data || error);
            }
          })}
        className="flex flex-col gap-5 max-w-md mx-auto bg-white p-6 rounded-lg shadow-md"
        >
        <div className="flex flex-row gap-3 justify-center border-b">
          <User />
          <h2 className="text-xl font-semibold text-center mb-4">Cadastrar Funcionário</h2>
        </div>

        <div className="space-y-4">
          {step === 1 && (
            <>
              <FormInput icon={User} type="text" placeholder="Nome completo" {...register("nome")} error={errors.nome?.message} />
              <FormInput icon={CreditCard} type="text" placeholder="CPF" {...register("cpf")} mask={cpfMask} error={errors.cpf?.message} />
              <FormInput icon={Phone} type="text" placeholder="Telefone" {...register("telefone")} mask={phoneMask} error={errors.telefone?.message} />

              <div className="flex flex-row gap-3">
                <div className="flex flex-row items-center border border-[#D1D1D1] rounded-md w-[200px]">
                  <div className="ml-2 mr-2"><User2 /></div>
                  <div className="border-l w-full">
                    <Select onValueChange={(value) => setValue("genero", value)} value={watch("genero")}>
                      <SelectTrigger className="w-full border-none focus:ring-0 shadow-none">
                        <SelectValue placeholder="Gênero" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Masculino">Masculino</SelectItem>
                        <SelectItem value="Feminino">Feminino</SelectItem>
                        <SelectItem value="Outro">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {errors.genero && <p className="text-red-500">{errors.genero.message}</p>}
                <FormInput icon={CalendarIcon} type="date" placeholder="Data de Nascimento" {...register("dataNascimento")} error={errors.dataNascimento?.message} />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <FormInput icon={Home} type="text" placeholder="Rua" {...register("endereco.rua")} error={errors.endereco?.rua?.message} />
              <FormInput icon={ClipboardList} type="text" placeholder="Número" {...register("endereco.numero")} error={errors.endereco?.numero?.message} />
              <FormInput icon={ClipboardList} type="text" placeholder="Complemento" {...register("endereco.complemento")} error={errors.endereco?.complemento?.message} />
              <FormInput icon={Building} type="text" placeholder="Bairro" {...register("endereco.bairro")} error={errors.endereco?.bairro?.message} />
              <FormInput icon={Building} type="text" placeholder="Cidade" {...register("endereco.cidade")} error={errors.endereco?.cidade?.message} />
              <FormInput icon={Landmark} type="text" placeholder="Estado" {...register("endereco.estado")} error={errors.endereco?.estado?.message} />
              <FormInput icon={MapPin} type="text" placeholder="CEP" {...register("endereco.cep")} mask={formatCEP} error={errors.endereco?.cep?.message} />
            </>
          )}

          {step === 3 && (
            <>
              <FormInput icon={Mail} type="email" placeholder="E-mail (login)" {...register("usuario.login")} error={errors.usuario?.login?.message} />
              <FormInput icon={Lock} type="password" placeholder="Senha" {...register("usuario.password")} error={errors.usuario?.password?.message} />
              <FormInput icon={LockKeyhole} type="password" placeholder="Confirmar Senha" {...register("confirmarSenha")} error={errors.confirmarSenha?.message} />
            </>
          )}
        </div>

        <div className="flex justify-between mt-6">
          {step === 1 ? (
            <Button variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
          ) : (
            <Button variant="outline" type="button" onClick={() => setStep(step - 1)}>
              Voltar
            </Button>
          )}

          {step < 3 ? (
            <Button className="bg-[#3FAFC3] text-white" type="button" onClick={() => setStep(step + 1)}>
              Avançar
            </Button>
          ) : (
            <Button className="bg-[#3FAFC3] text-white" type="submit">
              Confirmar
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
