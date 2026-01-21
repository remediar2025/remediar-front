"use client";

import { Suspense } from "react";
import DashboardLayout from "@/components/Dashboard/layouts/dashboardLayout";
import VisualizarEstoque from "@/components/Dashboard/Medicamento/ViewEstoque";
import { ConfiguracaoItems, menuPrincipalItems } from "@/utils/constants";
import { Boxes } from "lucide-react";

export default function ViewEstoque(){
    return(
        <DashboardLayout
            title="Item Estoque"
            Icon={() => <Boxes />}
            menuPrincipalItems={menuPrincipalItems}
            configuracaoItems={ConfiguracaoItems}
        >
            <Suspense fallback={<div>Carregando estoque...</div>}>
                <VisualizarEstoque />
            </Suspense>
        </DashboardLayout>
    );
}
