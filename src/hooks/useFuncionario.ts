import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { FuncionarioResponse } from "@/types/funcionario"
import { funcionarioSchema } from "@/utils/validations/ZodSchema"
import { api } from "@/services/api/api"
import ENDPOINTS from "@/services/endpoints"

type FormData = z.infer<typeof funcionarioSchema>

export function useFuncionario() {
  const [employees, setEmployees] = useState<FuncionarioResponse[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const form = useForm<FormData>({
    resolver: zodResolver(funcionarioSchema),
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
  })

  const { reset } = form

  const fetchFuncionarios = async () => {
    try {
      const res = await api.get<FuncionarioResponse[]>(ENDPOINTS.FUNCIONARIO.CRUD)
      setEmployees(res.data)
    } catch (error) {
      console.error("Erro ao buscar funcionários", error)
    }
  }

  useEffect(() => {
    fetchFuncionarios()
  }, [])

  const handleAdd = () => {
    setIsAdding(true)
    reset()
    setErrorMessage("")
  }

  const handleCancelAdd = () => {
    setIsAdding(false)
    setErrorMessage("")
    reset()
  }

  const handleSave = async (data: FormData) => {
    try {
      await api.post(ENDPOINTS.FUNCIONARIO.CRUD, data)
      fetchFuncionarios()
      setIsAdding(false)
    } catch (error: any) {
      console.error("Erro ao salvar funcionário", error)
      setErrorMessage("Erro ao salvar funcionário")
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`${ENDPOINTS.FUNCIONARIO.CRUD}/${id}`)
      fetchFuncionarios()
    } catch (error) {
      console.error("Erro ao excluir funcionário", error)
    }
  }

  return {
    employees,
    isAdding,
    errorMessage,
    form,
    handleAdd,
    handleCancelAdd,
    handleSave,
    handleDelete,
  }
}
