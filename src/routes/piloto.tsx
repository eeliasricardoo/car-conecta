import { createFileRoute, Link } from "@tanstack/react-router";
import govBrLogo from "@/assets/govbr-logo.svg";
import { useState, useEffect } from "react";
import { useDiagnostico } from "../hooks/use-diagnostico";
import type { DiagnosticoResult } from "../lib/services/diagnostico-engine";

export const Route = createFileRoute("/piloto")({
  head: () => ({
    meta: [
      { title: "Demonstração — CAR Proativo" },
      {
        name: "description",
        content:
          "Demonstração interativa do CAR Proativo: motor de diagnóstico, API e fluxo de resolução em 5 telas.",
      },
    ],
  }),
  component: PilotoPage,
});

// ── Demo CPFs (válidos pelo algoritmo oficial) ────────────────────────────────

// CPFs reais do ambiente de testes haCARthon (car-sus.dataprev.gov.br)
const DEMO_CPFS = [
  { cpf: "107.282.101-00", label: "Usuário 1 · pendente", hint: "Env. testes SICAR" },
  { cpf: "287.016.154-91", label: "Usuário 2 · sobreposição", hint: "Env. testes SICAR" },
  { cpf: "111.222.333-96", label: "Demo · regular", hint: "Dados exemplo" },
];

const STATUS_COLOR: Record<string, string> = {
  regular: "#2e7d32",
  pendente: "#e65100",
  sobreposicao: "#b71c1c",
  cancelado: "#37474f",
  nao_encontrado: "#37474f",
};

const STATUS_ICON: Record<string, string> = {
  regular: "fa-check-circle",
  pendente: "fa-exclamation-triangle",
  sobreposicao: "fa-times-circle",
  cancelado: "fa-ban",
  nao_encontrado: "fa-question-circle",
};

const STATUS_LABEL: Record<string, string> = {
  regular: "regular",
  pendente: "pendente",
  sobreposicao: "sobreposição",
  cancelado: "cancelado",
  nao_encontrado: "não encontrado",
};

// ── Page ─────────────────────────────────────────────────────────────────────

function PilotoPage() {
  const [activeTab, setActiveTab] = useState<"motor" | "api" | "fluxo">("motor");
  const [diagnostico, setDiagnostico] = useState<DiagnosticoResult | null>(null);

  return (
    <div>
      <PilotoNav />

      {/* Page hero — mesmo padrão da seção Problem da home */}
      <section className="section-dark" style={{ padding: "48px 0 40px" }}>
        <div className="container-lg">
          <span className="section-label">Demonstração interativa</span>
          <h1
            className="mt-3 text-weight-bold"
            style={{
              fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
              color: "var(--pure-0)",
              lineHeight: 1.15,
            }}
          >
            CAR Proativo em funcionamento
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.8)",
              marginTop: 12,
              maxWidth: 560,
              lineHeight: 1.7,
              fontSize: "var(--font-size-scale-up-01)",
            }}
          >
            Simule o motor de diagnóstico, veja a resposta da API e percorra o
            fluxo de resolução como o produtor veria no celular.
          </p>

          {/* Tab strip */}
          <div className="mt-5 d-flex flex-wrap" style={{ gap: 8 }}>
            {(["motor", "api", "fluxo"] as const).map((t) => {
              const labels = {
                motor: "01 · Motor de diagnóstico",
                api: "02 · API de diagnóstico",
                fluxo: "03 · Fluxo de resolução",
              };
              const active = activeTab === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTab(t)}
                  style={{
                    background: active
                      ? "var(--warning, #ffcd07)"
                      : "rgba(255,255,255,0.1)",
                    color: active
                      ? "var(--color-primary-darken-02)"
                      : "rgba(255,255,255,0.75)",
                    border: "none",
                    borderRadius: 999,
                    padding: "8px 20px",
                    fontWeight: active ? 700 : 500,
                    fontSize: "var(--font-size-scale-down-01)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {labels[t]}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tab content */}
      <div style={{ background: "#fff" }}>
        {activeTab === "motor" && (
          <DiagnosticEngine
            onResult={setDiagnostico}
            onGoToApi={() => setActiveTab("api")}
            onGoToFluxo={() => setActiveTab("fluxo")}
          />
        )}
        {activeTab === "api" && <ApiDemo diagnostico={diagnostico} />}
        {activeTab === "fluxo" && <ResolutionFlow diagnostico={diagnostico} />}
      </div>

      <PilotoFooter />
    </div>
  );
}

// ── Nav ──────────────────────────────────────────────────────────────────────

function PilotoNav() {
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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: 72,
            gap: 16,
          }}
        >
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              textDecoration: "none",
            }}
          >
            <img src={govBrLogo} alt="Governo Federal" style={{ height: 32 }} />
            <span
              className="br-divider vertical mx-3"
              style={{
                height: 24,
                borderLeft: "1px solid var(--color-secondary-03)",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span
                style={{
                  fontWeight: "bold",
                  color: "var(--color-secondary-09)",
                  fontSize: "1.1rem",
                }}
              >
                CAR
              </span>
              <span
                style={{
                  fontStyle: "italic",
                  color: "var(--color-primary-default)",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                }}
              >
                Proativo
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="br-button secondary small"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              borderRadius: 999,
            }}
          >
            <i
              className="fas fa-arrow-left"
              aria-hidden="true"
              style={{ fontSize: 12 }}
            />
            Voltar à apresentação
          </Link>
        </div>
      </div>
    </header>
  );
}

// ── 01 · Motor de diagnóstico ────────────────────────────────────────────────

function DiagnosticEngine({
  onResult,
  onGoToApi,
  onGoToFluxo,
}: {
  onResult: (d: DiagnosticoResult | null) => void;
  onGoToApi: () => void;
  onGoToFluxo: () => void;
}) {
  const [cpf, setCpf] = useState("");
  const [submittedCpf, setSubmittedCpf] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useDiagnostico(submittedCpf);

  useEffect(() => {
    if (data) onResult(data);
  }, [data]);

  function handleSearch() {
    setSubmittedCpf(cpf.trim());
  }

  return (
    <>
      {/* Section intro — fundo branco */}
      <section className="py-5">
        <div className="container-lg">
          <div className="py-4">
            <SectionEyebrow icon="fa-brain" number="01" title="Motor de diagnóstico" />
            <p
              style={{
                color: "var(--color-secondary-07)",
                marginTop: 8,
                maxWidth: 560,
                lineHeight: 1.7,
              }}
            >
              Simule uma consulta ao motor. Digite um CPF de teste para ver o
              diagnóstico gerado a partir do cruzamento de quatro bases de dados.
            </p>
          </div>

          {/* CPF hints */}
          <div
            className="br-card mb-4"
            style={{
              border: "1px solid var(--color-info-default, #155bcb)",
              background: "var(--color-info-pastel, #dce9f9)",
            }}
          >
            <div className="card-content py-3">
              <p
                style={{
                  margin: "0 0 10px",
                  fontSize: "var(--font-size-scale-down-01)",
                  color: "var(--color-info-default, #155bcb)",
                  fontWeight: 700,
                }}
              >
                <i className="fas fa-info-circle mr-2" aria-hidden="true" />
                CPFs de demonstração (clique para preencher)
              </p>
              <div className="d-flex flex-wrap" style={{ gap: 8 }}>
                {DEMO_CPFS.map(({ cpf: c, label, hint }) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCpf(c)}
                    style={{
                      background: "rgba(21,91,203,0.1)",
                      border: "1px solid rgba(21,91,203,0.3)",
                      borderRadius: 6,
                      padding: "4px 12px",
                      fontSize: "var(--font-size-scale-down-02)",
                      color: "var(--color-info-default, #155bcb)",
                      cursor: "pointer",
                      fontFamily: "monospace",
                      textAlign: "left",
                    }}
                  >
                    {c} · {label}
                    <span style={{ display: "block", fontSize: 10, opacity: 0.6, fontFamily: "sans-serif" }}>{hint}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="br-card mb-5">
            <div className="card-content">
              <label
                htmlFor="cpf-input"
                style={{
                  fontWeight: 700,
                  color: "var(--color-secondary-08)",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                CPF do produtor rural
              </label>
              <div className="d-flex flex-wrap" style={{ gap: 12 }}>
                <div className="br-input" style={{ flex: 1, minWidth: 240 }}>
                  <input
                    id="cpf-input"
                    className="input"
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && cpf && handleSearch()
                    }
                    style={{ fontFamily: "monospace", fontSize: "1rem" }}
                  />
                </div>
                <button
                  type="button"
                  className="br-button primary"
                  disabled={!cpf || isLoading}
                  onClick={handleSearch}
                  style={{ borderRadius: 6, minWidth: 160 }}
                >
                  <i className="fas fa-search mr-2" aria-hidden="true" />
                  Consultar motor
                </button>
              </div>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="br-card mb-5">
              <div className="card-content">
                <p style={{ fontWeight: 700, color: "var(--color-secondary-08)", marginBottom: 20 }}>
                  <i className="fas fa-cog fa-spin mr-2" style={{ color: "var(--color-primary-default)" }} aria-hidden="true" />
                  Analisando fontes de dados…
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { icon: "fa-database", label: "Consultando SICAR…" },
                    { icon: "fa-map", label: "Cruzando com INCRA…" },
                    { icon: "fa-satellite", label: "Verificando MapBiomas…" },
                    { icon: "fa-id-card", label: "Conferindo Receita Federal…" },
                    { icon: "fa-globe", label: "Enriquecendo com IBGE…" },
                  ].map((s) => (
                    <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 12, opacity: 0.6 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--color-secondary-03)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <i className={`fas ${s.icon}`} style={{ color: "var(--color-secondary-06)", fontSize: 13 }} aria-hidden="true" />
                      </div>
                      <span style={{ color: "var(--color-secondary-05)", fontSize: "var(--font-size-scale-down-01)" }}>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="br-card mb-5" style={{ border: "1px solid #b71c1c", background: "#ffebee" }}>
              <div className="card-content d-flex align-items-start" style={{ gap: 14 }}>
                <i className="fas fa-times-circle" style={{ color: "#b71c1c", fontSize: 22, flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                <div>
                  <p style={{ fontWeight: 700, color: "#b71c1c", margin: "0 0 4px" }}>Erro na consulta</p>
                  <p style={{ color: "#c62828", margin: 0, fontSize: "var(--font-size-scale-down-01)" }}>
                    {(error as Error)?.message ?? "Erro desconhecido. Verifique o CPF e tente novamente."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Not found */}
          {data && !data.encontrado && (
            <div className="br-card mb-5" style={{ border: "1px solid var(--color-secondary-04)" }}>
              <div className="card-content text-center py-5">
                <i className="fas fa-user-slash" style={{ fontSize: 40, color: "var(--color-secondary-05)" }} aria-hidden="true" />
                <p className="mt-3" style={{ color: "var(--color-secondary-07)" }}>
                  CPF não encontrado na base de demonstração.
                  <br />
                  Use um dos CPFs de teste listados acima.
                </p>
              </div>
            </div>
          )}

          {/* Result */}
          {data?.encontrado && data.sicar && (
            <DiagnosticResult
              diagnostico={data}
              onGoToApi={onGoToApi}
              onGoToFluxo={onGoToFluxo}
            />
          )}
        </div>
      </section>

      {/* Architecture strip — mesma cor do section-light da home */}
      <section className="section-light py-5">
        <div className="container-lg">
          <div className="py-4">
            <span
              className="section-label"
              style={{ color: "var(--color-primary-default)" }}
            >
              Arquitetura do motor
            </span>
            <h2
              className="mt-3 text-weight-bold"
              style={{
                fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                color: "var(--color-secondary-08)",
                maxWidth: 640,
                lineHeight: 1.2,
              }}
            >
              Uma camada de inteligência. Não uma base paralela.
            </h2>
          </div>

          <ol
            style={{
              listStyle: "none",
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-scale-2x)",
            }}
          >
            {[
              {
                icon: "fa-database",
                title: "SICAR",
                desc: "Base oficial com 7M+ cadastros.",
              },
              {
                icon: "fa-cogs",
                title: "Motor de diagnóstico",
                desc: "Classifica situação por imóvel e gera ação recomendada em linguagem simples.",
              },
              {
                icon: "fa-code",
                title: "API de diagnóstico",
                desc: "REST credenciada via convênio com o MMA. Retorna status + ação por CPF/CNPJ.",
              },
              {
                icon: "fa-handshake",
                title: "Parceiros",
                desc: "Bancos, cooperativas, tradings, EMATER, secretarias estaduais.",
              },
              {
                icon: "fa-comments",
                title: "Canal do produtor",
                desc: "WhatsApp, app do banco, e-mail — nenhum app novo para instalar.",
              },
              {
                icon: "fa-tasks",
                title: "Fluxo de resolução",
                desc: "5 telas, OCR de documento, confirmação de polígono.",
              },
              {
                icon: "fa-check-circle",
                title: "Retorno ao SICAR",
                desc: "Dados corrigidos voltam direto via módulo oficial de retificação.",
              },
            ].map((row, i) => (
              <li key={row.title}>
                <div className="br-card">
                  <div className="card-content">
                    <div className="row align-items-center">
                      <div className="col-auto">
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: "var(--color-primary-default)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--pure-0)",
                            fontWeight: "var(--font-weight-bold)",
                            fontSize: "var(--font-size-scale-down-01)",
                            flexShrink: 0,
                          }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </div>
                      </div>
                      <div className="col-auto">
                        <i
                          className={`fas ${row.icon}`}
                          style={{
                            color: "var(--color-primary-default)",
                            fontSize: 20,
                            width: 24,
                            textAlign: "center",
                          }}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="col-md-3">
                        <strong style={{ color: "var(--color-secondary-08)" }}>
                          {row.title}
                        </strong>
                      </div>
                      <div className="col">
                        <span style={{ color: "var(--color-secondary-07)" }}>
                          {row.desc}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}

function DiagnosticResult({
  diagnostico: d,
  onGoToApi,
  onGoToFluxo,
}: {
  diagnostico: DiagnosticoResult;
  onGoToApi: () => void;
  onGoToFluxo: () => void;
}) {
  const p = d.sicar!;
  const color = STATUS_COLOR[p.status] ?? "#37474f";
  const icon = STATUS_ICON[p.status] ?? "fa-question-circle";
  const label = STATUS_LABEL[p.status] ?? p.status;

  return (
    <div
      className="br-card mb-5"
      style={{ border: `2px solid ${color}` }}
    >
      <div
        className="card-header"
        style={{ background: `${color}0f` }}
      >
        <div
          className="d-flex align-items-start justify-content-between flex-wrap"
          style={{ gap: 12 }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <i className={`fas ${icon}`} style={{ color, fontSize: 18 }} aria-hidden="true" />
              <span
                style={{
                  background: color,
                  color: "#fff",
                  borderRadius: 99,
                  padding: "2px 12px",
                  fontSize: "var(--font-size-scale-down-02)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {label}
              </span>
              {!p.dado_real && (
                <span style={{ fontSize: "var(--font-size-scale-down-02)", color: "var(--color-secondary-06)", fontStyle: "italic" }}>
                  · demo
                </span>
              )}
            </div>
            <h3 style={{ margin: 0, fontSize: "var(--font-size-scale-up-02)", color: "var(--color-secondary-09)" }}>
              {p.nome_imovel}
            </h3>
            <p style={{ margin: "4px 0 0", color: "var(--color-secondary-07)", fontSize: "var(--font-size-scale-down-01)" }}>
              {d.municipio ? `${d.municipio.nome} — ${d.municipio.nomeUf}` : `${p.nome_municipio}, ${p.uf}`}
              {" · "}{p.area_ha.toLocaleString("pt-BR")} ha
            </p>
          </div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "var(--font-size-scale-down-01)",
              color: "var(--color-secondary-07)",
              background: "var(--color-secondary-02)",
              padding: "6px 14px",
              borderRadius: 6,
              whiteSpace: "nowrap",
            }}
          >
            {p.codigo_car}
          </div>
        </div>
      </div>

      <div className="card-content">
        <div className="row">
          <div className="col-md-6 mb-4 mb-md-0">
            <p
              style={{
                fontWeight: 700,
                color: "var(--color-secondary-08)",
                margin: "0 0 8px",
                fontSize: "var(--font-size-scale-down-01)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Diagnóstico
            </p>
            {p.pendencias.length > 0 ? (
              <>
                <p style={{ color, fontWeight: 600, margin: "0 0 8px" }}>
                  {p.pendencias[0]}
                </p>
                {p.pendencias.slice(1).map((pen) => (
                  <p key={pen} style={{ color: "var(--color-secondary-07)", lineHeight: 1.65, margin: "0 0 4px", fontSize: "var(--font-size-scale-down-01)" }}>
                    · {pen}
                  </p>
                ))}
              </>
            ) : (
              <p style={{ color: "var(--color-success-default, #168821)", fontWeight: 600, margin: 0 }}>
                <i className="fas fa-check-circle mr-2" aria-hidden="true" />
                CAR regular. Nenhuma ação necessária.
              </p>
            )}
          </div>

          <div className="col-md-3 mb-4 mb-md-0">
            <p
              style={{
                fontWeight: 700,
                color: "var(--color-secondary-08)",
                margin: "0 0 8px",
                fontSize: "var(--font-size-scale-down-01)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Fontes cruzadas
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {d.fontes.map((f) => (
                <li key={f.nome} style={{ fontSize: "var(--font-size-scale-down-01)", color: "var(--color-secondary-07)", marginBottom: 6, display: "flex", alignItems: "flex-start", gap: 6 }}>
                  <i
                    className={`fas ${f.status === "ok" ? "fa-check" : f.status === "alerta" ? "fa-exclamation-triangle" : f.status === "nao_disponivel" ? "fa-clock" : "fa-times"}`}
                    style={{
                      color: f.status === "ok" ? "var(--color-success-default, #168821)" : f.status === "alerta" ? "#e65100" : "var(--color-secondary-05)",
                      fontSize: 10,
                      marginTop: 3,
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  />
                  <span>
                    <strong>{f.nome}</strong>
                    {!f.dado_real && <span style={{ color: "var(--color-secondary-05)", fontStyle: "italic" }}> · demo</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-md-3">
            <p
              style={{
                fontWeight: 700,
                color: "var(--color-secondary-08)",
                margin: "0 0 8px",
                fontSize: "var(--font-size-scale-down-01)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Ação recomendada
            </p>
            {d.acao_recomendada ? (
              <span style={{ display: "inline-block", background: `${color}12`, color, border: `1px solid ${color}40`, borderRadius: 6, padding: "6px 12px", fontWeight: 600, fontSize: "var(--font-size-scale-down-01)" }}>
                {d.acao_recomendada}
              </span>
            ) : (
              <span style={{ color: "var(--color-secondary-06)", fontSize: "var(--font-size-scale-down-01)" }}>Nenhuma</span>
            )}
          </div>
        </div>

        {p.status !== "regular" && p.status !== "nao_encontrado" && (
          <div
            className="mt-4 pt-3"
            style={{
              borderTop: "1px solid var(--color-secondary-03)",
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              className="br-button secondary small"
              onClick={onGoToApi}
              style={{ borderRadius: 6 }}
            >
              <i className="fas fa-code mr-2" aria-hidden="true" />
              Ver resposta da API
            </button>
            {p.status !== "sobreposicao" && (
              <button
                type="button"
                className="br-button primary small"
                onClick={onGoToFluxo}
                style={{ borderRadius: 6 }}
              >
                <i className="fas fa-mobile-alt mr-2" aria-hidden="true" />
                Iniciar fluxo de resolução
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 02 · API Demo ────────────────────────────────────────────────────────────

// Fallback demo para quando nenhuma consulta foi feita ainda
const FALLBACK_DIAGNOSTICO: DiagnosticoResult = {
  cpf: "12345678909",
  encontrado: true,
  sicar: {
    codigo_car: "MT-5107925-6F3A2B4C1D8E",
    status: "pendente",
    nome_imovel: "Sítio Boa Esperança",
    area_ha: 48.3,
    codigo_ibge_municipio: "5107925",
    nome_municipio: "Sorriso",
    uf: "MT",
    data_inscricao: "2018-03-12",
    data_ultima_atualizacao: "2022-01-15",
    pendencias: ["CCIR vencido desde 03/2022", "Documento de posse desatualizado"],
    codigos_sncr: [],
    dado_real: false,
  },
  municipio: { ibge: "5107925", nome: "Sorriso", uf: "MT", nomeUf: "Mato Grosso" },
  fontes: [
    { nome: "SICAR", status: "alerta", descricao: "Dado de demonstração.", dado_real: false },
    { nome: "INCRA / SIGEF", status: "ok", descricao: "Demo.", dado_real: false },
    { nome: "MapBiomas", status: "ok", descricao: "Demo.", dado_real: false },
    { nome: "Receita Federal", status: "ok", descricao: "CPF válido.", dado_real: true },
    { nome: "IBGE", status: "ok", descricao: "Município enriquecido via API IBGE.", dado_real: true },
  ],
  nivel_risco: "medio",
  acao_recomendada: "Atualizar documentação via fluxo guiado",
  link_resolucao: "https://carproativo.gov.br/resolver?car=MT-5107925-6F3A2B4C1D8E",
  gerado_em: new Date().toISOString(),
};

function ApiDemo({ diagnostico }: { diagnostico: DiagnosticoResult | null }) {
  const d = diagnostico ?? FALLBACK_DIAGNOSTICO;
  const p = d.sicar!;

  const fields = [
    { key: "cpf", value: d.cpf },
    { key: "imovel", value: p.nome_imovel },
    { key: "municipio", value: d.municipio ? `${d.municipio.nome} — ${d.municipio.nomeUf}` : p.nome_municipio },
    { key: "car_codigo", value: p.codigo_car },
    { key: "status", value: p.status },
    { key: "pendencias", value: p.pendencias },
    { key: "acao_recomendada", value: d.acao_recomendada },
    { key: "nivel_risco", value: d.nivel_risco },
    { key: "fontes_cruzadas", value: d.fontes.map((f) => f.nome) },
    { key: "link_resolucao", value: d.link_resolucao },
    { key: "dado_real", value: p.dado_real },
    { key: "gerado_em", value: d.gerado_em },
  ];

  return (
    <>
      <section className="py-5">
        <div className="container-lg">
          <div className="py-4">
            <SectionEyebrow
              icon="fa-code"
              number="02"
              title="API de diagnóstico"
            />
            <p
              style={{
                color: "var(--color-secondary-07)",
                marginTop: 8,
                maxWidth: 560,
                lineHeight: 1.7,
              }}
            >
              Uma chamada REST. O parceiro passa o CPF do seu cliente e recebe o
              diagnóstico pronto para disparar no canal dele — WhatsApp, app do
              banco, e-mail.
            </p>
          </div>

          <div className="row mb-5">
            {/* Requisição */}
            <div className="col-md-6 mb-4 mb-md-0">
              <p
                style={{
                  fontWeight: 700,
                  color: "var(--color-secondary-08)",
                  margin: "0 0 12px",
                  fontSize: "var(--font-size-scale-down-01)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                <i
                  className="fas fa-arrow-up mr-2"
                  style={{ color: "var(--color-primary-default)" }}
                  aria-hidden="true"
                />
                Requisição
              </p>
              <div
                className="br-card"
                style={{
                  background: "var(--color-secondary-01)",
                  border: "1px solid var(--color-secondary-03)",
                }}
              >
                <div className="card-content">
                  <pre
                    style={{
                      fontFamily: "monospace",
                      fontSize: 13,
                      lineHeight: 1.7,
                      margin: 0,
                      color: "var(--color-secondary-09)",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all",
                    }}
                  >{`GET /api/diagnostico?cpf=${d.cpf}
Authorization: Bearer {token_parceiro}
Accept: application/json`}</pre>
                </div>
              </div>

              <div className="br-card mt-4">
                <div className="card-header">
                  <h3
                    className="mb-0"
                    style={{ fontSize: "var(--font-size-scale-up-01)" }}
                  >
                    Sobre a segurança dos dados
                  </h3>
                </div>
                <div className="card-content">
                  <ul
                    style={{
                      margin: 0,
                      padding: "0 0 0 18px",
                      color: "var(--color-secondary-07)",
                      fontSize: "var(--font-size-scale-down-01)",
                      lineHeight: 1.7,
                    }}
                  >
                    <li>
                      O parceiro passa o CPF do{" "}
                      <strong>próprio cliente</strong> — não é um dump de
                      dados.
                    </li>
                    <li>
                      A API retorna <strong>apenas status e ação</strong>.
                      Nenhum dado fundiário sensível.
                    </li>
                    <li>
                      Credenciamento via convênio com o MMA — mesmo modelo do
                      Serasa.
                    </li>
                    <li>Logs auditáveis por CPF consultado.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Resposta */}
            <div className="col-md-6">
              <p
                style={{
                  fontWeight: 700,
                  color: "var(--color-secondary-08)",
                  margin: "0 0 12px",
                  fontSize: "var(--font-size-scale-down-01)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                <i
                  className="fas fa-arrow-down mr-2"
                  style={{ color: "var(--color-success-default, #168821)" }}
                  aria-hidden="true"
                />
                Resposta JSON
              </p>
              <div
                className="br-card"
                style={{
                  background: "var(--color-secondary-01)",
                  border: "1px solid var(--color-secondary-03)",
                }}
              >
                <div className="card-content">
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: 12,
                      lineHeight: 1.75,
                      color: "var(--color-secondary-09)",
                    }}
                  >
                    <div>{"{"}</div>
                    {fields.map(({ key, value }, i) => {
                      const comma = i < fields.length - 1 ? "," : "";
                      let rendered: string;
                      if (value === null) {
                        rendered = "null";
                      } else if (Array.isArray(value)) {
                        rendered = `[${value.map((v) => `"${v}"`).join(", ")}]`;
                      } else {
                        rendered = `"${value}"`;
                      }
                      return (
                        <div key={key} style={{ paddingLeft: 16 }}>
                          <span
                            style={{ color: "var(--color-primary-default)" }}
                          >
                            "{key}"
                          </span>
                          <span
                            style={{ color: "var(--color-secondary-07)" }}
                          >
                            :{" "}
                          </span>
                          <span
                            style={{
                              color:
                                value === null
                                  ? "var(--color-secondary-05)"
                                  : "var(--color-success-default, #168821)",
                            }}
                          >
                            {rendered}
                          </span>
                          {comma}
                        </div>
                      );
                    })}
                    <div>{"}"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como o parceiro usa — accent strip */}
      <section className="section-accent py-5">
        <div className="container-lg">
          <div className="row align-items-center py-3">
            <div className="col-md-2 mb-3 mb-md-0 text-center">
              <i
                className="fas fa-lightbulb"
                style={{
                  fontSize: 56,
                  color: "var(--color-primary-darken-02)",
                  opacity: 0.7,
                }}
                aria-hidden="true"
              />
            </div>
            <div className="col-md-10">
              <p
                style={{
                  fontWeight: 700,
                  color: "var(--color-primary-darken-02)",
                  margin: "0 0 8px",
                  fontSize: "var(--font-size-scale-up-01)",
                }}
              >
                Como o parceiro usa isso
              </p>
              <p
                style={{
                  color: "var(--color-primary-darken-02)",
                  margin: 0,
                  lineHeight: 1.7,
                  opacity: 0.85,
                }}
              >
                O banco consulta a API uma vez por mês para todos os clientes
                com crédito rural ativo. Quem retornar com status diferente de{" "}
                <strong>regular</strong> recebe uma mensagem automática no app
                ou WhatsApp com o link de resolução embutido. O banco não
                desenvolve nada além da integração com a API — o fluxo de
                resolução é provido pelo governo.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ── 03 · Resolution Flow ─────────────────────────────────────────────────────

function ResolutionFlow({ diagnostico }: { diagnostico: DiagnosticoResult | null }) {
  const d = diagnostico && diagnostico.sicar?.status !== "regular" && diagnostico.sicar?.status !== "sobreposicao"
    ? diagnostico
    : FALLBACK_DIAGNOSTICO;
  const p = d.sicar!;

  const [screen, setScreen] = useState(0);

  const screens = [
    {
      icon: "fa-exclamation-triangle",
      accentColor: "#e65100",
      title: "Problema identificado",
      content: (
        <div>
          <div
            style={{
              background: "var(--color-warning-pastel, #fff3e0)",
              border: "1px solid var(--color-warning-default, #e65100)",
              borderRadius: 10,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <p
              style={{
                margin: "0 0 6px",
                fontWeight: 700,
                color: "#e65100",
                fontSize: "0.875rem",
              }}
            >
              <i
                className="fas fa-exclamation-triangle mr-2"
                aria-hidden="true"
              />
              {p.pendencias[0] ?? "Pendência identificada"}
            </p>
            <p
              style={{
                margin: 0,
                color: "var(--color-secondary-07)",
                fontSize: "0.8rem",
                lineHeight: 1.6,
              }}
            >
              {p.pendencias.slice(1).join(" · ") || "Verifique a documentação do imóvel."}
            </p>
          </div>
          <p
            style={{
              color: "var(--color-secondary-07)",
              lineHeight: 1.65,
              margin: "0 0 20px",
              fontSize: "0.875rem",
            }}
          >
            Seu CAR do <strong>{p.nome_imovel}</strong> precisa de atenção. Isso
            pode impedir acesso a crédito rural. Vamos resolver agora? Leva
            menos de 5 minutos.
          </p>
          <button
            type="button"
            className="br-button primary"
            onClick={() => setScreen(1)}
            style={{ borderRadius: 8, width: "100%" }}
          >
            Sim, vamos corrigir
            <i className="fas fa-arrow-right ml-2" aria-hidden="true" />
          </button>
        </div>
      ),
    },
    {
      icon: "fa-camera",
      accentColor: "var(--color-primary-default)",
      title: "Foto do documento",
      content: (
        <div>
          <p
            style={{
              color: "var(--color-secondary-07)",
              marginBottom: 16,
              lineHeight: 1.65,
              fontSize: "0.875rem",
            }}
          >
            Tire uma foto do seu <strong>CCIR atualizado</strong>. Você pode
            obter um no site do INCRA gratuitamente.
          </p>
          <div
            style={{
              border: "2px dashed var(--color-primary-default)",
              borderRadius: 10,
              padding: 32,
              textAlign: "center",
              background: "var(--color-primary-pastel-01)",
              marginBottom: 16,
              cursor: "pointer",
            }}
            onClick={() => setTimeout(() => setScreen(2), 500)}
          >
            <i
              className="fas fa-camera"
              style={{
                fontSize: 40,
                color: "var(--color-primary-default)",
                marginBottom: 10,
                display: "block",
              }}
              aria-hidden="true"
            />
            <p
              style={{
                margin: "0 0 4px",
                fontWeight: 700,
                color: "var(--color-primary-default)",
                fontSize: "0.875rem",
              }}
            >
              Toque para fotografar
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "0.75rem",
                color: "var(--color-secondary-07)",
              }}
            >
              ou arraste o arquivo aqui
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "var(--color-secondary-06)",
              fontSize: "0.75rem",
            }}
          >
            <i className="fas fa-lock" aria-hidden="true" />
            <span>Processado localmente via OCR. Não armazenado.</span>
          </div>
        </div>
      ),
    },
    {
      icon: "fa-check",
      accentColor: "var(--color-success-default, #168821)",
      title: "Confirme os dados",
      content: (
        <div>
          <p
            style={{
              color: "var(--color-secondary-07)",
              marginBottom: 14,
              lineHeight: 1.65,
              fontSize: "0.875rem",
            }}
          >
            O sistema leu os dados via OCR. Confirme se estão corretos:
          </p>
          <div
            style={{
              background: "var(--color-secondary-01)",
              borderRadius: 8,
              padding: 12,
              marginBottom: 16,
              border: "1px solid var(--color-secondary-03)",
            }}
          >
            {[
              { label: "Imóvel", value: p.nome_imovel },
              { label: "Município", value: d.municipio ? `${d.municipio.nome}, ${d.municipio.uf}` : p.nome_municipio },
              { label: "CCIR nº", value: "1234567-89" },
              { label: "Validade", value: "03/2027" },
            ].map((row) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "7px 0",
                  borderBottom: "1px solid var(--color-secondary-03)",
                  fontSize: "0.8rem",
                }}
              >
                <span style={{ color: "var(--color-secondary-07)" }}>
                  {row.label}
                </span>
                <span
                  style={{
                    fontWeight: 600,
                    color: "var(--color-secondary-09)",
                  }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="br-button primary"
            onClick={() => setScreen(3)}
            style={{ borderRadius: 8, width: "100%", marginBottom: 8 }}
          >
            <i className="fas fa-check mr-2" aria-hidden="true" />
            Está correto
          </button>
          <button
            type="button"
            className="br-button secondary"
            onClick={() => setScreen(1)}
            style={{ borderRadius: 8, width: "100%" }}
          >
            Corrigir manualmente
          </button>
        </div>
      ),
    },
    {
      icon: "fa-map-marked-alt",
      accentColor: "#00695c",
      title: "Limite do imóvel",
      content: (
        <div>
          <p
            style={{
              color: "var(--color-secondary-07)",
              marginBottom: 14,
              lineHeight: 1.65,
              fontSize: "0.875rem",
            }}
          >
            Limite conforme o INCRA. Confirme ou ajuste um ponto.
          </p>
          <div
            style={{
              height: 180,
              borderRadius: 10,
              background:
                "linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 40%, #81c784 100%)",
              position: "relative",
              overflow: "hidden",
              marginBottom: 16,
              border: "2px solid var(--color-secondary-03)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0.25,
                backgroundImage:
                  "repeating-linear-gradient(0deg,transparent,transparent 18px,rgba(0,0,0,0.12) 18px,rgba(0,0,0,0.12) 19px),repeating-linear-gradient(90deg,transparent,transparent 18px,rgba(0,0,0,0.12) 18px,rgba(0,0,0,0.12) 19px)",
              }}
            />
            <svg
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
              }}
            >
              <polygon
                points="72,36 190,28 210,122 144,162 56,134"
                fill="rgba(21,81,180,0.2)"
                stroke="#1351b4"
                strokeWidth="2"
                strokeDasharray="5,3"
              />
              {[
                [72, 36],
                [190, 28],
                [210, 122],
                [144, 162],
                [56, 134],
              ].map(([cx, cy]) => (
                <circle
                  key={`${cx}-${cy}`}
                  cx={cx}
                  cy={cy}
                  r="5"
                  fill="#1351b4"
                />
              ))}
            </svg>
            <div
              style={{
                position: "absolute",
                bottom: 6,
                right: 8,
                background: "rgba(255,255,255,0.9)",
                borderRadius: 4,
                padding: "3px 8px",
                fontSize: 10,
                fontWeight: 700,
                color: "var(--color-secondary-08)",
              }}
            >
              INCRA · {p.area_ha} ha
            </div>
          </div>
          <button
            type="button"
            className="br-button primary"
            onClick={() => setScreen(4)}
            style={{ borderRadius: 8, width: "100%", marginBottom: 8 }}
          >
            <i className="fas fa-check mr-2" aria-hidden="true" />
            Confirmar limite
          </button>
          <button
            type="button"
            className="br-button secondary"
            style={{ borderRadius: 8, width: "100%" }}
          >
            Ajustar ponto
          </button>
        </div>
      ),
    },
    {
      icon: "fa-star",
      accentColor: "var(--color-success-default, #168821)",
      title: "Tudo pronto!",
      content: (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "var(--color-success-pastel, #e8f5e9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <i
              className="fas fa-check-circle"
              style={{
                fontSize: 44,
                color: "var(--color-success-default, #168821)",
              }}
              aria-hidden="true"
            />
          </div>
          <h3
            style={{
              color: "var(--color-secondary-09)",
              fontSize: "1.1rem",
              margin: "0 0 10px",
            }}
          >
            CAR atualizado com sucesso!
          </h3>
          <p
            style={{
              color: "var(--color-secondary-07)",
              lineHeight: 1.65,
              margin: "0 0 20px",
              fontSize: "0.875rem",
            }}
          >
            As informações do <strong>{p.nome_imovel}</strong> foram enviadas ao
            SICAR via módulo oficial de retificação. Confirmação em até{" "}
            <strong>48 horas</strong>.
          </p>
          <div
            style={{
              background: "var(--color-secondary-01)",
              border: "1px solid var(--color-secondary-03)",
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 20,
              textAlign: "left",
            }}
          >
            <p
              style={{
                margin: "0 0 4px",
                fontWeight: 700,
                color: "var(--color-secondary-08)",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Protocolo
            </p>
            <p
              style={{
                margin: 0,
                fontFamily: "monospace",
                color: "var(--color-primary-default)",
                fontSize: "0.875rem",
              }}
            >
              CAR-2026-{Math.floor(Math.random() * 900000 + 100000)}
            </p>
          </div>
          <button
            type="button"
            className="br-button secondary"
            onClick={() => setScreen(0)}
            style={{ borderRadius: 8, width: "100%" }}
          >
            Reiniciar demonstração
          </button>
        </div>
      ),
    },
  ];

  const current = screens[screen];

  return (
    <>
      <section className="py-5">
        <div className="container-lg">
          <div className="py-4">
            <SectionEyebrow
              icon="fa-mobile-alt"
              number="03"
              title="Fluxo de resolução"
            />
            <p
              style={{
                color: "var(--color-secondary-07)",
                marginTop: 8,
                maxWidth: 560,
                lineHeight: 1.7,
              }}
            >
              Percorra as 5 telas como o produtor rural veria no celular — sem
              instalar nenhum aplicativo.
            </p>
          </div>

          {diagnostico && diagnostico.sicar?.status === "sobreposicao" && (
            <div
              className="br-card mb-5"
              style={{
                border: "1px solid var(--color-warning-default, #e65100)",
                background: "var(--color-warning-pastel, #fff3e0)",
              }}
            >
              <div className="card-content d-flex align-items-start" style={{ gap: 14 }}>
                <i
                  className="fas fa-info-circle"
                  style={{ color: "#e65100", fontSize: 20, marginTop: 2, flexShrink: 0 }}
                  aria-hidden="true"
                />
                <p style={{ margin: 0, color: "#bf360c", lineHeight: 1.65, fontSize: "var(--font-size-scale-down-01)" }}>
                  Casos de sobreposição não passam pelo fluxo automático — vão
                  direto para agendamento com técnico da EMATER, que recebe o
                  diagnóstico pré-preenchido e não precisa começar do zero.
                  A demonstração abaixo usa o caso padrão (documento desatualizado).
                </p>
              </div>
            </div>
          )}

          <div className="row">
            {/* Progress */}
            <div className="col-md-4 mb-5 mb-md-0">
              <div className="br-card" style={{ position: "sticky", top: 80 }}>
                <div className="card-header">
                  <h3
                    className="mb-0"
                    style={{ fontSize: "var(--font-size-scale-up-01)" }}
                  >
                    Progresso
                  </h3>
                </div>
                <div className="card-content">
                  <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {screens.map((s, i) => {
                      const done = i < screen;
                      const active = i === screen;
                      return (
                        <li
                          key={s.title}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "10px 0",
                            borderBottom:
                              i < screens.length - 1
                                ? "1px solid var(--color-secondary-02)"
                                : "none",
                          }}
                        >
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: "50%",
                              background: done
                                ? "var(--color-success-default, #168821)"
                                : active
                                ? "var(--color-primary-default)"
                                : "var(--color-secondary-03)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              transition: "background 0.3s",
                            }}
                          >
                            {done ? (
                              <i
                                className="fas fa-check"
                                style={{ color: "var(--pure-0)", fontSize: 11 }}
                                aria-hidden="true"
                              />
                            ) : (
                              <span
                                style={{
                                  color: active
                                    ? "var(--pure-0)"
                                    : "var(--color-secondary-06)",
                                  fontSize: 11,
                                  fontWeight: 700,
                                }}
                              >
                                {i + 1}
                              </span>
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: "var(--font-size-scale-down-01)",
                              fontWeight: active ? 700 : 400,
                              color: done
                                ? "var(--color-success-default, #168821)"
                                : active
                                ? "var(--color-secondary-09)"
                                : "var(--color-secondary-05)",
                            }}
                          >
                            {s.title}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </div>
            </div>

            {/* Phone mockup */}
            <div className="col-md-8">
              <div style={{ maxWidth: 360, margin: "0 auto" }}>
                <div
                  style={{
                    border: "8px solid var(--color-secondary-09)",
                    borderRadius: 36,
                    overflow: "hidden",
                    boxShadow: "var(--surface-shadow-xl, 0 20px 60px rgba(0,0,0,0.25))",
                  }}
                >
                  {/* Status bar */}
                  <div
                    style={{
                      background: "var(--color-secondary-09)",
                      padding: "8px 20px 4px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}
                    >
                      9:41
                    </span>
                    <div style={{ display: "flex", gap: 5 }}>
                      <i
                        className="fas fa-wifi"
                        style={{ color: "#fff", fontSize: 10 }}
                        aria-hidden="true"
                      />
                      <i
                        className="fas fa-battery-full"
                        style={{ color: "#fff", fontSize: 10 }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  {/* Browser chrome */}
                  <div
                    style={{
                      background: "var(--color-secondary-02)",
                      padding: "6px 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      borderBottom: "1px solid var(--color-secondary-03)",
                    }}
                  >
                    <i
                      className="fas fa-lock"
                      style={{
                        color: "var(--color-success-default, #168821)",
                        fontSize: 10,
                      }}
                      aria-hidden="true"
                    />
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--color-secondary-07)",
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      carproativo.gov.br/resolver
                    </span>
                  </div>

                  {/* Screen */}
                  <div
                    style={{ background: "#fff", minHeight: 480, padding: 20 }}
                  >
                    {/* App header */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 16,
                        paddingBottom: 14,
                        borderBottom: "1px solid var(--color-secondary-03)",
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "var(--color-primary-default)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <i
                          className={`fas ${current.icon}`}
                          style={{ color: "#fff", fontSize: 14 }}
                          aria-hidden="true"
                        />
                      </div>
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "var(--color-secondary-09)",
                            fontSize: 13,
                            lineHeight: 1.1,
                          }}
                        >
                          {current.title}
                        </div>
                        <div
                          style={{
                            color: "var(--color-secondary-06)",
                            fontSize: 11,
                          }}
                        >
                          Tela {screen + 1} de {screens.length}
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div
                      style={{
                        height: 3,
                        background: "var(--color-secondary-03)",
                        borderRadius: 99,
                        marginBottom: 18,
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          background: "var(--color-primary-default)",
                          borderRadius: 99,
                          width: `${((screen + 1) / screens.length) * 100}%`,
                          transition: "width 0.4s",
                        }}
                      />
                    </div>

                    {current.content}
                  </div>
                </div>

                <p
                  style={{
                    textAlign: "center",
                    marginTop: 14,
                    fontSize: "var(--font-size-scale-down-02)",
                    color: "var(--color-secondary-06)",
                  }}
                >
                  Interface web responsiva · sem instalar app
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA strip — mesmo section-accent da home */}
      <section className="section-accent py-5">
        <div className="container-lg">
          <div className="row py-3 align-items-center">
            <div className="col-md-7 mb-4 mb-md-0">
              <span
                style={{
                  fontSize: "var(--font-size-scale-down-01)",
                  fontWeight: "var(--font-weight-semi-bold)",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "var(--color-secondary-07)",
                }}
              >
                Próximo passo
              </span>
              <h2
                className="mt-2 text-weight-bold"
                style={{
                  fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                  color: "var(--color-secondary-08)",
                  lineHeight: 1.2,
                }}
              >
                Mato Grosso. 1 cooperativa. 100 produtores. 30 dias.
              </h2>
              <p
                className="mt-3"
                style={{
                  color: "var(--color-secondary-08)",
                  lineHeight: 1.7,
                  opacity: 0.85,
                  maxWidth: 500,
                }}
              >
                Maior volume de CARs do país, rede densa de cooperativas e
                tradings. O resultado do piloto vira o argumento de escala para
                os 7 milhões de cadastros.
              </p>
            </div>
            <div className="col-md-5">
              <div className="row mb-4">
                {[
                  { k: "100", v: "produtores" },
                  { k: "30d", v: "para medir" },
                  { k: "1", v: "cooperativa" },
                ].map((s) => (
                  <div key={s.k} className="col-4">
                    <div className="pilot-stat">
                      <div className="pilot-stat-num">{s.k}</div>
                      <div className="pilot-stat-label">{s.v}</div>
                    </div>
                  </div>
                ))}
              </div>
              <a
                href="mailto:contato@carproativo.gov.br"
                className="br-button primary large block"
              >
                <i className="fas fa-envelope mr-2" aria-hidden="true" />
                Conversar sobre o piloto
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function SectionEyebrow({
  icon,
  number,
  title,
}: {
  icon: string;
  number: string;
  title: string;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "var(--color-primary-pastel-01)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <i
            className={`fas ${icon}`}
            style={{ color: "var(--color-primary-default)", fontSize: 15 }}
            aria-hidden="true"
          />
        </div>
        <span
          className="section-label"
          style={{ color: "var(--color-primary-default)" }}
        >
          Camada {number}
        </span>
      </div>
      <h2
        className="mt-2 text-weight-bold"
        style={{
          fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
          color: "var(--color-secondary-08)",
          margin: 0,
          lineHeight: 1.2,
        }}
      >
        {title}
      </h2>
      <div
        style={{
          width: 40,
          height: 3,
          background: "var(--color-primary-default)",
          borderRadius: 99,
          marginTop: 12,
        }}
      />
    </div>
  );
}

function PilotoFooter() {
  return (
    <footer className="br-footer">
      <div className="container-lg">
        <div className="logo">
          <img
            src={govBrLogo}
            alt="Governo Federal"
            style={{ height: 32, filter: "brightness(0) invert(1)" }}
          />
        </div>
        <span className="br-divider my-3" />
        <div
          className="d-flex flex-wrap align-items-center justify-content-between py-3"
          style={{ gap: "var(--spacing-scale-2x)" }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: "var(--font-size-scale-down-01)",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              <strong style={{ color: "var(--pure-0)" }}>CAR Proativo</strong>{" "}
              · Proposta de bem público digital
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "var(--font-size-scale-down-01)",
                color: "rgba(255,255,255,0.75)",
              }}
            >
              Camada sobre o SICAR — não substitui, amplifica.
            </p>
          </div>
          <Link
            to="/"
            className="br-button circle small inverted"
            aria-label="Voltar à apresentação"
          >
            <i className="fas fa-arrow-left" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
