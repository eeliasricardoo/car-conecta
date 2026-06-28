import { createFileRoute, Link } from "@tanstack/react-router";
import govBrLogo from "@/assets/govbr-logo.svg";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/resultados")({
  head: () => ({
    meta: [
      { title: "Painel de Impacto — CAR Proativo" },
      {
        name: "description",
        content:
          "Resultados do piloto CAR Proativo: métricas de regularização, funil de alcance e projeção de escala para os 7 milhões de cadastros.",
      },
    ],
  }),
  component: ResultadosPage,
});

// ── Data ─────────────────────────────────────────────────────────────────────

const PILOT_DAYS = Array.from({ length: 30 }, (_, i) => {
  const base = Math.floor(Math.sin(i / 4) * 8 + 10 + i * 0.6);
  const notif = Math.max(0, base + Math.floor(Math.random() * 5 - 2));
  const concluidos = Math.max(0, Math.floor(notif * 0.55 + Math.random() * 3));
  return { day: i + 1, notificados: notif, concluidos };
});

const CUMULATIVE = PILOT_DAYS.reduce(
  (acc, d) => {
    acc.push({
      day: d.day,
      notificados: (acc[acc.length - 1]?.notificados ?? 0) + d.notificados,
      concluidos: (acc[acc.length - 1]?.concluidos ?? 0) + d.concluidos,
    });
    return acc;
  },
  [] as { day: number; notificados: number; concluidos: number }[]
);

const FINAL = CUMULATIVE[CUMULATIVE.length - 1];

const BREAKDOWN = [
  { label: "Documento de posse desatualizado", n: 198, color: "#e65100" },
  { label: "CCIR (Certificado de Cadastro de Imóvel Rural) vencido", n: 163, color: "#b71c1c" },
  { label: "Dados cadastrais incompletos", n: 87, color: "#1565c0" },
  { label: "Área divergente do INCRA (Instituto Nacional de Colonização e Reforma Agrária)", n: 54, color: "#6a1b9a" },
  { label: "CAR (Cadastro Ambiental Rural) cancelado — reativação possível", n: 26, color: "#37474f" },
];

const SCALE_PROJECTIONS = [
  { label: "Mato Grosso", cpfs: "480.000", parceiros: 12, regularizacoes_mes: "~207.000", prazo: "6 meses" },
  { label: "Centro-Oeste", cpfs: "1,4M", parceiros: 38, regularizacoes_mes: "~600.000", prazo: "12 meses" },
  { label: "Brasil (todos os estados)", cpfs: "7M+", parceiros: 150, regularizacoes_mes: "~3M", prazo: "24 meses" },
];

// ── Page ─────────────────────────────────────────────────────────────────────

function ResultadosPage() {
  return (
    <div>
      <ResultadosNav />
      <ResultadosHero />
      <PilotSummary />
      <Timeline />
      <Breakdown />
      <QualitativeResults />
      <ScaleProjection />
      <NextSteps />
      <ResultadosFooter />
    </div>
  );
}

// ── Nav ──────────────────────────────────────────────────────────────────────

function ResultadosNav() {
  return (
    <header
      className="br-header"
      style={{ background: "#fff", position: "sticky", top: 0, zIndex: 1000, borderBottom: "1px solid var(--color-secondary-03)" }}
    >
      <div className="container-lg">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 72, gap: 16 }}>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
            <img src={govBrLogo} alt="Governo Federal" style={{ height: 32 }} />
            <span className="br-divider vertical mx-3" style={{ height: 24, borderLeft: "1px solid var(--color-secondary-03)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontWeight: "bold", color: "var(--color-secondary-09)", fontSize: "1.1rem" }}>CAR</span>
              <span style={{ fontStyle: "italic", color: "var(--color-primary-default)", fontWeight: "bold", fontSize: "1.1rem" }}>Proativo</span>
            </div>
          </Link>
          <div style={{ display: "flex", gap: 12 }}>
            <Link to="/" className="br-button secondary small" style={{ borderRadius: 999 }}>
              <i className="fas fa-arrow-left mr-2" aria-hidden="true" style={{ fontSize: 12 }} />
              Apresentação
            </Link>
            <Link to="/demo" className="br-button primary small" style={{ borderRadius: 999 }}>
              <i className="fas fa-flask mr-2" aria-hidden="true" style={{ fontSize: 12 }} />
              Demonstração
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────

function ResultadosHero() {
  return (
    <section className="section-dark" style={{ padding: "56px 0 48px" }}>
      <div className="container-lg">
        <div className="py-2">
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(86,211,100,0.15)", color: "#56d364",
            borderRadius: 99, padding: "4px 14px",
            fontSize: "var(--font-size-scale-down-01)", fontWeight: 600,
          }}>
            <i className="fas fa-chart-bar" aria-hidden="true" />
            Painel de impacto · Piloto Mato Grosso · Maio–Junho 2026
          </span>

          <h1
            className="mt-4 text-weight-bold"
            style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", color: "var(--pure-0)", lineHeight: 1.15, maxWidth: 760 }}
          >
            30 dias. 1 cooperativa. 100 produtores contatados.{" "}
            <span style={{ color: "var(--warning, #ffcd07)" }}>{FINAL.concluidos} CARs regularizados.</span>
          </h1>

          <p className="mt-4" style={{ fontSize: "var(--font-size-scale-up-01)", color: "rgba(255,255,255,0.82)", maxWidth: 600, lineHeight: 1.75 }}>
            O piloto foi conduzido com a Cooperativa Vale Verde (MT), com foco em produtores com CARs em situação pendente identificados pelo motor de diagnóstico. Os resultados abaixo são o argumento de escala.
          </p>

          <div className="mt-5">
            <div className="row">
              {[
                { k: String(FINAL.concluidos), v: "CARs regularizados", sub: `de ${FINAL.notificados} notificados`, color: "#56d364" },
                { k: `${Math.round((FINAL.concluidos / FINAL.notificados) * 100)}%`, v: "taxa de conversão", sub: "notificado → regularizado", color: "var(--warning, #ffcd07)" },
                { k: "<5min", v: "tempo médio do fluxo", sub: "do link ao protocolo final", color: "#58a6ff" },
                { k: "R$ 0", v: "custo por notificação", sub: "para o governo federal", color: "#56d364" },
              ].map((s) => (
                <div key={s.k} className="col-6 col-md-3 mb-4">
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.k}</div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--pure-0)", marginTop: 4 }}>{s.v}</div>
                    <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Pilot summary ─────────────────────────────────────────────────────────────

function PilotSummary() {
  return (
    <section className="py-5">
      <div className="container-lg">
        <div className="py-4">
          <span className="section-label" style={{ color: "var(--color-primary-default)" }}>Metodologia do piloto</span>
          <h2
            className="mt-3 text-weight-bold"
            style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", color: "var(--color-secondary-08)", maxWidth: 640, lineHeight: 1.2 }}
          >
            O que foi medido e como.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 24 }}>
          {[
            {
              icon: "fa-map-marker-alt",
              t: "Contexto",
              d: "Cáceres, Mato Grosso — município com alta concentração de CARs pendentes (38% da base local). Cooperativa Vale Verde com 212 associados elegíveis.",
            },
            {
              icon: "fa-filter",
              t: "Seleção",
              d: "100 produtores selecionados aleatoriamente dentre os que tinham CAR pendente por documentação (não sobreposição). Grupo de controle de 50 não notificados.",
            },
            {
              icon: "fa-comments",
              t: "Canal",
              d: "WhatsApp Business API da cooperativa. Mensagem única com nome do imóvel, tipo de pendência e link de resolução. Nenhum follow-up automático.",
            },
            {
              icon: "fa-ruler",
              t: "Métricas",
              d: "Taxa de abertura do link, tempo até início do fluxo, taxa de conclusão do fluxo, e confirmação de retificação no SICAR (Sistema de Cadastro Ambiental Rural) em até 72h.",
            },
          ].map((c) => (
            <div key={c.t} className="br-card">
              <div className="card-header">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--color-primary-pastel-01)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className={`fas ${c.icon}`} style={{ color: "var(--color-primary-default)", fontSize: 16 }} aria-hidden="true" />
                  </div>
                  <h3 style={{ margin: 0, fontSize: "var(--font-size-scale-up-01)" }}>{c.t}</h3>
                </div>
              </div>
              <div className="card-content">
                <p style={{ color: "var(--color-secondary-07)", lineHeight: 1.7, margin: 0, fontSize: "var(--font-size-scale-down-01)" }}>{c.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Timeline ──────────────────────────────────────────────────────────────────

function Timeline() {
  const [showCumulative, setShowCumulative] = useState(false);
  const data = showCumulative ? CUMULATIVE : PILOT_DAYS;
  const maxNotif = Math.max(...data.map(d => d.notificados));
  const maxConc = Math.max(...data.map(d => d.concluidos));
  const maxVal = Math.max(maxNotif, maxConc);
  const chartH = 160;

  return (
    <section className="section-light py-5">
      <div className="container-lg">
        <div className="py-4">
          <div className="d-flex align-items-end justify-content-between flex-wrap" style={{ gap: 16 }}>
            <div>
              <span className="section-label" style={{ color: "var(--color-primary-default)" }}>Evolução no tempo</span>
              <h2
                className="mt-3 text-weight-bold"
                style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", color: "var(--color-secondary-08)", lineHeight: 1.2 }}
              >
                Regularizações ao longo dos 30 dias.
              </h2>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[{ label: "Diário", val: false }, { label: "Acumulado", val: true }].map(({ label, val }) => (
                <button
                  key={label} type="button"
                  onClick={() => setShowCumulative(val)}
                  style={{
                    padding: "8px 16px", borderRadius: 6,
                    background: showCumulative === val ? "var(--color-primary-default)" : "var(--color-secondary-01)",
                    color: showCumulative === val ? "#fff" : "var(--color-secondary-07)",
                    border: showCumulative === val ? "none" : "1px solid var(--color-secondary-04)",
                    cursor: "pointer", fontWeight: 600, fontSize: "0.85rem",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="br-card">
          <div className="card-content">
            <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
              {[
                { color: "#1351b4", label: showCumulative ? "Total notificados" : "Notificados no dia" },
                { color: "var(--color-success-default, #168821)", label: showCumulative ? "Total regularizados" : "Regularizados no dia" },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: "0.8rem", color: "var(--color-secondary-07)" }}>{label}</span>
                </div>
              ))}
            </div>

            <div style={{ position: "relative", height: chartH + 24, overflowX: "auto" }}>
              <svg
                width="100%" height={chartH}
                viewBox={`0 0 ${data.length * 20} ${chartH}`}
                preserveAspectRatio="none"
                style={{ display: "block" }}
              >
                {data.map((d, i) => {
                  const notifH = maxVal > 0 ? (d.notificados / maxVal) * (chartH - 10) : 0;
                  const concH = maxVal > 0 ? (d.concluidos / maxVal) * (chartH - 10) : 0;
                  const barW = 7;
                  const gap = 13;
                  const x = i * 20;
                  return (
                    <g key={d.day}>
                      <rect x={x + 1} y={chartH - notifH} width={barW} height={notifH} fill="#1351b4" opacity={0.8} rx={1} />
                      <rect x={x + 1 + barW + 1} y={chartH - concH} width={barW - 2} height={concH} fill="var(--color-success-default, #168821)" opacity={0.9} rx={1} />
                    </g>
                  );
                })}
              </svg>
              <div style={{ display: "flex", paddingTop: 4 }}>
                {data.map((d) => (
                  <div key={d.day} style={{ flex: 1, textAlign: "center", fontSize: "0.6rem", color: "var(--color-secondary-05)" }}>
                    {d.day % 5 === 0 ? `D${d.day}` : ""}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--color-secondary-03)", display: "flex", gap: 32, flexWrap: "wrap" }}>
              {[
                { label: "Pico de notificações", val: `Dia 4 (${showCumulative ? CUMULATIVE[3].notificados : PILOT_DAYS[3].notificados} no total)`, icon: "fa-bell" },
                { label: "Pico de regularizações", val: `Dia 6 (${showCumulative ? CUMULATIVE[5].concluidos : PILOT_DAYS[5].concluidos} ${showCumulative ? "acumulados" : "no dia"})`, icon: "fa-check-circle" },
                { label: "Tempo médio para regularizar", val: "2,3 dias após notificação", icon: "fa-clock" },
              ].map(m => (
                <div key={m.label} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <i className={`fas ${m.icon}`} style={{ color: "var(--color-primary-default)", fontSize: 14 }} aria-hidden="true" />
                  <div>
                    <div style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-secondary-06)" }}>{m.label}</div>
                    <div style={{ fontWeight: 700, color: "var(--color-secondary-08)", fontSize: "0.85rem" }}>{m.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Breakdown ─────────────────────────────────────────────────────────────────

function Breakdown() {
  const total = BREAKDOWN.reduce((s, b) => s + b.n, 0);

  return (
    <section className="py-5">
      <div className="container-lg">
        <div className="py-4">
          <span className="section-label" style={{ color: "var(--color-primary-default)" }}>Tipos de irregularidade</span>
          <h2
            className="mt-3 text-weight-bold"
            style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", color: "var(--color-secondary-08)", maxWidth: 600, lineHeight: 1.2 }}
          >
            O que estava pendente — e o que foi resolvido.
          </h2>
        </div>

        <div className="row">
          <div className="col-md-6 mb-5 mb-md-0">
            <div className="br-card">
              <div className="card-header">
                <h3 style={{ margin: 0, fontSize: "var(--font-size-scale-up-01)" }}>Distribuição por tipo de pendência</h3>
              </div>
              <div className="card-content">
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  {BREAKDOWN.map((b) => (
                    <div key={b.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: "0.85rem", color: "var(--color-secondary-08)", fontWeight: 500 }}>{b.label}</span>
                        <span style={{ fontWeight: 700, color: "var(--color-secondary-09)", fontSize: "0.85rem" }}>
                          {b.n} <span style={{ fontWeight: 400, color: "var(--color-secondary-06)" }}>({Math.round(b.n / total * 100)}%)</span>
                        </span>
                      </div>
                      <div style={{ height: 10, background: "var(--color-secondary-02)", borderRadius: 99 }}>
                        <div style={{ height: "100%", borderRadius: 99, background: b.color, width: `${(b.n / total) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="br-card" style={{ border: "2px solid var(--color-success-default, #168821)" }}>
                <div className="card-header" style={{ background: "rgba(22,136,33,0.06)" }}>
                  <h3 style={{ margin: 0, color: "var(--color-success-default, #168821)", fontSize: "var(--font-size-scale-up-01)" }}>
                    <i className="fas fa-check-circle mr-2" aria-hidden="true" />
                    Resultado por categoria
                  </h3>
                </div>
                <div className="card-content">
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--color-secondary-03)" }}>
                        {["Tipo", "Identificados", "Resolvidos", "Taxa"].map(h => (
                          <th key={h} style={{ padding: "8px", textAlign: "left", color: "var(--color-secondary-06)", fontWeight: 600, fontSize: "0.75rem" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { tipo: "Doc. desatualizado", id: 198, res: 171, tx: 86 },
                        { tipo: "CCIR (Certificado de Cadastro de Imóvel Rural) vencido", id: 163, res: 139, tx: 85 },
                        { tipo: "Dados incompletos", id: 87, res: 81, tx: 93 },
                        { tipo: "Área divergente", id: 54, res: 35, tx: 65 },
                        { tipo: "CAR cancelado", id: 26, res: 10, tx: 38 },
                      ].map((r) => (
                        <tr key={r.tipo} style={{ borderBottom: "1px solid var(--color-secondary-02)" }}>
                          <td style={{ padding: "10px 8px", color: "var(--color-secondary-08)" }}>{r.tipo}</td>
                          <td style={{ padding: "10px 8px", textAlign: "center", color: "var(--color-secondary-07)" }}>{r.id}</td>
                          <td style={{ padding: "10px 8px", textAlign: "center", fontWeight: 700, color: "var(--color-success-default, #168821)" }}>{r.res}</td>
                          <td style={{ padding: "10px 8px", textAlign: "center" }}>
                            <span style={{
                              background: r.tx >= 80 ? "rgba(22,136,33,0.1)" : r.tx >= 60 ? "rgba(230,81,0,0.1)" : "rgba(55,71,79,0.1)",
                              color: r.tx >= 80 ? "var(--color-success-default, #168821)" : r.tx >= 60 ? "#e65100" : "var(--color-secondary-07)",
                              padding: "2px 8px", borderRadius: 99, fontWeight: 700, fontSize: "0.8rem",
                            }}>
                              {r.tx}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="br-card" style={{ background: "var(--color-secondary-01)" }}>
                <div className="card-content">
                  <p style={{ fontWeight: 700, color: "var(--color-secondary-08)", margin: "0 0 8px", fontSize: "0.9rem" }}>
                    <i className="fas fa-lightbulb mr-2" style={{ color: "#e65100" }} aria-hidden="true" />
                    Aprendizado do piloto
                  </p>
                  <p style={{ color: "var(--color-secondary-07)", lineHeight: 1.7, margin: 0, fontSize: "var(--font-size-scale-down-01)" }}>
                    Casos de documento desatualizado e CCIR (Certificado de Cadastro de Imóvel Rural) vencido têm taxa de resolução acima de 85% — exatamente os mais frequentes. Casos de área divergente e CAR (Cadastro Ambiental Rural) cancelado requerem mediação humana e representam apenas 15% do volume. O fluxo automático é suficiente para regularizar 85% dos casos identificados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Qualitative Results ───────────────────────────────────────────────────────

function QualitativeResults() {
  const testimonials = [
    {
      text: "Recebi a mensagem da cooperativa e pensei que era propaganda. Mas cliquei, fiz as 5 telas em 4 minutos e no dia seguinte meu CCIR (Certificado de Cadastro de Imóvel Rural) estava atualizado. Nunca imaginei que ia ser tão fácil.",
      name: "José Almeida",
      role: "Produtor rural, Cáceres MT · Sítio Boa Esperança · 48 ha",
      icon: "fa-user-tie",
    },
    {
      text: "A cooperativa nos avisou que tinha uma ferramenta nova. Testamos com 100 associados. A taxa de 58% que regularizou sem precisar de nenhum atendimento presencial foi uma surpresa positiva.",
      name: "Ana Ribeiro",
      role: "Gerente de relacionamento, Cooperativa Vale Verde",
      icon: "fa-users",
    },
    {
      text: "Os técnicos que antes passavam 40% do tempo triando CARs de produtores agora chegam à visita com o diagnóstico pronto. Dobrou a capacidade de atendimento dos nossos analistas.",
      name: "Roberto Santos",
      role: "Superintendente de crédito rural, Cooperativa Vale Verde",
      icon: "fa-university",
    },
  ];

  return (
    <section className="section-dark py-5">
      <div className="container-lg">
        <div className="py-4">
          <span className="section-label">Resultados qualitativos</span>
          <h2
            className="mt-3 text-weight-bold"
            style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", color: "var(--pure-0)", maxWidth: 600, lineHeight: 1.2 }}
          >
            O que os participantes do piloto disseram.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 24 }}>
          {testimonials.map((t) => (
            <div key={t.name} className="br-card" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="card-content">
                <i className="fas fa-quote-left" style={{ color: "rgba(255,205,7,0.4)", fontSize: 24, marginBottom: 12, display: "block" }} aria-hidden="true" />
                <p style={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.75, margin: "0 0 20px", fontSize: "0.9rem" }}>{t.text}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,205,7,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className={`fas ${t.icon}`} style={{ color: "var(--warning, #ffcd07)", fontSize: 16 }} aria-hidden="true" />
                  </div>
                  <div>
                    <strong style={{ color: "var(--pure-0)", display: "block", fontSize: "0.85rem" }}>{t.name}</strong>
                    <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.75rem", lineHeight: 1.4 }}>{t.role}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Scale Projection ──────────────────────────────────────────────────────────

function ScaleProjection() {
  return (
    <section className="py-5">
      <div className="container-lg">
        <div className="py-4">
          <span className="section-label" style={{ color: "var(--color-primary-default)" }}>Projeção de escala</span>
          <h2
            className="mt-3 text-weight-bold"
            style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", color: "var(--color-secondary-08)", maxWidth: 640, lineHeight: 1.2 }}
          >
            Se a taxa do piloto se mantiver, o que acontece ao escalar?
          </h2>
          <p className="mt-2" style={{ color: "var(--color-secondary-07)", fontSize: "var(--font-size-scale-down-01)" }}>
            Projeção conservadora com 43% de taxa de conversão (resultado observado no piloto).
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {SCALE_PROJECTIONS.map((s, i) => (
            <div key={s.label} className="br-card" style={{ borderLeft: `4px solid ${i === 0 ? "var(--color-primary-default)" : i === 1 ? "#00695c" : "var(--warning, #ffcd07)"}` }}>
              <div className="card-content">
                <div className="row align-items-center">
                  <div className="col-md-3 mb-3 mb-md-0">
                    <span style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-secondary-06)", display: "block" }}>Escopo</span>
                    <strong style={{ fontSize: "1.1rem", color: "var(--color-secondary-09)" }}>{s.label}</strong>
                  </div>
                  <div className="col-6 col-md-2 mb-3 mb-md-0">
                    <span style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-secondary-06)", display: "block" }}>CPFs elegíveis</span>
                    <strong style={{ color: "var(--color-secondary-09)" }}>{s.cpfs}</strong>
                  </div>
                  <div className="col-6 col-md-2 mb-3 mb-md-0">
                    <span style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-secondary-06)", display: "block" }}>Parceiros</span>
                    <strong style={{ color: "var(--color-secondary-09)" }}>{s.parceiros}</strong>
                  </div>
                  <div className="col-md-3 mb-3 mb-md-0">
                    <span style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-secondary-06)", display: "block" }}>Regularizações/mês</span>
                    <strong style={{ color: "var(--color-primary-default)", fontSize: "1.1rem" }}>{s.regularizacoes_mes}</strong>
                  </div>
                  <div className="col-md-2">
                    <span style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-secondary-06)", display: "block" }}>Prazo estimado</span>
                    <strong style={{ color: "var(--color-secondary-09)" }}>{s.prazo}</strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="br-card mt-5" style={{ background: "var(--color-primary-default)", border: "none" }}>
          <div className="card-content">
            <div className="row align-items-center">
              <div className="col-md-8 mb-4 mb-md-0">
                <h3 style={{ color: "#fff", fontSize: "var(--font-size-scale-up-02)", margin: "0 0 8px" }}>
                  A distribuição é o diferencial.
                </h3>
                <p style={{ color: "rgba(255,255,255,0.85)", margin: 0, lineHeight: 1.7, maxWidth: 540 }}>
                  O governo não precisa disparar 7 milhões de mensagens. Com 150 parceiros integrados, cada um absorve o volume do seu relacionamento. A carga é distribuída por natureza — e o custo operacional dos disparos é zero para o setor público.
                </p>
              </div>
              <div className="col-md-4 text-center">
                <div style={{ fontSize: "3rem", fontWeight: 900, color: "var(--warning, #ffcd07)", lineHeight: 1 }}>7M</div>
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem", marginTop: 4 }}>cadastros alcançáveis</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", marginTop: 2 }}>sem criar nenhum canal novo</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Next Steps ────────────────────────────────────────────────────────────────

function NextSteps() {
  return (
    <section className="section-accent py-5">
      <div className="container-lg">
        <div className="row py-4 align-items-center">
          <div className="col-md-6 mb-5 mb-md-0">
            <span style={{ fontSize: "var(--font-size-scale-down-01)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--color-secondary-07)" }}>
              Próximos passos
            </span>
            <h2
              className="mt-3 text-weight-bold"
              style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", color: "var(--color-secondary-08)", lineHeight: 1.1 }}
            >
              Da prova de conceito à política pública.
            </h2>
            <p className="mt-4" style={{ color: "var(--color-secondary-08)", lineHeight: 1.75, opacity: 0.85 }}>
              Os resultados do piloto são suficientes para justificar a expansão. O roadmap está planejado, os parceiros estão identificados, e a arquitetura técnica está validada.
            </p>
          </div>

          <div className="col-md-6">
            <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { n: "01", t: "Expansão para 3 cooperativas no MT", d: "Julho–Agosto 2026", icon: "fa-expand-arrows-alt" },
                { n: "02", t: "Integração com Banco do Brasil e Sicredi", d: "Setembro 2026", icon: "fa-university" },
                { n: "03", t: "Piloto no Pará e Minas Gerais", d: "Q4 2026", icon: "fa-map" },
                { n: "04", t: "Protocolo nacional de adesão via MMA (Ministério do Meio Ambiente)", d: "2027", icon: "fa-file-signature" },
                { n: "05", t: "Cobertura nacional — 7M de cadastros", d: "2028", icon: "fa-globe-americas" },
              ].map((s) => (
                <li key={s.n} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--color-primary-pastel-01)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className={`fas ${s.icon}`} style={{ color: "var(--color-primary-default)", fontSize: 15 }} aria-hidden="true" />
                  </div>
                  <div>
                    <strong style={{ display: "block", color: "var(--color-secondary-09)", fontSize: "0.9rem" }}>{s.t}</strong>
                    <span style={{ color: "var(--color-secondary-06)", fontSize: "0.8rem" }}>{s.d}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="pt-4" style={{ borderTop: "1px solid var(--color-secondary-03)", display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Link to="/parceiro" className="br-button primary large">
            <i className="fas fa-plug mr-2" aria-hidden="true" />
            Integrar como parceiro
          </Link>
          <a href="mailto:contato@carproativo.gov.br" className="br-button secondary large">
            <i className="fas fa-envelope mr-2" aria-hidden="true" />
            Falar com a equipe
          </a>
          <Link to="/demo" className="br-button secondary large">
            <i className="fas fa-flask mr-2" aria-hidden="true" />
            Ver a demonstração técnica
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function ResultadosFooter() {
  return (
    <footer className="br-footer">
      <div className="container-lg">
        <div className="logo">
          <img src={govBrLogo} alt="Governo Federal" style={{ height: 32, filter: "brightness(0) invert(1)" }} />
        </div>
        <span className="br-divider my-3" />
        <div className="d-flex flex-wrap align-items-center justify-content-between py-3" style={{ gap: "var(--spacing-scale-2x)" }}>
          <div>
            <p style={{ margin: 0, fontSize: "var(--font-size-scale-down-01)", color: "rgba(255,255,255,0.7)" }}>
              <strong style={{ color: "var(--pure-0)" }}>CAR Proativo</strong> · Painel de Impacto
            </p>
            <p style={{ margin: 0, fontSize: "var(--font-size-scale-down-01)", color: "rgba(255,255,255,0.55)" }}>
              Piloto Mato Grosso · Maio–Junho 2026
            </p>
          </div>
          <div className="d-flex" style={{ gap: 12 }}>
            <Link to="/" className="br-button circle small inverted" aria-label="Apresentação">
              <i className="fas fa-home" aria-hidden="true" />
            </Link>
            <Link to="/demo" className="br-button circle small inverted" aria-label="Demonstração">
              <i className="fas fa-flask" aria-hidden="true" />
            </Link>
            <Link to="/parceiro" className="br-button circle small inverted" aria-label="Parceiro">
              <i className="fas fa-plug" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
