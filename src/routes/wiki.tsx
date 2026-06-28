import { createFileRoute, Link } from "@tanstack/react-router";
import govBrLogo from "@/assets/govbr-logo.svg";

export const Route = createFileRoute("/wiki")({
  head: () => ({
    meta: [
      { title: "Wiki — CAR Proativo" },
      {
        name: "description",
        content:
          "Documentação visual da arquitetura replicável do CAR Proativo para WhatsApp, widgets e experiências web completas.",
      },
    ],
  }),
  component: WikiPage,
});

const CHANNELS = [
  {
    title: "WhatsApp",
    icon: "fab fa-whatsapp",
    color: "#128c7e",
    description:
      "O bot recebe CPF ou código CAR, chama a API e devolve uma orientação curta no canal que o produtor já usa.",
    example: "Webhook -> /api/diagnostico -> mensagem guiada",
  },
  {
    title: "Widget em sites",
    icon: "fas fa-puzzle-piece",
    color: "#1351b4",
    description:
      "Parceiros incorporam uma consulta rápida em portais, apps de cooperativas, bancos ou assistência técnica.",
    example: '<car-diagnostico-widget cpf="..." />',
  },
  {
    title: "Experiência web",
    icon: "fas fa-desktop",
    color: "#2e7d32",
    description:
      "A interface completa mostra diagnóstico, fontes cruzadas, risco, pendências e fluxo de resolução passo a passo.",
    example: "/piloto, /parceiro e futuras áreas autenticadas",
  },
];

const API_STEPS = [
  "Entrada normalizada",
  "Validação de CPF/CAR",
  "Consulta SICAR e fontes públicas",
  "Motor de risco e recomendação",
  "Resposta JSON para qualquer canal",
];

const TOKEN_PHASES = [
  {
    title: "Demo",
    icon: "fas fa-flask",
    text: "Usa dados demonstrativos e APIs públicas auxiliares, sem credencial SICAR sensível.",
  },
  {
    title: "Piloto institucional",
    icon: "fas fa-key",
    text: "Parceiro autorizado fornece client_id e client_secret emitidos no Conecta gov.br.",
  },
  {
    title: "Produção",
    icon: "fas fa-shield-alt",
    text: "Backend renova token OAuth, audita chamadas e aplica consentimento por produtor.",
  },
];

const PUBLIC_SOURCES = [
  {
    title: "SIGEF parcela por código",
    access: "Público",
    endpoint: "GET /geo/exportar/parcela/json/?codigo_imovel=<CODIGO>",
  },
  {
    title: "SIGEF parcelas por CPF/CNPJ",
    access: "Público com validação operacional",
    endpoint: "GET /consultar/parcelas/?cpf=<CPF> ou ?cnpj=<CNPJ>",
  },
  {
    title: "SIGEF WFS municipal",
    access: "Público",
    endpoint: "GET /geo/wfs/?service=WFS&request=GetFeature&typeName=sigef:parcela_certificada",
  },
  {
    title: "SIGEF GEO via Conecta",
    access: "Restrito",
    endpoint: "OAuth + cadastro institucional + firewall SERPRO",
  },
];

function WikiPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <WikiNav />
      <main>
        <Hero />
        <Architecture />
        <Channels />
        <Contract />
        <LocationApi />
        <PublicSources />
        <TokenFlow />
        <Roadmap />
      </main>
    </div>
  );
}

function WikiNav() {
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
            <strong style={{ color: "var(--color-secondary-09)" }}>CAR</strong>
            <strong
              style={{ color: "var(--color-primary-default)", fontStyle: "italic", marginLeft: 4 }}
            >
              Proativo
            </strong>
          </Link>
          <nav className="d-flex" style={{ gap: 8 }}>
            <Link to="/demo" className="br-button secondary small" style={{ borderRadius: 999 }}>
              Demo
            </Link>
            <Link to="/parceiro" className="br-button primary small" style={{ borderRadius: 999 }}>
              Portal
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="section-dark" style={{ padding: "56px 0 44px" }}>
      <div className="container-lg">
        <div className="row align-items-center">
          <div className="col-md-7">
            <span className="section-label">Wiki visual</span>
            <h1
              className="mt-3 text-weight-bold"
              style={{
                color: "var(--pure-0)",
                fontSize: "clamp(2rem, 4vw, 3.1rem)",
                lineHeight: 1.12,
              }}
            >
              Um motor de diagnóstico. Vários formatos de entrega.
            </h1>
            <p
              className="mt-4"
              style={{
                color: "rgba(255,255,255,0.82)",
                fontSize: "var(--font-size-scale-up-01)",
                lineHeight: 1.75,
                maxWidth: 680,
              }}
            >
              A tecnologia do CAR Proativo deve ser documentada como uma camada reutilizável: a
              mesma API pode alimentar WhatsApp, widgets em sites parceiros e uma experiência web
              completa.
            </p>
          </div>
          <div className="col-md-5 mt-5 mt-md-0">
            <div
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.16)",
                borderRadius: 8,
                padding: 24,
              }}
            >
              <FlowNode label="Produtor ou parceiro" icon="fas fa-user-check" tone="#ffcd07" />
              <Connector />
              <FlowNode label="REST API de diagnóstico" icon="fas fa-code-branch" tone="#8ab4f8" />
              <Connector />
              <FlowNode label="Resposta orientada à ação" icon="fas fa-route" tone="#9be7a4" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Architecture() {
  return (
    <section style={{ padding: "56px 0", background: "var(--color-secondary-01)" }}>
      <div className="container-lg">
        <div className="row">
          <div className="col-md-4 mb-4 mb-md-0">
            <span style={eyebrowStyle}>Arquitetura replicável</span>
            <h2 style={sectionTitleStyle}>Separar inteligência de interface</h2>
            <p style={bodyStyle}>
              A camada central não deve conhecer WhatsApp, widget ou tela web. Ela recebe dados,
              consulta fontes, calcula risco e retorna JSON.
            </p>
          </div>
          <div className="col-md-8">
            <div className="br-card" style={{ borderRadius: 8 }}>
              <div className="card-content">
                <div className="row">
                  {API_STEPS.map((step, index) => (
                    <div key={step} className="col-md">
                      <div className="text-center" style={{ padding: "12px 4px" }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: "50%",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background:
                              index === 4
                                ? "var(--color-primary-default)"
                                : "var(--color-primary-pastel-01)",
                            color: index === 4 ? "#fff" : "var(--color-primary-default)",
                            fontWeight: 800,
                          }}
                        >
                          {index + 1}
                        </div>
                        <p
                          style={{
                            margin: "10px 0 0",
                            color: "var(--color-secondary-08)",
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        >
                          {step}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    marginTop: 18,
                    padding: 16,
                    borderRadius: 6,
                    background: "var(--color-secondary-02)",
                    color: "var(--color-secondary-08)",
                    fontFamily: "monospace",
                    fontSize: 13,
                    overflowX: "auto",
                  }}
                >
                  {
                    "POST /api/diagnostico { cpf, canal, parceiro } -> { nivel_risco, pendencias, acao_recomendada }"
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Channels() {
  return (
    <section style={{ padding: "56px 0", background: "#fff" }}>
      <div className="container-lg">
        <div className="mb-5">
          <span style={eyebrowStyle}>Canais de distribuição</span>
          <h2 style={sectionTitleStyle}>A mesma resposta vira experiências diferentes</h2>
        </div>
        <div className="row">
          {CHANNELS.map((channel) => (
            <div key={channel.title} className="col-md-4 mb-4">
              <article className="br-card" style={{ height: "100%", borderRadius: 8 }}>
                <div
                  className="card-content"
                  style={{ height: "100%", display: "flex", flexDirection: "column" }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: `${channel.color}18`,
                      color: channel.color,
                      fontSize: 22,
                    }}
                  >
                    <i className={channel.icon} aria-hidden="true" />
                  </div>
                  <h3
                    style={{
                      margin: "18px 0 8px",
                      color: "var(--color-secondary-09)",
                      fontSize: "1.2rem",
                    }}
                  >
                    {channel.title}
                  </h3>
                  <p style={{ ...bodyStyle, flex: 1 }}>{channel.description}</p>
                  <code
                    style={{
                      display: "block",
                      background: "var(--color-secondary-02)",
                      color: "var(--color-secondary-08)",
                      padding: 12,
                      borderRadius: 6,
                      fontSize: 12,
                      whiteSpace: "normal",
                    }}
                  >
                    {channel.example}
                  </code>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contract() {
  return (
    <section style={{ padding: "56px 0", background: "var(--color-primary-pastel-02)" }}>
      <div className="container-lg">
        <div className="row align-items-start">
          <div className="col-md-5 mb-4 mb-md-0">
            <span style={eyebrowStyle}>Contrato inicial</span>
            <h2 style={sectionTitleStyle}>O chatbot não precisa conhecer a regra ambiental</h2>
            <p style={bodyStyle}>
              O canal só precisa coletar a entrada, chamar a API e renderizar a próxima ação. A
              regra fica centralizada e auditável.
            </p>
          </div>
          <div className="col-md-7">
            <div
              style={{
                background: "#071d41",
                color: "#d7e5ff",
                borderRadius: 8,
                padding: 20,
                fontFamily: "monospace",
                fontSize: 13,
                lineHeight: 1.7,
                overflowX: "auto",
              }}
            >
              <div style={{ color: "#ffcd07" }}>POST /api/diagnostico</div>
              <div>{"{"}</div>
              <div>&nbsp;&nbsp;"cpf": "10728210100",</div>
              <div>&nbsp;&nbsp;"canal": "whatsapp",</div>
              <div>&nbsp;&nbsp;"parceiro": "cooperativa-vale-verde"</div>
              <div>{"}"}</div>
              <br />
              <div style={{ color: "#9be7a4" }}>200 OK</div>
              <div>{"{"}</div>
              <div>&nbsp;&nbsp;"nivel_risco": "medio",</div>
              <div>&nbsp;&nbsp;"acao_recomendada": "Atualizar documentacao",</div>
              <div>&nbsp;&nbsp;"pendencias": ["CCIR vencido"]</div>
              <div>{"}"}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LocationApi() {
  return (
    <section style={{ padding: "56px 0", background: "var(--color-secondary-01)" }}>
      <div className="container-lg">
        <div className="row align-items-start">
          <div className="col-md-5 mb-4 mb-md-0">
            <span style={eyebrowStyle}>Localização pelo WhatsApp</span>
            <h2 style={sectionTitleStyle}>Coordenada vira consulta pública regional do CAR</h2>
            <p style={bodyStyle}>
              Quando o produtor compartilha localização, o backend extrai latitude/longitude,
              identifica município/UF e consulta o endpoint público de municípios do SICAR pelo
              código IBGE.
            </p>
            <div className="d-flex flex-wrap mt-4" style={{ gap: 8 }}>
              <code style={pillCodeStyle}>POST /api/localizacao/car</code>
              <code style={pillCodeStyle}>GET /api/localizacao/car?lat=-16.07&amp;lng=-57.68</code>
            </div>
          </div>
          <div className="col-md-7">
            <div
              style={{
                background: "#071d41",
                color: "#d7e5ff",
                borderRadius: 8,
                padding: 20,
                fontFamily: "monospace",
                fontSize: 13,
                lineHeight: 1.7,
                overflowX: "auto",
              }}
            >
              <div style={{ color: "#ffcd07" }}>Payload recebido do WhatsApp</div>
              <div>{"{"}</div>
              <div>&nbsp;&nbsp;"location": {"{"}</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;"latitude": -16.0672,</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;"longitude": -57.6814,</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;"name": "Localizacao compartilhada",</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;"address": "Caceres - MT"</div>
              <div>&nbsp;&nbsp;{"}"}</div>
              <div>{"}"}</div>
              <br />
              <div style={{ color: "#9be7a4" }}>Resposta da API</div>
              <div>{"{"}</div>
              <div>&nbsp;&nbsp;"municipio_localizacao": {"{ nome, uf, ibge }"},</div>
              <div>&nbsp;&nbsp;"consulta_publica_sicar": {"{ moduloFiscal, area, estado }"},</div>
              <div>&nbsp;&nbsp;"mensagem": "Localização identificada..."</div>
              <div>{"}"}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PublicSources() {
  return (
    <section style={{ padding: "56px 0", background: "#fff" }}>
      <div className="container-lg">
        <div className="row align-items-start">
          <div className="col-md-4 mb-4 mb-md-0">
            <span style={eyebrowStyle}>Fontes públicas e restritas</span>
            <h2 style={sectionTitleStyle}>SIGEF tem caminhos públicos úteis para o piloto</h2>
            <p style={bodyStyle}>
              Nem todo cruzamento fundiário precisa começar pela API restrita do Conecta. Para
              validações iniciais, o produto pode testar endpoints públicos do SIGEF e reservar o
              Conecta para integrações institucionais.
            </p>
          </div>
          <div className="col-md-8">
            <div className="br-card" style={{ borderRadius: 8 }}>
              <div className="card-content">
                {PUBLIC_SOURCES.map((source) => (
                  <div
                    key={source.title}
                    style={{
                      padding: "14px 0",
                      borderBottom: "1px solid var(--color-secondary-03)",
                    }}
                  >
                    <div
                      className="d-flex flex-wrap align-items-center justify-content-between"
                      style={{ gap: 8 }}
                    >
                      <strong style={{ color: "var(--color-secondary-09)" }}>{source.title}</strong>
                      <span
                        style={{
                          borderRadius: 999,
                          padding: "3px 10px",
                          background:
                            source.access === "Restrito"
                              ? "#fce4ec"
                              : "var(--color-primary-pastel-01)",
                          color:
                            source.access === "Restrito"
                              ? "#b71c1c"
                              : "var(--color-primary-default)",
                          fontSize: 12,
                          fontWeight: 800,
                        }}
                      >
                        {source.access}
                      </span>
                    </div>
                    <code
                      style={{
                        display: "block",
                        marginTop: 8,
                        padding: 10,
                        borderRadius: 6,
                        background: "var(--color-secondary-02)",
                        color: "var(--color-secondary-08)",
                        fontSize: 12,
                        whiteSpace: "normal",
                      }}
                    >
                      {source.endpoint}
                    </code>
                  </div>
                ))}
                <p style={{ ...bodyStyle, margin: "16px 0 0", fontSize: 14 }}>
                  Nota operacional: endpoints públicos podem aplicar bloqueios por rede, headers ou
                  volume. Antes de prometer produção, validar consumo server-side, cache, rate limit
                  e termos de uso.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TokenFlow() {
  return (
    <section style={{ padding: "56px 0", background: "#fff" }}>
      <div className="container-lg">
        <div className="row align-items-start">
          <div className="col-md-4 mb-4 mb-md-0">
            <span style={eyebrowStyle}>Token e credenciais</span>
            <h2 style={sectionTitleStyle}>O token é do backend, não do usuário final</h2>
            <p style={bodyStyle}>
              O produtor no WhatsApp não gera token e não consulta o SICAR diretamente. O canal
              aciona a API do CAR Proativo, e o backend usa credenciais institucionais autorizadas.
            </p>
          </div>
          <div className="col-md-8">
            <div className="row mb-4">
              {TOKEN_PHASES.map((phase) => (
                <div key={phase.title} className="col-md-4 mb-3 mb-md-0">
                  <div className="br-card" style={{ height: "100%", borderRadius: 8 }}>
                    <div className="card-content">
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 8,
                          background: "var(--color-primary-pastel-01)",
                          color: "var(--color-primary-default)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 14,
                        }}
                      >
                        <i className={phase.icon} aria-hidden="true" />
                      </div>
                      <strong style={{ display: "block", color: "var(--color-secondary-09)" }}>
                        {phase.title}
                      </strong>
                      <p style={{ ...bodyStyle, margin: "8px 0 0", fontSize: 14 }}>{phase.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="br-card" style={{ borderRadius: 8 }}>
              <div className="card-content">
                <div className="row align-items-center">
                  {[
                    { label: "Credenciais oficiais", detail: "client_id + client_secret" },
                    { label: "OAuth Conecta", detail: "token temporario" },
                    { label: "API SICAR", detail: "Authorization: Bearer" },
                    { label: "Resposta segura", detail: "resumo para o canal" },
                  ].map((step, index, list) => (
                    <div key={step.label} className="col-md">
                      <div className="text-center" style={{ padding: "8px 4px" }}>
                        <div
                          style={{
                            margin: "0 auto 10px",
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background:
                              index === 0
                                ? "var(--warning, #ffcd07)"
                                : "var(--color-primary-default)",
                            color: index === 0 ? "#071d41" : "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                          }}
                        >
                          {index + 1}
                        </div>
                        <strong
                          style={{
                            display: "block",
                            color: "var(--color-secondary-09)",
                            fontSize: 13,
                          }}
                        >
                          {step.label}
                        </strong>
                        <span style={{ color: "var(--color-secondary-06)", fontSize: 12 }}>
                          {step.detail}
                        </span>
                        {index < list.length - 1 && (
                          <div
                            className="d-none d-md-block"
                            style={{
                              position: "relative",
                              height: 0,
                              top: -46,
                              left: "55%",
                              width: "90%",
                              borderTop: "2px solid var(--color-secondary-03)",
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    marginTop: 20,
                    padding: 14,
                    borderRadius: 6,
                    background: "#fff8dc",
                    color: "#5f4100",
                    border: "1px solid #f2d675",
                    lineHeight: 1.6,
                    fontSize: 14,
                  }}
                >
                  Sem credenciais aprovadas, o produto deve operar em modo demo ou com fontes
                  públicas. Em produção, o token fica no servidor e nunca no WhatsApp, widget ou
                  navegador do usuário.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Roadmap() {
  return (
    <section style={{ padding: "56px 0", background: "var(--color-secondary-01)" }}>
      <div className="container-lg">
        <div className="row">
          <div className="col-md-5 mb-4 mb-md-0">
            <span style={eyebrowStyle}>Próximos documentos</span>
            <h2 style={sectionTitleStyle}>Wiki viva para evolução do produto</h2>
          </div>
          <div className="col-md-7">
            {[
              "Especificar endpoints REST e autenticação por parceiro.",
              "Detalhar renovação OAuth, cache de token e variáveis de ambiente.",
              "Documentar campos reais, campos demo e fontes pendentes de credencial.",
              "Criar templates de resposta para WhatsApp, widget e web.",
              "Mapear métricas: diagnósticos gerados, regularizações iniciadas e resolvidas.",
            ].map((item) => (
              <div key={item} className="d-flex align-items-start mb-3" style={{ gap: 12 }}>
                <i
                  className="fas fa-check-circle"
                  style={{ color: "var(--color-primary-default)", marginTop: 4 }}
                  aria-hidden="true"
                />
                <p style={{ ...bodyStyle, margin: 0 }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FlowNode({ label, icon, tone }: { label: string; icon: string; tone: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "#fff",
        borderRadius: 8,
        padding: 14,
        color: "var(--color-secondary-09)",
        fontWeight: 800,
      }}
    >
      <span
        style={{
          width: 34,
          height: 34,
          borderRadius: 6,
          background: tone,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#071d41",
          flex: "0 0 auto",
        }}
      >
        <i className={icon} aria-hidden="true" />
      </span>
      {label}
    </div>
  );
}

function Connector() {
  return (
    <div
      style={{
        height: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#ffcd07",
      }}
    >
      <i className="fas fa-arrow-down" aria-hidden="true" />
    </div>
  );
}

const eyebrowStyle = {
  display: "block",
  color: "var(--color-primary-default)",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  fontSize: "var(--font-size-scale-down-01)",
} as const;

const sectionTitleStyle = {
  color: "var(--color-secondary-09)",
  fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
  lineHeight: 1.2,
  fontWeight: 800,
  margin: "10px 0 14px",
} as const;

const bodyStyle = {
  color: "var(--color-secondary-07)",
  lineHeight: 1.7,
  fontSize: "var(--font-size-scale-base)",
} as const;

const pillCodeStyle = {
  display: "inline-flex",
  background: "var(--color-secondary-02)",
  color: "var(--color-secondary-08)",
  borderRadius: 999,
  padding: "6px 12px",
  fontSize: 12,
  whiteSpace: "normal",
} as const;
