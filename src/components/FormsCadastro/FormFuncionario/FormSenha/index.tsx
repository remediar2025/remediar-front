import FormInput from "@/components/Dashboard/FormsParaCadastro/FormInput";
import { Lock, LockKeyhole } from "lucide-react";
import { useFormContext } from "react-hook-form";

export default function FormSenha() {
    const { register, formState: { errors } } = useFormContext();

    
    return (
        <div className="space-y-4">
            <FormInput
                icon={Lock}
                type="password"
                placeholder="Senha"
                {...register("usuario.password")}
                error={(errors.usuario as any)?.password?.message}

            />
            <FormInput
                icon={LockKeyhole}
                type="password"
                placeholder="Confirmar Senha"
                {...register("confirmarSenha")}
                error={errors.confirmarSenha?.message as string | undefined}
            />
        </div>
    );
}
