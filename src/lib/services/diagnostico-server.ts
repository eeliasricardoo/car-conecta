import { createServerFn } from "@tanstack/react-start";
import { gerarDiagnostico, validarCPF } from "./diagnostico-engine";

export const consultarDiagnostico = createServerFn({ method: "GET" })
  .validator((cpf: string) => {
    const digits = cpf.replace(/\D/g, "");
    if (digits.length !== 11) throw new Error("CPF deve ter 11 dígitos.");
    if (!validarCPF(digits)) throw new Error("CPF inválido.");
    return digits;
  })
  .handler(async ({ data: cpf }) => {
    return gerarDiagnostico(cpf);
  });
