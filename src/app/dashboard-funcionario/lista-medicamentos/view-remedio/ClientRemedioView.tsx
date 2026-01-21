"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import VisualizarMedicamento from "@/components/Dashboard/Medicamento/index";
import ENDPOINTS from "@/services/endpoints";
import { api } from "@/services/api/api";

export default function ClientRemedioView() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [medicamento, setMedicamento] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Medicamento não encontrado.");
      setLoading(false);
      return;
    }
    setLoading(true);
    api.get(`${ENDPOINTS.MEDICAMENTOS.CRUD}/${id}`)
      .then((res) => {
        setMedicamento(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Erro ao buscar medicamento.");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-96">Carregando medicamento...</div>;
  }
  if (error) {
    return <div className="flex justify-center items-center h-96">{error}</div>;
  }
  if (!medicamento) {
    return <div className="flex justify-center items-center h-96">Medicamento não encontrado.</div>;
  }
  return <VisualizarMedicamento medicamento={medicamento} />;
}
