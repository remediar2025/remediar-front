"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/assets/LogoSecundaria.svg";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarItem {
  nome: string;
  url: string;
  icon: React.ElementType;
}

interface AppSidebarProps {
  menuPrincipalItems: SidebarItem[];
  configuracaoItems: SidebarItem[];
}


export function AppSidebar({ menuPrincipalItems, configuracaoItems }: AppSidebarProps) {
  const pathname = usePathname();

  const { user } = useAuth();

  let dashboardHref = "/";
  if (user?.role === "USER" || user?.role === "CLIENTE") {
    dashboardHref = "/dashboard-cliente";
  } else if (user?.role === "FUNCIONARIO" || user?.role === "ADMIN") {
    dashboardHref = "/dashboard-funcionario";
  }


  return (
    <aside className="w-full px-4 mt-4 text-sm">
      <Link
        href={dashboardHref}
        className="flex items-center justify-center gap-2 mb-8"
      >
          <div className="w-20 h-auto lg:w-32 justify-center items-center" >
            <Image
              src={Logo}
              alt="logo"
              width={128}
              height={128}
              className="object-contain w-full h-auto"
              priority
            />
          </div>
      </Link>

      <div className="flex flex-col gap-2">
        <span className="hidden lg:block text-gray-400 font-light my-4">
          Menu Principal
        </span>
        {menuPrincipalItems.map((item) => {
          const isActive = pathname === item.url;
          return (
            <Link
              href={item.url}
              key={item.nome}
              className={`flex items-center justify-center lg:justify-start gap-4 py-2 md:px-2 rounded-md transition-colors duration-200 ${
                isActive
                  ? "bg-[#3FAFC3] text-white"
                  : "text-gray-500 hover:bg-[#3FAFC3] hover:text-white"
              }`}
            >
              <item.icon
                size={20}
                className={`${isActive ? "text-white" : "text-gray-500 group-hover:text-white"}`}
              />
              <span className={`hidden lg:block`}>{item.nome}</span>
            </Link>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 mt-6">
        <span className="hidden lg:block text-gray-400 font-light my-4">
          Configurações
        </span>
        {configuracaoItems.map((item) => {
          const isActive = pathname === item.url;
          return (
            <Link
              href={item.url}
              key={item.nome}
              className={`flex items-center justify-center lg:justify-start gap-4 py-2 md:px-2 rounded-md transition-colors duration-200 ${
                isActive
                  ? "bg-[#3FAFC3] text-white"
                  : "text-gray-500 hover:bg-[#3FAFC3] hover:text-white"
              }`}
            >
              <item.icon
                size={20}
                className={`${isActive ? "text-white" : "text-gray-500 group-hover:text-white"}`}
              />
              <span className={`hidden lg:block`}>{item.nome}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
