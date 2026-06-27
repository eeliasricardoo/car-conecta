/**
 * SICAR integration layer.
 *
 * Endpoints públicos disponíveis (sem auth) no ambiente de testes:
 *   GET https://car-sus.dataprev.gov.br/estados/all
 *   GET https://car-sus.dataprev.gov.br/municipios/byCodigoIbge/{codigoIbge}
 *
 * Consulta de imóveis por CPF requer autenticação Gov.br OAuth.
 * Os registros demo abaixo usam os CPFs reais do ambiente de testes do haCARthon
 * com os códigos SNCR correspondentes fornecidos pela organização.
 */

const SICAR_TEST_BASE = "https://car-sus.dataprev.gov.br";

export type SicarStatus = "regular" | "pendente" | "sobreposicao" | "cancelado" | "nao_encontrado";

export type SicarRecord = {
  codigo_car: string;
  status: SicarStatus;
  nome_imovel: string;
  area_ha: number;
  codigo_ibge_municipio: string;
  nome_municipio: string;
  uf: string;
  data_inscricao: string;
  data_ultima_atualizacao: string;
  pendencias: string[];
  codigos_sncr: string[];
  /** true = dado real da API; false = dado de demonstração */
  dado_real: boolean;
};

export type SicarEstado = {
  id: string;
  nome: string;
  codigoIbge: number;
  area: number;
};

export type SicarMunicipio = {
  id: number;
  nome: string;
  estado: { id: string; nome: string; codigoIbge: number; area: number };
  moduloFiscal: number;
  area: number;
};

// CPFs reais do ambiente de testes haCARthon com dados representativos
const DEMO_RECORDS: Record<string, SicarRecord> = {
  // CPF 1 do hackathon — data nasc: 12/12/2002
  "10728210100": {
    codigo_car: "MT-5102504-A4B2C1D8E3F5",
    status: "pendente",
    nome_imovel: "Sítio Boa Esperança",
    area_ha: 48.3,
    codigo_ibge_municipio: "5102504",
    nome_municipio: "Cáceres",
    uf: "MT",
    data_inscricao: "2019-06-14",
    data_ultima_atualizacao: "2022-11-08",
    pendencias: [
      "CCIR vencido desde 11/2022",
      "Comprovante de domínio desatualizado",
    ],
    codigos_sncr: ["9130730239223", "9130730254613"],
    dado_real: false,
  },
  // CPF 2 do hackathon — data nasc: 01/01/1980
  "28701615491": {
    codigo_car: "MT-5107925-D5F9B3C2A7E1",
    status: "sobreposicao",
    nome_imovel: "Fazenda Santa Luzia",
    area_ha: 210.5,
    codigo_ibge_municipio: "5107925",
    nome_municipio: "Sorriso",
    uf: "MT",
    data_inscricao: "2017-03-22",
    data_ultima_atualizacao: "2023-08-15",
    pendencias: [
      "Sobreposição de 4,7 ha com APP de nascente (CAR MT-5107925-E2F8)",
      "Área de Reserva Legal não averbada",
    ],
    codigos_sncr: ["2420200634280", "2480450028362", "9500339031245", "9500339031326", "9501737335390"],
    dado_real: false,
  },
  // CPF extra para demo — status regular
  "11122233396": {
    codigo_car: "MT-5107602-D5F1A7C8B2E3",
    status: "regular",
    nome_imovel: "Chácara Boa Vista",
    area_ha: 12.7,
    codigo_ibge_municipio: "5107602",
    nome_municipio: "Rondonópolis",
    uf: "MT",
    data_inscricao: "2019-11-05",
    data_ultima_atualizacao: "2024-02-20",
    pendencias: [],
    codigos_sncr: [],
    dado_real: false,
  },
};

export async function fetchSicarByCpf(cpf: string): Promise<SicarRecord | null> {
  const digits = cpf.replace(/\D/g, "");

  // Quando autenticação Gov.br estiver disponível (token de sessão):
  // const session = process.env.SICAR_SESSION_COOKIE;
  // if (session) {
  //   const res = await fetch(`${SICAR_TEST_BASE}/imovel/byFiltros?cpf=${digits}`, {
  //     headers: { Cookie: `SICARCOOKIE_SESSION=${session}` },
  //   });
  //   if (res.ok) {
  //     const data = await res.json();
  //     if (data.status === "s" && data.dados?.length) {
  //       return mapSicarResponseToRecord(data.dados[0], digits);
  //     }
  //   }
  // }

  return DEMO_RECORDS[digits] ?? null;
}

export async function fetchSicarByCodigo(codigo: string): Promise<SicarRecord | null> {
  const upper = codigo.toUpperCase().trim();
  const record = Object.values(DEMO_RECORDS).find((r) => r.codigo_car === upper);
  return record ?? null;
}

/** Consulta pública — lista todos os estados (sem autenticação) */
export async function fetchEstados(): Promise<SicarEstado[]> {
  try {
    const res = await fetch(`${SICAR_TEST_BASE}/estados/all`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.status === "s" ? data.dados : [];
  } catch {
    return [];
  }
}

/** Consulta pública — município por código IBGE (sem autenticação) */
export async function fetchMunicipioByCodigo(codigoIbge: string): Promise<SicarMunicipio | null> {
  try {
    const res = await fetch(`${SICAR_TEST_BASE}/municipios/byCodigoIbge/${codigoIbge}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.status === "s" ? data.dados : null;
  } catch {
    return null;
  }
}
