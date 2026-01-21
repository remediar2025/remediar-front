"use client";

import { useState, useEffect } from "react";
import {
  X, CheckSquare2, User, Mail, MapPin, Phone, Pill,
  Package, Repeat, Calendar, Truck, VenusAndMars,
  CreditCard, Badge, UserCheck, Stethoscope, ClipboardCheck,
  Plus, Minus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Solicitation } from "@/lib/types";
import { api } from "@/services/api/api";
import ENDPOINTS from "@/services/endpoints";
import { useAuth } from "@/contexts/AuthContext";
import { solicitacaoSchema } from "@/utils/validations/ZodSchema";


interface SolicitationFormProps {
  solicitation: Solicitation; 
  onClose: () => void;
  onStatusChange: (newStatus: Solicitation['status']) => void;
  currentUser: {
    id: string;
    nome: string;
  };
}

interface DadosPessoais {
    id: string;
    nome: string;
    documento: string;
    telefone: string;
    email: string;
    endereco: string;
}

export function SolicitacaoForm({ solicitation, onClose, onStatusChange, currentUser }: SolicitationFormProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.5);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const { user } = useAuth();

  // Estado para armazenar e-mail e endereço completos do usuário solicitante
  const [usuarioInfo, setUsuarioInfo] = useState<{ email: string; endereco: string }>({
    email: "Não informado",
    endereco: "Não informado"
  });

  useEffect(() => {
    const usuarioId = (solicitation.dadosPessoais as any).id;
    if (!usuarioId) return;

    // Busca do backend oficial
    api.get(`https://ongremediar.com.br/api/usuarios/${usuarioId}`)
      .then(response => {
        const data = response.data;
        const enderecoObj = data.usuario?.endereco;
        const enderecoFormatado = enderecoObj
          ? `${enderecoObj.rua}, ${enderecoObj.numero}${enderecoObj.complemento ? ' ' + enderecoObj.complemento : ''} - ${enderecoObj.cidade} - ${enderecoObj.estado}, ${enderecoObj.cep}`
          : "Não informado";
        setUsuarioInfo({
          email: data.usuario?.user?.login || "Não informado",
          endereco: enderecoFormatado
        });
      })
      .catch(() => {
        setUsuarioInfo({ email: "Não informado", endereco: "Não informado" });
      });
  }, [solicitation.dadosPessoais]);


  const handleImageClick = () => {
    setIsZoomed(true);
    setZoomLevel(1.5);
    setPosition({ x: 0, y: 0 });
  };


  const handleAssumeSolicitation = async () => {
    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return;
    }
  
    try {
      await api.patch(
        `${ENDPOINTS.SOLICITACOES.ASSUMIR_FUNCIONARIO}/${solicitation.id}/funcionario`,
        { funcionarioId: user.id },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
  
      toast.success("Solicitação assumida com sucesso", {
        description: `Você agora é o responsável pela solicitação #${solicitation.id}`
      });
  
      onStatusChange("EM_ANALISE");
      onClose();
    } catch (error) {
      console.error("Erro ao assumir solicitação:", error);
      toast.error("Erro ao assumir solicitação");
    }
  };
  

  const handleStatusChangeWithToast = (
    newStatus: Parameters<typeof onStatusChange>[0],
    message: string
  ) => {
    onStatusChange(newStatus);
    onClose();
    toast.success(message, {
      description: `Status atualizado para: ${formatStatus(newStatus)}`,
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isZoomed) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isZoomed]);

  

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-2 sm:p-3">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 w-full px-2 sm:px-3">

          {/* Coluna 1 - Responsável, Solicitante e Paciente */}
          <div className="space-y-2 lg:col-span-1">
            {solicitation.responsavel && (
              <div className="bg-white rounded-lg p-2 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="w-4 h-4 text-gray-600" />
                  <h2 className="text-sm font-semibold">Responsável</h2>
                </div>
                <div className="space-y-2">
                  <InfoItem icon={UserCheck} label="Responsável" value={solicitation.responsavel} />
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-600" />
                <h2 className="text-sm font-semibold">Solicitante</h2>
              </div>
              <div className="space-y-2">
                <InfoItem icon={User} label="Nome" value={solicitation.dadosPessoais.nome} />
                <InfoItem icon={Mail} label="E-mail" value={usuarioInfo.email} />
                <InfoItem icon={MapPin} label="Endereço" value={usuarioInfo.endereco} />
                <InfoItem icon={Phone} label="Telefone" value={solicitation.dadosPessoais.telefone} />
              </div>
            </div>

            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-600" />
                <h2 className="text-sm font-semibold">Paciente</h2>
              </div>
              <div className="space-y-2">
                <InfoItem icon={User} label="Nome" value={solicitation.prescricaoMedica.nomePaciente} />
                <InfoItem icon={Calendar} label="Idade" value={`${solicitation.prescricaoMedica.idadePaciente} anos`} />
                <InfoItem icon={VenusAndMars} label="Gênero" value={solicitation.prescricaoMedica.genero} />
                <InfoItem icon={CreditCard} label="CPF" value={solicitation.prescricaoMedica.cpf} />
                <InfoItem icon={Phone} label="Contato" value={solicitation.prescricaoMedica.contato} />
              </div>
            </div>
          </div>

          {/* Coluna 2 - Item Solicitado e Médico */}
          <div className="space-y-2 lg:col-span-1">
            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-gray-600" />
                <h2 className="text-sm font-semibold">Item Solicitado</h2>
              </div>
              <div className="space-y-2">
                <InfoItem icon={Pill} label="Medicamento" value={solicitation.itemSolicitacao.medicamento} />
                <InfoItem
                  icon={Calendar}
                  label="Data e hora da Solicitação"
                  value={solicitation.itemSolicitacao.dataSolicitacao}
                />
                <InfoItem icon={Package} label="Quantidade" value={solicitation.itemSolicitacao.quantidade.toString()} />
                <InfoItem icon={Truck} label="Entrega" value={solicitation.itemSolicitacao.modoEntrega} />
              </div>
            </div>

            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope className="w-4 h-4 text-gray-600" />
                <h2 className="text-sm font-semibold">Médico</h2>
              </div>
              <div className="space-y-2">
                <InfoItem icon={User} label="Nome" value={solicitation.prescricaoMedica.nomeMedico} />
                <InfoItem icon={Badge} label="CRM" value={solicitation.prescricaoMedica.crm} />
              </div>
            </div>
          </div>

          {/* Coluna 3 - Prescrição + Imagem */}
          <div className="space-y-2 lg:col-span-1">
            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <ClipboardCheck className="w-4 h-4 text-gray-600" />
                <h2 className="text-sm font-semibold">Prescrição</h2>
              </div>
              <div className="space-y-2">
                <InfoItem icon={Calendar} label="Data" value={solicitation.prescricaoMedica.data} />
                <InfoItem icon={Package} label="Dispensada" value={solicitation.prescricaoMedica.dispensada} />
                <InfoItem icon={Repeat} label="Uso Contínuo" value={solicitation.prescricaoMedica.usoContinuo} />
              </div>
            </div>

            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <ClipboardCheck className="w-4 h-4 text-gray-600" />
                <h2 className="text-sm font-semibold">Receita Médica</h2>
              </div>
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-zoom-in">
                <div className="w-full h-full" onClick={handleImageClick}>
                  <img
                    src={solicitation.prescricaoMedica.imagemReceita}
                    alt="Receita médica"
                    className="object-contain w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overlay do Zoom */}
        {isZoomed && (
          <div
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setIsZoomed(false)}
          >
            <div className="max-w-[90vw] max-h-[90vh] relative bg-white rounded-lg overflow-hidden">
              <div
                className="relative h-full overflow-hidden"
                onMouseDown={handleMouseDown}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                <div
                  className="w-full h-full"
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease',
                  }}
                >
                  <img
                    src={solicitation.prescricaoMedica.imagemReceita}
                    alt="Receita ampliada"
                    className="block object-contain w-full h-full origin-center"
                  />
                </div>

                {/* Controles de Zoom */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm"
                    onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 3))}
                    aria-label="Aumentar zoom"
                  >
                    <Plus className="w-6 h-6" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm"
                    onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 1))}
                    aria-label="Diminuir zoom"
                  >
                    <Minus className="w-6 h-6" />
                  </Button>
                </div>

                {/* Botão Fechar */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 left-4 text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm"
                  onClick={() => {
                    setIsZoomed(false);
                    setZoomLevel(1.5);
                    setPosition({ x: 0, y: 0 });
                  }}
                  aria-label="Fechar zoom"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="sticky bottom-0 border-t border-gray-200 bg-white p-2 z-10">
        <div className="flex flex-wrap justify-end gap-1.5">
          {solicitation.status === "EM_ANALISE" && (
            <>
              <Button
                variant="destructive"
                className="gap-1.5 px-3 py-1 h-8 text-xs"
                onClick={() => handleStatusChangeWithToast(
                  "REJEITADA",
                  "Solicitação rejeitada com sucesso!"
                )}
              >
                <X className="w-3.5 h-3.5" />
                Rejeitar
              </Button>
              <Button
                className="bg-[#3FAFC3] hover:bg-cyan-800 gap-1.5 px-3 py-1 h-8 text-xs"
                onClick={async () => {
                  if (!user?.id) {
                    toast.error("Usuário não autenticado");
                    return;
                  }

                  try {
                    await api.patch(
                      `${ENDPOINTS.SOLICITACOES.CONFIRMAR}/${solicitation.id}/confirmar`,
                      { funcionarioId: user.id },
                      {
                        headers: {
                          "Content-Type": "application/json"
                        }
                      }
                    );

                    toast.success("Solicitação aprovada com sucesso!", {
                      description: `Status atualizado para: Aprovada`,
                    });

                    onStatusChange("APROVADA");
                    onClose();
                  } catch (error) {
                    console.error("Erro ao aprovar solicitação:", error);
                    toast.error("Erro ao aprovar solicitação");
                  }
                }}
              >
                <CheckSquare2 className="w-3.5 h-3.5" />
                Aprovar
              </Button>
            </>
          )}

          {solicitation.status === "APROVADA" && (
            <Button
              className="bg-orange-500 hover:bg-orange-600 gap-1.5 px-3 py-1 h-8 text-xs"
              onClick={async () => {
                if (!user?.id) {
                  toast.error("Usuário não autenticado");
                  return;
                }

                try {
                  await api.patch(
                    `${ENDPOINTS.SOLICITACOES.CONFIRMAR}/${solicitation.id}/separar`,
                    { funcionarioId: user.id },
                    {
                      headers: {
                        "Content-Type": "application/json"
                      }
                    }
                  );

                  toast.success("Processo de separação iniciado!", {
                    description: `Status atualizado para: Em Separação`,
                  });

                  onStatusChange("SEPARADA");
                  onClose();
                } catch (error) {
                  console.error("Erro ao separar solicitação:", error);
                  toast.error("Erro ao iniciar separação");
                }
              }}
            >
              <Package className="w-3.5 h-3.5" />
              Separar
            </Button>
          )}

          {solicitation.status === "SEPARADA" && (
            <Button
              className="bg-purple-600 hover:bg-purple-700 gap-1.5 px-3 py-1 h-8 text-xs"
              onClick={async () => {
                if (!user?.id) {
                  toast.error("Usuário não autenticado");
                  return;
                }

                try {
                  await api.patch(
                    `${ENDPOINTS.SOLICITACOES.CONFIRMAR}/${solicitation.id}/pronto-para-retirada`,
                    { funcionarioId: user.id },
                    {
                      headers: {
                        "Content-Type": "application/json"
                      }
                    }
                  );

                  toast.success("Medicamento pronto para retirada!", {
                    description: `Status atualizado para: Aguardando Retirada`,
                  });

                  onStatusChange("AGUARDANDO_RETIRADA");
                  onClose();
                } catch (error) {
                  console.error("Erro ao finalizar separação:", error);
                  toast.error("Erro ao atualizar status para pronto para retirada");
                }
              }}
            >
              <Truck className="w-3.5 h-3.5" />
              Pronto para Retirada
            </Button>
          )}

          {solicitation.status === "AGUARDANDO_RETIRADA" && (
            <>
              <Button
                variant="destructive"
                className="gap-1.5 px-3 py-1 h-8 text-xs"
                onClick={() => handleStatusChangeWithToast(
                  "CANCELADA",
                  "Solicitação cancelada com sucesso!"
                )}
              >
                <X className="w-3.5 h-3.5" />
                Cancelar
              </Button>
              <Button
                  className="bg-green-600 hover:bg-green-700 gap-1.5 px-3 py-1 h-8 text-xs"
                  onClick={async () => {
                    if (!user?.id) {
                      toast.error("Usuário não autenticado");
                      return;
                    }

                    try {
                      await api.patch(
                        `${ENDPOINTS.SOLICITACOES.CONFIRMAR}/${solicitation.id}/finalizar`,
                        { funcionarioId: user.id },
                        {
                          headers: {
                            "Content-Type": "application/json",
                          },
                        }
                      );

                      toast.success("Solicitação concluída com sucesso!", {
                        description: `Solicitação #${solicitation.id} foi finalizada.`,
                      });

                      onStatusChange("CONCLUIDA");
                      onClose();
                    } catch (error) {
                      console.error("Erro ao concluir solicitação:", error);
                      toast.error("Erro ao concluir solicitação");
                    }
                  }}
                >
                  <CheckSquare2 className="w-3.5 h-3.5" />
                  Concluir
                </Button>
            </>
          )}

          {solicitation.status === "PENDENTE" && (
            <Button
              className="bg-blue-600 hover:bg-blue-700 gap-1.5 px-3 py-1 h-8 text-xs"
              onClick={handleAssumeSolicitation}
            >
              <CheckSquare2 className="w-3.5 h-3.5" />
              Assumir
            </Button>
          )}
        </div>
      </div>

      <Toaster position="top-right" richColors expand visibleToasts={3} />
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center border border-[#D1D1D1] rounded-md p-1.5 w-full">
      <div className="flex items-center pr-2 border-r border-[#D1D1D1]">
        <Icon className="w-4 h-4 text-gray-600" />
      </div>
      <div className="ml-2">
        <p className="text-[0.7rem] text-gray-500 leading-tight">{label}</p>
        <p className="text-xs font-medium text-gray-800 break-words leading-tight">{value}</p>
      </div>
    </div>
  );
}

const formatStatus = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'PENDENTE': 'Pendente',
    'EM_ANALISE': 'Em Análise',
    'APROVADA': 'Aprovada',
    'REJEITADA': 'Rejeitada',
    'CONCLUIDA': 'Concluída',
    'CANCELADA': 'Cancelada',
    'EM_SEPARACAO': 'Em Separação',
    'AGUARDANDO_RETIRADA': 'Aguardando Retirada'
  };
  return statusMap[status] || status;
};