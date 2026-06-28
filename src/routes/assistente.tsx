import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import govBrLogo from "@/assets/govbr-logo.svg";
import { useDiagnostico } from "@/hooks/use-diagnostico";
import type { DiagnosticoResult } from "@/lib/services/diagnostico-engine";
import { fetchSicarByCodigo, type SicarRecord } from "@/lib/services/sicar";

export const Route = createFileRoute("/assistente")({
  head: () => ({
    meta: [
      { title: "Assistente CAR — Gov.br" },
      {
        name: "description",
        content:
          "Escolha seu perfil para acessar soluções do CAR como agricultor ou parceiro credenciado.",
      },
    ],
  }),
  component: AssistentePage,
});

type Profile = "agricultor" | "parceiro" | null;
type FarmerPanel = "cpf" | "localizacao" | "car" | "mapa" | "novo" | null;

type LocationResult = {
  ok: boolean;
  municipio_localizacao: { ibge: string; nome: string; uf: string; nomeUf: string } | null;
  consulta_publica_sicar: { nome: string; moduloFiscal: number; area: number } | null;
  mensagem: string;
};

const DEMO_CPFS = [
  { cpf: "107.282.101-00", label: "Pendente" },
  { cpf: "287.016.154-91", label: "Sobreposição" },
  { cpf: "111.222.333-96", label: "Regular" },
];

const INSTITUTIONS = [
  "EMATER (Empresa de Assistência Técnica e Extensão Rural) — Mato Grosso",
  "Sicredi RS",
  "Banco do Brasil — MT",
  "Cargill Grãos",
];

function AssistentePage() {
  const [profile, setProfile] = useState<Profile>(null);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 18% 8%, rgba(52,199,89,0.12), transparent 28%), linear-gradient(180deg, #f8faf7 0%, #eef5f1 100%)",
        color: "#1f2937",
      }}
    >
      <GovHeader onHome={() => setProfile(null)} />
      {!profile && <ProfileChooser onChoose={setProfile} />}
      {profile === "agricultor" && <FarmerHub />}
      {profile === "parceiro" && <PartnerFlow />}
    </div>
  );
}

function GovHeader({ onHome }: { onHome: () => void }) {
  return (
    <header
      style={{
        minHeight: 76,
        background: "rgba(255,255,255,0.92)",
        borderBottom: "1px solid rgba(15,23,42,0.08)",
        boxShadow: "0 10px 30px rgba(15,23,42,0.04)",
        display: "flex",
        alignItems: "center",
        backdropFilter: "blur(14px)",
      }}
    >
      <div className="container-lg">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <button
            type="button"
            onClick={onHome}
            style={{
              border: 0,
              background: "transparent",
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              color: "#111827",
              fontWeight: 800,
              fontSize: 18,
              padding: 0,
            }}
          >
            <img src={govBrLogo} alt="Gov.br" style={{ height: 30 }} />
            <span style={{ color: "#168821" }}>CAR Proativo</span>
          </button>
          <nav style={{ display: "flex", gap: 8 }}>
            <Link to="/demo" style={navPillStyle}>
              Demo chatbot
            </Link>
            <Link to="/localizacao" style={navPillStyle}>
              API localização
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

function ProfileChooser({ onChoose }: { onChoose: (profile: Profile) => void }) {
  return (
    <main className="container-lg" style={{ padding: "64px 16px 88px" }}>
      <section style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
            gap: 32,
            alignItems: "center",
          }}
        >
          <div>
            <span style={eyebrowStyle}>Assistente web replicável</span>
            <h1
              style={{
                fontSize: "clamp(38px, 5vw, 64px)",
                lineHeight: 1.02,
                margin: "16px 0",
                color: "#0f172a",
                maxWidth: 640,
              }}
            >
              Um fluxo CAR para agricultor, parceiro e widget no site.
            </h1>
            <p style={{ ...mutedTextStyle, fontSize: 18, maxWidth: 620 }}>
              A experiência começa pelo perfil e adapta o atendimento: orientação simples para o
              produtor, painel operacional para parceiros e um widget reutilizável para canais
              digitais.
            </p>
          </div>
          <div style={heroCardStyle}>
            <div style={{ display: "grid", gap: 14 }}>
              <ProfileCard
                icon="fa-seedling"
                title="Sou Agricultor"
                description="Acessar consultas guiadas, localização, mapa e caminhos para regularizar ou criar o CAR."
                onClick={() => onChoose("agricultor")}
              />
              <ProfileCard
                icon="fa-handshake"
                title="Sou parceiro CAR"
                description="Entrar no portal para buscar produtores, acompanhar mapa e instalar o widget no site."
                onClick={() => onChoose("parceiro")}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ProfileCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        minHeight: 132,
        border: "1px solid rgba(15,23,42,0.08)",
        borderRadius: 18,
        background: "#fff",
        padding: 20,
        textAlign: "left",
        display: "grid",
        gridTemplateColumns: "58px 1fr",
        alignItems: "center",
        gap: 16,
        boxShadow: "0 18px 38px rgba(15,23,42,0.08)",
        cursor: "pointer",
      }}
    >
      <span
        style={{
          width: 58,
          height: 58,
          borderRadius: "50%",
          background: "#e0f2fe",
          color: "#1351b4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
        }}
      >
        <i className={`fas ${icon}`} aria-hidden="true" />
      </span>
      <span>
        <strong style={{ display: "block", fontSize: 22, lineHeight: 1.2, color: "#1f2937" }}>
          {title}
        </strong>
        <span
          style={{
            display: "block",
            color: "#4b5563",
            fontSize: 14,
            lineHeight: 1.45,
            marginTop: 6,
          }}
        >
          {description}
        </span>
      </span>
    </button>
  );
}

function FarmerHub() {
  const [panel, setPanel] = useState<FarmerPanel>(null);

  return (
    <main className="container-lg" style={{ padding: "42px 16px 96px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <section style={{ ...heroCardStyle, marginBottom: 24 }}>
          <span style={eyebrowStyle}>Experiência do agricultor</span>
          <h1
            style={{ margin: "10px 0 8px", fontSize: "clamp(30px, 4vw, 48px)", color: "#0f172a" }}
          >
            Conferir CAR e avançar para crédito rural sem perder contexto.
          </h1>
          <p style={{ ...mutedTextStyle, maxWidth: 720 }}>
            O produtor escolhe uma necessidade e recebe um caminho guiado. CPF fica sinalizado como
            fluxo com autenticação Gov.br; localização, mapa e número do CAR simulam consultas
            públicas.
          </p>
        </section>
        <div style={surfaceStyle}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: 16,
            }}
          >
            <HubButton
              title="CPF Exige Login GOV.BR"
              icon="fa-id-card"
              onClick={() => setPanel("cpf")}
            />
            <HubButton
              title="Envie sua localização"
              icon="fa-location-arrow"
              onClick={() => setPanel("localizacao")}
            />
            <HubButton title="Número do CAR" icon="fa-hashtag" onClick={() => setPanel("car")} />
            <HubButton title="Encontre no Mapa" icon="fa-map" onClick={() => setPanel("mapa")} />
            <HubButton
              title="Não Tenho CAR"
              icon="fa-file-signature"
              onClick={() => setPanel("novo")}
            />
          </div>
          <div style={{ marginTop: 28 }}>
            {!panel && <EmptyFarmerState />}
            {panel === "cpf" && <CpfStatusPanel />}
            {panel === "localizacao" && <LocationPanel />}
            {panel === "car" && <CarNumberPanel />}
            {panel === "mapa" && <MapPanel audience="agricultor" />}
            {panel === "novo" && <NewCarPanel />}
          </div>
        </div>
      </div>
    </main>
  );
}

function HubButton({ title, icon, onClick }: { title: string; icon: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: "1px solid rgba(15,23,42,0.08)",
        borderRadius: 16,
        background: "#fff",
        minHeight: 128,
        padding: 18,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 10,
        color: "#1f2937",
        fontWeight: 800,
        fontSize: 18,
        lineHeight: 1.2,
        boxShadow: "0 14px 34px rgba(15,23,42,0.06)",
        cursor: "pointer",
      }}
    >
      <span style={miniIconStyle}>
        <i className={`fas ${icon}`} aria-hidden="true" />
      </span>
      {title}
    </button>
  );
}

function EmptyFarmerState() {
  return (
    <div style={panelStyle}>
      <strong>Escolha uma solução acima.</strong>
      <p style={mutedTextStyle}>
        O hub foi desenhado para deixar claro quais consultas exigem autenticação Gov.br e quais
        podem usar dados públicos regionais.
      </p>
    </div>
  );
}

function CpfStatusPanel() {
  const [cpf, setCpf] = useState("107.282.101-00");
  const [submittedCpf, setSubmittedCpf] = useState<string | null>(null);
  const { data, isFetching, error } = useDiagnostico(submittedCpf);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedCpf(cpf);
  }

  return (
    <div style={panelStyle}>
      <div style={govLoginBadgeStyle}>
        <i className="fas fa-lock" aria-hidden="true" />
        Consulta por CPF exige login Gov.br ou contexto autorizado.
      </div>
      <form onSubmit={submit} style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
        <input
          value={cpf}
          onChange={(event) => setCpf(event.target.value)}
          style={inputStyle}
          placeholder="Digite o CPF"
        />
        <button type="submit" style={primaryButtonStyle} disabled={isFetching}>
          {isFetching ? "Consultando..." : "Consultar CPF"}
        </button>
      </form>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        {DEMO_CPFS.map((item) => (
          <button key={item.cpf} type="button" style={chipStyle} onClick={() => setCpf(item.cpf)}>
            {item.label}: {item.cpf}
          </button>
        ))}
      </div>
      {error && (
        <p style={{ ...mutedTextStyle, color: "#b71c1c" }}>CPF inválido ou não encontrado.</p>
      )}
      {data && <DiagnosticSummary data={data} />}
    </div>
  );
}

function DiagnosticSummary({ data }: { data: DiagnosticoResult }) {
  if (!data.sicar) {
    return <p style={mutedTextStyle}>Nenhum CAR demonstrativo encontrado para este CPF.</p>;
  }

  return (
    <div style={resultCardStyle}>
      <strong>{data.sicar.nome_imovel}</strong>
      <p style={mutedTextStyle}>
        CAR {data.sicar.codigo_car} · {data.sicar.status} · risco {data.nivel_risco}
      </p>
      {data.sicar.pendencias.length > 0 && (
        <ul style={{ margin: "8px 0 0", paddingLeft: 18, color: "#374151" }}>
          {data.sicar.pendencias.map((pendencia) => (
            <li key={pendencia}>{pendencia}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LocationPanel() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LocationResult | null>(null);

  async function simulateDemoLocation() {
    setLoading(true);
    try {
      const response = await fetch("/api/localizacao/car", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: {
            latitude: -16.0672,
            longitude: -57.6814,
            name: "Localização compartilhada",
            address: "Cáceres - MT",
          },
        }),
      });
      setResult((await response.json()) as LocationResult);
    } finally {
      setLoading(false);
    }
  }

  function useNativeLocation() {
    if (!navigator.geolocation) {
      void simulateDemoLocation();
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch("/api/localizacao/car", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              location: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                name: "Localização do dispositivo",
              },
            }),
          });
          setResult((await response.json()) as LocationResult);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        void simulateDemoLocation();
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div style={panelStyle}>
      <strong>Envie sua localização</strong>
      <p style={mutedTextStyle}>
        O sistema identifica município/UF, encontra o código IBGE (Instituto Brasileiro de Geografia
        e Estatística) e consulta o município na API (Interface de Programação de Aplicações)
        pública do SICAR (Sistema de Cadastro Ambiental Rural).
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          style={primaryButtonStyle}
          onClick={useNativeLocation}
          disabled={loading}
        >
          {loading ? "Consultando..." : "Usar localização do dispositivo"}
        </button>
        <button
          type="button"
          style={secondaryButtonStyle}
          onClick={simulateDemoLocation}
          disabled={loading}
        >
          Simular Cáceres/MT
        </button>
      </div>
      {result && (
        <div style={resultCardStyle}>
          <strong>{result.mensagem}</strong>
          <p style={mutedTextStyle}>
            {result.municipio_localizacao?.nome}/{result.municipio_localizacao?.uf} · IBGE
            (Instituto Brasileiro de Geografia e Estatística) {result.municipio_localizacao?.ibge}
          </p>
        </div>
      )}
    </div>
  );
}

function CarNumberPanel() {
  const [code, setCode] = useState("MT-5102504-A4B2C1D8E3F5");
  const [record, setRecord] = useState<SicarRecord | null | undefined>(undefined);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRecord(await fetchSicarByCodigo(code));
  }

  return (
    <div style={panelStyle}>
      <strong>Número do CAR</strong>
      <p style={mutedTextStyle}>Busque um CAR demonstrativo pelo código do imóvel.</p>
      <form onSubmit={submit} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input value={code} onChange={(event) => setCode(event.target.value)} style={inputStyle} />
        <button type="submit" style={primaryButtonStyle}>
          Buscar CAR
        </button>
      </form>
      {record === null && (
        <p style={mutedTextStyle}>Código não encontrado nos registros demonstrativos.</p>
      )}
      {record && (
        <div style={resultCardStyle}>
          <strong>{record.nome_imovel}</strong>
          <p style={mutedTextStyle}>
            {record.codigo_car} · {record.status} · {record.nome_municipio}/{record.uf}
          </p>
        </div>
      )}
    </div>
  );
}

function MapPanel({ audience }: { audience: "agricultor" | "parceiro" }) {
  return (
    <div style={panelStyle}>
      <strong>{audience === "agricultor" ? "Encontre no mapa" : "Mapa de atendimentos"}</strong>
      <div
        style={{
          height: 260,
          marginTop: 14,
          border: "1px solid #111827",
          background:
            "linear-gradient(135deg, rgba(19,81,180,0.12), rgba(22,136,33,0.12)), repeating-linear-gradient(45deg, transparent 0 22px, rgba(15,23,42,0.04) 22px 24px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#1f2937",
          fontWeight: 800,
          fontSize: 22,
        }}
      >
        mapa · Cáceres/MT · SICAR (Sistema de Cadastro Ambiental Rural) público
      </div>
    </div>
  );
}

function NewCarPanel() {
  return (
    <div style={panelStyle}>
      <strong>Não tenho CAR</strong>
      <p style={mutedTextStyle}>
        O assistente encaminha o agricultor para o cadastro oficial e recomenda apoio técnico quando
        houver dúvida sobre documentação ou desenho do imóvel.
      </p>
      <a href="https://www.car.gov.br/#/" target="_blank" rel="noreferrer" style={primaryLinkStyle}>
        Abrir cadastro oficial do CAR
      </a>
    </div>
  );
}

function PartnerFlow() {
  const [logged, setLogged] = useState(false);
  const [institution, setInstitution] = useState(INSTITUTIONS[0]);
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (code.trim() && code.trim().toUpperCase() !== "DEMO2026") {
      setError(true);
      return;
    }
    setLogged(true);
  }

  if (logged) return <PartnerDashboard institution={institution} />;

  return (
    <main className="container-lg" style={{ padding: "56px 16px 88px" }}>
      <div style={{ width: "100%", maxWidth: 560, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 32 }}>
          {["Solicitação", "Aprovação", "Acesso"].map((label, index) => (
            <div
              key={label}
              style={{ display: "flex", alignItems: "center", flex: index < 2 ? 1 : 0 }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: index < 2 ? "#168821" : "#1351b4",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                  }}
                >
                  {index < 2 ? <i className="fas fa-check" aria-hidden="true" /> : index + 1}
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: index < 2 ? "#168821" : "#1351b4",
                    fontWeight: 800,
                  }}
                >
                  {label}
                </span>
              </div>
              {index < 2 && (
                <div style={{ flex: 1, height: 2, background: "#168821", margin: "0 12px 16px" }} />
              )}
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={partnerIconStyle}>
            <i className="fas fa-handshake" aria-hidden="true" />
          </div>
          <h1 style={{ color: "#111827", fontSize: 28, margin: "16px 0 6px" }}>
            Portal do Parceiro
          </h1>
          <p style={mutedTextStyle}>Insira o código recebido por e-mail para acessar</p>
        </div>
        <form
          onSubmit={login}
          style={{ ...surfaceStyle, display: "flex", flexDirection: "column", gap: 18 }}
        >
          <label style={labelStyle}>
            Instituição
            <select
              value={institution}
              onChange={(event) => setInstitution(event.target.value)}
              style={inputStyle}
            >
              {INSTITUTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label style={labelStyle}>
            Código de acesso
            <input
              value={code}
              onChange={(event) => {
                setCode(event.target.value);
                setError(false);
              }}
              placeholder="DEMO2026"
              style={{ ...inputStyle, borderColor: error ? "#b71c1c" : "#d1d5db" }}
            />
            <span style={{ color: error ? "#b71c1c" : "#6b7280", fontSize: 13 }}>
              {error
                ? "Código inválido. Use DEMO2026."
                : "Demonstração: deixe em branco ou use DEMO2026"}
            </span>
          </label>
          <button type="submit" style={{ ...primaryButtonStyle, justifyContent: "center" }}>
            <i className="fas fa-sign-in-alt" aria-hidden="true" />
            Acessar portal
          </button>
        </form>
      </div>
    </main>
  );
}

function PartnerDashboard({ institution }: { institution: string }) {
  const [cpf, setCpf] = useState("107.282.101-00");
  const [submittedCpf, setSubmittedCpf] = useState<string | null>(null);
  const [showWidget, setShowWidget] = useState(false);
  const { data, isFetching } = useDiagnostico(submittedCpf);

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedCpf(cpf);
  }

  const widgetSnippet = useMemo(
    () =>
      `<script src="https://carproativo.gov.br/widget.js" data-parceiro="${institution}"></script>`,
    [institution],
  );

  return (
    <main className="container-lg" style={{ padding: "42px 16px 96px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <section style={{ ...heroCardStyle, marginBottom: 24 }}>
          <span style={eyebrowStyle}>Portal do parceiro</span>
          <h1
            style={{ margin: "10px 0 8px", fontSize: "clamp(30px, 4vw, 48px)", color: "#0f172a" }}
          >
            Consultas, mapa e widget para atendimento distribuído.
          </h1>
          <p style={{ ...mutedTextStyle, maxWidth: 720 }}>
            {institution} acessa uma visão operacional para buscar CPF (Cadastro de Pessoas Físicas)
            em contexto autorizado, visualizar território atendido e gerar um ponto de entrada para
            o site institucional.
          </p>
        </section>
        <div style={surfaceStyle}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
              gap: 18,
              alignItems: "start",
            }}
          >
            <div style={panelStyle}>
              <strong style={{ display: "block", marginBottom: 12 }}>Buscar produtor</strong>
              <form onSubmit={search} style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <input
                  value={cpf}
                  onChange={(event) => setCpf(event.target.value)}
                  style={inputStyle}
                />
                <button type="submit" style={primaryButtonStyle}>
                  {isFetching ? "..." : "Buscar por CPF"}
                </button>
              </form>
              {data && <DiagnosticSummary data={data} />}
            </div>
            <div style={panelStyle}>
              <strong style={{ display: "block", marginBottom: 12 }}>
                Widget para site parceiro
              </strong>
              <button
                type="button"
                onClick={() => setShowWidget((value) => !value)}
                style={{
                  ...primaryButtonStyle,
                  width: "100%",
                  minHeight: 72,
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                <i className="fas fa-code" aria-hidden="true" />
                Adicionar Widget no site
              </button>
              {showWidget && <pre style={codeBlockStyle}>{widgetSnippet}</pre>}
            </div>
          </div>
          <MapPanel audience="parceiro" />
        </div>
      </div>
    </main>
  );
}

const navPillStyle = {
  color: "#111827",
  textDecoration: "none",
  border: "1px solid rgba(15,23,42,0.12)",
  borderRadius: 999,
  padding: "8px 12px",
  background: "#fff",
  fontWeight: 800,
  fontSize: 13,
} as const;

const eyebrowStyle = {
  display: "inline-flex",
  alignItems: "center",
  width: "fit-content",
  borderRadius: 999,
  background: "#dcfce7",
  color: "#168821",
  padding: "7px 12px",
  fontWeight: 900,
  fontSize: 13,
} as const;

const heroCardStyle = {
  background: "rgba(255,255,255,0.86)",
  border: "1px solid rgba(15,23,42,0.08)",
  borderRadius: 24,
  padding: 28,
  boxShadow: "0 24px 70px rgba(15,23,42,0.10)",
} as const;

const surfaceStyle = {
  background: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(15,23,42,0.08)",
  borderRadius: 24,
  padding: 28,
  boxShadow: "0 24px 70px rgba(15,23,42,0.08)",
} as const;

const panelStyle = {
  background: "#fff",
  border: "1px solid rgba(15,23,42,0.08)",
  borderRadius: 16,
  padding: 22,
  boxShadow: "0 12px 32px rgba(15,23,42,0.06)",
} as const;

const mutedTextStyle = {
  color: "#6b7280",
  lineHeight: 1.6,
  margin: "8px 0",
} as const;

const govLoginBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  color: "#1351b4",
  background: "#e0f2fe",
  borderRadius: 999,
  padding: "6px 12px",
  fontWeight: 800,
  fontSize: 13,
} as const;

const inputStyle = {
  flex: 1,
  minWidth: 220,
  border: "1px solid #d1d5db",
  borderRadius: 6,
  padding: "10px 12px",
  background: "#fff",
  color: "#1f2937",
} as const;

const primaryButtonStyle = {
  border: 0,
  borderRadius: 6,
  background: "#1351b4",
  color: "#fff",
  padding: "10px 16px",
  fontWeight: 800,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  textDecoration: "none",
} as const;

const secondaryButtonStyle = {
  border: "1px solid rgba(15,23,42,0.14)",
  borderRadius: 6,
  background: "#f8fafc",
  color: "#1f2937",
  padding: "10px 16px",
  fontWeight: 800,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
} as const;

const miniIconStyle = {
  width: 42,
  height: 42,
  borderRadius: 14,
  background: "#e0f2fe",
  color: "#1351b4",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
} as const;

const chipStyle = {
  border: "1px solid #bfdbfe",
  borderRadius: 999,
  background: "#fff",
  color: "#1351b4",
  padding: "6px 10px",
  fontSize: 13,
  fontWeight: 800,
} as const;

const resultCardStyle = {
  marginTop: 16,
  border: "1px solid #bbf7d0",
  background: "#f0fdf4",
  borderRadius: 8,
  padding: 16,
} as const;

const primaryLinkStyle = {
  ...primaryButtonStyle,
  width: "fit-content",
} as const;

const labelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  color: "#374151",
  fontWeight: 800,
} as const;

const partnerIconStyle = {
  width: 76,
  height: 76,
  borderRadius: "50%",
  background: "#d7e5ff",
  color: "#1351b4",
  margin: "0 auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 30,
} as const;

const codeBlockStyle = {
  margin: "14px 0 0",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  background: "#0f172a",
  color: "#dbeafe",
  borderRadius: 8,
  padding: 14,
  fontSize: 12,
} as const;
