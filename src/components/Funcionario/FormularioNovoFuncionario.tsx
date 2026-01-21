"use client"

import { Save, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Controller, useFormContext } from "react-hook-form"
import { cpfMask, phoneMask, dateMask, formatCEP } from "@/utils/masks/masks"
import { z } from "zod"
import { funcionarioSchema } from "@/utils/validations/ZodSchema"
import axios from "axios"
import { useState } from "react"

type FormData = z.infer<typeof funcionarioSchema>

interface Props {
  onCancel: () => void
  onSave: (data: FormData) => void
  errorMessage?: string
}

const FormularioNovoFuncionario: React.FC<Props> = ({ onCancel, onSave, errorMessage }) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext<FormData>()
  const [enderecoBloqueado, setEnderecoBloqueado] = useState(false)

const cep = watch("endereco.cep")

const buscarCep = async () => {
  const cepSemMascara = cep?.replace(/\D/g, "")
  if (!cepSemMascara || cepSemMascara.length !== 8) {
    alert("Digite um CEP válido com 8 dígitos.")
    return
  }

  try {
    const response = await axios.get(`https://viacep.com.br/ws/${cepSemMascara}/json/`)
    const data = response.data

    if (data.erro) {
      alert("CEP não encontrado.")
      return
    }

    setValue("endereco.rua", data.logradouro)
    setValue("endereco.bairro", data.bairro)
    setValue("endereco.cidade", data.localidade)
    setValue("endereco.estado", data.uf)

    setEnderecoBloqueado(true)
  } catch (error) {
    alert("Erro ao buscar CEP.")
  }
}

  return (
    <form onSubmit={handleSubmit(onSave)}>
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-md font-medium">Adicionar Novo Funcionário</CardTitle>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={onCancel} type="button">
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
            <Button type="submit" variant="default" size="sm" className="bg-[#3FAFC3] hover:bg-[#3FAFC3]/90">
              <Save className="h-4 w-4 mr-1" />
              Salvar
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nome</label>
              <Input {...register("nome")} placeholder="Nome completo" />
              {errors.nome && <p className="text-sm text-red-500">{errors.nome.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Gênero</label>
              <select {...register("genero")} className="w-full h-10 border rounded px-3">
                <option value="">Selecione</option>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMININO">Feminino</option>
                <option value="OUTRO">Outro</option>
              </select>
              {errors.genero && <p className="text-sm text-red-500">{errors.genero.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">CPF</label>
              <Controller
                name="cpf"
                control={control}
                render={({ field }) => (
                  <Input {...field} value={cpfMask(field.value)} placeholder="000.000.000-00" />
                )}
              />
              {errors.cpf && <p className="text-sm text-red-500">{errors.cpf.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Telefone</label>
              <Controller
                name="telefone"
                control={control}
                render={({ field }) => (
                  <Input {...field} value={phoneMask(field.value)} placeholder="(00) 00000-0000" />
                )}
              />
              {errors.telefone && <p className="text-sm text-red-500">{errors.telefone.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Data de Nascimento</label>
              <Controller
                name="dataNascimento"
                control={control}
                render={({ field }) => (
                  <Input {...field} value={dateMask(field.value)} placeholder="DD/MM/AAAA" />
                )}
              />
              {errors.dataNascimento && <p className="text-sm text-red-500">{errors.dataNascimento.message}</p>}
            </div>
          </div>

          <h2 className="text-lg font-semibold mt-6">Endereço</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
                <label className="text-sm font-medium">CEP</label>
                <div className="flex gap-2">
                <Controller
                    name="endereco.cep"
                    control={control}
                    render={({ field }) => (
                    <Input {...field} value={formatCEP(field.value)} placeholder="00000-000" />
                    )}
                />
                <Button type="button" onClick={buscarCep} className="bg-[#3FAFC3]">
                    <Search className="h-4 w-4" />
                </Button>
                </div>
                {errors.endereco?.cep && <p className="text-sm text-red-500">{errors.endereco.cep.message}</p>}
            </div>

            <div>
                <label className="text-sm font-medium">Rua</label>
                <Input {...register("endereco.rua")} readOnly={enderecoBloqueado} />
                {errors.endereco?.rua && <p className="text-sm text-red-500">{errors.endereco.rua.message}</p>}
            </div>
            <div>
                <label className="text-sm font-medium">Número</label>
                <Input {...register("endereco.numero")} />
                {errors.endereco?.numero && <p className="text-sm text-red-500">{errors.endereco.numero.message}</p>}
            </div>
            <div>
                <label className="text-sm font-medium">Complemento</label>
                <Input {...register("endereco.complemento")} />
            </div>
            <div>
                <label className="text-sm font-medium">Bairro</label>
                <Input {...register("endereco.bairro")} readOnly={enderecoBloqueado} />
                {errors.endereco?.bairro && <p className="text-sm text-red-500">{errors.endereco.bairro.message}</p>}
            </div>
            <div>
                <label className="text-sm font-medium">Cidade</label>
                <Input {...register("endereco.cidade")} readOnly={enderecoBloqueado} />
                {errors.endereco?.cidade && <p className="text-sm text-red-500">{errors.endereco.cidade.message}</p>}
            </div>
            <div>
                <label className="text-sm font-medium">Estado</label>
                <Input {...register("endereco.estado")} readOnly={enderecoBloqueado} maxLength={2} />
                {errors.endereco?.estado && <p className="text-sm text-red-500">{errors.endereco.estado.message}</p>}
            </div>
            </div>

          <h2 className="text-lg font-semibold mt-6">Acesso</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Login (Email)</label>
              <Input {...register("usuario.login")} />
              {errors.usuario?.login && <p className="text-sm text-red-500">{errors.usuario.login.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Senha</label>
              <Input type="password" {...register("usuario.password")} />
              {errors.usuario?.password && <p className="text-sm text-red-500">{errors.usuario.password.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Confirmar Senha</label>
              <Input type="password" {...register("confirmarSenha")} />
              {errors.confirmarSenha && <p className="text-sm text-red-500">{errors.confirmarSenha.message}</p>}
            </div>
          </div>

          {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
        </CardContent>
      </Card>
    </form>
  )
}

export default FormularioNovoFuncionario
