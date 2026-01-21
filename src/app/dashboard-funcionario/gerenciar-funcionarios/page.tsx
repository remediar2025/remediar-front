"use client"

import { Plus, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from "@/components/Dashboard/layouts/dashboardLayout"
import { ConfiguracaoItems, menuPrincipalItems } from "@/utils/constants"
import TabelaFuncionarios from "@/components/Funcionario/TabelaFuncionarios"
import FormularioNovoFuncionario from "@/components/Funcionario/FormularioNovoFuncionario"
import { FormProvider } from "react-hook-form"
import { useFuncionario } from "@/hooks/useFuncionario"

export default function GerenciarFuncionario() {
  const {
    employees,
    isAdding,
    errorMessage,
    form,
    handleAdd,
    handleCancelAdd,
    handleSave,
    handleDelete
  } = useFuncionario()

  return (
    <DashboardLayout
      title="Funcionários"
      Icon={() => <Settings />}
      menuPrincipalItems={menuPrincipalItems}
      configuracaoItems={ConfiguracaoItems}
    >
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto py-6 px-4 md:px-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Gerenciar Funcionários</h1>
            <Button onClick={handleAdd} className="bg-[#3FAFC3] hover:bg-[#3FAFC3]/90">
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Funcionário
            </Button>
          </div>

          {isAdding && (
            <FormProvider {...form}>
              <FormularioNovoFuncionario
                onCancel={handleCancelAdd}
                onSave={handleSave}
                errorMessage={errorMessage}
              />
            </FormProvider>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Lista de Funcionários</CardTitle>
            </CardHeader>
            <CardContent>
              <TabelaFuncionarios
                employees={employees}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
