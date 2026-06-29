import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import govBrLogo from "@/assets/govbr-logo.svg";
import carProativoLogo from "@/assets/leaf_Car_Proativo.png";

export const Route = createFileRoute("/localizacao")({
  head: () => ({
    meta: [
      { title: "Localização WhatsApp — CAR Proativo" },
      {
        name: "description",
        content:
          "Demonstração de consulta pública regional do CAR a partir de uma localização compartilhada pelo WhatsApp.",
      },
    ],
  }),
  component: LocalizacaoPage,
});

type ConsultaResult = {
  ok: boolean;
  input: { latitude: number; longitude: number; name?: string; address?: string } | null;
  municipio_localizacao: { ibge: string; nome: string; uf: string; nomeUf: string } | null;
  consulta_publica_sicar: {
    id: number;
    nome: string;
    estado: { id: string; nome: string; codigoIbge: number; area: number };
    moduloFiscal: number;
    area: number;
  } | null;
  fontes: Array<{
    nome: string;
    status: "ok" | "erro" | "nao_disponivel";
    descricao: string;
    dado_real: boolean;
  }>;
  mensagem: string;
};

const SAMPLE_PAYLOAD = {
  entry: [
    {
      changes: [
        {
          value: {
            messages: [
              {
                from: "5565999999999",
                type: "location",
                location: {
                  latitude: -16.0672,
                  longitude: -57.6814,
                  name: "Localizacao compartilhada",
                  address: "Caceres - MT",
                },
              },
            ],
          },
        },
      ],
    },
  ],
};

function LocalizacaoPage() {
  const [payload, setPayload] = useState(() => JSON.stringify(SAMPLE_PAYLOAD, null, 2));
  const [result, setResult] = useState<ConsultaResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const status = useMemo(() => {
    if (loading) return { label: "Consultando", color: "#e65100", icon: "fa-spinner fa-spin" };
    if (result?.ok)
      return { label: "Consulta concluída", color: "#2e7d32", icon: "fa-check-circle" };
    if (error || result)
      return { label: "Ajuste necessário", color: "#b71c1c", icon: "fa-exclamation-triangle" };
    return { label: "Pronto para testar", color: "#1351b4", icon: "fa-map-marker-alt" };
  }, [error, loading, result]);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const body = JSON.parse(payload) as unknown;
      const response = await fetch("/api/localizacao/car", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await response.json()) as ConsultaResult;
      setResult(data);
      if (!response.ok) setError(data.mensagem || "A consulta não retornou sucesso.");
    } catch (err) {
      setError(
        err instanceof SyntaxError
          ? "O payload precisa ser JSON válido."
          : "Falha ao consultar o endpoint.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-secondary-01)" }}>
      <LocalizacaoNav />
      <main>
        <section className="section-dark" style={{ padding: "48px 0 40px" }}>
          <div className="container-lg">
            <span className="section-label">Demonstração WhatsApp</span>
            <div className="row align-items-end">
              <div className="col-md-8">
                <h1
                  className="mt-3 text-weight-bold"
                  style={{
                    color: "var(--pure-0)",
                    fontSize: "clamp(2rem, 4vw, 3rem)",
                    lineHeight: 1.12,
                  }}
                >
                  Localização compartilhada vira consulta pública regional do CAR.
                </h1>
                <p
                  className="mt-4"
                  style={{
                    color: "rgba(255,255,255,0.82)",
                    fontSize: "var(--font-size-scale-up-01)",
                    lineHeight: 1.7,
                    maxWidth: 720,
                  }}
                >
                  A API recebe o payload de localização do WhatsApp, identifica município/UF,
                  encontra o código IBGE e consulta o endpoint público de municípios do SICAR.
                </p>
              </div>
              <div className="col-md-4 mt-4 mt-md-0">
                <div
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.16)",
                    borderRadius: 8,
                    padding: 18,
                  }}
                >
                  <div className="d-flex align-items-center" style={{ gap: 10 }}>
                    <i
                      className={`fas ${status.icon}`}
                      style={{ color: status.color }}
                      aria-hidden="true"
                    />
                    <strong style={{ color: "#fff" }}>{status.label}</strong>
                  </div>
                  <code
                    style={{
                      display: "block",
                      marginTop: 12,
                      color: "#d7e5ff",
                      fontSize: 13,
                      whiteSpace: "normal",
                    }}
                  >
                    POST /api/localizacao/car
                  </code>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: "40px 0 56px" }}>
          <div className="container-lg">
            <div className="row">
              <div className="col-lg-6 mb-4 mb-lg-0">
                <div className="br-card" style={{ borderRadius: 8, height: "100%" }}>
                  <div className="card-header">
                    <div
                      className="d-flex align-items-center justify-content-between"
                      style={{ gap: 12 }}
                    >
                      <div>
                        <h2
                          style={{
                            margin: 0,
                            fontSize: "1.2rem",
                            color: "var(--color-secondary-09)",
                          }}
                        >
                          Payload do WhatsApp
                        </h2>
                        <p
                          style={{
                            margin: "4px 0 0",
                            color: "var(--color-secondary-06)",
                            fontSize: 13,
                          }}
                        >
                          Edite latitude/longitude ou cole um webhook real.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="br-button secondary small"
                        style={{ borderRadius: 999 }}
                        onClick={() => {
                          setPayload(JSON.stringify(SAMPLE_PAYLOAD, null, 2));
                          setError(null);
                          setResult(null);
                        }}
                      >
                        Resetar
                      </button>
                    </div>
                  </div>
                  <div className="card-content">
                    <textarea
                      value={payload}
                      onChange={(event) => setPayload(event.target.value)}
                      spellCheck={false}
                      aria-label="Payload JSON da consulta por localização"
                      style={{
                        width: "100%",
                        minHeight: 430,
                        resize: "vertical",
                        border: "1px solid var(--color-secondary-04)",
                        borderRadius: 8,
                        padding: 14,
                        fontFamily: "monospace",
                        fontSize: 13,
                        lineHeight: 1.55,
                        color: "var(--color-secondary-09)",
                        background: "#fff",
                      }}
                    />
                    <button
                      type="button"
                      className="br-button primary large mt-3"
                      style={{ width: "100%", justifyContent: "center", borderRadius: 8 }}
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      <i
                        className={`fas ${loading ? "fa-spinner fa-spin" : "fa-search-location"} mr-2`}
                        aria-hidden="true"
                      />
                      Consultar região no CAR público
                    </button>
                    {error && (
                      <div
                        className="mt-3"
                        style={{
                          border: "1px solid #f2b8b5",
                          background: "#fce4ec",
                          color: "#8c1d18",
                          borderRadius: 8,
                          padding: 12,
                          fontSize: 14,
                        }}
                      >
                        {error}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <ResultPanel result={result} />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function LocalizacaoNav() {
  return (
    <header
      className="br-header"
      style={{
        background: "#fff",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        borderBottom: "1px solid var(--color-secondary-03)",
      }}
    >
      <div className="container-lg">
        <div
          style={{
            height: 72,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <Link
            to="/"
            style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}
          >
            <img src={govBrLogo} alt="Governo Federal" style={{ height: 32 }} />
            <span
              style={{
                margin: "0 12px",
                borderLeft: "1px solid var(--color-secondary-03)",
                height: 24,
              }}
            />
            <img src={carProativoLogo} alt="CAR Proativo" style={{ height: 28 }} />
          </Link>
          <nav className="d-flex" style={{ gap: 8 }}>
            <Link to="/wiki" className="br-button secondary small" style={{ borderRadius: 999 }}>
              Wiki
            </Link>
            <Link to="/demo" className="br-button primary small" style={{ borderRadius: 999 }}>
              Demo
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

function ResultPanel({ result }: { result: ConsultaResult | null }) {
  if (!result) {
    return (
      <div className="br-card" style={{ borderRadius: 8, height: "100%" }}>
        <div
          className="card-content"
          style={{
            minHeight: 560,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: 340 }}>
            <i
              className="fas fa-location-arrow"
              style={{ fontSize: 42, color: "var(--color-primary-default)" }}
              aria-hidden="true"
            />
            <h2
              style={{
                color: "var(--color-secondary-09)",
                fontSize: "1.2rem",
                margin: "18px 0 8px",
              }}
            >
              Resultado aparece aqui
            </h2>
            <p style={{ color: "var(--color-secondary-07)", lineHeight: 1.7, margin: 0 }}>
              Execute a consulta para ver município identificado, código IBGE, dados públicos do
              SICAR e fontes usadas.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="br-card" style={{ borderRadius: 8, height: "100%" }}>
      <div className="card-header">
        <h2 style={{ margin: 0, fontSize: "1.2rem", color: "var(--color-secondary-09)" }}>
          Resposta da consulta pública
        </h2>
      </div>
      <div className="card-content">
        <div
          style={{
            borderRadius: 8,
            background: result.ok ? "#e8f5e9" : "#fff8dc",
            border: result.ok ? "1px solid #a5d6a7" : "1px solid #f2d675",
            padding: 14,
            color: result.ok ? "#1b5e20" : "#5f4100",
            lineHeight: 1.6,
          }}
        >
          {result.mensagem}
        </div>

        <div className="row mt-4">
          <InfoBox
            title="Localização"
            icon="fa-map-marker-alt"
            value={
              result.municipio_localizacao
                ? `${result.municipio_localizacao.nome}/${result.municipio_localizacao.uf}`
                : "Não identificada"
            }
            detail={
              result.municipio_localizacao
                ? `IBGE ${result.municipio_localizacao.ibge}`
                : "Sem código IBGE"
            }
          />
          <InfoBox
            title="SICAR público"
            icon="fa-leaf"
            value={result.consulta_publica_sicar?.nome ?? "Sem retorno"}
            detail={
              result.consulta_publica_sicar
                ? `Módulo fiscal ${result.consulta_publica_sicar.moduloFiscal}`
                : "API pública não retornou município"
            }
          />
        </div>

        <div className="mt-4">
          <h3 style={{ fontSize: "1rem", color: "var(--color-secondary-09)", margin: "0 0 12px" }}>
            Fontes usadas
          </h3>
          {result.fontes.map((fonte) => (
            <div
              key={fonte.nome}
              className="d-flex align-items-start mb-3"
              style={{
                gap: 10,
                borderBottom: "1px solid var(--color-secondary-03)",
                paddingBottom: 12,
              }}
            >
              <i
                className={`fas ${fonte.status === "ok" ? "fa-check-circle" : "fa-exclamation-circle"}`}
                style={{ color: fonte.status === "ok" ? "#2e7d32" : "#b71c1c", marginTop: 3 }}
                aria-hidden="true"
              />
              <div>
                <strong style={{ display: "block", color: "var(--color-secondary-09)" }}>
                  {fonte.nome}
                </strong>
                <span style={{ color: "var(--color-secondary-07)", fontSize: 14, lineHeight: 1.6 }}>
                  {fonte.descricao}
                </span>
              </div>
            </div>
          ))}
        </div>

        <pre
          className="mt-4"
          style={{
            margin: 0,
            background: "#071d41",
            color: "#d7e5ff",
            borderRadius: 8,
            padding: 16,
            fontFamily: "monospace",
            fontSize: 12,
            lineHeight: 1.55,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            maxHeight: 260,
            overflow: "auto",
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    </div>
  );
}

function InfoBox({
  title,
  icon,
  value,
  detail,
}: {
  title: string;
  icon: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="col-md-6 mb-3">
      <div
        style={{
          border: "1px solid var(--color-secondary-03)",
          borderRadius: 8,
          padding: 14,
          height: "100%",
          background: "#fff",
        }}
      >
        <div className="d-flex align-items-center mb-2" style={{ gap: 8 }}>
          <i
            className={`fas ${icon}`}
            style={{ color: "var(--color-primary-default)" }}
            aria-hidden="true"
          />
          <span
            style={{
              color: "var(--color-secondary-06)",
              fontSize: 12,
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            {title}
          </span>
        </div>
        <strong
          style={{ display: "block", color: "var(--color-secondary-09)", fontSize: "1.05rem" }}
        >
          {value}
        </strong>
        <span style={{ color: "var(--color-secondary-07)", fontSize: 13 }}>{detail}</span>
      </div>
    </div>
  );
}
