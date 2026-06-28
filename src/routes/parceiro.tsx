import { createFileRoute, Link } from "@tanstack/react-router";
import govBrLogo from "@/assets/govbr-logo.svg";
import { useState, useEffect } from "react";
import { useDiagnostico } from "@/hooks/use-diagnostico";
import type { DiagnosticoResult } from "@/lib/services/diagnostico-engine";
import { DemoPage } from "@/components/car-assistente";
import { PilotoPage } from "@/components/piloto-demo";

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
  { cpf: "107.282.101-00", label: "Pendente · doc. desatualizado",   hint: "CCIR (Certificado de Cadastro de Imóvel Rural) vencido + domínio" },
  { cpf: "287.016.154-91", label: "Sobreposição · APP (Área de Preservação Permanente) + RL (Reserva Legal)", hint: "Conflito de polígono" },
  { cpf: "321.654.987-91", label: "Cancelado · requer reativação",   hint: "Inconsistência de domínio" },
  { cpf: "555.666.777-20", label: "Pendente · dados incorretos",     hint: "Área divergente" },
  { cpf: "111.222.333-96", label: "Regular · nenhuma ação",          hint: "CAR em dia" },
  { cpf: "448.903.217-05", label: "Múltiplas pendências · misto",    hint: "CCIR + sobreposição APP" },
];

// ── Processo de resolução ─────────────────────────────────────────────────────

type ProcessoInfo = {
  label: string;
  modulo: string;
  desc: string;
  icon: string;
  color: string;
};

function getProcessoInfoList(data: DiagnosticoResult): ProcessoInfo[] {
  const status = data.sicar?.status;
  const pendencias: string[] = data.sicar?.pendencias ?? [];
  const result: ProcessoInfo[] = [];

  if (status === "sobreposicao") {
    result.push({
      label: "Análise técnica presencial",
      modulo: "EMATER (Empresa de Assistência Técnica e Extensão Rural) / Órgão ambiental",
      desc: "Sobreposição com APP (Área de Preservação Permanente) ou RL (Reserva Legal) exige laudo de engenheiro florestal e aprovação do órgão ambiental estadual. Não resolve digitalmente.",
      icon: "fa-user-tie",
      color: "#b71c1c",
    });
  }

  if (status === "cancelado") {
    result.push({
      label: "Reativação junto ao órgão estadual",
      modulo: "Central do SICAR (Sistema de Cadastro Ambiental Rural)",
      desc: "CAR (Cadastro Ambiental Rural) cancelado por inconsistência. É preciso solicitar reativação com documentação de domínio atualizada junto ao órgão ambiental estadual.",
      icon: "fa-redo",
      color: "#616161",
    });
  }

  if (status === "pendente" || status === "sobreposicao") {
    const temDoc = pendencias.some(
      (p) =>
        p.toLowerCase().includes("ccir") ||
        p.toLowerCase().includes("domínio") ||
        p.toLowerCase().includes("documento") ||
        p.toLowerCase().includes("comprovante")
    );
    if (temDoc) {
      result.push({
        label: "Etapa 1 — Documentação (resolve digitalmente)",
        modulo: "Módulo de Cadastro (SICAR — Sistema de Cadastro Ambiental Rural — offline)",
        desc: "O produtor atualiza os dados de domínio (tipo, número, cartório) pelo celular em até 5 minutos. O upload da cópia é sempre opcional — CAR é declaratório.",
        icon: "fa-file-alt",
        color: "#e65100",
      });
    }

    const temGeo = pendencias.some(
      (p) =>
        p.toLowerCase().includes("área") ||
        p.toLowerCase().includes("módulo") ||
        p.toLowerCase().includes("polígono") ||
        p.toLowerCase().includes("diverge")
    );
    if (temGeo) {
      result.push({
        label: "Etapa — Retificação Geo (resolve digitalmente)",
        modulo: "Módulo de Cadastro (SICAR — Sistema de Cadastro Ambiental Rural — offline)",
        desc: "Divergência de área ou polígono. O produtor corrige os dados georreferenciados no Módulo de Cadastro e reenvia o arquivo .CAR.",
        icon: "fa-map-marked-alt",
        color: "#1565c0",
      });
    }

    const temApp = pendencias.some(
      (p) =>
        p.toLowerCase().includes("app") ||
        p.toLowerCase().includes("preservação") ||
        p.toLowerCase().includes("sobreposição") ||
        p.toLowerCase().includes("reserva legal")
    );
    if (temApp) {
      result.push({
        label: "Etapa — Análise técnica presencial (requer EMATER)",
        modulo: "EMATER (Empresa de Assistência Técnica e Extensão Rural) / Órgão ambiental",
        desc: "Sobreposição com APP (Área de Preservação Permanente) ou RL (Reserva Legal) requer laudo técnico. Um técnico da EMATER recebe o diagnóstico já preparado.",
        icon: "fa-user-tie",
        color: "#b71c1c",
      });
    }

    if (!temDoc && !temGeo && !temApp) {
      result.push({
        label: "Retificação no Módulo de Cadastro",
        modulo: "Módulo de Cadastro (SICAR — Sistema de Cadastro Ambiental Rural — offline)",
        desc: "O produtor corrige os dados declarados e reenvia o arquivo .CAR. Somente os campos com asterisco são exigidos.",
        icon: "fa-edit",
        color: "#e65100",
      });
    }
  }

  return result;
}

// ── Root ──────────────────────────────────────────────────────────────────────

type AppStep = "govbr" | "login" | "portal";

const SESSION_KEY = "carproativo_session";

function ParceirPage() {
  const [step, setStep] = useState<AppStep>(() => {
    try { return (sessionStorage.getItem(SESSION_KEY + "_step") as AppStep) || "govbr"; } catch { return "govbr"; }
  });
  const [institution, setInstitution] = useState<Institution | null>(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY + "_inst");
      return raw ? (JSON.parse(raw) as Institution) : null;
    } catch { return null; }
  });

  function persist(s: AppStep, inst: Institution | null) {
    try {
      sessionStorage.setItem(SESSION_KEY + "_step", s);
      sessionStorage.setItem(SESSION_KEY + "_inst", inst ? JSON.stringify(inst) : "");
    } catch {}
  }

  function handleAuth() { persist("login", null); setStep("login"); }
  function handleLogin(inst: Institution) { persist("portal", inst); setInstitution(inst); setStep("portal"); }
  function handleLogout() { persist("govbr", null); setInstitution(null); setStep("govbr"); }

  if (step === "govbr") return <GovBrScreen onAuth={handleAuth} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <GovBrTopBar onLogout={handleLogout} />
      {step === "login"
        ? <LoginScreen onLogin={handleLogin} />
        : <PortalScreen institution={institution!} onLogout={handleLogout} />
      }
    </div>
  );
}

// ── Gov.br authenticated top bar ─────────────────────────────────────────────

function GovBrTopBar({ onLogout }: { onLogout: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div style={{
      background: "#1351b4", color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", height: 44, fontSize: 13, position: "sticky", top: 0, zIndex: 200,
      fontFamily: "Rawline, sans-serif",
    }}>
      {/* Left: gov.br logo + nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <img
          src="https://sso.acesso.gov.br/assets/govbr/img/govbr-colorido-b.png"
          alt="gov.br"
          style={{ height: 20 }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <span style={{ color: "rgba(255,255,255,0.55)", margin: "0 4px" }}>|</span>
        {["Institucional", "Acessibilidade", "Comunica BR", "Participe"].map((label) => (
          <span key={label} style={{ color: "rgba(255,255,255,0.85)", cursor: "pointer", fontSize: 12 }}>{label}</span>
        ))}
      </div>

      {/* Right: atalhos + user */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          border: "1px solid rgba(255,255,255,0.5)", borderRadius: 4,
          padding: "3px 10px", cursor: "pointer", fontSize: 12,
        }}>
          <i className="fas fa-th" aria-hidden="true" style={{ fontSize: 11 }} />
          Atalhos gov.br
        </div>

        {/* User pill */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "none", border: "none", color: "#fff",
              cursor: "pointer", fontSize: 13, fontFamily: "inherit",
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: "50%", background: "#3a3a3a",
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden",
            }}>
              <i className="fas fa-user" style={{ fontSize: 14, color: "#fff" }} aria-hidden="true" />
            </div>
            <span>Olá, <strong>Elias</strong></span>
            <i className="fas fa-chevron-down" style={{ fontSize: 10, opacity: 0.7 }} aria-hidden="true" />
          </button>

          {menuOpen && (
            <div style={{
              position: "absolute", right: 0, top: "calc(100% + 8px)",
              background: "#fff", color: "#333", borderRadius: 6,
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)", minWidth: 180, zIndex: 300,
              overflow: "hidden",
            }}>
              <div style={{ padding: "10px 16px", borderBottom: "1px solid #eee", fontSize: 12, color: "#555" }}>
                <div style={{ fontWeight: 700, color: "#222" }}>Elias Ricardo</div>
                <div>CPF: ***.***.***/00</div>
              </div>
              <button
                type="button"
                onClick={() => { setMenuOpen(false); onLogout(); }}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  width: "100%", padding: "10px 16px", background: "none",
                  border: "none", cursor: "pointer", fontSize: 13, color: "#c00",
                }}
              >
                <i className="fas fa-sign-out-alt" aria-hidden="true" />
                Sair do gov.br
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Gov.br ────────────────────────────────────────────────────────────────────

function GovBrScreen({ onAuth }: { onAuth: () => void }) {
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [cpfOpen, setCpfOpen] = useState(true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); onAuth(); }, 1600);
  }

  const itemStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", padding: "12px 16px",
    borderTop: "1px solid #e0e0e0", cursor: "pointer", background: "none",
    border: "none", width: "100%", textAlign: "left", gap: 12,
  };
  const itemImgStyle: React.CSSProperties = { width: 24, height: 24, objectFit: "contain", flexShrink: 0 };

  return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", flexDirection: "column", fontFamily: "Rawline, sans-serif" }}>
      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px", borderBottom: "1px solid #e0e0e0", height: 48 }}>
        <img
          src="https://sso.acesso.gov.br/assets/govbr/img/govbr.png"
          alt="Logomarca GovBR"
          style={{ height: 32 }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
            (e.target as HTMLImageElement).insertAdjacentHTML("afterend", '<span style="font-weight:800;font-size:1.3rem"><span style="color:#1351B4">g</span><span style="color:#168821">o</span><span style="color:#1351B4">v</span><span style="color:#FFCD07">.</span><span style="color:#1351B4">b</span><span style="color:#168821">r</span></span>');
          }}
        />
        <div style={{ display: "flex", gap: 20 }}>
          <a href="#" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", color: "#333", textDecoration: "none" }}>
            <i className="fas fa-adjust" aria-hidden="true" /> Alto Contraste
          </a>
          <a href="//www.vlibras.gov.br" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", color: "#333", textDecoration: "none" }}>
            <i className="fas fa-deaf" aria-hidden="true" /> VLibras
          </a>
        </div>
      </header>

      {/* Body */}
      <div style={{ flex: 1, display: "flex" }}>
        {/* Aside — imagem */}
        <aside style={{ flex: "0 0 57%", overflow: "hidden", display: "flex" }}>
          <img
            src="https://sso.acesso.gov.br/assets/govbr/img/conta_govbr_v2_defeso-eleitoral.jpg"
            alt="Uma conta gov.br garante a identificação de cada cidadão que acessa os serviços digitais públicos."
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
          />
        </aside>

        {/* Main — form */}
        <main style={{ flex: "0 0 43%", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 40px 32px 32px" }}>
          <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 380 }}>
            <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 4, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
              <h3 style={{ margin: 0, padding: "20px 20px 12px", fontSize: "0.95rem", fontWeight: 700, color: "#1a1a1a" }}>
                Identifique-se no gov.br com:
              </h3>

              {/* CPF accordion header */}
              <div
                style={{ ...itemStyle, borderTop: "1px solid #e0e0e0" }}
                onClick={() => setCpfOpen(o => !o)}
              >
                <img
                  src="https://sso.acesso.gov.br/assets/govbr/img/icons/id-card-solid.png"
                  alt=""
                  style={itemImgStyle}
                  onError={(e) => { (e.target as HTMLImageElement).replaceWith(Object.assign(document.createElement("i"), { className: "fas fa-id-card", style: "color:#1351B4;font-size:18px" })); }}
                />
                <a style={{ color: "#1351B4", fontSize: "0.88rem", fontWeight: 600, textDecoration: "none" }}>
                  Número do CPF
                </a>
              </div>

              {/* CPF accordion panel */}
              {cpfOpen && (
                <div style={{ padding: "12px 20px 16px", borderTop: "1px solid #eee", background: "#fafafa" }}>
                  <p style={{ margin: "0 0 12px", fontSize: "0.8rem", color: "#555", lineHeight: 1.55 }}>
                    Digite seu CPF para <strong>criar</strong> ou <strong>acessar</strong> sua conta gov.br
                  </p>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#333", marginBottom: 6 }}>CPF</label>
                  <input
                    id="accountId"
                    type="tel"
                    inputMode="numeric"
                    placeholder="Digite seu CPF"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    autoComplete="off"
                    style={{
                      width: "100%", padding: "10px 12px", boxSizing: "border-box",
                      border: "1px solid #bdbdbd", borderRadius: 4,
                      fontSize: "0.9rem", color: "#1a1a1a", marginBottom: 14, outline: "none",
                      background: "#fff",
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "#1351B4"; e.target.style.boxShadow = "0 0 0 2px rgba(19,81,180,0.15)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#bdbdbd"; e.target.style.boxShadow = "none"; }}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        padding: "10px 32px", borderRadius: 999, border: "none",
                        background: "#1351B4", color: "#fff", fontWeight: 700,
                        fontSize: "0.88rem", cursor: loading ? "default" : "pointer",
                        opacity: loading ? 0.6 : 1,
                      }}
                    >
                      {loading ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: 6 }} aria-hidden="true" />Aguarde…</> : "Continuar"}
                    </button>
                  </div>
                </div>
              )}

              {/* Outras opções */}
              <label style={{ display: "block", padding: "12px 20px 4px", fontSize: "0.78rem", fontWeight: 600, color: "#555" }}>
                Outras opções de identificação:
              </label>
              <hr style={{ margin: "0 0 0", border: "none", borderTop: "1px solid #e0e0e0" }} />

              {/* Login com banco */}
              <button type="button" style={{ ...itemStyle, color: "#008C32", borderTop: "none", paddingLeft: 20 }}>
                <img src="https://sso.acesso.gov.br/assets/govbr/img/icons/InternetBanking-green.png" alt="" style={itemImgStyle}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <span style={{ color: "#008C32", fontSize: "0.85rem", fontWeight: 600 }}>Login com seu banco</span>
                <span style={{ fontSize: "0.55rem", background: "#008C32", color: "#fff", padding: "2px 5px", position: "relative", top: -3, marginLeft: 4, fontWeight: 700, letterSpacing: "0.04em" }}>
                  SUA CONTA SERÁ PRATA
                </span>
              </button>

              {/* QR code */}
              <button type="button" style={{ ...itemStyle, paddingLeft: 20 }}>
                <img src="https://sso.acesso.gov.br/assets/govbr/img/icons/qrcode.png" alt="" style={itemImgStyle}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <span style={{ color: "#1351B4", fontSize: "0.85rem" }}>Login com QR code</span>
              </button>

              {/* Certificado digital */}
              <button type="button" style={{ ...itemStyle, paddingLeft: 20 }}>
                <img src="https://sso.acesso.gov.br/assets/govbr/img/icons/CD.png" alt="" style={itemImgStyle}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <span style={{ color: "#1351B4", fontSize: "0.85rem" }}>Seu certificado digital</span>
              </button>

              {/* Certificado digital em nuvem */}
              <button type="button" style={{ ...itemStyle, paddingLeft: 20 }}>
                <img src="https://sso.acesso.gov.br/assets/govbr/img/icons/CD-Nuvem.png" alt="" style={itemImgStyle}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <span style={{ color: "#1351B4", fontSize: "0.85rem" }}>Seu certificado digital em nuvem</span>
              </button>

              {/* Footer links */}
              <div style={{ padding: "16px 20px", borderTop: "1px solid #e0e0e0", display: "flex", flexDirection: "column", gap: 8 }}>
                <a href="#" style={{ display: "flex", alignItems: "center", gap: 8, color: "#1351B4", fontSize: "0.8rem", textDecoration: "none" }}>
                  <img src="https://sso.acesso.gov.br/assets/govbr/fontawesome/webfonts/circle-question-solid.svg" alt="" style={{ width: 14, height: 14 }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  Está com dúvidas e precisa de ajuda?
                </a>
                <a href="#" style={{ color: "#1351B4", fontSize: "0.8rem", textDecoration: "none" }}>
                  Termo de Uso e Aviso de Privacidade
                </a>
                <p style={{ margin: "4px 0 0", fontSize: "0.65rem", color: "#aaa" }}>
                  Simulação — qualquer CPF é aceito nesta demonstração
                </p>
              </div>
            </div>
          </form>
        </main>
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
              Insira o código recebido por e‑mail para acessar o Portal do Parceiro CAR (Cadastro Ambiental Rural)
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

type PortalTab = "consulta" | "assistente" | "piloto" | "painel";

const PORTAL_TABS: { id: PortalTab; label: string; icon: string }[] = [
  { id: "consulta",   label: "Consultar CPF", icon: "fa-search" },
  { id: "assistente", label: "CAR Proativo", icon: "fa-robot" },
  { id: "piloto",     label: "Fluxo do produtor", icon: "fa-mobile-alt" },
  { id: "painel",     label: "Painel",         icon: "fa-chart-bar" },
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
            <span style={{ fontSize: "0.75rem", color: "var(--color-secondary-05)" }}>
              <i className="fas fa-shield-alt mr-1" aria-hidden="true" />
              Sessão gov.br ativa
            </span>
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

{tab === "painel" && <MetricsSection institution={institution} />}
          {tab === "assistente" && <DemoPage />}
          {tab === "piloto" && <PilotoPage />}
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
              <Link to="/demo" className="br-button circle small inverted" aria-label="Demonstração">
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
          <strong style={{ color: "var(--color-secondary-07)" }}>CPF (Cadastro de Pessoas Físicas) não encontrado no SICAR (Sistema de Cadastro Ambiental Rural)</strong>
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

            {(() => {
              const procs = getProcessoInfoList(data);
              if (procs.length === 0) return null;
              const digital = procs.filter(p => p.icon !== "fa-user-tie" && p.icon !== "fa-redo").length;
              const presencial = procs.filter(p => p.icon === "fa-user-tie").length;
              return (
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                  {procs.length > 1 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, background: "#e65100", color: "#fff", borderRadius: 4, padding: "2px 8px" }}>
                        {procs.length} caminhos de resolução
                      </span>
                      {digital > 0 && (
                        <span style={{ fontSize: "0.7rem", fontWeight: 700, background: "#168821", color: "#fff", borderRadius: 4, padding: "2px 8px" }}>
                          {digital} resolve{digital === 1 ? "" : "m"} pelo celular
                        </span>
                      )}
                      {presencial > 0 && (
                        <span style={{ fontSize: "0.7rem", fontWeight: 700, background: "#b71c1c", color: "#fff", borderRadius: 4, padding: "2px 8px" }}>
                          {presencial} requer{presencial === 1 ? "" : "em"} visita técnica
                        </span>
                      )}
                    </div>
                  )}
                  {procs.map((proc, i) => (
                    <div key={i} style={{
                      background: `${proc.color}09`,
                      border: `1px solid ${proc.color}30`,
                      borderRadius: 8,
                      padding: "10px 14px",
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                    }}>
                      <i className={`fas ${proc.icon}`} style={{ color: proc.color, fontSize: 13, flexShrink: 0, marginTop: 3 }} aria-hidden="true" />
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <strong style={{ fontSize: "0.72rem", color: proc.color, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                            {proc.label}
                          </strong>
                          <span style={{ fontSize: "0.68rem", color: "var(--color-secondary-06)", fontStyle: "italic" }}>
                            {proc.modulo}
                          </span>
                        </div>
                        <p style={{ margin: "3px 0 0", fontSize: "0.77rem", color: "var(--color-secondary-07)", lineHeight: 1.55 }}>
                          {proc.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
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
  const [recipient, setRecipient] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const message = buildMessage(channel, data, institution);

  const recipientLabel = channel === "email" ? "E-mail do produtor" : "WhatsApp / celular do produtor";
  const recipientPlaceholder = channel === "email" ? "exemplo@email.com" : "(99) 99999-9999";
  const recipientType = channel === "email" ? "email" : "tel";

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
                        onClick={() => { setChannel(key); setRecipient(""); }}
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

              {/* Recipient input */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-secondary-07)", marginBottom: 8 }}>
                  {recipientLabel}
                </label>
                <input
                  type={recipientType}
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder={recipientPlaceholder}
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: 6, fontSize: "0.9rem",
                    border: "1.5px solid var(--color-secondary-04)", outline: "none",
                    color: "var(--color-secondary-09)", boxSizing: "border-box",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "var(--color-primary-default)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--color-secondary-04)"; }}
                />
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
                  disabled={sending || recipient.trim() === ""}
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
