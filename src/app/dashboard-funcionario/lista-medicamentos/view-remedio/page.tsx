'use client';

import { Suspense } from "react";
import DashboardLayout from "@/components/Dashboard/layouts/dashboardLayout";
import { Boxes } from "lucide-react";
import { ConfiguracaoItems, menuPrincipalItems } from "@/utils/constants";
import ClientRemedioView from "./ClientRemedioView";

export default function ViewRemedio() {
  return (
    <DashboardLayout
      title="Gerência de Medicamentos"
      Icon={() => <Boxes />}
      menuPrincipalItems={menuPrincipalItems}
      configuracaoItems={ConfiguracaoItems}
    >
      <Suspense fallback={<div className="text-center py-10">Carregando medicamento...</div>}>
        <ClientRemedioView />
      </Suspense>
    </DashboardLayout>
  );
}
