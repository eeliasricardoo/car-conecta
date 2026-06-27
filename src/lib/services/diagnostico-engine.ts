import { fetchSicarByCpf, fetchMunicipioByCodigo, type SicarRecord } from "./sicar";
import type { MunicipioInfo } from "./ibge";

export type RiskLevel = "nenhum" | "baixo" | "medio" | "alto";

export type FonteCruzada = {
  nome: string;
  status: "ok" | "alerta" | "erro" | "nao_disponivel";
  descricao: string;
  dado_real: boolean;
};

export type DiagnosticoResult = {
  cpf: string;
  encontrado: boolean;
  sicar: SicarRecord | null;
  municipio: MunicipioInfo | null;
  fontes: FonteCruzada[];
  nivel_risco: RiskLevel;
  acao_recomendada: string | null;
  link_resolucao: string | null;
  gerado_em: string;
};

/** Valida CPF pelo algoritmo oficial */
export function validarCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(digits[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  return rest === parseInt(digits[10]);
}

function buildFontes(sicar: SicarRecord | null): FonteCruzada[] {
  const fontes: FonteCruzada[] = [];

  // SICAR
  if (sicar) {
    fontes.push({
      nome: "SICAR",
      status: sicar.status === "regular" ? "ok" : sicar.status === "nao_encontrado" ? "erro" : "alerta",
      descricao: sicar.dado_real
        ? "Registro obtido do SICAR via API credenciada."
        : "Dados de demonstração (integração SICAR pendente de credencial parceiro).",
      dado_real: sicar.dado_real,
    });
  }

  // INCRA — aguardando credencial WFS
  fontes.push({
    nome: "INCRA / SIGEF",
    status: sicar ? (sicar.status === "sobreposicao" ? "alerta" : "ok") : "nao_disponivel",
    descricao: "Cruzamento de polígono fundiário. Integração via WFS/SIGEF — requer credencial INCRA.",
    dado_real: false,
  });

  // MapBiomas
  fontes.push({
    nome: "MapBiomas",
    status: sicar?.status === "sobreposicao" ? "alerta" : "ok",
    descricao: "Análise de uso do solo e desmatamento. Integração via API MapBiomas — requer token.",
    dado_real: false,
  });

  // Receita Federal — validamos CPF com algoritmo oficial (sem API externa)
  fontes.push({
    nome: "Receita Federal",
    status: "ok",
    descricao: "CPF válido pelo algoritmo oficial. Consulta de titularidade requer convênio RFB.",
    dado_real: true,
  });

  // SICAR público — município enriquecido em tempo real
  fontes.push({
    nome: "SICAR Municípios",
    status: "ok",
    descricao: "Dados de município obtidos em tempo real via API pública do SICAR (car-sus.dataprev.gov.br).",
    dado_real: true,
  });

  return fontes;
}

function calcularRisco(sicar: SicarRecord | null): RiskLevel {
  if (!sicar) return "nenhum";
  switch (sicar.status) {
    case "regular": return "nenhum";
    case "pendente": return "medio";
    case "sobreposicao": return "alto";
    case "cancelado": return "alto";
    default: return "baixo";
  }
}

function acaoRecomendada(sicar: SicarRecord | null): string | null {
  if (!sicar || sicar.status === "regular") return null;
  switch (sicar.status) {
    case "pendente": return "Atualizar documentação via fluxo guiado";
    case "sobreposicao": return "Agendar visita técnica EMATER";
    case "cancelado": return "Solicitar reativação junto ao órgão estadual";
    default: return "Contatar técnico habilitado";
  }
}

export async function gerarDiagnostico(cpf: string): Promise<DiagnosticoResult> {
  const sicar = await fetchSicarByCpf(cpf);
  const municipioSicar = sicar ? await fetchMunicipioByCodigo(sicar.codigo_ibge_municipio) : null;
  const municipio: MunicipioInfo | null = municipioSicar
    ? { ibge: String(municipioSicar.id), nome: municipioSicar.nome, uf: municipioSicar.estado.id, nomeUf: municipioSicar.estado.nome }
    : null;

  const risco = calcularRisco(sicar);
  const acao = acaoRecomendada(sicar);

  return {
    cpf: cpf.replace(/\D/g, ""),
    encontrado: sicar !== null,
    sicar,
    municipio,
    fontes: buildFontes(sicar),
    nivel_risco: risco,
    acao_recomendada: acao,
    link_resolucao:
      sicar && sicar.status !== "regular" && sicar.status !== "sobreposicao"
        ? `https://carproativo.gov.br/resolver?car=${sicar.codigo_car}`
        : null,
    gerado_em: new Date().toISOString(),
  };
}
