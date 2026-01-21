// Update the import path below if the Button component is located elsewhere
import { Button } from "../../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { cpfMask, phoneMask } from "@/utils/masks/masks";

interface CardListProps {
  name: string;
  email: string;
  cpf: string;
  telefone: string;
  onDelete?: () => void; // função opcional de exclusão
}

export function CardList({ name, email, cpf, telefone, onDelete }: CardListProps) {
  return (
    <Card className="items-center">
      <CardHeader className="border-b w-full p-2 text-center">
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-[11px]">
          <div className="flex flex-row gap-2 p-3 border rounded-[10px] w-[226px] h-[50px] items-center">
            <p className="text-[16px] font-semibold">Email:</p>
            <span className="text-[14px] truncate">{email}</span>
          </div>
          <div className="flex flex-row gap-2 p-3 border rounded-[10px] w-[226px] h-[50px] items-center">
            <p className="text-[16px] font-semibold">CPF:</p>
            <span className="text-[16px]">{cpfMask(cpf)}</span>
          </div>
          <div className="flex flex-row gap-2 p-3 border rounded-[10px] w-[226px] h-[50px] items-center">
            <p className="text-[16px] font-semibold">Telefone:</p>
            <span className="text-[16px]">{phoneMask(telefone)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center pt-4 h-full border-t w-full">
        <Button
          type="button"
          className="bg-white text-black border hover:bg-[#3FAFC3] transition-colors duration-300 cursor-pointer"
          onClick={onDelete}
        >
          Remover
        </Button>
      </CardFooter>
    </Card>
  );
}
