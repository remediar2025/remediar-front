import { Input } from "@/components/ui/input";
import { ChangeEvent, JSX } from "react";
import React from "react";

interface InputWithIconProps {
  icon: JSX.Element;
  placeholder: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: ChangeEvent<HTMLInputElement>) => void;
  mask?: string;
  required?: boolean;
  fieldName: string;
  camposComErro?: string[];
}

export default function InputWithIcon({
  icon,
  placeholder,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  mask = "",
  required = false,
  fieldName,
  camposComErro = [],
}: InputWithIconProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    // Limitar nome a 500 caracteres
    if (fieldName === "nome" && inputValue.length > 500) {
      inputValue = inputValue.substring(0, 500);
    }

    // Máscaras
    if (mask === "(99) 99999-9999") {
      const digits = inputValue.replace(/\D/g, "").substring(0, 11);
      inputValue = digits.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    }

    if (mask === "99999-999") {
      const digits = inputValue.replace(/\D/g, "").substring(0, 8);
      inputValue = digits.replace(/^(\d{5})(\d)/, "$1-$2");
    }

    if (
      (mask === "999.999.999-99" || mask === "99.999.999/9999-99") &&
      inputValue
    ) {
      const digits = inputValue.replace(/\D/g, "");

      if (digits.length <= 11) {
        inputValue = digits
          .replace(/(\d{3})(\d)/, "$1.$2")
          .replace(/(\d{3})(\d)/, "$1.$2")
          .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
          .substring(0, 14);
      } else {
        inputValue = digits
          .replace(/(\d{2})(\d)/, "$1.$2")
          .replace(/(\d{3})(\d)/, "$1.$2")
          .replace(/(\d{3})(\d)/, "$1/$2")
          .replace(/(\d{4})(\d{1,2})$/, "$1-$2")
          .substring(0, 18);
      }
    }

    if (fieldName === "qtdPessoasCasa") {
      const num = parseInt(inputValue) || 0;
      inputValue = Math.min(Math.max(num, 0), 30).toString();
    }

    if (fieldName === "rendaFamiliar") {
      const num = parseFloat(inputValue) || 0;
      inputValue = Math.min(Math.max(num, 0), 1000000000).toString();
    }

    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: inputValue,
      },
    };

    onChange(syntheticEvent as ChangeEvent<HTMLInputElement>);
  };

  const temErro = camposComErro?.includes(fieldName);

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          {icon}
        </div>
        <Input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          className={`pl-14 h-16 text-lg border-2 rounded-md w-full bg-white ${
            temErro ? "border-red-500 focus:border-red-500" : ""
          }`}
          required={required}
        />
      </div>
      <div
        className={`text-base pl-3 ${
          temErro ? "text-red-500" : "text-gray-500"
        }`}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </div>
    </div>
  );
}