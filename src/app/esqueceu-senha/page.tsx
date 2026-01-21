"use client";

import type React from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { api } from "@/services/api/api";
import ENDPOINTS from "@/services/endpoints";
import Image from "next/image";
import Background from "@/assets/Rectangle 1.png";
import Logo from "@/assets/Ativo 12.png";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [login, setLogin] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSucesso("");
    setLoading(true);

    try {
      const response = await api.post(`${ENDPOINTS.FORGOT_PASS.CRUD}`, {
        login,
      });

      toast.success(
        "E-mail enviado com sucesso! Verifique sua caixa de entrada."
      );
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Erro ao enviar e-mail";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="flex flex-1 items-center justify-center bg-[#1EAED3] relative">
        <Image
          src={Background || "/placeholder.svg"}
          alt="Background"
          layout="fill"
          objectFit="cover"
          className="absolute"
        />
        <div className="p-8 flex flex-col items-center relative z-10">
          <Image
            src={Logo || "/placeholder.svg"}
            alt="Logo"
            width={400}
            height={133}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-12">
        <div className="flex flex-1 flex-col items-center justify-center max-w-[520px] mx-auto w-full">
          <form onSubmit={handleSubmit} className="w-full space-y-10">
            <div className="space-y-3">
              <h1 className="text-[2.5rem] font-bold tracking-tight">
                Esqueceu a senha?
              </h1>
              <p className="text-xl text-muted-foreground">
                Redefina a senha em duas etapas
              </p>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-400"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                  <Input
                    type="email"
                    placeholder="exemplo@email.com"
                    className="pl-10 h-12 text-sm border rounded-md w-full"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                  />
                </div>
                <div className="text-base text-gray-500 pl-3">E-mail</div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base bg-[#19b5de] hover:bg-[#17a3c9] text-white font-medium rounded-full"
                disabled={loading}
              >
                {loading ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
