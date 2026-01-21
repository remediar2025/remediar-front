"use client";

import { useFormContext } from "react-hook-form";
import FormInput from "../../FormInput";
import {
  CalendarIcon,
  CreditCard,
  Mail,
  Phone,
  User,
  User2,
} from "lucide-react";
import { cpfMask, dateMask, phoneMask } from "@/utils/masks/masks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function FormDadosPessoais() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-4">
      <FormInput
        icon={User}
        type="text"
        placeholder="Nome completo"
        {...register("nome")}
        error={errors.nome?.message as string | undefined}
      />
      <FormInput
        icon={CreditCard}
        type="text"
        placeholder="CPF"
        {...register("cpf")}
        mask={cpfMask}
        error={errors.cpf?.message as string | undefined}
      />
      <FormInput
        icon={Mail}
        type="email"
        placeholder="E-mail"
        {...register("email")}
        error={errors.email?.message as string | undefined}
      />
      <FormInput
        icon={Phone}
        type="text"
        placeholder="Telefone"
        {...register("telefone")}
        mask={phoneMask}
        error={errors.telefone?.message as string | undefined}
      />
      <div className="flex flex-row gap-3">
        <div className="flex flex-row items-center border border-[#D1D1D1] rounded-md w-[200px]">
          <div className="ml-2 mr-2">
            <User2 />
          </div>
          <div className="border-l w-full">
            <Select
              onValueChange={(value) => setValue("genero", value)}
              value={watch("genero")}
            >
              <SelectTrigger className="w-full border-none focus:ring-0 shadow-none">
                <SelectValue placeholder="Gênero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Masculino</SelectItem>
                <SelectItem value="F">Feminino</SelectItem>
                <SelectItem value="O">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {typeof errors.genero?.message === "string" && (
          <p className="text-red-500">{errors.genero.message}</p>
        )}
        <FormInput
          icon={CalendarIcon}
          type="date"
          placeholder="Data de Nascimento"
          {...register("dataNascimento")}
          error={typeof errors.dataNascimento?.message === "string" ? errors.dataNascimento.message : undefined}
        />
        {typeof errors.dataNascimento?.message === "string" && (
          <p className="text-red-500">{errors.dataNascimento.message}</p>
        )}
      </div>
    </div>
  );
}
