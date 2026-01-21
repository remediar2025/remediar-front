import { MapPin, Landmark, Building, Home, ClipboardList } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { formatCEP } from "@/utils/masks/masks";
import FormInput from "@/components/Dashboard/FormsParaCadastro/FormInput";

export default function FormEndereco() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-4">
      <FormInput
        icon={MapPin}
        type="text"
        placeholder="CEP"
        {...register("endereco.cep")}
        error={(errors.endereco as any)?.cep?.message}
        mask={formatCEP}
      />
      <FormInput
        icon={Landmark}
        type="text"
        placeholder="Estado"
        {...register("endereco.estado")}
        error={(errors.endereco as any)?.estado?.message}
      />
      <FormInput
        icon={Building}
        type="text"
        placeholder="Cidade"
        {...register("endereco.cidade")}
        error={(errors.endereco as any)?.cidade?.message}
      />
      <FormInput
        icon={Home}
        type="text"
        placeholder="Rua"
        {...register("endereco.rua")}
        error={(errors.endereco as any)?.rua?.message}
      />
      <FormInput
        icon={Home}
        type="text"
        placeholder="Número"
        {...register("endereco.numero")}
        error={(errors.endereco as any)?.numero?.message}
      />
      <FormInput
        icon={MapPin}
        type="text"
        placeholder="Bairro"
        {...register("endereco.bairro")}
        error={(errors.endereco as any)?.bairro?.message}
      />
      <FormInput
        icon={ClipboardList}
        type="text"
        placeholder="Complemento"
        {...register("endereco.complemento")}
        error={(errors.endereco as any)?.complemento?.message}
      />
    </div>
  );
}
