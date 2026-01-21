import { z } from "zod";

export const funcionarioSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  cpf: z.string().min(11, "CPF inválido").max(14, "CPF inválido"),
  telefone: z.string().min(10, "Telefone inválido"),
  genero: z.string().nonempty("Selecione um gênero"),
  dataNascimento: z.string().nonempty("Informe sua data de nascimento"),
  endereco: z.object({
    rua: z.string().nonempty("Endereço obrigatório"),
    numero: z.string().nonempty("Número obrigatório"),
    complemento: z.string().optional(),
    bairro: z.string().nonempty("Bairro obrigatório"),
    cidade: z.string().nonempty("Cidade obrigatória"),
    estado: z.string().min(2, "Estado obrigatório").max(2, "Estado obrigatório"),
    cep: z.string().min(8, "CEP inválido"),
  }),
  usuario: z.object({
    login: z.string().email("E-mail inválido"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    role: z.literal("ADMIN"),
  }),
  confirmarSenha: z
    .string()
    .min(6, "A confirmação de senha deve ter pelo menos 6 caracteres"),
}).refine((data) => data.usuario.password === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
});




export const medicacaoStep1Schema = z.object({
    nomeComercial: z.string().min(3, "O nome comercial do medicamento deve ter pelo menos 3 caracteres.").trim().nonempty("O nome comercial do medicamento é obrigatório."),
    principioAtivo: z.string().trim().nonempty("O princípio ativo do medicamento é obrigatório."),
    apresentacao: z.string().trim().nonempty("A apresentação do medicamento é obrigatória."),
    codigoBarras: z.string().trim().nonempty("O código de barras do medicamentos é obrigatório."),
    laboratorio: z.string().trim().nonempty("O laboratório do medicamento é obrigatório."),
    statusProduto: z.string().trim().nonempty("O status do produto é obrigatório."),
});

export const medicacaoStep2Schema = z.object({
    laboratorio: z.string().trim().nonempty("O laboratório do medicamento é obrigatório."),
    precoMaximo: z.preprocess(
        (val) => {
            if (val === null || val === undefined || val === "") return undefined;
            if (typeof val === "string") {
                const cleaned = val.replace(/\D/g, "");
                if (!cleaned) return undefined;
                let masked = cleaned.replace(/(\d+)(\d{2})$/, "$1,$2");
                masked = masked.replace(/^(0+)(\d)/, "$2");
                masked = masked.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                const num = parseFloat(masked.replace(/\./g, '').replace(',', '.'));
                return isNaN(num) ? undefined : num;
            }
            if (typeof val === "number") return val;
            return undefined;
        },
        z.number({ required_error: "O preço máximo é obrigatório." }).min(0.01, "O preço máximo deve ser maior que zero.")
    ),
    statusProduto: z.string().trim().nonempty("O status do produto é obrigatório."),
});

export const medicacaoSchema = medicacaoStep1Schema.merge(medicacaoStep2Schema);


export const solicitacaoSchema = z.object({
  item: z.object({
    nomeComercialOrPrincipioAtivo: z.string().min(1, "Medicamento obrigatório"),
    quantidade: z.number().min(1, "Quantidade obrigatória"),
  }),
  modoEntrega: z.enum(["RETIRADA", "ENVIO"], {
    required_error: "Modo de entrega obrigatório",
  }),
  usuarioId: z.number().min(1),
  prescricaoMedica: z.object({
    dataEmissao: z.string().min(1, "Data obrigatória"),
    dispensada: z.boolean(),
    usoContinuo: z.boolean(),
    imageUrl: z.string().optional(),
    nomeMedico: z.string().min(1, "Nome do médico obrigatório"),
    crmMedico: z.string().min(1, "CRM obrigatório"),
    idadePaciente: z.number().min(1, "Idade obrigatória"),
    generoPaciente: z.enum(["MASCULINO", "FEMININO", "OUTRO"]),
    cpfPaciente: z.string().min(11, "CPF inválido"),
    contato: z.string().min(1, "Telefone obrigatório"),
  }),
});
