'use client';

import { ReactNode, useEffect } from "react";
import { AppSidebar } from "@/components/Dashboard/sidebar";
import { DashNavbar } from "../dashNavbar";
import { SidebarItem } from "@/utils/types/SidebarItem";
import { toast, Toaster } from "sonner";
import { useAuthCheck } from "@/hooks/useAuthCheck";


interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  Icon: React.ElementType;
  menuPrincipalItems: SidebarItem[];
  configuracaoItems: SidebarItem[];
}

export default function DashboardLayout({
  children,
  title,
  Icon,
  menuPrincipalItems,
  configuracaoItems,
}: DashboardLayoutProps) {

  const { isAuthenticated, isChecking } = useAuthCheck();

  useEffect(() => {
    if (!isChecking && !isAuthenticated) {
      toast.error("Usuário não autenticado. Redirecionando para o login...");
    }
  }, [isAuthenticated, isChecking]);

  // Mostrar loading enquanto verifica autenticação
  if (isChecking) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#3FAFC3] mb-4"></div>
        <p className="text-gray-600 text-lg">Verificando autenticação...</p>
        <Toaster position="top-center" richColors />
      </div>
    );
  }

  // Se não autenticado, mostrar mensagem de redirecionamento
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-red-500 mb-4"></div>
        <p className="text-red-600 text-lg font-medium">Redirecionando para login...</p>
        <p className="text-gray-500 text-sm mt-2">Usuário não autenticado</p>
        <Toaster position="top-center" richColors />
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <div className="w-[12%] md:w-[8%] lg:w-[14%] xl:w-[12%] border-r-1">
        <AppSidebar
            menuPrincipalItems={menuPrincipalItems}
            configuracaoItems={configuracaoItems}
          />
      </div>

      <div className="w-[88%] md:w-[92%] lg:w-[86%] xl:w-[88%] flex flex-col">
        <div>
          <DashNavbar Icon={Icon} title={title} />
        </div>
        <div>
          <main className="flex-1 overflow-y-auto p-4">{children}</main>
          <Toaster position="top-center" richColors /> 
        </div>
      </div>
    </div>
  );
}

