'use client';

import DashboardLayout from "@/components/Dashboard/layouts/dashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// no topo do seu componente
import { api } from '@/services/api/api';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { ConfiguracaoClienteItems, menuPrincipalClienteItems } from "@/utils/constants";
import { DollarSign, Plus, Wallet, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import {QRCodeCanvas} from 'qrcode.react';
import { v4 as uuidv4 } from 'uuid';
import axios from "axios";

type Doacao = {
  NomeDoador: string;
  Valor: number;
  Data_doacao: string;
};

type UserData = {
  usuario: {
    id: number;
    nome: string;
    documento: string;
    telefone: string;
    endereco: {
      rua: string;
      numero: string;
      complemento: string;
      bairro: string;
      cidade: string;
      estado: string;
      cep: string;
    };
    user: {
      login: string;
    };
  };
  // Campos adicionais para Pessoa Física
  genero?: string;
  dataNascimento?: string;
  escolaridade?: string;
  qtdPessoasCasa?: number;
  rendaFamiliar?: number;
};

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novaDoacaoValor, setNovaDoacaoValor] = useState("");
  const [doacoes, setDoacoes] = useState<Doacao[]>([]);
  const [showSuccessTooltip, setShowSuccessTooltip] = useState(false);
  const [successData, setSuccessData] = useState<{ valor: string; data: string }>({ valor: '', data: '' });
  const [currentStep, setCurrentStep] = useState<'form' | 'qr' | 'success'>('form');
  const [userData, setUserData] = useState<UserData | null>(null);

  // --- novos estados para o PIX ---
  const [pixEmv, setPixEmv] = useState<string | null>(null);
  const [isLoadingPix, setIsLoadingPix] = useState(false);

  useEffect(() => {
    // Buscar dados do usuário logado
    const fetchUserData = async () => {
      try {
        const response = await api.get('/usuarios/me');
        setUserData(response.data);
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    setDoacoes([
      { NomeDoador: "João Silva", Valor: 1000, Data_doacao: "13/05/2023" },
      { NomeDoador: "João Silva", Valor: 200, Data_doacao: "10/05/2025" },
      { NomeDoador: "João Silva", Valor: 150, Data_doacao: "11/05/2025" },
    ]);
  }, []);

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const formattedValue = (parseInt(rawValue || '0', 10) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    setNovaDoacaoValor(formattedValue);
  };

  // quando o usuário envia o form, chamamos a API e pegamos o EMV
  const handleNovaDoacao = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawValue = parseFloat(novaDoacaoValor.replace(/\D/g, '')) / 100;
    
    // Validação do valor mínimo
    if (rawValue < 5) {
      alert("O valor mínimo para doação é de R$ 5,00");
      return;
    }

    if (!userData) {
      alert("Erro ao obter dados do usuário. Por favor, tente novamente.");
      return;
    }

    setIsLoadingPix(true);
    try {
      // Geração de due_date sempre para o dia seguinte (garante que nunca será no passado)
      const hoje = new Date();
      const amanha = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1);
      const due_date = amanha.toISOString().slice(0, 10); // 'YYYY-MM-DD'

      const payload = {
        code: `doacao_${Date.now()}_${Math.floor(Math.random()*100000)}`,
        customer: {
          name: userData.usuario.nome,
          email: userData.usuario.user.login,
          document: {
            identity: userData.usuario.documento,
            type: userData.usuario.documento.length === 11 ? "CPF" : "CNPJ"
          },
          address: {
            street: userData.usuario.endereco.rua,
            number: userData.usuario.endereco.numero,
            district: userData.usuario.endereco.bairro,
            city: userData.usuario.endereco.cidade,
            state: userData.usuario.endereco.estado,
            complement: userData.usuario.endereco.complemento,
            zip_code: userData.usuario.endereco.cep
          }
        },
        services: [
          {
            name: "Doação",
            description: "Doação para RemediAR",
            amount: Math.round(rawValue * 100)
          }
        ],
        payment_terms: {
          due_date,
          fine: {
            amount: 0
          },
          discount: {
            type: "PERCENT",
            value: 0
          },
          interest: {
            rate: 0
          }
        },
        notification: {
          name: userData.usuario.nome,
          channels: [
            {
              channel: "EMAIL",
              contact: userData.usuario.user.login,
              rules: [
                "NOTIFY_WHEN_PAID",
                "NOTIFY_ON_DUE_DATE"
              ]
            }
          ]
        },
        payment_forms: ["PIX"]
      };

      // Header único para cada requisição
      const headers = {
        'Idempotency-Key': uuidv4(),
        'Content-Type': 'application/json'
      };

      // usa o interceptor pra mandar o Bearer token automaticamente
      const res = await api.post('/pix/gerar', payload, { headers });
      setPixEmv(res.data.pix.emv);
      setCurrentStep('qr');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao gerar PIX';
      console.error("Erro ao gerar PIX:", errorMessage);
      alert(errorMessage);
    } finally {
      setIsLoadingPix(false);
    }
  };

  const handleConfirmarPagamento = async () => {
    try {
      if (!userData) {
        alert("Erro ao obter dados do usuário. Por favor, tente novamente.");
        return;
      }

      const response = await api.post('/pix/confirmar', null, {
        params: {
          transactionId: pixEmv,
          userId: userData.usuario?.id,
          userName: userData.usuario?.nome,
          amount: parseFloat(novaDoacaoValor.replace(/\D/g, '')) / 100,
          campaignId: 'CAMP001',
          campaignName: 'Campanha de Arrecadação'
        }
      });

      if (response.status === 200) {
        // Atualizar a lista de doações
        const novaDoacao = {
          NomeDoador: userData?.usuario?.nome || '',
          Valor: parseFloat(novaDoacaoValor.replace(/\D/g, '')) / 100,
          Data_doacao: new Date().toLocaleDateString('pt-BR')
        };
        setDoacoes([...doacoes, novaDoacao]);
        
        // Limpar o formulário e fechar o modal
        setNovaDoacaoValor("");
        setPixEmv(null);
        setIsModalOpen(false);
        setCurrentStep('form');
        
        // Mostrar mensagem de sucesso
        setSuccessData({ 
          valor: novaDoacaoValor, 
          data: new Date().toLocaleDateString('pt-BR') 
        });
        setShowSuccessTooltip(true);
        setTimeout(() => setShowSuccessTooltip(false), 5000);
      }
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      alert('Erro ao confirmar pagamento. Por favor, tente novamente.');
    }
  };

  const filteredDoacoes = [...doacoes].sort((a, b) => b.Valor - a.Valor);
  const totalDoacoes = filteredDoacoes.reduce((acc, d) => acc + d.Valor, 0);

  return (
    <DashboardLayout
      title="Doações de Financeiras"
      Icon={() => <DollarSign />}
      menuPrincipalItems={menuPrincipalClienteItems}
      configuracaoItems={ConfiguracaoClienteItems}
    >
      {showSuccessTooltip && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md flex items-center gap-2 animate-fade-in shadow-lg">
            <CheckCircle size={16} className="text-green-600" />
            <span className="font-medium">
              Doação de {successData.valor} realizada em {successData.data}
            </span>
          </div>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <div className="flex justify-end mb-6">
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-[#3FAFC3] text-white hover:bg-[#3498a9]">
              Nova Doação <Plus size={18} />
            </Button>
          </DialogTrigger>
        </div>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              {currentStep === 'form' ? 'Nova Doação' : 'Pagamento via PIX'}
            </DialogTitle>
          </DialogHeader>

          {currentStep === 'form' && (
            <form onSubmit={handleNovaDoacao}>
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gray-500" />
                  <Input
                    placeholder="Valor da doação"
                    value={novaDoacaoValor}
                    onChange={handleValorChange}
                    className="text-lg font-medium"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-[#3FAFC3] hover:bg-[#3498a9] w-full">
                  Gerar QR Code PIX
                </Button>
              </DialogFooter>
            </form>
          )}

          {currentStep === 'qr' && (
            <div className="flex flex-col items-center gap-6">
              {isLoadingPix ? (
                <div>Gerando QR Code...</div>
              ) : (
                pixEmv && (
                  <>
                    <QRCodeCanvas value={pixEmv} size={256} />
                    <p className="break-all text-sm text-gray-600 mt-2">{pixEmv}</p>
                    <Button
                      onClick={handleConfirmarPagamento}
                      className="bg-green-600 hover:bg-green-700 w-full"
                    >
                      <CheckCircle size={18} /> Confirmar Pagamento
                    </Button>
                  </>
                )
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* tabela de doações */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* ... seu código de tabela ... */}
        </table>
      </div>
      <div className="mt-4 text-sm text-gray-500">
        Total doado:{' '}
        {totalDoacoes.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        })}
      </div>
    </DashboardLayout>
  );
}
