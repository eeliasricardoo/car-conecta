import { createFileRoute, Link } from "@tanstack/react-router";
import heroProducer from "@/assets/hero-producer.png";
import aerialMosaic from "@/assets/aerial-mosaic.jpg";
import govBrLogo from "@/assets/govbr-logo.svg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CAR Proativo — O CAR que vai até você" },
      {
        name: "description",
        content:
          "Uma camada de inteligência sobre o SICAR que entrega o diagnóstico certo, para o produtor certo, no canal que ele já usa.",
      },
      { property: "og:title", content: "CAR Proativo — O CAR que vai até você" },
      {
        property: "og:description",
        content:
          "Regularização ambiental em escala, distribuída pelos parceiros que já conversam com o produtor rural.",
      },
      { property: "og:image", content: heroProducer },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div>
      <Nav />
      <Hero />
      <Problem />
      <Insight />
      <HowItWorks />
      <Partners />
      <Flow />
      <Objections />
      <Pilot />
      <SiteFooter />
    </div>
  );
}

function Nav() {
  return (
    <header className="br-header" style={{ background: "#fff", position: "sticky", top: 0, zIndex: 1000, borderBottom: "1px solid var(--color-secondary-03)" }}>
      <div className="container-lg">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 72, gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <a href="#top" style={{ display: "inline-flex", alignItems: "center" }}>
              <img
                src={govBrLogo}
                alt="Governo Federal"
                style={{ height: 32, display: "block" }}
              />
            </a>
            <span className="br-divider vertical mx-3" style={{ height: 24, borderLeft: "1px solid var(--color-secondary-03)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontWeight: "bold", color: "var(--color-secondary-09)", fontSize: "1.1rem" }}>CAR</span>
              <span style={{ fontStyle: "italic", color: "var(--color-primary-default)", fontWeight: "bold", fontSize: "1.1rem" }}>Proativo</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <nav className="d-none d-md-flex" style={{ gap: "24px", alignItems: "center" }}>
              <a href="#problema" style={{ color: "var(--color-secondary-07)", fontWeight: 600, textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-primary-default)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-secondary-07)"}>Problema</a>
              <a href="#funciona" style={{ color: "var(--color-secondary-07)", fontWeight: 600, textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-primary-default)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-secondary-07)"}>Como funciona</a>
              <a href="#parceiros" style={{ color: "var(--color-secondary-07)", fontWeight: 600, textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-primary-default)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-secondary-07)"}>Parceiros</a>
              <a href="#piloto" style={{ color: "var(--color-secondary-07)", fontWeight: 600, textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-primary-default)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-secondary-07)"}>Piloto</a>
            </nav>
            <div>
              <Link to="/piloto" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "var(--color-primary-default)",
                color: "#fff",
                borderRadius: 999,
                padding: "0 18px",
                height: 36,
                fontWeight: 600,
                fontSize: 14,
                textDecoration: "none",
                whiteSpace: "nowrap",
                lineHeight: 1,
              }}>
                <i className="fas fa-rocket" aria-hidden="true" style={{ fontSize: 13 }} />
                <span className="nav-cta-text">Apresentar piloto</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" style={{ background: "#fff", padding: "56px 0 48px", borderBottom: "1px solid var(--color-secondary-03)" }}>
      <div className="container-lg">
        <div className="row align-items-center">
          <div className="col-md-7 py-2">
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "var(--color-primary-pastel-01)",
              color: "var(--color-primary-default)",
              borderRadius: "var(--surface-rounder-sm)",
              padding: "4px 12px",
              fontSize: "var(--font-size-scale-down-01)",
              fontWeight: "var(--font-weight-semi-bold)",
            }}>
              <i className="fas fa-leaf" aria-hidden="true" />
              Inovação Aberta · SICAR
            </span>

            <h1
              className="mt-4 text-weight-bold"
              style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", color: "var(--color-secondary-08)", lineHeight: 1.1 }}
            >
              O CAR que vai<br />
              <span style={{ color: "var(--color-primary-default)" }}>até você.</span>
            </h1>

            <p className="mt-4" style={{ fontSize: "var(--font-size-scale-up-01)", color: "var(--color-secondary-07)", maxWidth: 540, lineHeight: 1.75 }}>
              Mais de 7 milhões de cadastros. Centenas de milhares irregulares.
              A maioria dos produtores{" "}
              <strong style={{ color: "var(--color-secondary-08)" }}>não sabe que tem um problema</strong> —
              até perder crédito, ser bloqueado ou receber uma autuação.
            </p>
            <p className="mt-3" style={{ fontSize: "var(--font-size-scale-up-01)", color: "var(--color-secondary-07)", maxWidth: 540, lineHeight: 1.75 }}>
              O CAR Proativo entrega o diagnóstico certo, para a pessoa certa,
              no canal certo, na hora certa.
            </p>

            <div className="cta-buttons mt-5 d-flex flex-wrap" style={{ gap: "var(--spacing-scale-2x)" }}>
              <a href="#funciona" className="br-button primary large">
                <i className="fas fa-arrow-down mr-2" aria-hidden="true" />
                Ver como funciona
              </a>
              <a href="#problema" className="br-button secondary large">
                Entender o problema
              </a>
            </div>

            <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--color-secondary-03)" }}>
              <div className="row">
                {[
                  { k: "7M+", v: "cadastros no SICAR" },
                  { k: "0", v: "novo canal exigido" },
                  { k: "5", v: "telas até regularizar" },
                ].map((s) => (
                  <div key={s.k} className="col-4 text-center">
                    <div style={{ fontSize: "var(--font-size-scale-up-04)", fontWeight: "var(--font-weight-extra-bold)", color: "var(--color-primary-default)", lineHeight: 1 }}>{s.k}</div>
                    <div style={{ fontSize: "var(--font-size-scale-down-02)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-secondary-06)", marginTop: 4 }}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-md-5 py-4 d-none d-md-block">
            <div style={{ position: "relative", borderRadius: "var(--surface-rounder-md)", overflow: "hidden", boxShadow: "var(--surface-shadow-md)" }}>
              <img
                src={heroProducer}
                alt="Produtor rural conferindo o celular ao pôr do sol"
                style={{ width: "100%", height: 380, objectFit: "cover", display: "block" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(7,29,65,0.85) 0%, transparent 55%)" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "var(--spacing-scale-3x)" }}>
                <div className="hero-mockup">
                  <div className="d-flex align-items-center mb-2" style={{ gap: "var(--spacing-scale-base)" }}>
                    <span style={{ background: "#25D366", borderRadius: "4px", width: 18, height: 18, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <i className="fab fa-whatsapp" style={{ color: "#fff", fontSize: 11 }} aria-hidden="true" />
                    </span>
                    <span style={{ fontSize: "var(--font-size-scale-down-02)", color: "var(--color-secondary-07)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                      Cooperativa Vale Verde · agora
                    </span>
                  </div>
                  <p style={{ fontSize: "var(--font-size-scale-down-01)", color: "var(--color-secondary-08)", lineHeight: 1.55, margin: 0 }}>
                    Olá, Sr. José. O CAR do{" "}
                    <strong>Sítio Boa Esperança</strong> está com documento de
                    posse desatualizado.{" "}
                    <span style={{ color: "var(--color-primary-default)", fontWeight: 600 }}>
                      Corrija em 5 passos →
                    </span>
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

function Problem() {
  return (
    <section id="problema" className="section-dark py-5">
      <div className="container-lg">
        <div className="row py-4">
          <div className="col-md-5 mb-4 mb-md-0">
            <span className="section-label">O problema que ninguém vê</span>
            <h2
              className="mt-3 text-weight-bold"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", color: "var(--pure-0)", lineHeight: 1.2 }}
            >
              O governo construiu o sistema para{" "}
              <span style={{ color: "var(--warning, #ffcd07)" }}>receber</span> dados.
              Ninguém construiu o sistema para{" "}
              <span style={{ color: "var(--warning, #ffcd07)" }}>devolver</span>.
            </h2>
          </div>
          <div className="col-md-7 pl-md-5">
            <p style={{ fontSize: "var(--font-size-scale-up-01)", color: "rgba(255,255,255,0.85)", lineHeight: 1.75 }}>
              O produtor rural não vive no SICAR. Ele vive no WhatsApp da
              cooperativa, no aplicativo do banco, na conversa com o técnico
              agrícola. Esses canais já chegam até ele todo mês — e já têm
              interesse direto em que o CAR esteja regular.
            </p>
            <div className="quote-block">
              A solução não é um canal novo. É carregar os canais que já existem
              com a informação certa.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Insight() {
  const points = [
    {
      n: "01",
      icon: "fa-brain",
      t: "Diagnóstico individual",
      d: "Um motor cruza SICAR, INCRA, MapBiomas e Receita para classificar cada imóvel: regular, pendente, sobreposição, dados desatualizados, cancelado.",
    },
    {
      n: "02",
      icon: "fa-plug",
      t: "API credenciada",
      d: "Bancos, cooperativas, tradings e EMATER consultam por CPF/CNPJ e recebem só o status e a ação recomendada. Sem dados sensíveis trafegando.",
    },
    {
      n: "03",
      icon: "fa-bell",
      t: "Notificação no canal certo",
      d: "O parceiro dispara a mensagem no canal que o produtor já usa — WhatsApp, app do banco, e-mail. Sem novo aplicativo, sem novo login.",
    },
    {
      n: "04",
      icon: "fa-mobile-alt",
      t: "Resolução em 5 telas",
      d: "Fluxo guiado mobile-first com OCR de documentos e confirmação de polígono pré-carregado. Casos complexos vão direto para a EMATER.",
    },
  ];

  return (
    <section id="funciona" className="py-5">
      <div className="container-lg">
        <div className="py-4">
          <span className="section-label" style={{ color: "var(--color-primary-default)" }}>Como funciona</span>
          <h2
            className="mt-3 text-weight-bold"
            style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", color: "var(--color-secondary-08)", maxWidth: 680, lineHeight: 1.2 }}
          >
            Uma camada de inteligência sobre o SICAR. Não uma base paralela.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: "var(--spacing-scale-3x)", alignItems: "start", marginTop: "var(--spacing-scale-3x)" }}>
          {points.map((p) => (
            <div key={p.n}>
              <div className="br-card">
                <div className="card-header">
                  <div className="d-flex align-items-center" style={{ gap: "var(--spacing-scale-2x)" }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: "50%",
                      background: "var(--color-primary-pastel-01)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <i className={`fas ${p.icon}`} style={{ color: "var(--color-primary-default)", fontSize: 20 }} aria-hidden="true" />
                    </div>
                    <div>
                      <div style={{ fontSize: "var(--font-size-scale-down-01)", color: "var(--color-primary-default)", fontWeight: "var(--font-weight-semi-bold)" }}>{p.n}</div>
                      <h3 className="mb-0" style={{ fontSize: "var(--font-size-scale-up-01)" }}>{p.t}</h3>
                    </div>
                  </div>
                </div>
                <div className="card-content">
                  <p style={{ color: "var(--color-secondary-07)", lineHeight: 1.7, margin: 0 }}>{p.d}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { k: "SICAR", icon: "fa-database", v: "Base oficial existente, com 7M+ cadastros." },
    { k: "Motor de diagnóstico", icon: "fa-cogs", v: "Classifica situação por imóvel e gera ação recomendada em linguagem simples." },
    { k: "API de diagnóstico", icon: "fa-code", v: "REST pública, credenciada via convênio com o MMA. Retorna status + ação por CPF/CNPJ." },
    { k: "Parceiros", icon: "fa-handshake", v: "Bancos, cooperativas, tradings, EMATER, secretarias estaduais." },
    { k: "Canal do produtor", icon: "fa-comments", v: "WhatsApp, app do banco, e-mail — nenhum app novo para instalar." },
    { k: "Fluxo de resolução", icon: "fa-tasks", v: "5 telas, OCR de documento, confirmação de polígono." },
    { k: "Retorno ao SICAR", icon: "fa-check-circle", v: "Dados corrigidos voltam direto via módulo oficial de retificação." },
  ];

  return (
    <section className="section-light py-5" style={{ position: "relative", overflow: "hidden" }}>
      <img
        src={aerialMosaic}
        alt="Vista aérea de mosaico de propriedades rurais"
        loading="lazy"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.06 }}
      />
      <div className="container-lg" style={{ position: "relative" }}>
        <div className="py-4">
          <span className="section-label" style={{ color: "var(--color-primary-default)" }}>Arquitetura do fluxo</span>
          <h2
            className="mt-3 text-weight-bold"
            style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", color: "var(--color-secondary-08)", maxWidth: 680, lineHeight: 1.2 }}
          >
            Do dado parado no SICAR à ação concluída no celular do produtor.
          </h2>
        </div>

        <ol className="mt-4" style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "var(--spacing-scale-2x)" }}>
          {steps.map((row, i) => (
            <li key={row.k}>
              <div className="br-card">
                <div className="card-content">
                  <div className="row align-items-center step-row">
                    <div className="col-auto step-row-num">
                      <div style={{
                        width: 40, height: 40, borderRadius: "50%",
                        background: "var(--color-primary-default)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "var(--pure-0)", fontWeight: "var(--font-weight-bold)",
                        fontSize: "var(--font-size-scale-down-01)",
                        flexShrink: 0,
                      }}>
                        {String(i + 1).padStart(2, "0")}
                      </div>
                    </div>
                    <div className="col-auto step-row-icon">
                      <i className={`fas ${row.icon}`} style={{ color: "var(--color-primary-default)", fontSize: 20, width: 24, textAlign: "center" }} aria-hidden="true" />
                    </div>
                    <div className="col step-row-info">
                      <strong style={{ color: "var(--color-secondary-08)", display: "block" }}>{row.k}</strong>
                      <span style={{ color: "var(--color-secondary-07)", fontSize: "var(--font-size-scale-down-01)" }}>{row.v}</span>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Partners() {
  const cards = [
    {
      tag: "Crédito",
      icon: "fa-university",
      t: "Bancos e cooperativas",
      ex: "BB · Sicredi · Sicoob · Cresol",
      why: "CAR regular é pré-requisito para Pronaf e crédito rural. Se o cliente está irregular, o crédito não sai. Interesse direto em regularizar.",
    },
    {
      tag: "Cadeia produtiva",
      icon: "fa-industry",
      t: "Tradings e frigoríficos",
      ex: "Cargill · JBS · Marfrig · SLC",
      why: "Compromissos ESG e rastreabilidade exigem CAR regular do fornecedor. Já constroem isso internamente — a API entrega pronto.",
    },
    {
      tag: "Extensão rural",
      icon: "fa-tractor",
      t: "EMATER e estados",
      ex: "EMATER · secretarias estaduais",
      why: "Já visitam o produtor e já são o elo de confiança no campo. A API entrega uma lista de quem precisa de ajuda antes da visita.",
    },
    {
      tag: "Backlog",
      icon: "fa-leaf",
      t: "Secretarias de meio ambiente",
      ex: "Análise estadual do CAR",
      why: "Quanto mais CARs chegam completos e corretos, menor o backlog. Interesse direto na qualidade do dado de entrada.",
    },
  ];

  return (
    <section id="parceiros" className="py-5">
      <div className="container-lg">
        <div className="row py-4">
          <div className="col-md-4 mb-5 mb-md-0">
            <span className="section-label" style={{ color: "var(--color-primary-default)" }}>Parceiros</span>
            <h2
              className="mt-3 text-weight-bold"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", color: "var(--color-secondary-08)", lineHeight: 1.2 }}
            >
              Quem distribui o diagnóstico — e por que topa.
            </h2>
            <p className="mt-3" style={{ color: "var(--color-secondary-07)", lineHeight: 1.7 }}>
              O governo não precisa disparar 7 milhões de mensagens. Cada parceiro
              absorve o volume do próprio relacionamento.
            </p>
          </div>
          <div className="col-md-8">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: "var(--spacing-scale-3x)", alignItems: "start" }}>
              {cards.map((c) => (
                <div key={c.t}>
                  <div className="br-card">
                    <div className="card-header">
                      <div className="d-flex align-items-center" style={{ gap: "var(--spacing-scale-base)" }}>
                        <i className={`fas ${c.icon}`} style={{ color: "var(--color-primary-default)", fontSize: 18 }} aria-hidden="true" />
                        <span className="br-tag" style={{ fontSize: "var(--font-size-scale-down-02)", background: "var(--color-primary-pastel-01)", color: "var(--color-primary-default)" }}>
                          {c.tag}
                        </span>
                      </div>
                      <h3 className="mt-2 mb-0" style={{ fontSize: "var(--font-size-scale-up-01)" }}>{c.t}</h3>
                      <p style={{ fontSize: "var(--font-size-scale-down-01)", color: "var(--color-secondary-07)", margin: "4px 0 0" }}>{c.ex}</p>
                    </div>
                    <div className="card-content">
                      <p style={{ color: "var(--color-secondary-07)", lineHeight: 1.7, fontSize: "var(--font-size-scale-down-01)", margin: 0 }}>{c.why}</p>
                    </div>
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

function Flow() {
  const screens = [
    { n: 1, icon: "fa-search", t: "Diagnóstico", d: "Seu CAR do Sítio Boa Esperança está com o documento de posse desatualizado. Vamos corrigir?" },
    { n: 2, icon: "fa-camera", t: "Foto do documento", d: "O produtor tira foto pelo celular. OCR pré-preenche os dados automaticamente." },
    { n: 3, icon: "fa-check", t: "Confirmação", d: "Revisão dos dados extraídos. Um toque para confirmar." },
    { n: 4, icon: "fa-map-marked-alt", t: "Polígono no mapa", d: "Limite do imóvel pré-carregado do INCRA. Confirmar ou arrastar um ponto." },
    { n: 5, icon: "fa-star", t: "Pronto", d: "CAR atualizado. Confirmação oficial em até 48 horas." },
  ];

  return (
    <section className="section-dark py-5">
      <div className="container-lg">
        <div className="py-4">
          <div className="d-flex align-items-end justify-content-between flex-wrap" style={{ gap: "var(--spacing-scale-2x)" }}>
            <div>
              <span className="section-label">Fluxo de resolução</span>
              <h2
                className="mt-3 text-weight-bold"
                style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", color: "var(--pure-0)", maxWidth: 580, lineHeight: 1.2 }}
              >
                5 telas. Uma ação por tela. Funciona no celular, sem instalar nada.
              </h2>
            </div>
            <span className="d-none d-md-block" style={{ color: "rgba(255,255,255,0.75)", fontStyle: "italic" }}>→ deslize</span>
          </div>

          <div className="flow-scroll mt-5">
            {screens.map((s) => (
              <div key={s.n} className="flow-card">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <span className="text-weight-bold" style={{ fontSize: "var(--font-size-scale-up-03)", color: "var(--warning, #ffcd07)", lineHeight: 1 }}>0{s.n}</span>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,205,7,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className={`fas ${s.icon}`} style={{ color: "var(--warning, #ffcd07)", fontSize: 14 }} aria-hidden="true" />
                  </div>
                </div>
                <h3 className="text-weight-semi-bold" style={{ color: "var(--pure-0)", fontSize: "var(--font-size-scale-up-01)", margin: "0 0 var(--spacing-scale-base)" }}>{s.t}</h3>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "var(--font-size-scale-down-01)", lineHeight: 1.65, margin: 0 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Objections() {
  const qa = [
    {
      q: "Por que isso não foi feito antes?",
      a: "Porque o SICAR foi construído para receber dados, não para distribuir diagnósticos. A mudança não é técnica — é de mentalidade. E é exatamente para isso que servem hackathons de inovação aberta.",
    },
    {
      q: "Passar dados do produtor para banco ou trading não é problemático?",
      a: "A API não passa dados do produtor para o parceiro. O parceiro já tem o CPF do cliente — consulta a API e recebe só o status do CAR e a ação. É o mesmo modelo de consulta ao Serasa.",
    },
    {
      q: "E quem não tem banco ou cooperativa?",
      a: "Para esses, o canal é a EMATER e as prefeituras municipais. Para quem nem isso tem, o SMS direto do governo via base da Receita — já existe precedente com Auxílio Brasil e Pix do INSS.",
    },
    {
      q: "Isso escala para 7 milhões de cadastros?",
      a: "Sim, porque a carga é distribuída. Cada parceiro absorve o volume do próprio relacionamento. O banco dispara para correntistas, a cooperativa para associados, a trading para fornecedores.",
    },
    {
      q: "Como garantir que o produtor não comete erros no fluxo?",
      a: "O fluxo só apresenta ações que o sistema já sabe que são seguras para aquele caso. Casos com risco (sobreposição, redesenho de polígono) nunca caem no automático — vão direto para o técnico.",
    },
  ];

  return (
    <section className="py-5">
      <div className="container-lg">
        <div className="row py-4">
          <div className="col-md-4 mb-5 mb-md-0">
            <span className="section-label" style={{ color: "var(--color-primary-default)" }}>As perguntas difíceis</span>
            <h2
              className="mt-3 text-weight-bold"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", color: "var(--color-secondary-08)", lineHeight: 1.2 }}
            >
              As que o júri sempre faz.
            </h2>
            <p className="mt-3" style={{ color: "var(--color-secondary-07)" }}>Respostas curtas, prontas para defesa.</p>
          </div>
          <div className="col-md-8">
            <div className="br-accordion" id="objections-accordion">
              {qa.map((item, i) => (
                <div key={item.q} className="item">
                  <button className="header" type="button" aria-controls={`obj-${i}`}>
                    <span className="icon"><i className="fas fa-angle-down" aria-hidden="true" /></span>
                    <span className="title">{item.q}</span>
                  </button>
                  <div className="content" id={`obj-${i}`} style={{ color: "var(--color-secondary-07)", lineHeight: 1.7 }}>
                    {item.a}
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

function Pilot() {
  return (
    <section id="piloto" className="py-5 section-accent">
      <div className="container-lg">
        <div className="row py-4 align-items-center">
          <div className="col-md-7 mb-5 mb-md-0">
            <span style={{ fontSize: "var(--font-size-scale-down-01)", fontWeight: "var(--font-weight-semi-bold)", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--color-secondary-07)" }}>
              Piloto sugerido
            </span>
            <h2
              className="mt-3 text-weight-bold"
              style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", color: "var(--color-secondary-08)", lineHeight: 1.1 }}
            >
              Mato Grosso. 1 cooperativa. 100 produtores. 30 dias.
            </h2>
            <p className="mt-4" style={{ fontSize: "var(--font-size-scale-up-01)", color: "var(--color-secondary-08)", lineHeight: 1.75, maxWidth: 520, opacity: 0.85 }}>
              Maior volume de CARs do país, rede densa de cooperativas e tradings.
              Mede-se abertura, conclusão do fluxo e CARs atualizados. O resultado
              vira o argumento de escala.
            </p>
          </div>
          <div className="col-md-5">
            <div className="row mb-4">
              {[
                { k: "100", v: "produtores" },
                { k: "30d", v: "para medir impacto" },
                { k: "1", v: "cooperativa parceira" },
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
  );
}

function SiteFooter() {
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

        <div className="br-list horizontal" data-toggle="data-toggle" data-sub="data-sub">
          <div className="col-2">
            <a className="br-item header" href="#funciona">
              <div className="content text-down-01 text-bold text-uppercase">Solução</div>
              <div className="support"><i className="fas fa-angle-down" aria-hidden="true" /></div>
            </a>
            <div className="br-list">
              <span className="br-divider d-md-none" />
              <a className="br-item" href="#funciona"><div className="content">Como funciona</div></a>
              <a className="br-item" href="#parceiros"><div className="content">Parceiros</div></a>
              <span className="br-divider d-md-none" />
            </div>
          </div>
          <div className="col-2">
            <a className="br-item header" href="#piloto">
              <div className="content text-down-01 text-bold text-uppercase">Piloto</div>
              <div className="support"><i className="fas fa-angle-down" aria-hidden="true" /></div>
            </a>
            <div className="br-list">
              <span className="br-divider d-md-none" />
              <a className="br-item" href="#piloto"><div className="content">Mato Grosso</div></a>
              <a className="br-item" href="mailto:contato@carproativo.gov.br"><div className="content">Fale conosco</div></a>
              <span className="br-divider d-md-none" />
            </div>
          </div>
          <div className="col-2">
            <a className="br-item header" href="https://www.car.gov.br" target="_blank" rel="noreferrer">
              <div className="content text-down-01 text-bold text-uppercase">SICAR</div>
              <div className="support"><i className="fas fa-angle-down" aria-hidden="true" /></div>
            </a>
            <div className="br-list">
              <span className="br-divider d-md-none" />
              <a className="br-item" href="https://www.car.gov.br" target="_blank" rel="noreferrer"><div className="content">Portal CAR</div></a>
              <a className="br-item" href="https://www.gov.br/mma" target="_blank" rel="noreferrer"><div className="content">Ministério do Meio Ambiente</div></a>
              <span className="br-divider d-md-none" />
            </div>
          </div>
        </div>

        <span className="br-divider my-3" />

        <div className="d-flex flex-wrap align-items-center justify-content-between py-3" style={{ gap: "var(--spacing-scale-2x)" }}>
          <div>
            <p style={{ margin: 0, fontSize: "var(--font-size-scale-down-01)", color: "rgba(255,255,255,0.7)" }}>
              <strong style={{ color: "var(--pure-0)" }}>CAR Proativo</strong> · Proposta de bem público digital
            </p>
            <p style={{ margin: 0, fontSize: "var(--font-size-scale-down-01)", color: "rgba(255,255,255,0.75)" }}>
              Camada sobre o SICAR — não substitui, amplifica.
            </p>
          </div>
          <div className="d-flex" style={{ gap: "var(--spacing-scale-2x)" }}>
            <a href="https://www.gov.br" target="_blank" rel="noreferrer" className="br-button circle small inverted" aria-label="Gov.br">
              <i className="fas fa-globe" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
