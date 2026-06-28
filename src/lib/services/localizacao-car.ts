import { searchMunicipio, type MunicipioInfo } from "./ibge";
import { fetchMunicipioByCodigo, type SicarMunicipio } from "./sicar";

type WhatsappLocation = {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
};

type ReverseGeocodeResult = {
  nomeMunicipio: string;
  uf: string | null;
  nomeUf: string | null;
  fonte: string;
};

export type ConsultaCarLocalizacaoResult = {
  ok: boolean;
  input: WhatsappLocation | null;
  municipio_localizacao: MunicipioInfo | null;
  consulta_publica_sicar: SicarMunicipio | null;
  fontes: Array<{
    nome: string;
    status: "ok" | "erro" | "nao_disponivel";
    descricao: string;
    dado_real: boolean;
  }>;
  mensagem: string;
};

const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";

const UF_BY_STATE_NAME: Record<string, string> = {
  acre: "AC",
  alagoas: "AL",
  amapá: "AP",
  amapa: "AP",
  amazonas: "AM",
  bahia: "BA",
  ceará: "CE",
  ceara: "CE",
  "distrito federal": "DF",
  "espírito santo": "ES",
  "espirito santo": "ES",
  goiás: "GO",
  goias: "GO",
  maranhão: "MA",
  maranhao: "MA",
  "mato grosso": "MT",
  "mato grosso do sul": "MS",
  "minas gerais": "MG",
  pará: "PA",
  para: "PA",
  paraíba: "PB",
  paraiba: "PB",
  paraná: "PR",
  parana: "PR",
  pernambuco: "PE",
  piaui: "PI",
  piauí: "PI",
  "rio de janeiro": "RJ",
  "rio grande do norte": "RN",
  "rio grande do sul": "RS",
  rondônia: "RO",
  rondonia: "RO",
  roraima: "RR",
  "santa catarina": "SC",
  "são paulo": "SP",
  "sao paulo": "SP",
  sergipe: "SE",
  tocantins: "TO",
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const normalized = value.replace(",", ".").trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function readLocationCandidate(value: unknown): WhatsappLocation | null {
  if (!isRecord(value)) return null;

  const latitude = toNumber(value.latitude ?? value.lat ?? value.Latitude);
  const longitude = toNumber(value.longitude ?? value.lng ?? value.lon ?? value.Longitude);

  if (latitude == null || longitude == null) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;

  return {
    latitude,
    longitude,
    name: typeof value.name === "string" ? value.name : undefined,
    address: typeof value.address === "string" ? value.address : undefined,
  };
}

export function extractWhatsappLocation(payload: unknown): WhatsappLocation | null {
  const direct = readLocationCandidate(payload);
  if (direct) return direct;
  if (!isRecord(payload)) return null;

  const nestedKeys = ["location", "Location", "localizacao", "localização"];
  for (const key of nestedKeys) {
    const nested = readLocationCandidate(payload[key]);
    if (nested) return nested;
  }

  const entry = payload.entry;
  if (Array.isArray(entry)) {
    for (const item of entry) {
      if (!isRecord(item) || !Array.isArray(item.changes)) continue;
      for (const change of item.changes) {
        if (!isRecord(change) || !isRecord(change.value) || !Array.isArray(change.value.messages)) {
          continue;
        }
        for (const message of change.value.messages) {
          if (!isRecord(message)) continue;
          const location = readLocationCandidate(message.location);
          if (location) return location;
        }
      }
    }
  }

  return null;
}

function getMunicipioName(address: Record<string, unknown>): string | null {
  const candidates = [
    address.city,
    address.town,
    address.village,
    address.municipality,
    address.county,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.replace(/^Município de\s+/i, "").trim();
    }
  }

  return null;
}

function getUf(address: Record<string, unknown>): { uf: string | null; nomeUf: string | null } {
  const iso = typeof address["ISO3166-2-lvl4"] === "string" ? address["ISO3166-2-lvl4"] : null;
  if (iso?.startsWith("BR-")) {
    return { uf: iso.slice(3), nomeUf: typeof address.state === "string" ? address.state : null };
  }

  if (typeof address.state !== "string") return { uf: null, nomeUf: null };
  const uf = UF_BY_STATE_NAME[normalizeText(address.state)] ?? null;
  return { uf, nomeUf: address.state };
}

async function reverseGeocodeLocation(
  location: WhatsappLocation,
): Promise<ReverseGeocodeResult | null> {
  const url = new URL(NOMINATIM_REVERSE_URL);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(location.latitude));
  url.searchParams.set("lon", String(location.longitude));
  url.searchParams.set("zoom", "10");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "pt-BR");

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "CAR-Conecta/1.0 (diagnostico-localizacao)",
    },
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { address?: Record<string, unknown> };
  if (!isRecord(data.address)) return null;

  const nomeMunicipio = getMunicipioName(data.address);
  if (!nomeMunicipio) return null;

  const { uf, nomeUf } = getUf(data.address);
  return {
    nomeMunicipio,
    uf,
    nomeUf,
    fonte: "OpenStreetMap Nominatim",
  };
}

function chooseMunicipioMatch(matches: MunicipioInfo[], reverse: ReverseGeocodeResult) {
  const normalizedName = normalizeText(reverse.nomeMunicipio);

  return (
    matches.find(
      (municipio) =>
        normalizeText(municipio.nome) === normalizedName &&
        (!reverse.uf || municipio.uf === reverse.uf),
    ) ??
    matches.find((municipio) => !reverse.uf || municipio.uf === reverse.uf) ??
    matches[0] ??
    null
  );
}

export async function consultarCarPorLocalizacaoWhatsapp(
  payload: unknown,
): Promise<ConsultaCarLocalizacaoResult> {
  const location = extractWhatsappLocation(payload);
  if (!location) {
    return {
      ok: false,
      input: null,
      municipio_localizacao: null,
      consulta_publica_sicar: null,
      fontes: [
        {
          nome: "WhatsApp Location",
          status: "erro",
          descricao:
            "Payload não contém latitude/longitude em formato reconhecido de localização do WhatsApp.",
          dado_real: true,
        },
      ],
      mensagem: "Envie uma localização do WhatsApp com latitude e longitude.",
    };
  }

  const reverse = await reverseGeocodeLocation(location);
  if (!reverse) {
    return {
      ok: false,
      input: location,
      municipio_localizacao: null,
      consulta_publica_sicar: null,
      fontes: [
        {
          nome: "Geocodificação reversa",
          status: "erro",
          descricao: "Não foi possível identificar município/UF para a coordenada enviada.",
          dado_real: true,
        },
      ],
      mensagem: "Não consegui identificar a região da localização enviada.",
    };
  }

  const municipios = await searchMunicipio(reverse.nomeMunicipio, reverse.uf ?? undefined);
  const municipio = chooseMunicipioMatch(municipios, reverse);
  const sicarMunicipio = municipio ? await fetchMunicipioByCodigo(municipio.ibge) : null;

  return {
    ok: !!municipio && !!sicarMunicipio,
    input: location,
    municipio_localizacao: municipio,
    consulta_publica_sicar: sicarMunicipio,
    fontes: [
      {
        nome: "WhatsApp Location",
        status: "ok",
        descricao: "Latitude e longitude extraídas do payload recebido.",
        dado_real: true,
      },
      {
        nome: reverse.fonte,
        status: municipio ? "ok" : "erro",
        descricao: reverse.uf
          ? `Coordenada resolvida para ${reverse.nomeMunicipio}/${reverse.uf}.`
          : `Coordenada resolvida para ${reverse.nomeMunicipio}.`,
        dado_real: true,
      },
      {
        nome: "SICAR Municípios",
        status: sicarMunicipio ? "ok" : "nao_disponivel",
        descricao: sicarMunicipio
          ? "Consulta pública por código IBGE realizada no ambiente SICAR/Dataprev."
          : "Município identificado, mas a API pública do SICAR não retornou dados para o código IBGE.",
        dado_real: true,
      },
    ],
    mensagem:
      municipio && sicarMunicipio
        ? `Localização identificada em ${municipio.nome}/${municipio.uf}. Consulta pública SICAR retornou município ${sicarMunicipio.nome} com módulo fiscal ${sicarMunicipio.moduloFiscal}.`
        : "A localização foi lida, mas não foi possível completar a consulta pública do CAR para a região.",
  };
}
