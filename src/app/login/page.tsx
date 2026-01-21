"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

import Logo from "@/assets/Ativo 12.png";
import Background from "@/assets/Rectangle 1.png";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    try {
      await login(email, senha);
    } catch (err: any) {
      setErro(err.message || "Erro ao fazer login");
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="flex flex-1 items-center justify-center bg-[#1EAED3] relative">
        <Image
          src={Background}
          alt="Background"
          layout="fill"
          objectFit="cover"
          className="absolute"
        />
        <div className="p-8 flex flex-col items-center relative z-10">
          <Image
            src={Logo}
            alt="Remediar Logo"
            width={400}
            height={133}
            className="mb-6"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-12">
        <div className="flex flex-1 flex-col items-center justify-center max-w-[520px] mx-auto w-full">
          <form onSubmit={handleSubmit} className="w-full space-y-10">
            <div className="space-y-2 text-center">
              <h1 className="text-[2.5rem] font-bold tracking-tight">
                Realize seu Login
              </h1>
              <p className="text-xl text-muted-foreground">
                Entre com seu email e senha
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="26"
                      height="26"
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
                    className="pl-14 h-16 text-lg border-2 rounded-md w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="text-base text-gray-500 pl-3">Email</div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-400"
                    >
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <Input
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="********"
                    className="pl-14 h-16 text-lg border-2 rounded-md w-full"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4"
                  >
                    {mostrarSenha ? (
                      <EyeOff className="h-6 w-6 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-6 w-6 text-gray-400" />
                    )}
                  </button>
                </div>
                <div className="text-base text-gray-500 pl-3">Senha</div>
              </div>

              {erro && (
                <p className="text-red-500 text-sm text-center">{erro}</p>
              )}

              <div className="text-right mb-4">
                <Link
                  href="esqueceu-senha/#"
                  className="text-base text-gray-500 hover:text-gray-700"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-16 text-xl bg-[#1EAED3] hover:bg-[#1a9cbf] text-white font-medium rounded-full"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>

              <div className="flex gap-4 w-full justify-center">
                <Link href="/" className="w-1/2">
                  <Button
                    variant="outline"
                    className="w-full bg-white text-gray-700 border border-gray-300 font-medium text-base p-6 rounded-2xl shadow-sm transition-all duration-200 hover:bg-gray-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                  >
                    Tela Inicial
                  </Button>
                </Link>

                <Link href="/register/" className="w-1/2">
                  <Button
                    variant="outline"
                    className="w-full bg-[#1EAED3] text-white font-medium text-base p-6 rounded-2xl shadow-md transition-all duration-200 hover:bg-black hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1EAED3] hover:text-white"
                  >
                    Cadastre-se
                  </Button>
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
