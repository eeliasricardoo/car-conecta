import { createFileRoute, Link } from "@tanstack/react-router";
import govBrLogo from "@/assets/govbr-logo.svg";
import { useState, useEffect } from "react";
import { useDiagnostico } from "@/hooks/use-diagnostico";
import type { DiagnosticoResult } from "@/lib/services/diagnostico-engine";

export const Route = createFileRoute("/parceiro")({
  head: () => ({
    meta: [
      { title: "Portal do Parceiro — CAR Proativo" },
      {
        name: "description",
        content:
          "Acesse o portal e consulte o status do CAR dos seus clientes diretamente. Sem integração, sem API — tudo na interface.",
      },
    ],
  }),
  component: ParceirPage,
});

// ── Types ─────────────────────────────────────────────────────────────────────

type Institution = {
  id: string;
  label: string;
  type: "banco" | "cooperativa" | "trading" | "emater";
  icon: string;
};

const INSTITUTIONS: Institution[] = [
  { id: "sicredi-rs", label: "Sicredi RS", type: "cooperativa", icon: "fa-users" },
  { id: "bb-mt", label: "Banco do Brasil — MT", type: "banco", icon: "fa-university" },
  { id: "cargill", label: "Cargill Grãos", type: "trading", icon: "fa-industry" },
  { id: "emater-mt", label: "EMATER — Mato Grosso", type: "emater", icon: "fa-tractor" },
];

const DEMO_CPFS = [
  { cpf: "107.282.101-00", label: "Pendente · doc. desatualizado",   hint: "CCIR vencido + domínio" },
  { cpf: "287.016.154-91", label: "Sobreposição · APP + RL",         hint: "Conflito de polígono" },
  { cpf: "321.654.987-00", label: "Cancelado · requer reativação",   hint: "Inconsistência de domínio" },
  { cpf: "555.666.777-89", label: "Pendente · dados incorretos",     hint: "Área divergente" },
  { cpf: "111.222.333-96", label: "Regular · nenhuma ação",          hint: "CAR em dia" },
];

// ── Root ──────────────────────────────────────────────────────────────────────

type AppStep = "solicitacao" | "pendente" | "login" | "portal";

function ParceirPage() {
  const [step, setStep] = useState<AppStep>("solicitacao");
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [solicitante, setSolicitante] = useState<{ nome: string; instituicao: string } | null>(null);

  if (step === "solicitacao") {
    return <SolicitacaoScreen onSubmit={(data) => { setSolicitante(data); setStep("pendente"); }} />;
  }

  if (step === "pendente") {
    return <PendenteScreen solicitante={solicitante!} onEnterCode={() => setStep("login")} />;
  }

  if (step === "login") {
    return <LoginScreen onLogin={(inst) => { setInstitution(inst); setStep("portal"); }} />;
  }

  return <PortalScreen institution={institution!} onLogout={() => { setInstitution(null); setStep("solicitacao"); }} />;
}

// ── Solicitação ───────────────────────────────────────────────────────────────

const INST_TYPES = [
  { value: "banco",       label: "Banco / Financeira" },
  { value: "cooperativa", label: "Cooperativa de Crédito" },
  { value: "trading",     label: "Trading / Agroindústria" },
  { value: "emater",      label: "EMATER / Órgão público" },
  { value: "outro",       label: "Outro" },
];

function SolicitacaoScreen({ onSubmit }: { onSubmit: (d: { nome: string; instituicao: string }) => void }) {
  const [nome, setNome] = useState("");
  const [instituicao, setInstituicao] = useState("");
  const [tipo, setTipo] = useState("cooperativa");
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome || !instituicao || !email) return;
    setSubmitted(true);
    setTimeout(() => onSubmit({ nome, instituicao }), 900);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-secondary-01)", display: "flex", flexDirection: "column" }}>
      <header className="br-header" style={{ background: "#fff", borderBottom: "1px solid var(--color-secondary-03)" }}>
        <div className="container-lg">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 72 }}>
            <Link to="/" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
              <img src={govBrLogo} alt="Governo Federal" style={{ height: 32 }} />
              <span style={{ margin: "0 12px", borderLeft: "1px solid var(--color-secondary-03)", height: 24 }} />
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontWeight: "bold", color: "var(--color-secondary-09)", fontSize: "1.1rem" }}>CAR</span>
                <span style={{ fontStyle: "italic", color: "var(--color-primary-default)", fontWeight: "bold", fontSize: "1.1rem" }}>Proativo</span>
              </div>
            </Link>
            <Link to="/" className="br-button secondary small" style={{ borderRadius: 999 }}>
              <i className="fas fa-arrow-left mr-2" aria-hidden="true" style={{ fontSize: 12 }} />
              Apresentação
            </Link>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 16px" }}>
        <div style={{ width: "100%", maxWidth: 520 }}>
          {/* Progresso */}
          <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 32 }}>
            {["Solicitação", "Aprovação", "Acesso"].map((label, i) => (
              <div key={label} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: i === 0 ? "var(--color-primary-default)" : "var(--color-secondary-03)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.7rem", fontWeight: 800,
                    color: i === 0 ? "#fff" : "var(--color-secondary-06)",
                  }}>{i + 1}</div>
                  <span style={{ fontSize: "0.65rem", color: i === 0 ? "var(--color-primary-default)" : "var(--color-secondary-05)", fontWeight: i === 0 ? 700 : 400, whiteSpace: "nowrap" }}>{label}</span>
                </div>
                {i < 2 && <div style={{ flex: 1, height: 2, background: "var(--color-secondary-03)", margin: "0 4px", marginBottom: 16 }} />}
              </div>
            ))}
          </div>

          <div className="text-center mb-5">
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "var(--color-primary-pastel-01)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <i className="fas fa-file-signature" style={{ color: "var(--color-primary-default)", fontSize: 26 }} aria-hidden="true" />
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-secondary-09)", margin: "0 0 8px" }}>
              Solicitar acesso ao portal
            </h1>
            <p style={{ color: "var(--color-secondary-07)", margin: 0, fontSize: "0.9rem", lineHeight: 1.6 }}>
              O portal do parceiro é exclusivo para instituições credenciadas.<br />
              Preencha os dados abaixo para solicitar acesso.
            </p>
          </div>

          <div className="br-card">
            <div className="card-content">
              <form onSubmit={handleSubmit}>
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div>
                    <label style={{ fontWeight: 600, display: "block", marginBottom: 6, fontSize: "0.875rem", color: "var(--color-secondary-08)" }}>
                      Nome completo *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Maria Silva"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                      style={{ width: "100%", padding: "10px 12px", boxSizing: "border-box", border: "1px solid var(--color-secondary-04)", borderRadius: 6, fontSize: "0.9rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontWeight: 600, display: "block", marginBottom: 6, fontSize: "0.875rem", color: "var(--color-secondary-08)" }}>
                      Instituição *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Sicredi Alto Jacuí"
                      value={instituicao}
                      onChange={(e) => setInstituicao(e.target.value)}
                      required
                      style={{ width: "100%", padding: "10px 12px", boxSizing: "border-box", border: "1px solid var(--color-secondary-04)", borderRadius: 6, fontSize: "0.9rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontWeight: 600, display: "block", marginBottom: 6, fontSize: "0.875rem", color: "var(--color-secondary-08)" }}>
                      Tipo de instituição
                    </label>
                    <select
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--color-secondary-04)", borderRadius: 6, fontSize: "0.9rem", background: "var(--pure-0)", color: "var(--color-secondary-08)" }}
                    >
                      {INST_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontWeight: 600, display: "block", marginBottom: 6, fontSize: "0.875rem", color: "var(--color-secondary-08)" }}>
                      CNPJ <span style={{ fontWeight: 400, color: "var(--color-secondary-06)" }}>(opcional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="00.000.000/0001-00"
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", boxSizing: "border-box", border: "1px solid var(--color-secondary-04)", borderRadius: 6, fontSize: "0.9rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontWeight: 600, display: "block", marginBottom: 6, fontSize: "0.875rem", color: "var(--color-secondary-08)" }}>
                      E-mail de contato *
                    </label>
                    <input
                      type="email"
                      placeholder="seu@instituicao.com.br"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{ width: "100%", padding: "10px 12px", boxSizing: "border-box", border: "1px solid var(--color-secondary-04)", borderRadius: 6, fontSize: "0.9rem" }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="br-button primary large"
                    style={{ borderRadius: 6, width: "100%", justifyContent: "center" }}
                    disabled={submitted}
                  >
                    {submitted ? (
                      <><i className="fas fa-spinner fa-spin mr-2" aria-hidden="true" />Enviando…</>
                    ) : (
                      <><i className="fas fa-paper-plane mr-2" aria-hidden="true" />Solicitar credenciamento</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: "0.75rem", color: "var(--color-secondary-06)" }}>
            Solicitações são analisadas em até 2 dias úteis. Você receberá o código de acesso por e-mail.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Aprovação pendente ────────────────────────────────────────────────────────

function PendenteScreen({ solicitante, onEnterCode }: { solicitante: { nome: string; instituicao: string }; onEnterCode: () => void }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-secondary-01)", display: "flex", flexDirection: "column" }}>
      <header className="br-header" style={{ background: "#fff", borderBottom: "1px solid var(--color-secondary-03)" }}>
        <div className="container-lg">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 72 }}>
            <Link to="/" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
              <img src={govBrLogo} alt="Governo Federal" style={{ height: 32 }} />
              <span style={{ margin: "0 12px", borderLeft: "1px solid var(--color-secondary-03)", height: 24 }} />
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontWeight: "bold", color: "var(--color-secondary-09)", fontSize: "1.1rem" }}>CAR</span>
                <span style={{ fontStyle: "italic", color: "var(--color-primary-default)", fontWeight: "bold", fontSize: "1.1rem" }}>Proativo</span>
              </div>
            </Link>
            <Link to="/" className="br-button secondary small" style={{ borderRadius: 999 }}>
              <i className="fas fa-arrow-left mr-2" aria-hidden="true" style={{ fontSize: 12 }} />
              Apresentação
            </Link>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 16px" }}>
        <div style={{ width: "100%", maxWidth: 480 }}>
          {/* Progresso */}
          <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 32 }}>
            {["Solicitação", "Aprovação", "Acesso"].map((label, i) => (
              <div key={label} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: i === 0 ? "var(--color-success-default, #168821)" : i === 1 ? "var(--color-primary-default)" : "var(--color-secondary-03)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.7rem", fontWeight: 800,
                    color: i < 2 ? "#fff" : "var(--color-secondary-06)",
                  }}>
                    {i === 0 ? <i className="fas fa-check" style={{ fontSize: 10 }} /> : i + 1}
                  </div>
                  <span style={{ fontSize: "0.65rem", color: i === 1 ? "var(--color-primary-default)" : i === 0 ? "var(--color-success-default, #168821)" : "var(--color-secondary-05)", fontWeight: i <= 1 ? 700 : 400, whiteSpace: "nowrap" }}>{label}</span>
                </div>
                {i < 2 && <div style={{ flex: 1, height: 2, background: i === 0 ? "var(--color-success-default, #168821)" : "var(--color-secondary-03)", margin: "0 4px", marginBottom: 16 }} />}
              </div>
            ))}
          </div>

          <div className="br-card">
            <div className="card-content" style={{ textAlign: "center", padding: "36px 24px" }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "#fff8e1",
                border: "3px solid #ffcc80",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 24px",
              }}>
                <i className="fas fa-clock" style={{ color: "#e65100", fontSize: 30 }} aria-hidden="true" />
              </div>

              <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--color-secondary-09)", margin: "0 0 12px" }}>
                Solicitação enviada!
              </h2>
              <p style={{ color: "var(--color-secondary-07)", fontSize: "0.9rem", lineHeight: 1.7, margin: "0 0 8px" }}>
                Recebemos o pedido de credenciamento de <strong>{solicitante.nome}</strong> ({solicitante.instituicao}).
              </p>
              <p style={{ color: "var(--color-secondary-07)", fontSize: "0.875rem", lineHeight: 1.7, margin: "0 0 28px" }}>
                Nossa equipe analisará os dados e enviará o <strong>código de acesso por e-mail em até 2 dias úteis</strong>.
              </p>

              <div style={{ background: "var(--color-secondary-01)", border: "1px solid var(--color-secondary-03)", borderRadius: 8, padding: "14px 18px", marginBottom: 28, textAlign: "left" }}>
                <p style={{ margin: "0 0 10px", fontSize: "0.8rem", fontWeight: 700, color: "var(--color-secondary-08)", display: "flex", alignItems: "center", gap: 6 }}>
                  <i className="fas fa-list-check" style={{ color: "var(--color-primary-default)" }} aria-hidden="true" />
                  O que acontece depois da aprovação
                </p>
                {[
                  "Você recebe um código de acesso por e-mail",
                  "Acessa o portal com a instituição e o código",
                  "Consulta CPFs e notifica produtores com CAR pendente",
                ].map((step, i) => (
                  <div key={step} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: i < 2 ? 8 : 0 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--color-primary-default)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 800, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                    <span style={{ fontSize: "0.8rem", color: "var(--color-secondary-07)", lineHeight: 1.5 }}>{step}</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: "1px solid var(--color-secondary-03)", paddingTop: 20 }}>
                <p style={{ margin: "0 0 12px", fontSize: "0.8rem", color: "var(--color-secondary-06)" }}>
                  Já tem um código de acesso?
                </p>
                <button
                  type="button"
                  className="br-button secondary"
                  style={{ borderRadius: 6 }}
                  onClick={onEnterCode}
                >
                  <i className="fas fa-key mr-2" aria-hidden="true" />
                  Inserir código de acesso
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Login ──────────────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (i: Institution) => void }) {
  const [selected, setSelected] = useState(INSTITUTIONS[0].id);
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim().toUpperCase() === "DEMO2026" || code.trim() === "") {
      const inst = INSTITUTIONS.find((i) => i.id === selected)!;
      onLogin(inst);
    } else {
      setError(true);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-secondary-01)", display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <header className="br-header" style={{ background: "#fff", borderBottom: "1px solid var(--color-secondary-03)" }}>
        <div className="container-lg">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 72 }}>
            <Link to="/" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
              <img src={govBrLogo} alt="Governo Federal" style={{ height: 32 }} />
              <span style={{ margin: "0 12px", borderLeft: "1px solid var(--color-secondary-03)", height: 24 }} />
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontWeight: "bold", color: "var(--color-secondary-09)", fontSize: "1.1rem" }}>CAR</span>
                <span style={{ fontStyle: "italic", color: "var(--color-primary-default)", fontWeight: "bold", fontSize: "1.1rem" }}>Proativo</span>
              </div>
            </Link>
            <Link to="/" className="br-button secondary small" style={{ borderRadius: 999 }}>
              <i className="fas fa-arrow-left mr-2" aria-hidden="true" style={{ fontSize: 12 }} />
              Apresentação
            </Link>
          </div>
        </div>
      </header>

      {/* Login card */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 16px" }}>
        <div style={{ width: "100%", maxWidth: 440 }}>
          {/* Progresso */}
          <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 32 }}>
            {["Solicitação", "Aprovação", "Acesso"].map((label, i) => (
              <div key={label} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: i < 2 ? "var(--color-success-default, #168821)" : "var(--color-primary-default)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.7rem", fontWeight: 800, color: "#fff",
                  }}>
                    {i < 2 ? <i className="fas fa-check" style={{ fontSize: 10 }} /> : i + 1}
                  </div>
                  <span style={{ fontSize: "0.65rem", color: i < 2 ? "var(--color-success-default, #168821)" : "var(--color-primary-default)", fontWeight: 700, whiteSpace: "nowrap" }}>{label}</span>
                </div>
                {i < 2 && <div style={{ flex: 1, height: 2, background: "var(--color-success-default, #168821)", margin: "0 4px", marginBottom: 16 }} />}
              </div>
            ))}
          </div>

          <div className="text-center mb-5">
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "var(--color-primary-pastel-01)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <i className="fas fa-handshake" style={{ color: "var(--color-primary-default)", fontSize: 28 }} aria-hidden="true" />
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-secondary-09)", margin: "0 0 8px" }}>
              Portal do Parceiro
            </h1>
            <p style={{ color: "var(--color-secondary-07)", margin: 0, fontSize: "0.9rem" }}>
              Insira o código recebido por e-mail para acessar
            </p>
          </div>

          <div className="br-card">
            <div className="card-content">
              <form onSubmit={handleSubmit}>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <label style={{ fontWeight: 600, display: "block", marginBottom: 6, fontSize: "0.875rem", color: "var(--color-secondary-08)" }}>
                      Instituição
                    </label>
                    <select
                      value={selected}
                      onChange={(e) => setSelected(e.target.value)}
                      style={{
                        width: "100%", padding: "10px 12px",
                        border: "1px solid var(--color-secondary-04)",
                        borderRadius: 6, fontSize: "0.9rem",
                        background: "var(--pure-0)", color: "var(--color-secondary-08)",
                      }}
                    >
                      {INSTITUTIONS.map((i) => (
                        <option key={i.id} value={i.id}>{i.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontWeight: 600, display: "block", marginBottom: 6, fontSize: "0.875rem", color: "var(--color-secondary-08)" }}>
                      Código de acesso
                    </label>
                    <input
                      type="text"
                      placeholder="DEMO2026"
                      value={code}
                      onChange={(e) => { setCode(e.target.value); setError(false); }}
                      style={{
                        width: "100%", padding: "10px 12px", boxSizing: "border-box",
                        border: `1px solid ${error ? "#b71c1c" : "var(--color-secondary-04)"}`,
                        borderRadius: 6, fontSize: "0.9rem",
                      }}
                    />
                    {error && (
                      <p style={{ margin: "6px 0 0", color: "#b71c1c", fontSize: "0.8rem" }}>
                        Código inválido. Use <strong>DEMO2026</strong> para acessar a demonstração.
                      </p>
                    )}
                    {!error && (
                      <p style={{ margin: "6px 0 0", color: "var(--color-secondary-06)", fontSize: "0.75rem" }}>
                        Demonstração: deixe em branco ou use <strong>DEMO2026</strong>
                      </p>
                    )}
                  </div>

                  <button type="submit" className="br-button primary large" style={{ borderRadius: 6, width: "100%" }}>
                    <i className="fas fa-sign-in-alt mr-2" aria-hidden="true" />
                    Acessar portal
                  </button>
                </div>
              </form>
            </div>
          </div>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: "0.75rem", color: "var(--color-secondary-06)" }}>
            Acesso restrito a instituições credenciadas pelo CAR Proativo
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Portal ─────────────────────────────────────────────────────────────────────

type PortalTab = "consulta" | "midiakit" | "painel";

const PORTAL_TABS: { id: PortalTab; label: string; icon: string }[] = [
  { id: "consulta",  label: "Consultar CPF",  icon: "fa-search" },
  { id: "midiakit",  label: "Mídia Kit",       icon: "fa-chalkboard-teacher" },
  { id: "painel",    label: "Painel",          icon: "fa-chart-bar" },
];

function PortalScreen({ institution, onLogout }: { institution: Institution; onLogout: () => void }) {
  const [tab, setTab] = useState<PortalTab>("consulta");
  const [cpfInput, setCpfInput] = useState("");
  const [cpfQuery, setCpfQuery] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [notifyModal, setNotifyModal] = useState(false);
  const [notified, setNotified] = useState(false);

  const { data, isLoading, error } = useDiagnostico(cpfQuery);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setCpfQuery(cpfInput);
    setCopied(false);
    setNotified(false);
  }

  function handleCopyLink(link: string) {
    navigator.clipboard.writeText(link).catch(() => {});
    setCopied(true);
  }

  function handleNotified() {
    setNotifyModal(false);
    setNotified(true);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-secondary-01)", display: "flex", flexDirection: "column" }}>
      {/* Portal header */}
      <header className="br-header" style={{ background: "#fff", borderBottom: "1px solid var(--color-secondary-03)", position: "sticky", top: 0, zIndex: 100 }}>
        <div className="container-lg">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 72, gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img src={govBrLogo} alt="Governo Federal" style={{ height: 28 }} />
              <span style={{ borderLeft: "1px solid var(--color-secondary-03)", height: 24, margin: "0 4px" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontWeight: "bold", color: "var(--color-secondary-09)", fontSize: "1rem" }}>CAR</span>
                <span style={{ fontStyle: "italic", color: "var(--color-primary-default)", fontWeight: "bold", fontSize: "1rem" }}>Proativo</span>
              </div>
              <span style={{ borderLeft: "1px solid var(--color-secondary-03)", height: 24, margin: "0 4px" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "var(--color-primary-pastel-01)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <i className={`fas ${institution.icon}`} style={{ color: "var(--color-primary-default)", fontSize: 12 }} aria-hidden="true" />
                </div>
                <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--color-secondary-08)" }}>{institution.label}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="br-button secondary small"
              style={{ borderRadius: 999 }}
            >
              <i className="fas fa-sign-out-alt mr-2" aria-hidden="true" style={{ fontSize: 12 }} />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--color-secondary-03)" }}>
        <div className="container-lg">
          <div style={{ display: "flex", gap: 0 }}>
            {PORTAL_TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  style={{
                    padding: "14px 20px", background: "none", border: "none",
                    borderBottom: active ? "3px solid var(--color-primary-default)" : "3px solid transparent",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                    fontWeight: active ? 700 : 500,
                    color: active ? "var(--color-primary-default)" : "var(--color-secondary-07)",
                    fontSize: "0.875rem", transition: "all 0.15s",
                  }}
                >
                  <i className={`fas ${t.icon}`} aria-hidden="true" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Portal content */}
      <div style={{ flex: 1 }}>
        <div className="container-lg" style={{ padding: "40px 16px" }}>

          {tab === "midiakit" && <MidiaKit institution={institution} />}
          {tab === "painel" && <MetricsSection institution={institution} />}
          {tab === "consulta" && <>
          {/* Demo CPFs */}
          <div style={{
            background: "var(--color-primary-pastel-01)",
            border: "1px solid var(--color-primary-lighten-02, #c5d4eb)",
            borderRadius: 8, padding: "12px 16px", marginBottom: 24,
          }}>
            <p style={{ margin: "0 0 10px", fontSize: "0.8rem", fontWeight: 600, color: "var(--color-primary-darken-02)" }}>
              <i className="fas fa-info-circle mr-1" aria-hidden="true" />
              CPFs de demonstração (clique para preencher)
            </p>
            <div className="d-flex flex-wrap" style={{ gap: 8 }}>
              {DEMO_CPFS.map((d) => (
                <button
                  key={d.cpf}
                  type="button"
                  onClick={() => { setCpfInput(d.cpf); setCpfQuery(null); setCopied(false); setNotified(false); }}
                  style={{
                    background: "#fff", border: "1px solid var(--color-primary-lighten-02, #c5d4eb)",
                    borderRadius: 6, padding: "6px 12px", cursor: "pointer",
                    textAlign: "left", transition: "border-color 0.2s",
                  }}
                >
                  <div style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--color-primary-default)", fontWeight: 700 }}>{d.cpf}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--color-secondary-07)", marginTop: 2 }}>{d.label} · {d.hint}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="br-card" style={{ marginBottom: 28 }}>
            <div className="card-content">
              <form onSubmit={handleSearch}>
                <label style={{ fontWeight: 700, display: "block", marginBottom: 8, color: "var(--color-secondary-08)" }}>
                  CPF do produtor rural
                </label>
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpfInput}
                    onChange={(e) => setCpfInput(e.target.value)}
                    style={{
                      flex: 1, padding: "12px 16px",
                      border: "1px solid var(--color-secondary-04)",
                      borderRadius: 6, fontSize: "1rem",
                    }}
                  />
                  <button type="submit" className="br-button primary" style={{ borderRadius: 6, whiteSpace: "nowrap" }}>
                    <i className="fas fa-search mr-2" aria-hidden="true" />
                    Consultar
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Result */}
          {isLoading && (
            <div className="br-card" style={{ textAlign: "center", padding: "40px 0" }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: 32, color: "var(--color-primary-default)", marginBottom: 16, display: "block" }} aria-hidden="true" />
              <p style={{ color: "var(--color-secondary-07)", margin: 0 }}>Consultando bases de dados…</p>
            </div>
          )}

          {error && (
            <div className="br-card" style={{ border: "1px solid #b71c1c20" }}>
              <div className="card-content">
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <i className="fas fa-times-circle" style={{ color: "#b71c1c", fontSize: 22, flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                  <div>
                    <strong style={{ color: "#b71c1c", display: "block", marginBottom: 4 }}>Erro na consulta</strong>
                    <span style={{ color: "var(--color-secondary-07)", fontSize: "0.875rem" }}>
                      {(error as Error).message || "Verifique o CPF e tente novamente."}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {data && !isLoading && (
            <DiagnosticoCard
              data={data}
              copied={copied}
              notified={notified}
              onCopy={handleCopyLink}
              onNotify={() => setNotifyModal(true)}
            />
          )}

          {notifyModal && data?.sicar && (
            <NotifyModal
              data={data}
              institution={institution}
              onConfirm={handleNotified}
              onClose={() => setNotifyModal(false)}
            />
          )}
          </>}
        </div>
      </div>

      {/* Footer */}
      <footer className="br-footer">
        <div className="container-lg">
          <div className="logo">
            <img src={govBrLogo} alt="Governo Federal" style={{ height: 32, filter: "brightness(0) invert(1)" }} />
          </div>
          <span className="br-divider my-3" />
          <div className="d-flex flex-wrap align-items-center justify-content-between py-3" style={{ gap: 16 }}>
            <div>
              <p style={{ margin: 0, fontSize: "var(--font-size-scale-down-01)", color: "rgba(255,255,255,0.7)" }}>
                <strong style={{ color: "var(--pure-0)" }}>CAR Proativo</strong> · Portal do Parceiro
              </p>
              <p style={{ margin: 0, fontSize: "var(--font-size-scale-down-01)", color: "rgba(255,255,255,0.55)" }}>
                Acesso exclusivo para instituições credenciadas.
              </p>
            </div>
            <div className="d-flex" style={{ gap: 12 }}>
              <Link to="/" className="br-button circle small inverted" aria-label="Apresentação">
                <i className="fas fa-home" aria-hidden="true" />
              </Link>
              <Link to="/piloto" className="br-button circle small inverted" aria-label="Demonstração">
                <i className="fas fa-flask" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Diagnostic card ────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  regular:      { bg: "#e8f5e9", text: "#2e7d32", border: "#a5d6a7", label: "REGULAR" },
  pendente:     { bg: "#fff8e1", text: "#e65100", border: "#ffcc80", label: "PENDENTE" },
  sobreposicao: { bg: "#fce4ec", text: "#b71c1c", border: "#ef9a9a", label: "SOBREPOSIÇÃO" },
  cancelado:    { bg: "#eeeeee", text: "#616161", border: "#bdbdbd", label: "CANCELADO" },
  nao_encontrado: { bg: "#f5f5f5", text: "#757575", border: "#e0e0e0", label: "NÃO ENCONTRADO" },
};

function DiagnosticoCard({
  data, copied, notified, onCopy, onNotify,
}: {
  data: DiagnosticoResult;
  copied: boolean;
  notified: boolean;
  onCopy: (link: string) => void;
  onNotify: () => void;
}) {
  if (!data.encontrado || !data.sicar) {
    return (
      <div className="br-card" style={{ marginBottom: 28 }}>
        <div className="card-content text-center" style={{ padding: "32px 0" }}>
          <i className="fas fa-search" style={{ fontSize: 36, color: "var(--color-secondary-04)", marginBottom: 12, display: "block" }} aria-hidden="true" />
          <strong style={{ color: "var(--color-secondary-07)" }}>CPF não encontrado no SICAR</strong>
          <p style={{ color: "var(--color-secondary-06)", fontSize: "0.875rem", margin: "8px 0 0" }}>
            Verifique se o CPF está correto ou se o produtor possui imóvel cadastrado.
          </p>
        </div>
      </div>
    );
  }

  const p = data.sicar;
  const statusInfo = STATUS_COLORS[p.status] ?? STATUS_COLORS.pendente;
  const isIrregular = p.status !== "regular";

  return (
    <div className="br-card" style={{ marginBottom: 28, border: `1.5px solid ${statusInfo.border}` }}>
      {/* Header */}
      <div className="card-header" style={{ background: statusInfo.bg }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <i
              className={`fas ${p.status === "regular" ? "fa-check-circle" : "fa-exclamation-triangle"}`}
              style={{ color: statusInfo.text, fontSize: 20, flexShrink: 0 }}
              aria-hidden="true"
            />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{
                  background: statusInfo.text, color: "#fff",
                  borderRadius: 4, padding: "2px 8px",
                  fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.06em",
                }}>
                  {statusInfo.label}
                </span>
                {!p.dado_real && (
                  <span style={{ fontSize: "0.7rem", color: "var(--color-secondary-06)", fontStyle: "italic" }}>demo</span>
                )}
              </div>
              <h2 style={{ margin: "4px 0 0", fontSize: "1.15rem", fontWeight: 800, color: "var(--color-secondary-09)" }}>
                {p.nome_imovel}
              </h2>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--color-secondary-07)" }}>
                {p.nome_municipio} — {p.uf} · {p.area_ha} ha
              </p>
            </div>
          </div>
          <code style={{ fontSize: "0.7rem", color: "var(--color-secondary-06)", flexShrink: 0 }}>{p.codigo_car}</code>
        </div>
      </div>

      <div className="card-content">
        <div className="row">
          {/* Diagnóstico */}
          <div className="col-md-5 mb-4 mb-md-0">
            <p style={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-secondary-07)", margin: "0 0 12px" }}>
              Diagnóstico
            </p>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <i className={`fas ${p.status === "regular" ? "fa-check-circle" : "fa-times-circle"}`}
                style={{ color: statusInfo.text, fontSize: 16, marginTop: 2, flexShrink: 0 }}
                aria-hidden="true"
              />
              <p style={{ margin: 0, color: statusInfo.text, fontWeight: 600, lineHeight: 1.55 }}>
                {data.acao_recomendada ?? "Nenhuma ação necessária."}
              </p>
            </div>

            {p.pendencias && p.pendencias.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <p style={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-secondary-07)", margin: "0 0 8px" }}>
                  Pendências
                </p>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                  {p.pendencias.map((pend: string) => (
                    <li key={pend} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <i className="fas fa-circle" style={{ color: "#e65100", fontSize: 6, marginTop: 6, flexShrink: 0 }} aria-hidden="true" />
                      <span style={{ fontSize: "0.8rem", color: "var(--color-secondary-07)" }}>{pend}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Fontes */}
          <div className="col-md-4 mb-4 mb-md-0">
            <p style={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-secondary-07)", margin: "0 0 12px" }}>
              Fontes cruzadas
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {data.fontes.map((f) => (
                <div key={f.nome} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <i
                    className={`fas ${f.status === "ok" ? "fa-check" : f.status === "alerta" ? "fa-exclamation" : "fa-minus"}`}
                    style={{
                      color: f.status === "ok" ? "var(--color-success-default, #168821)" : f.status === "alerta" ? "#e65100" : "var(--color-secondary-05)",
                      fontSize: 11, width: 14, textAlign: "center", flexShrink: 0,
                    }}
                    aria-hidden="true"
                  />
                  <span style={{ fontSize: "0.8rem", color: "var(--color-secondary-07)" }}>
                    {f.nome}
                    {!f.dado_real && <span style={{ color: "var(--color-secondary-05)", fontStyle: "italic" }}> · demo</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="col-md-3">
            <p style={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-secondary-07)", margin: "0 0 12px" }}>
              Ação recomendada
            </p>
            {!isIrregular ? (
              <p style={{ color: "var(--color-secondary-06)", fontSize: "0.875rem", margin: 0 }}>Nenhuma</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.link_resolucao && (
                  <button
                    type="button"
                    className="br-button primary small"
                    style={{ borderRadius: 6, width: "100%", justifyContent: "center" }}
                    onClick={() => onCopy(data.link_resolucao!)}
                  >
                    <i className={`fas ${copied ? "fa-check" : "fa-copy"} mr-2`} aria-hidden="true" />
                    {copied ? "Link copiado!" : "Copiar link"}
                  </button>
                )}
                <button
                  type="button"
                  className={`br-button ${notified ? "secondary" : "secondary"} small`}
                  style={{ borderRadius: 6, width: "100%", justifyContent: "center" }}
                  onClick={onNotify}
                  disabled={notified}
                >
                  <i className={`fas ${notified ? "fa-check" : "fa-paper-plane"} mr-2`} aria-hidden="true" />
                  {notified ? "Notificado!" : "Notificar produtor"}
                </button>
                {notified && (
                  <p style={{ fontSize: "0.7rem", color: "var(--color-success-default, #168821)", margin: 0, textAlign: "center" }}>
                    Mensagem enviada via WhatsApp / e-mail
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Mídia Kit ─────────────────────────────────────────────────────────────────

type KitChannel = "whatsapp" | "sms" | "email" | "grupo";
type KitMoment = "educacao" | "pendencia" | "lembrete";

const KIT_CHANNELS: { id: KitChannel; icon: string; label: string; color: string }[] = [
  { id: "whatsapp", icon: "fab fa-whatsapp", label: "WhatsApp", color: "#25D366" },
  { id: "sms",      icon: "fas fa-comment-dots", label: "SMS", color: "var(--color-primary-default)" },
  { id: "email",    icon: "fas fa-envelope", label: "E-mail", color: "#e65100" },
  { id: "grupo",    icon: "fas fa-users", label: "Grupo / Circular", color: "#7b1fa2" },
];

const KIT_MOMENTS: { id: KitMoment; label: string; desc: string }[] = [
  { id: "educacao",  label: "1ª mensagem — educação", desc: "Produtor não sabe o que é CAR" },
  { id: "pendencia", label: "2ª mensagem — pendência", desc: "Produtor tem pendência identificada" },
  { id: "lembrete",  label: "3ª mensagem — lembrete", desc: "Produtor não agiu após 7 dias" },
];

function buildKitMessage(channel: KitChannel, moment: KitMoment, inst: Institution): string {
  const instName = inst.label;

  if (moment === "educacao") {
    if (channel === "whatsapp") return `Olá, Sr. José! Aqui é da ${instName} 👋\n\nVocê sabia que seu registro de terra no governo precisa ser atualizado de tempos em tempos?\n\nEsse cadastro — chamado de CAR — é o que garante que você pode acessar o crédito rural do próximo plantio.\n\nQuer saber se o seu está em dia? É gratuito e leva menos de 1 minuto:\n👉 carproativo.gov.br/verificar\n\nQualquer dúvida, fala com a gente!`;
    if (channel === "sms") return `${instName}: Seu registro de terra (CAR) precisa estar em dia para acessar credito rural. Verifique gratis: carproativo.gov.br/verificar`;
    if (channel === "email") return `Assunto: Seu registro de terra está em dia?\n\nSr. José,\n\nO Cadastro Ambiental Rural (CAR) é o documento que registra sua propriedade junto ao governo federal. Ele é obrigatório e necessário para acessar crédito rural, Pronaf e outros benefícios.\n\nMuitos produtores não sabem que o cadastro pode ficar desatualizado com o tempo — e isso pode bloquear o acesso ao crédito sem aviso prévio.\n\nVerifique agora se o seu está regular:\n👉 carproativo.gov.br/verificar\n\nO processo é gratuito e leva menos de 1 minuto.\n\nAtenciosamente,\n${instName}`;
    return `Prezado associado,\n\nLembramos que o Cadastro Ambiental Rural (CAR) é obrigatório para produtores rurais e necessário para acesso ao crédito rural.\n\nRecomendamos que todos verifiquem a situação do seu cadastro gratuitamente em:\ncarproativo.gov.br/verificar\n\n${instName}`;
  }

  if (moment === "pendencia") {
    if (channel === "whatsapp") return `Sr. José, verificamos aqui na ${instName} e o seu registro de terra (CAR do *Sítio Boa Esperança*) está com uma pendência.\n\nIsso pode travar a liberação do seu crédito rural no próximo plantio.\n\nA boa notícia: dá pra resolver pelo celular, em menos de 5 minutos, sem sair de casa:\n👉 carproativo.gov.br/resolver?car=MT-5102504\n\nQualquer dúvida, liga pra gente! 📞`;
    if (channel === "sms") return `${instName}: Seu CAR (Sitio Boa Esperanca) tem pendencia que pode bloquear seu credito rural. Resolva em 5min: carproativo.gov.br/resolver?car=MT-5102504`;
    if (channel === "email") return `Assunto: Pendência no seu registro de terra — ação necessária\n\nSr. José,\n\nIdentificamos uma pendência no Cadastro Ambiental Rural (CAR) do Sítio Boa Esperança que pode impedir a liberação do seu crédito rural.\n\nO que está pendente: documento de posse desatualizado.\n\nComo resolver: acesse o link abaixo e siga as instruções. O processo é simples, gratuito e pode ser feito pelo celular em menos de 5 minutos.\n\n👉 carproativo.gov.br/resolver?car=MT-5102504\n\nSe precisar de ajuda, entre em contato com sua agência.\n\nAtenciosamente,\n${instName}`;
    return `Comunicado interno — ${instName}\n\nIdentificamos associados com pendências no CAR que podem impactar o acesso ao crédito rural.\n\nOrientamos os associados afetados a acessar o link de regularização enviado individualmente.\n\nDúvidas: contate o departamento de crédito rural.`;
  }

  // lembrete
  if (channel === "whatsapp") return `Sr. José, tudo bem? 👋\n\nHá uma semana enviamos um aviso sobre a pendência no seu registro de terra (CAR).\n\nA pendência ainda está aberta e pode travar seu crédito rural. Leva só 5 minutos para resolver:\n👉 carproativo.gov.br/resolver?car=MT-5102504\n\nPrecisando de ajuda, é só chamar!`;
  if (channel === "sms") return `${instName}: Lembrete — pendencia no seu CAR ainda esta aberta. Resolva antes do vencimento: carproativo.gov.br/resolver?car=MT-5102504`;
  if (channel === "email") return `Assunto: Lembrete — pendência no CAR ainda em aberto\n\nSr. José,\n\nEnviamos um aviso há 7 dias sobre a pendência no CAR do Sítio Boa Esperança. A pendência ainda não foi resolvida.\n\nLembramos que essa pendência pode bloquear a liberação de crédito rural. Por favor, acesse o link abaixo o quanto antes:\n\n👉 carproativo.gov.br/resolver?car=MT-5102504\n\nSe precisar de auxílio, nossa equipe está disponível.\n\nAtenciosamente,\n${instName}`;
  return `Lembrete — ${instName}\n\nAssociados que receberam aviso de pendência no CAR e ainda não regularizaram: o prazo para manter o acesso ao crédito rural está se aproximando.\n\nOrientamos a acessar o link de regularização o quanto antes.`;
}

function MidiaKit({ institution }: { institution: Institution }) {
  const [channel, setChannel] = useState<KitChannel>("whatsapp");
  const [moment, setMoment] = useState<KitMoment>("educacao");
  const [copied, setCopied] = useState(false);

  const message = buildKitMessage(channel, moment, institution);

  function handleCopy() {
    navigator.clipboard.writeText(message).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: "0 0 6px", fontSize: "1.2rem", fontWeight: 800, color: "var(--color-secondary-09)" }}>
          Mídia Kit — Educação e notificação
        </h2>
        <p style={{ margin: 0, color: "var(--color-secondary-07)", fontSize: "0.875rem", lineHeight: 1.65 }}>
          Templates prontos em linguagem simples para comunicar com produtores rurais. Adapte com o nome do produtor e envie pelo canal que já usa.
        </p>
      </div>

      <div className="row">
        <div className="col-md-4 mb-4 mb-md-0">
          {/* Moment selector */}
          <div className="br-card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <h3 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700 }}>Momento da comunicação</h3>
            </div>
            <div className="card-content" style={{ padding: 0 }}>
              {KIT_MOMENTS.map((m) => {
                const active = moment === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMoment(m.id)}
                    style={{
                      width: "100%", padding: "12px 16px", background: active ? "var(--color-primary-pastel-01)" : "#fff",
                      border: "none", borderBottom: "1px solid var(--color-secondary-03)",
                      borderLeft: active ? "3px solid var(--color-primary-default)" : "3px solid transparent",
                      cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                    }}
                  >
                    <div style={{ fontWeight: active ? 700 : 500, color: active ? "var(--color-primary-default)" : "var(--color-secondary-08)", fontSize: "0.875rem" }}>{m.label}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-secondary-06)", marginTop: 2 }}>{m.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Channel selector */}
          <div className="br-card">
            <div className="card-header">
              <h3 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700 }}>Canal</h3>
            </div>
            <div className="card-content">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {KIT_CHANNELS.map((ch) => {
                  const active = channel === ch.id;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setChannel(ch.id)}
                      style={{
                        padding: "10px 14px", borderRadius: 8, cursor: "pointer",
                        border: active ? `2px solid ${ch.color}` : "2px solid var(--color-secondary-03)",
                        background: active ? `${ch.color}12` : "#fff",
                        display: "flex", alignItems: "center", gap: 10,
                        transition: "all 0.15s",
                      }}
                    >
                      <i className={ch.icon} style={{ color: ch.color, fontSize: 18, width: 20, textAlign: "center" }} aria-hidden="true" />
                      <span style={{ fontWeight: active ? 700 : 500, color: active ? ch.color : "var(--color-secondary-08)", fontSize: "0.875rem" }}>{ch.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="br-card" style={{ height: "100%" }}>
            <div className="card-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <i className={KIT_CHANNELS.find(c => c.id === channel)!.icon} style={{ color: KIT_CHANNELS.find(c => c.id === channel)!.color, fontSize: 18 }} aria-hidden="true" />
                <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>
                  {KIT_MOMENTS.find(m => m.id === moment)!.label} · {KIT_CHANNELS.find(c => c.id === channel)!.label}
                </h3>
              </div>
              <button
                type="button"
                className="br-button secondary small"
                style={{ borderRadius: 6 }}
                onClick={handleCopy}
              >
                <i className={`fas ${copied ? "fa-check" : "fa-copy"} mr-2`} aria-hidden="true" />
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>
            <div className="card-content">
              <div style={{
                background: "var(--color-secondary-01)",
                border: "1px solid var(--color-secondary-03)",
                borderRadius: 8, padding: "16px 18px",
                minHeight: 260,
              }}>
                <pre style={{
                  margin: 0, fontFamily: "inherit", fontSize: "0.875rem",
                  color: "var(--color-secondary-08)", whiteSpace: "pre-wrap", lineHeight: 1.75,
                }}>
                  {message}
                </pre>
              </div>

              <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <div style={{ background: "var(--color-primary-pastel-01)", borderRadius: 6, padding: "6px 12px", fontSize: "0.75rem", color: "var(--color-primary-darken-02)", fontWeight: 600 }}>
                  <i className="fas fa-info-circle mr-1" aria-hidden="true" />
                  Substitua "Sr. José" pelo nome do cliente
                </div>
                <div style={{ background: "var(--color-secondary-01)", borderRadius: 6, padding: "6px 12px", fontSize: "0.75rem", color: "var(--color-secondary-07)", border: "1px solid var(--color-secondary-03)" }}>
                  <i className="fas fa-link mr-1" aria-hidden="true" />
                  O link de resolução é gerado automaticamente por CPF
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="br-card mt-4">
        <div className="card-header">
          <h3 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700 }}>
            <i className="fas fa-lightbulb mr-2" style={{ color: "var(--color-primary-default)" }} aria-hidden="true" />
            Como usar o mídia kit
          </h3>
        </div>
        <div className="card-content">
          <div className="row">
            {[
              { n: "1", t: "Comece pela educação", d: "Mande a 1ª mensagem para todos os clientes rurais — não só os com pendência. Muitos não sabem o que é CAR." },
              { n: "2", t: "Personalize com o nome", d: "\"Sr. José\" converte muito mais que \"Prezado cliente\". Use o nome do produtor sempre que possível." },
              { n: "3", t: "WhatsApp primeiro", d: "Taxa de abertura do WhatsApp chega a 98%. E-mail e SMS para quem não responde em 3 dias." },
              { n: "4", t: "Nunca mencione 'autuação'", d: "Foque no benefício — liberar crédito, garantir o plantio. Não no risco de punição. O medo paralisa." },
            ].map((tip) => (
              <div key={tip.n} className="col-md-6 mb-3">
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--color-primary-default)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800, flexShrink: 0 }}>{tip.n}</div>
                  <div>
                    <strong style={{ display: "block", fontSize: "0.875rem", color: "var(--color-secondary-09)", marginBottom: 2 }}>{tip.t}</strong>
                    <span style={{ fontSize: "0.8rem", color: "var(--color-secondary-07)", lineHeight: 1.55 }}>{tip.d}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Notify Modal ──────────────────────────────────────────────────────────────

type NotifyChannel = "whatsapp" | "email" | "sms";

const CHANNEL_CONFIG: Record<NotifyChannel, { icon: string; label: string; color: string }> = {
  whatsapp: { icon: "fab fa-whatsapp", label: "WhatsApp", color: "#25D366" },
  email:    { icon: "fas fa-envelope", label: "E-mail", color: "#e65100" },
  sms:      { icon: "fas fa-comment-dots", label: "SMS", color: "var(--color-primary-default)" },
};

function buildMessage(channel: NotifyChannel, data: DiagnosticoResult, institution: Institution): string {
  const nome = data.sicar?.nome_imovel ?? "seu imóvel";
  const link = data.link_resolucao ?? "https://carproativo.gov.br/resolver";
  const inst = institution.label;

  if (channel === "whatsapp") {
    return `Olá! A ${inst} identificou uma pendência no CAR do *${nome}*.\n\n${data.acao_recomendada}\n\nRegularize em menos de 5 minutos:\n${link}\n\nDúvidas? Fale com seu gerente.`;
  }
  if (channel === "email") {
    return `Assunto: Pendência no CAR — ${nome}\n\nPrezado produtor,\n\nIdentificamos que o Cadastro Ambiental Rural do ${nome} possui pendência que pode bloquear o acesso a crédito rural.\n\nPendência: ${data.acao_recomendada}\n\nRegularize agora acessando o link:\n${link}\n\nO processo leva menos de 5 minutos pelo celular.\n\nAtenciosamente,\n${inst}`;
  }
  return `${inst}: CAR pendente - ${nome}. Regularize agora: ${link}`;
}

function NotifyModal({
  data, institution, onConfirm, onClose,
}: {
  data: DiagnosticoResult;
  institution: Institution;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [channel, setChannel] = useState<NotifyChannel>("whatsapp");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const message = buildMessage(channel, data, institution);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleSend() {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setTimeout(onConfirm, 1200);
    }, 1800);
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "#fff", borderRadius: 12,
        width: "100%", maxWidth: 520,
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid var(--color-secondary-03)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "var(--color-secondary-09)" }}>
              Notificar produtor
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "var(--color-secondary-06)" }}>
              {data.sicar?.nome_imovel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--color-secondary-06)", fontSize: 18 }}
            aria-label="Fechar"
          >
            <i className="fas fa-times" aria-hidden="true" />
          </button>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {sent ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "var(--color-success-pastel, #e8f5e9)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
              }}>
                <i className="fas fa-check" style={{ color: "var(--color-success-default, #168821)", fontSize: 24 }} aria-hidden="true" />
              </div>
              <strong style={{ color: "var(--color-secondary-09)", display: "block", marginBottom: 4 }}>
                Notificação enviada!
              </strong>
              <p style={{ color: "var(--color-secondary-07)", fontSize: "0.875rem", margin: 0 }}>
                O produtor receberá a mensagem via {CHANNEL_CONFIG[channel].label}.
              </p>
            </div>
          ) : (
            <>
              {/* Channel selector */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-secondary-07)", margin: "0 0 10px" }}>
                  Canal de envio
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  {(Object.entries(CHANNEL_CONFIG) as [NotifyChannel, typeof CHANNEL_CONFIG[NotifyChannel]][]).map(([key, cfg]) => {
                    const active = channel === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setChannel(key)}
                        style={{
                          flex: 1, padding: "10px 8px", borderRadius: 8, cursor: "pointer",
                          border: active ? `2px solid ${cfg.color}` : "2px solid var(--color-secondary-03)",
                          background: active ? `${cfg.color}10` : "#fff",
                          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                          transition: "all 0.15s",
                        }}
                      >
                        <i className={cfg.icon} style={{ color: cfg.color, fontSize: 20 }} aria-hidden="true" />
                        <span style={{ fontSize: "0.75rem", fontWeight: active ? 700 : 500, color: active ? cfg.color : "var(--color-secondary-07)" }}>
                          {cfg.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message preview */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-secondary-07)", margin: "0 0 10px" }}>
                  Prévia da mensagem
                </p>
                <div style={{
                  background: "var(--color-secondary-01)",
                  border: "1px solid var(--color-secondary-03)",
                  borderRadius: 8, padding: "12px 14px",
                  maxHeight: 180, overflowY: "auto",
                }}>
                  <pre style={{
                    margin: 0, fontFamily: "inherit", fontSize: "0.82rem",
                    color: "var(--color-secondary-08)", whiteSpace: "pre-wrap", lineHeight: 1.65,
                  }}>
                    {message}
                  </pre>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="br-button secondary" style={{ flex: 1, borderRadius: 6 }} onClick={onClose}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="br-button primary"
                  style={{ flex: 2, borderRadius: 6, justifyContent: "center" }}
                  onClick={handleSend}
                  disabled={sending}
                >
                  {sending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2" aria-hidden="true" />
                      Enviando…
                    </>
                  ) : (
                    <>
                      <i className={`${CHANNEL_CONFIG[channel].icon} mr-2`} aria-hidden="true" />
                      Enviar via {CHANNEL_CONFIG[channel].label}
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Metrics ───────────────────────────────────────────────────────────────────

function MetricsSection({ institution }: { institution: Institution }) {
  const metrics = [
    { icon: "fa-search", label: "CPFs consultados", value: "1.240", color: "var(--color-primary-default)" },
    { icon: "fa-exclamation-triangle", label: "Pendências identificadas", value: "893", color: "#e65100" },
    { icon: "fa-paper-plane", label: "Produtores notificados", value: "641", color: "#00695c" },
    { icon: "fa-check-circle", label: "CARs regularizados", value: "528", color: "var(--color-success-default, #168821)" },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "var(--color-secondary-08)" }}>
          Painel de impacto — {institution.label}
        </h2>
        <span style={{ fontSize: "0.75rem", color: "var(--color-secondary-06)" }}>Junho 2026 · dados demo</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        {metrics.map((m) => (
          <div key={m.label} className="br-card">
            <div className="card-content" style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: `${m.color}18`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <i className={`fas ${m.icon}`} style={{ color: m.color, fontSize: 18 }} aria-hidden="true" />
              </div>
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--color-secondary-09)", lineHeight: 1 }}>{m.value}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-secondary-07)", marginTop: 2, lineHeight: 1.4 }}>{m.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Funnel */}
      <div className="br-card">
        <div className="card-header">
          <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>Funil de regularização · Junho 2026</h3>
        </div>
        <div className="card-content">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "CPFs consultados", n: 1240, pct: 100, color: "var(--color-primary-default)" },
              { label: "Pendências identificadas", n: 893, pct: 72, color: "#e65100" },
              { label: "Produtores notificados", n: 641, pct: 52, color: "#00695c" },
              { label: "CARs regularizados", n: 528, pct: 43, color: "var(--color-success-default, #168821)" },
            ].map((f) => (
              <div key={f.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-secondary-07)" }}>{f.label}</span>
                  <span style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--color-secondary-09)", fontSize: "0.85rem" }}>
                    {f.n.toLocaleString("pt-BR")}
                  </span>
                </div>
                <div style={{ height: 8, background: "var(--color-secondary-03)", borderRadius: 99 }}>
                  <div style={{ height: "100%", borderRadius: 99, background: f.color, width: `${f.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3" style={{ borderTop: "1px solid var(--color-secondary-03)", display: "flex", alignItems: "center", gap: 8 }}>
            <i className="fas fa-trophy" style={{ color: "var(--warning, #ffcd07)", fontSize: 16 }} aria-hidden="true" />
            <span style={{ fontWeight: 700, color: "var(--color-secondary-08)", fontSize: "0.9rem" }}>
              Taxa de regularização: <span style={{ color: "var(--color-success-default, #168821)" }}>43%</span>
            </span>
            <span style={{ color: "var(--color-secondary-06)", fontSize: "0.8rem", marginLeft: 4 }}>
              de cada 100 consultados
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
