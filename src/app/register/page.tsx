"use client";

import { useState, useEffect, ChangeEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  User,
  Phone,
  Mail,
  Home,
  MapPin,
  Building2,
  Map,
  CircleDot,
  Users,
  Wallet,
  ChevronRight,
  FileText,
  Calendar,
  BookOpen,
  Users2,
} from "lucide-react";

import Logo from "@/assets/Ativo 12.png";
import Background from "@/assets/Rectangle 1.png";
import { registerUser } from "@/api/auth";
import type { DadosCadastro } from "@/types/auth";

import { escolaridadeOptions, generoOptions } from "../../services/enums/enum";
import InputWithIcon from "@/components/Dashboard/inputs/InputWithIcon";
import SelectWithIcon from "@/components/Dashboard/inputs/SelectWithIcon";
import PasswordInput from "@/components/Dashboard/inputs/PasswordInput";
import { toast, Toaster } from "sonner";

/**
 * Converte uma data ISO (yyyy-MM-dd) em dd/MM/yyyy – formato que o backend espera.
 * Se a string não corresponder ao padrão ISO, devolve-a inalterada.
 */
function toBackendDate(iso: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  }
  return iso;
}

async function verificarDocumentoExistente(documento: string): Promise<boolean> {
  const documentoDigits = documento.replace(/\D/g, "");
  if (documentoDigits.length !== 11 && documentoDigits.length !== 14) {
    console.log("Documento incompleto, não verifica.");
    return false;
  }
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/usuarios/existsByDocument/${documentoDigits}`
    );
    const exists = await response.text();
    console.log("Retorno da API:", exists);
    return exists === "true";
  } catch (error) {
    console.error("Erro ao verificar documento:", error);
    return false;
  }
}

async function verificarEmailExistente(email: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/usuarios/existsByEmail/${email}`
    );
    const exists = await response.text();
    console.log("Retorno da API:", exists);
    return exists === "true";
  } catch (error) {
    console.error("Erro ao verificar email:", error);
    return false;
  }
}

function buildPayload(cadastro: DadosCadastro, isPF: boolean) {
  const documentoDigits = cadastro.documento.replace(/\D/g, "");
  if (isPF) {
    // PF → usa o wrapper "usuario"
    return {
      usuario: {
        nome: cadastro.nome,
        documento: documentoDigits,
        telefone: cadastro.telefone,
        endereco: {
          rua: cadastro.endereco.rua,
          numero: cadastro.endereco.numero,
          complemento: cadastro.endereco.complemento,
          bairro: cadastro.endereco.bairro,
          cidade: cadastro.endereco.cidade,
          estado: cadastro.endereco.estado,
          cep: cadastro.endereco.cep,
        },
        user: {
          login: cadastro.user.login,
          password: cadastro.user.password,
          role: cadastro.user.role,
        },
      },
      dataNascimento: toBackendDate(cadastro.dataNascimento),
      escolaridade: cadastro.escolaridade,
      qtdPessoasCasa: cadastro.qtdPessoasCasa,
      rendaFamiliar: cadastro.rendaFamiliar,
      genero: cadastro.genero,
    };
  } else {
    // PJ → campos achatados
    return {
      nome: cadastro.nome,
      documento: documentoDigits,
      telefone: cadastro.telefone,
      endereco: {
        rua: cadastro.endereco.rua,
        numero: cadastro.endereco.numero,
        complemento: cadastro.endereco.complemento,
        bairro: cadastro.endereco.bairro,
        cidade: cadastro.endereco.cidade,
        estado: cadastro.endereco.estado,
        cep: cadastro.endereco.cep,
      },
      user: {
        login: cadastro.user.login,
        password: cadastro.user.password,
        role: cadastro.user.role,
      },
    };
  }
}

function validaSenhaForte(senha: string): {
  valida: boolean;
  mensagem: string;
} {
  if (senha.length < 8) {
    return {
      valida: false,
      mensagem: "A senha deve ter pelo menos 8 caracteres.",
    };
  }

  const temMaiuscula = /[A-Z]/.test(senha);
  const temMinuscula = /[a-z]/.test(senha);
  const temNumero = /\d/.test(senha);
  const temEspecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(senha);

  if (!temMaiuscula) {
    return {
      valida: false,
      mensagem: "A senha deve conter pelo menos uma letra maiúscula.",
    };
  }
  if (!temMinuscula) {
    return {
      valida: false,
      mensagem: "A senha deve conter pelo menos uma letra minúscula.",
    };
  }
  if (!temNumero) {
    return {
      valida: false,
      mensagem: "A senha deve conter pelo menos um número.",
    };
  }
  if (!temEspecial) {
    return {
      valida: false,
      mensagem: "A senha deve conter pelo menos um caractere especial.",
    };
  }

  return { valida: true, mensagem: "" };
}

export default function MultiStepRegister() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [isPF, setIsPF] = useState(true); // Flag para identificar se é PF ou PJ
  const [camposComErro, setCamposComErro] = useState<string[]>([]);

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const [dadosCadastro, setDadosCadastro] = useState<DadosCadastro>({
    nome: "",
    documento: "", // Agora é um campo genérico para CPF ou CNPJ
    telefone: "",
    dataNascimento: "",
    escolaridade: "",
    genero: "",
    qtdPessoasCasa: 0,
    rendaFamiliar: 0,
    endereco: {
      cep: "",
      estado: "",
      cidade: "",
      bairro: "",
      rua: "",
      numero: "",
      complemento: "",
    },
    user: {
      login: "",
      password: "",
      role: "USER",
    },
  });

  const [confirmarEmail, setConfirmarEmail] = useState("");

  // Detecta PF/PJ pelo tamanho do documento
  useEffect(() => {
    const documentoDigits = dadosCadastro.documento.replace(/\D/g, "");
    if (documentoDigits.length >= 11) setIsPF(documentoDigits.length <= 11);
  }, [dadosCadastro.documento]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const cep = dadosCadastro.endereco.cep.replace(/\D/g, "");
      if (cep.length === 8) {
        buscarEnderecoPorCep(cep).then((endereco) => {
          if (endereco) {
            setDadosCadastro((prev) => ({
              ...prev,
              endereco: {
                ...prev.endereco,
                rua: endereco.rua || "",
                bairro: endereco.bairro || "",
                cidade: endereco.cidade || "",
                estado: endereco.estado || "",
              },
            }));
            setErro("");
          } else {
            setErro("CEP não encontrado.");
          }
        });
      }
    }, 300);

    return () => clearTimeout(timeout); // Limpa timeout se o usuário continuar digitando
  }, [dadosCadastro.endereco.cep]);

  const nextStep = async () => {
    if (step === 1) {
      const camposObrigatorios = [];

      if (!dadosCadastro.nome) camposObrigatorios.push("nome");
      if (!dadosCadastro.documento) camposObrigatorios.push("documento");
      if (!dadosCadastro.telefone) camposObrigatorios.push("telefone");
      if (!dadosCadastro.user.login) camposObrigatorios.push("email");
      if (!confirmarEmail) camposObrigatorios.push("confirmarEmail");

      if (camposObrigatorios.length > 0) {
        setCamposComErro(camposObrigatorios);
        setErro("Preencha todos os campos obrigatórios.");
        return;
      }

      if (dadosCadastro.nome.length > 500) {
        setCamposComErro(["nome"]);
        setErro("O nome deve ter no máximo 500 caracteres.");
        return;
      }

      const documentoDigits = dadosCadastro.documento.replace(/\D/g, "");
      if (documentoDigits.length === 11) {
        if (!validaCPF(documentoDigits)) {
          setCamposComErro(["documento"]);
          setErro("CPF inválido.");
          return;
        }
      } else if (documentoDigits.length === 14) {
        if (!validaCNPJ(documentoDigits)) {
          setCamposComErro(["documento"]);
          setErro("CNPJ inválido.");
          return;
        }
      } else {
        setCamposComErro(["documento"]);
        setErro("Documento deve conter 11 (CPF) ou 14 (CNPJ) dígitos.");
        return;
      }

      const documentoJaExiste = await verificarDocumentoExistente(dadosCadastro.documento);
      if (documentoJaExiste) {
        setCamposComErro(["documento"]);
        setErro("Já existe um usuário cadastrado com este documento.");
        toast.error("Já existe um usuário cadastrado com este documento.");
        return;
      }

      const telefoneDigits = dadosCadastro.telefone.replace(/\D/g, "");
      if (!/^(\d{2})(9\d{8})$/.test(telefoneDigits)) {
        setCamposComErro(["telefone"]);
        setErro(
          "Telefone inválido. Use um número de celular com DDD e nono dígito."
        );
        return;
      }

      const emailJaExiste = await verificarEmailExistente(dadosCadastro.user.login);
      if (emailJaExiste) {
        setCamposComErro(["email", "confirmarEmail"]);
        setErro("Já existe um usuário cadastrado com este email.");
        toast.error("Já existe um usuário cadastrado com este email.");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(dadosCadastro.user.login)) {
        setCamposComErro(["email"]);
        setErro("Email inválido.");
        return;
      }

      if (dadosCadastro.user.login !== confirmarEmail) {
        setCamposComErro(["email", "confirmarEmail"]);
        setErro("Os emails não coincidem.");
        return;
      }

      setCamposComErro([]);
      setErro("");
    } else if (step === 2) {
      const camposObrigatorios = [];

      if (!dadosCadastro.endereco.cep) camposObrigatorios.push("cep");
      if (!dadosCadastro.endereco.estado) camposObrigatorios.push("estado");
      if (!dadosCadastro.endereco.cidade) camposObrigatorios.push("cidade");
      if (!dadosCadastro.endereco.bairro) camposObrigatorios.push("bairro");
      if (!dadosCadastro.endereco.rua) camposObrigatorios.push("rua");
      if (!dadosCadastro.endereco.numero) camposObrigatorios.push("numero");

      if (camposObrigatorios.length > 0) {
        setCamposComErro(camposObrigatorios);
        setErro("Preencha todos os campos de endereço obrigatórios.");
        return;
      }

      setCamposComErro([]);
      setErro("");

      if (!isPF && step === 2) {
        setStep(4);
        return;
      }
    } else if (step === 3 && isPF) {
      const camposObrigatorios = [];

      if (!dadosCadastro.dataNascimento)
        camposObrigatorios.push("dataNascimento");
      if (!dadosCadastro.escolaridade) camposObrigatorios.push("escolaridade");
      if (!dadosCadastro.genero) camposObrigatorios.push("genero");
      if (dadosCadastro.qtdPessoasCasa <= 0)
        camposObrigatorios.push("qtdPessoasCasa");
      if (dadosCadastro.rendaFamiliar <= 0)
        camposObrigatorios.push("rendaFamiliar");

      if (dadosCadastro.qtdPessoasCasa > 30) {
        setCamposComErro(["qtdPessoasCasa"]);
        setErro("O número de moradores não pode ser maior que 30.");
        return;
      }

      if (dadosCadastro.rendaFamiliar > 1000000000) {
        setCamposComErro(["rendaFamiliar"]);
        setErro("A renda familiar não pode ser maior que R$ 1.000.000.000,00.");
        return;
      }

      if (camposObrigatorios.length > 0) {
        setCamposComErro(camposObrigatorios);
        setErro("Preencha todos os campos obrigatórios.");
        return;
      }

      setCamposComErro([]);
      setErro("");
    }

    setStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    if (step === 4 && !isPF) {
      // Se estiver no step 4 (senha) e for PJ, volta para o step 2 (endereço)
      setStep(2);
      return;
    }
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleRegister = async () => {
    setErro("");
    setCamposComErro([]);

    if (dadosCadastro.user.password !== confirmarSenha) {
      setCamposComErro(["senha", "confirmarSenha"]);
      setErro("As senhas não coincidem.");
      return;
    }

    const validacaoSenha = validaSenhaForte(dadosCadastro.user.password);
    if (!validacaoSenha.valida) {
      setCamposComErro(["senha"]);
      setErro(validacaoSenha.mensagem);
      return;
    }

    setCarregando(true);
    try {
      const payload = buildPayload(dadosCadastro, isPF);
      const resposta = await registerUser(payload, isPF);

      if (resposta && resposta.id) {
        // sucesso: redireciona para a página de login
        router.push(
          "/login/verificacao?email=" +
            encodeURIComponent(dadosCadastro.user.login)
        );
      } else {
        setErro("Não foi possível cadastrar. Tente novamente.");
      }
    } catch (err: any) {
      setErro(
        err.response?.data?.mensagem || "Erro ao cadastrar. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  };

  // Determina o número total de passos com base no tipo de usuário
  const totalSteps = isPF ? 4 : 3;

  // Ajusta o progresso visual com base no tipo de usuário
  const getProgressWidth = () => {
    if (isPF) {
      // Para PF: 4 passos
      return ["w-1/4", "w-2/4", "w-3/4", "w-full"][step - 1];
    } else {
      // Para PJ: 3 passos (pula o passo 3)
      if (step === 4) {
        return "w-full"; // No passo 4, mostra progresso completo
      }
      return ["w-1/3", "w-2/3", "w-full"][step - 1];
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="flex flex-1 items-center justify-center bg-[#1EAED3] relative">
        <Toaster position="top-right" richColors />
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

      <div className="flex flex-1 flex-col p-6 md:p-12">
        <div className="w-full max-w-[520px] mx-auto my-auto">
          <div className="space-y-2">
            <div className="flex justify-between mb-8">
              <h1 className="text-[2rem] font-bold tracking-tight w-64 mr-4">
                Cadastre-se
              </h1>

              <div className="mt-4 w-2/3 flex flex-col items-center items-end justify-center">
                <div className="h-2 w-full bg-gray-200 rounded-full">
                  <div
                    className={`h-2 bg-[#1EAED3] rounded-full ${getProgressWidth()}`}
                  ></div>
                </div>
                <div className="w-full text-right text-sm text-gray-500 mt-2">
                  {step}/{totalSteps}
                </div>
              </div>
            </div>

            {step === 1 && (
              <div className="space-y-2 md:space-y-4">
                <InputWithIcon
                  icon={<User />}
                  placeholder="Nome completo"
                  label="Nome completo"
                  value={dadosCadastro.nome}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setDadosCadastro({ ...dadosCadastro, nome: e.target.value })
                  }
                  required
                  fieldName="nome"
                  camposComErro={camposComErro}
                />
                <div className="flex space-x-2 space-y-0 w-full">
                  <div className="w-1/2">
                    <InputWithIcon
                      icon={<FileText />}
                      placeholder="CPF/CNPJ"
                      label={`Documento (${isPF ? "CPF" : "CNPJ"})`}
                      value={dadosCadastro.documento}
                      onChange={(e) =>
                        setDadosCadastro({
                          ...dadosCadastro,
                          documento: e.target.value,
                        })
                      }
                      onBlur={(e) => verificarDocumentoExistente(e.target.value)}
                      mask={isPF ? "999.999.999-99" : "99.999.999/9999-99"}
                      required
                      fieldName="documento"
                      camposComErro={camposComErro}
                    />
                  </div>
                  <div className="w-1/2">
                    <InputWithIcon
                      icon={<Phone />}
                      placeholder="Telefone"
                      label="Telefone"
                      value={dadosCadastro.telefone}
                      onChange={(e) =>
                        setDadosCadastro({
                          ...dadosCadastro,
                          telefone: e.target.value,
                        })
                      }
                      mask="(99) 99999-9999"
                      required
                      fieldName="telefone"
                      camposComErro={camposComErro}
                    />
                  </div>
                </div>

                <InputWithIcon
                  icon={<Mail />}
                  placeholder="Email"
                  label="Email"
                  value={dadosCadastro.user.login}
                  onChange={(e) =>
                    setDadosCadastro({
                      ...dadosCadastro,
                      user: { ...dadosCadastro.user, login: e.target.value },
                    })
                  }
                  onBlur={(e) => verificarEmailExistente(e.target.value)}
                  type="email"
                  required
                  fieldName="email"
                  camposComErro={camposComErro}
                />
                <InputWithIcon
                  icon={<Mail />}
                  placeholder="Confirme o email"
                  label="Confirmar Email"
                  value={confirmarEmail}
                  onChange={(e) => setConfirmarEmail(e.target.value)}
                  type="email"
                  required
                  fieldName="confirmarEmail"
                  camposComErro={camposComErro}
                />                
                
                {erro && <p className="text-red-500 text-sm">{erro}</p>}
                
                <div className="flex space-x-4">
                  <Button
                    onClick={() => router.push("/login")}
                    variant="outline"
                    className="w-1/3 h-16 border-2 border-[#1EAED3] text-[#1EAED3] rounded-full"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={nextStep}
                    className="w-2/3 h-16 bg-[#1EAED3] text-white rounded-full"
                  >
                    Próximo <ChevronRight className="ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-2 md:space-y-4">
                <div className="md:flex md:space-x-2 space-y-4 md:space-y-0 w-full">
                  <div className="lg:w-1/3">
                    <InputWithIcon
                      icon={<Home />}
                      placeholder="CEP"
                      label="CEP"
                      value={dadosCadastro.endereco.cep}
                      onChange={(e) =>
                        setDadosCadastro({
                          ...dadosCadastro,
                          endereco: {
                            ...dadosCadastro.endereco,
                            cep: e.target.value,
                          },
                        })
                      }
                      mask="99999-999"
                      fieldName="cep"
                      camposComErro={camposComErro}
                    />
                  </div>
                  <div className="md:flex space-x-2 space-y-4 md:space-y-0 md:w-2/3">
                    <div className="md:w-1/2">
                      <SelectWithIcon
                        icon={<MapPin />}
                        label="Estado"
                        options={["SP", "MG", "RJ"]}
                        value={dadosCadastro.endereco.estado}
                        onChange={(valor) =>
                          setDadosCadastro({
                            ...dadosCadastro,
                            endereco: {
                              ...dadosCadastro.endereco,
                              estado: valor,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="md:w-1/2">
                      <InputWithIcon
                        icon={<CircleDot />}
                        placeholder="Número"
                        label="Número"
                        value={dadosCadastro.endereco.numero}
                        onChange={(e) =>
                          setDadosCadastro({
                            ...dadosCadastro,
                            endereco: {
                              ...dadosCadastro.endereco,
                              numero: e.target.value,
                            },
                          })
                        }
                        mask="99999"
                        fieldName="numero"
                        camposComErro={camposComErro}
                      />
                    </div>
                  </div>
                </div>

                <div className="md:flex space-x-2 space-y-4 md:space-y-0 w-full">
                  <div className="md:w-1/2">
                    <InputWithIcon
                      icon={<Map />}
                      placeholder="Rua"
                      label="Rua"
                      value={dadosCadastro.endereco.rua}
                      onChange={(e) =>
                        setDadosCadastro({
                          ...dadosCadastro,
                          endereco: {
                            ...dadosCadastro.endereco,
                            rua: e.target.value,
                          },
                        })
                      }
                      fieldName="rua"
                      camposComErro={camposComErro}
                    />
                  </div>
                  <div className="md:w-1/2">
                    <InputWithIcon
                      icon={<Home />}
                      placeholder="Complemento"
                      label="Complemento"
                      value={dadosCadastro.endereco.complemento ?? ""}
                      onChange={(e) =>
                        setDadosCadastro({
                          ...dadosCadastro,
                          endereco: {
                            ...dadosCadastro.endereco,
                            complemento: e.target.value,
                          },
                        })
                      }
                      fieldName="complemento"
                      camposComErro={camposComErro}
                    />
                  </div>
                </div>

                <div className="md:flex space-x-2 space-y-4 md:space-y-0 w-full">
                  <div className="md:w-1/2">
                    <InputWithIcon
                      icon={<Building2 />}
                      placeholder="Cidade"
                      label="Cidade"
                      value={dadosCadastro.endereco.cidade}
                      onChange={(e) =>
                        setDadosCadastro({
                          ...dadosCadastro,
                          endereco: {
                            ...dadosCadastro.endereco,
                            cidade: e.target.value,
                          },
                        })
                      }
                      fieldName="cidade"
                      camposComErro={camposComErro}
                    />
                  </div>

                  <div className="md:w-1/2">
                    <InputWithIcon
                      icon={<CircleDot />}
                      placeholder="Bairro"
                      label="Bairro"
                      value={dadosCadastro.endereco.bairro}
                      onChange={(e) =>
                        setDadosCadastro({
                          ...dadosCadastro,
                          endereco: {
                            ...dadosCadastro.endereco,
                            bairro: e.target.value,
                          },
                        })
                      }
                      fieldName="bairro"
                      camposComErro={camposComErro}
                    />
                  </div>
                </div>

                {erro && <p className="text-red-500 text-sm">{erro}</p>}

                <div className="flex space-x-4">
                  <Button
                    onClick={prevStep}
                    variant="outline"
                    className="w-1/3 h-16 border-2 border-[#1EAED3] text-[#1EAED3] rounded-full"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={nextStep}
                    className="w-2/3 h-16 bg-[#1EAED3] text-white rounded-full"
                  >
                    Próximo <ChevronRight className="ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && isPF && (
              <div className="space-y-5">
                <div className="md:flex space-x-2 space-y-4 md:space-y-0">
                  <div className="md:w-1/2">
                    <InputWithIcon
                      icon={<Calendar />}
                      type="date"
                      placeholder="Data de nascimento"
                      label="Data de nascimento"
                      value={dadosCadastro.dataNascimento}
                      onChange={(e) =>
                        setDadosCadastro({
                          ...dadosCadastro,
                          dataNascimento: e.target.value,
                        })
                      }
                      required
                      fieldName="dataNascimento"
                      camposComErro={camposComErro}
                    />
                  </div>

                  <div className="md:w-1/2">
                    <SelectWithIcon
                      icon={<Users2 />}
                      label="Gênero"
                      options={generoOptions}
                      value={dadosCadastro.genero}
                      onChange={(valor) =>
                        setDadosCadastro({ ...dadosCadastro, genero: valor })
                      }
                    />
                  </div>
                </div>

                <div className="md:flex space-x-2 space-y-4 md:space-y-0">
                  <div className="md:w-1/2">
                    <InputWithIcon
                      icon={<Users />}
                      placeholder="Nº de Pessoas"
                      label="Número de moradores na residência"
                      type="number"
                      value={dadosCadastro.qtdPessoasCasa.toString()}
                      onChange={(e) =>
                        setDadosCadastro({
                          ...dadosCadastro,
                          qtdPessoasCasa: Number(e.target.value),
                        })
                      }
                      required
                      fieldName="qtdPessoasCasa"
                      camposComErro={camposComErro}
                    />
                  </div>

                  <div className="md:w-1/2">
                    <InputWithIcon
                      icon={<Wallet />}
                      placeholder="Renda Familiar"
                      label="Renda Familiar"
                      type="number"
                      value={dadosCadastro.rendaFamiliar.toString()}
                      onChange={(e) =>
                        setDadosCadastro({
                          ...dadosCadastro,
                          rendaFamiliar: Number(e.target.value),
                        })
                      }
                      required
                      fieldName="rendaFamiliar"
                      camposComErro={camposComErro}
                    />
                  </div>
                </div>

                <SelectWithIcon
                  icon={<BookOpen />}
                  label="Escolaridade"
                  options={escolaridadeOptions}
                  value={dadosCadastro.escolaridade}
                  onChange={(valor) =>
                    setDadosCadastro({ ...dadosCadastro, escolaridade: valor })
                  }
                />

                {erro && <p className="text-red-500 text-sm">{erro}</p>}

                <div className="flex space-x-4">
                  <Button
                    onClick={prevStep}
                    variant="outline"
                    className="w-1/3 h-16 border-2 border-[#1EAED3] text-[#1EAED3] rounded-full"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={nextStep}
                    className="w-2/3 h-16 bg-[#1EAED3] text-white rounded-full"
                  >
                    Próximo <ChevronRight className="ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <PasswordInput
                  placeholder="Senha"
                  label="Senha"
                  visible={showPassword}
                  toggle={() => setShowPassword(!showPassword)}
                  value={dadosCadastro.user.password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setDadosCadastro({
                      ...dadosCadastro,
                      user: { ...dadosCadastro.user, password: e.target.value },
                    })
                  }
                  fieldName="senha"
                  camposComErro={camposComErro}
                />
                <PasswordInput
                  placeholder="Confirmar senha"
                  label="Confirmar senha"
                  visible={showConfirmPassword}
                  toggle={() => setShowConfirmPassword(!showConfirmPassword)}
                  value={confirmarSenha}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setConfirmarSenha(e.target.value)
                  }
                  fieldName="confirmarSenha"
                  camposComErro={camposComErro}
                />
                {erro && <p className="text-red-500 text-sm">{erro}</p>}
                <div className="flex space-x-4">
                  <Button
                    onClick={prevStep}
                    variant="outline"
                    className="w-1/3 h-16 border-2 border-[#1EAED3] text-[#1EAED3] rounded-full"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={handleRegister}
                    disabled={carregando}
                    className="w-2/3 h-16 bg-[#1EAED3] text-white rounded-full"
                  >
                    {carregando ? "Cadastrando..." : "Cadastre-se"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function validaCPF(cpf: string) {
  cpf = cpf.replace(/[^\d]+/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number.parseInt(cpf.charAt(i)) * (10 - i);
  let resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== Number.parseInt(cpf.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++)
    soma += Number.parseInt(cpf.charAt(i)) * (11 - i);
  resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  return resto === Number.parseInt(cpf.charAt(10));
}

function validaCNPJ(cnpj: string) {
  cnpj = cnpj.replace(/[^\d]+/g, "");
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  const digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += Number.parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== Number.parseInt(digitos.charAt(0))) return false;

  tamanho += 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += Number.parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado === Number.parseInt(digitos.charAt(1));
}

async function buscarEnderecoPorCep(cep: string) {
  const cepLimpo = cep.replace(/\D/g, "");
  if (cepLimpo.length !== 8) return null;

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json`);
    const data = await resposta.json();
    if (data.erro) return null;

    return {
      rua: data.logradouro,
      bairro: data.bairro,
      cidade: data.localidade,
      estado: data.uf,
    };
  } catch (e) {
    return null;
  }
}
