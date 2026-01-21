import { createContext, useContext, useState, ReactNode } from "react";

interface DataContextType {
  dataInicio: string;
  setDataInicio: (value: string) => void;
  dataFim: string;
  setDataFim: (value: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const hoje = new Date();
  const hojeFormatado = hoje.toISOString().split("T")[0];
  
  const data365DiasAtras = new Date();
  data365DiasAtras.setDate(data365DiasAtras.getDate() - 365);
  const dataInicioFormatado = data365DiasAtras.toISOString().split("T")[0];

  const [dataInicio, setDataInicio] = useState(dataInicioFormatado);
  const [dataFim, setDataFim] = useState(hojeFormatado);

  return (
    <DataContext.Provider value={{ dataInicio, setDataInicio, dataFim, setDataFim }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useDataContext deve ser usado dentro de um DataProvider");
  }
  return context;
};
