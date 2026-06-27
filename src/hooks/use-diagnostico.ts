import { useQuery } from "@tanstack/react-query";
import { consultarDiagnostico } from "../lib/services/diagnostico-server";
import type { DiagnosticoResult } from "../lib/services/diagnostico-engine";

export function useDiagnostico(cpf: string | null) {
  return useQuery<DiagnosticoResult>({
    queryKey: ["diagnostico", cpf],
    enabled: !!cpf && cpf.replace(/\D/g, "").length === 11,
    queryFn: () => consultarDiagnostico({ data: cpf! }),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
