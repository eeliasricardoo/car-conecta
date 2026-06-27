const IBGE_BASE = "https://servicodados.ibge.gov.br/api/v1";
const BRASIL_API = "https://brasilapi.com.br/api";

export type IbgeMunicipio = {
  id: number;
  nome: string;
  microrregiao: {
    mesorregiao: {
      UF: { sigla: string; nome: string };
    };
  };
};

export type MunicipioInfo = {
  ibge: string;
  nome: string;
  uf: string;
  nomeUf: string;
};

export async function getMunicipioByIbge(codigoIbge: string): Promise<MunicipioInfo | null> {
  try {
    const res = await fetch(`${IBGE_BASE}/localidades/municipios/${codigoIbge}`);
    if (!res.ok) return null;
    const data: IbgeMunicipio = await res.json();
    return {
      ibge: String(data.id),
      nome: data.nome,
      uf: data.microrregiao.mesorregiao.UF.sigla,
      nomeUf: data.microrregiao.mesorregiao.UF.nome,
    };
  } catch {
    return null;
  }
}

export async function getMunicipiosByUF(uf: string): Promise<{ nome: string; codigo_ibge: string }[]> {
  try {
    const res = await fetch(`${BRASIL_API}/ibge/municipios/v1/${uf}?providers=dados-abertos-br,gov,wikipedia`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function searchMunicipio(query: string, uf?: string): Promise<MunicipioInfo[]> {
  try {
    const endpoint = uf
      ? `${IBGE_BASE}/localidades/estados/${uf}/municipios`
      : `${IBGE_BASE}/localidades/municipios`;
    const res = await fetch(endpoint);
    if (!res.ok) return [];
    const all: IbgeMunicipio[] = await res.json();
    const q = query.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    return all
      .filter((m) => m.nome.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(q))
      .slice(0, 10)
      .map((m) => ({
        ibge: String(m.id),
        nome: m.nome,
        uf: m.microrregiao.mesorregiao.UF.sigla,
        nomeUf: m.microrregiao.mesorregiao.UF.nome,
      }));
  } catch {
    return [];
  }
}
