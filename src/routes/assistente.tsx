import { createFileRoute } from "@tanstack/react-router";
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
type DoubtMessage = {
  id: string;
  from: "bot" | "user";
  text: string;
};

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

const FARMER_ACTIONS: Array<{
  panel: Exclude<FarmerPanel, null>;
  title: string;
  description: string;
  icon: string;
  variant: "primary" | "secondary";
}> = [
  {
    panel: "localizacao",
    title: "Envie sua localização",
    description: "Cruza coordenadas com município, IBGE e dados públicos da região.",
    icon: "fa-location-arrow",
    variant: "primary",
  },
  {
    panel: "cpf",
    title: "Consulta por CPF",
    description: "Exige login Gov.br ou contexto autorizado para dados pessoais.",
    icon: "fa-id-card",
    variant: "secondary",
  },
  {
    panel: "car",
    title: "Número do CAR",
    description: "Busca demonstrativa por código do imóvel rural.",
    icon: "fa-hashtag",
    variant: "secondary",
  },
  {
    panel: "mapa",
    title: "Encontre no mapa",
    description: "Visualiza a região de atendimento e sinais territoriais.",
    icon: "fa-map",
    variant: "secondary",
  },
  {
    panel: "novo",
    title: "Não tenho CAR",
    description: "Orienta o caminho oficial para inscrição ou regularização.",
    icon: "fa-file-signature",
    variant: "secondary",
  },
];

const QUICK_DOUBTS = [
  "O que é o CAR?",
  "CPF exige login?",
  "Posso usar localização?",
  "Serve para WhatsApp?",
];

const DEMONSTRATIVO_PDF_URL = "/demo/Demonstrativo_PE-2613909-4B8F858952E8403AA02C95B630239DF7.pdf";

const DEMO_REPORT = {
  codigo: "PE-2613909-4B8F858952E8403AA02C95B630239DF7",
  municipio: "Serra Talhada",
  uf: "Pernambuco",
  dataInscricao: "30/03/2020",
  ultimaRetificacao: "30/03/2020",
  latitude: "8°8'40.611\"S",
  longitude: "38°26'33.615\"W",
  area: "68,47 ha",
  modulos: "1,71",
  status: "Ativo",
};

function AssistentePage() {
  const [profile, setProfile] = useState<Profile>(null);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-secondary-01, #f8f8f8)",
        color: "var(--color-secondary-09, #1f2937)",
      }}
    >
      <GovHeader onHome={() => setProfile(null)} />
      {!profile && <ProfileChooser onChoose={setProfile} />}
      {profile === "agricultor" && <FarmerHub />}
      {profile === "parceiro" && <PartnerFlow />}
      <DoubtChat />
    </div>
  );
}

function GovHeader({ onHome }: { onHome: () => void }) {
  return (
    <header
      className="br-header"
      style={{
        background: "#fff",
        borderBottom: "1px solid var(--color-secondary-03)",
        position: "sticky",
        top: 0,
        zIndex: 100,
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
              color: "var(--color-secondary-09)",
              fontWeight: 700,
              fontSize: 16,
              padding: 0,
            }}
          >
            <img src={govBrLogo} alt="Gov.br" style={{ height: 30 }} />
            <span
              className="br-divider vertical mx-1"
              style={{ height: 24, borderLeft: "1px solid var(--color-secondary-03)" }}
            />
            <span style={{ color: "#168821" }}>CAR Proativo</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function DoubtChat() {
  const [open, setOpen] = useState(true);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<DoubtMessage[]>([
    {
      id: "welcome",
      from: "bot",
      text: "Olá. Posso tirar dúvidas sobre CAR, Gov.br, CPF, localização, SICAR e uso em WhatsApp ou widget.",
    },
  ]);

  function ask(question: string) {
    const answer = answerDoubt(question);
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), from: "user", text: question },
      { id: crypto.randomUUID(), from: "bot", text: answer },
    ]);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = draft.trim();
    if (!question) return;
    setDraft("");
    ask(question);
  }

  return (
    <aside className={`assistente-chat ${open ? "is-open" : "is-closed"}`}>
      <button
        type="button"
        className="br-button primary circle assistente-chat-toggle"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Fechar chat de dúvidas" : "Abrir chat de dúvidas"}
      >
        <i className={`fas ${open ? "fa-times" : "fa-comments"}`} aria-hidden="true" />
      </button>
      {open && (
        <div className="br-card assistente-chat-panel">
          <div className="assistente-chat-header">
            <div>
              <strong>Chat de dúvidas</strong>
              <span>CAR Proativo</span>
            </div>
          </div>
          <div className="assistente-chat-body" aria-live="polite">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`assistente-chat-message assistente-chat-message--${message.from}`}
              >
                {message.text}
              </div>
            ))}
          </div>
          <div className="assistente-chat-quick">
            {QUICK_DOUBTS.map((question) => (
              <button
                key={question}
                type="button"
                className="br-button secondary small"
                onClick={() => ask(question)}
              >
                {question}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="assistente-chat-form">
            <div className="br-input">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Digite sua dúvida"
                aria-label="Digite sua dúvida"
              />
            </div>
            <button type="submit" className="br-button primary circle" aria-label="Enviar dúvida">
              <i className="fas fa-paper-plane" aria-hidden="true" />
            </button>
          </form>
        </div>
      )}
    </aside>
  );
}

function answerDoubt(question: string) {
  const normalized = question.toLowerCase();
  if (normalized.includes("cpf") || normalized.includes("login")) {
    return "Consulta por CPF deve ser tratada como fluxo autenticado ou autorizado. Na demonstração, usamos CPFs fictícios para explicar o diagnóstico sem expor dados reais.";
  }
  if (normalized.includes("local")) {
    return "Sim. Uma localização compartilhada pode virar latitude e longitude, depois ser cruzada com município, código IBGE e bases públicas regionais.";
  }
  if (normalized.includes("whatsapp") || normalized.includes("zap")) {
    return "Sim. A ideia funciona em WhatsApp: o usuário envia texto ou localização, o backend recebe o webhook e responde com orientação ou resultado público.";
  }
  if (normalized.includes("sicar") || normalized.includes("api")) {
    return "O SICAR público pode apoiar consultas regionais, como município e módulo fiscal. Dados pessoais ou fluxos sensíveis devem respeitar autenticação e autorização.";
  }
  if (normalized.includes("sigef") || normalized.includes("incra")) {
    return "SIGEF/INCRA tem endpoints públicos para algumas consultas, como parcela por código ou filtros geográficos. APIs restritas exigem credencial institucional.";
  }
  if (
    normalized.includes("crédito") ||
    normalized.includes("credito") ||
    normalized.includes("pronaf")
  ) {
    return "O CAR ajuda na preparação para crédito rural porque organiza sinais ambientais do imóvel. A liberação do PRONAF ainda depende do banco, documentação e critérios da política pública.";
  }
  if (normalized.includes("car")) {
    return "CAR é o Cadastro Ambiental Rural. Ele registra informações ambientais do imóvel rural e apoia regularização, análise territorial e acesso a políticas públicas.";
  }
  return "Posso explicar o conceito, indicar qual fluxo exige Gov.br, diferenciar dados públicos de dados sensíveis ou mostrar como isso vira WhatsApp, widget ou experiência web.";
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
    <main style={{ padding: "56px 0 88px", background: "var(--color-secondary-01)" }}>
      <div className="container-lg">
        <section style={{ maxWidth: 900, marginBottom: 36 }}>
          <span className="br-tag success" style={{ fontWeight: 700, marginBottom: 12 }}>
            Experiência do agricultor
          </span>
          <h1
            style={{
              margin: "12px 0 8px",
              fontSize: "var(--font-size-scale-up-06, 2.5rem)",
              lineHeight: 1.12,
              color: "var(--color-secondary-09)",
            }}
          >
            Conferir CAR e avançar para crédito rural sem perder contexto.
          </h1>
          <p style={{ ...mutedTextStyle, maxWidth: 760, fontSize: 16 }}>
            O produtor escolhe uma necessidade e recebe um caminho guiado. CPF fica sinalizado como
            fluxo com autenticação Gov.br; localização, mapa e número do CAR simulam consultas
            públicas.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <div style={actionGridStyle}>
            {FARMER_ACTIONS.map((action) => (
              <HubActionCard
                key={action.panel}
                title={action.title}
                description={action.description}
                icon={action.icon}
                variant={action.variant}
                active={panel === action.panel}
                onClick={() => setPanel(action.panel)}
              />
            ))}
          </div>
        </section>

        <section>
          <div>
            {!panel && <EmptyFarmerState />}
            {panel === "cpf" && <CpfStatusPanel />}
            {panel === "localizacao" && <LocationPanel />}
            {panel === "car" && <CarNumberPanel />}
            {panel === "mapa" && <MapPanel audience="agricultor" />}
            {panel === "novo" && <NewCarPanel />}
          </div>
        </section>
      </div>
    </main>
  );
}

function HubActionCard({
  title,
  description,
  icon,
  variant,
  active,
  onClick,
}: {
  title: string;
  description: string;
  icon: string;
  variant: "primary" | "secondary";
  active: boolean;
  onClick: () => void;
}) {
  return (
    <article
      className="br-card"
      style={{
        height: "100%",
        minHeight: 224,
        borderRadius: 8,
        border: active
          ? "2px solid var(--color-primary-default)"
          : "1px solid var(--color-secondary-04)",
        borderTop:
          variant === "primary"
            ? "4px solid var(--color-success-default, #168821)"
            : "1px solid var(--color-secondary-04)",
        boxShadow: active ? "0 0 0 4px var(--color-primary-pastel-01)" : undefined,
        display: "flex",
        flexDirection: "column",
        padding: 24,
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "var(--color-primary-pastel-01)",
            color: "var(--color-primary-default)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <i className={`fas ${icon}`} aria-hidden="true" />
        </div>
        <h2 style={{ fontSize: 18, lineHeight: 1.25, margin: "0 0 8px" }}>{title}</h2>
        <p style={{ color: "var(--color-secondary-07)", margin: 0, lineHeight: 1.45 }}>
          {description}
        </p>
      </div>
      <div style={{ marginTop: 20 }}>
        <button
          type="button"
          className={`br-button ${active || variant === "primary" ? "primary" : "secondary"} small`}
          onClick={onClick}
          style={{ borderRadius: 999 }}
        >
          Acessar
        </button>
      </div>
    </article>
  );
}

function EmptyFarmerState() {
  return (
    <div className="br-message info" role="status" style={{ marginBottom: 0, maxWidth: 920 }}>
      <div className="icon">
        <i className="fas fa-info-circle" aria-hidden="true" />
      </div>
      <div className="content">
        <span className="message-title" style={{ display: "block", marginBottom: 4 }}>
          Escolha uma solução acima.
        </span>
        <span className="message-body" style={{ display: "block" }}>
          O hub mostra quais consultas exigem autenticação Gov.br e quais usam dados públicos
          regionais.
        </span>
      </div>
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
    <ResultSummaryCard
      source="cpf"
      title={`Encontramos o CAR de ${data.sicar.nome_imovel}`}
      body={`O imóvel está em ${data.sicar.nome_municipio}/${data.sicar.uf}. O status atual é ${formatStatus(data.sicar.status)} e o nível de atenção é ${data.nivel_risco}.`}
      record={data.sicar}
    />
  );
}

function ResultSummaryCard({
  source,
  title,
  body,
  record,
  location,
}: {
  source: string;
  title: string;
  body: string;
  record?: SicarRecord;
  location?: LocationResult;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="br-card"
      style={{
        borderRadius: 8,
        marginTop: 18,
        borderLeft: "4px solid var(--color-success-default, #168821)",
      }}
    >
      <span className="br-tag success" style={{ marginBottom: 10 }}>
        Resultado encontrado
      </span>
      <h3 style={{ margin: "0 0 8px", fontSize: 20 }}>{title}</h3>
      <p style={{ ...mutedTextStyle, maxWidth: 760 }}>{body}</p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 170px), 1fr))",
          gap: 12,
          margin: "16px 0",
        }}
      >
        <MiniFact label="Origem da busca" value={source} />
        <MiniFact
          label="Município"
          value={
            record
              ? `${record.nome_municipio}/${record.uf}`
              : `${location?.municipio_localizacao?.nome}/${location?.municipio_localizacao?.uf}`
          }
        />
        <MiniFact label="Registro" value={record?.codigo_car ?? DEMO_REPORT.codigo} />
      </div>
      <button type="button" className="br-button primary" onClick={() => setOpen(true)}>
        Ver demonstrativo completo
      </button>
      {open && <ReportModal record={record} location={location} onClose={() => setOpen(false)} />}
    </div>
  );
}

function MiniFact({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "var(--color-secondary-01)", borderRadius: 8, padding: 12 }}>
      <span style={{ display: "block", color: "var(--color-secondary-07)", fontSize: 12 }}>
        {label}
      </span>
      <strong style={{ display: "block", marginTop: 4, wordBreak: "break-word" }}>{value}</strong>
    </div>
  );
}

function formatStatus(status: SicarRecord["status"]) {
  const labels: Record<SicarRecord["status"], string> = {
    regular: "regular",
    pendente: "pendente",
    sobreposicao: "com sobreposição",
    cancelado: "cancelado",
    nao_encontrado: "não encontrado",
  };
  return labels[status];
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function ReportModal({
  record,
  location,
  onClose,
}: {
  record?: SicarRecord;
  location?: LocationResult;
  onClose: () => void;
}) {
  const report = record
    ? {
        codigo: record.codigo_car,
        municipio: record.nome_municipio,
        uf: record.uf,
        dataInscricao: formatDate(record.data_inscricao),
        ultimaRetificacao: formatDate(record.data_ultima_atualizacao),
        latitude: "Coordenada disponível no demonstrativo oficial",
        longitude: "Coordenada disponível no demonstrativo oficial",
        area: `${record.area_ha.toLocaleString("pt-BR")} ha`,
        modulos: "Consulte o demonstrativo",
        status: formatStatus(record.status),
      }
    : DEMO_REPORT;
  const municipio = location?.municipio_localizacao;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(15,23,42,0.46)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        className="br-card"
        style={{
          width: "min(980px, 100%)",
          maxHeight: "88vh",
          overflow: "auto",
          borderRadius: 8,
          padding: 0,
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--color-secondary-03)",
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div>
            <span className="br-tag info">Demonstrativo do CAR</span>
            <h2 id="report-modal-title" style={{ margin: "12px 0 0", fontSize: 26 }}>
              Entenda o imóvel sem linguagem complicada
            </h2>
          </div>
          <button
            type="button"
            className="br-button circle secondary"
            onClick={onClose}
            aria-label="Fechar demonstrativo"
          >
            <i className="fas fa-times" aria-hidden="true" />
          </button>
        </div>
        <div style={{ padding: 24 }}>
          <div className="br-message success" role="status">
            <div className="icon">
              <i className="fas fa-check-circle" aria-hidden="true" />
            </div>
            <div className="content">
              <span className="message-title">O CAR foi encontrado.</span>
              <span className="message-body">
                Mostramos abaixo os dados principais em linguagem simples. O PDF oficial continua
                disponível para conferência e download.
              </span>
            </div>
          </div>

          <section style={{ marginTop: 22 }}>
            <h3 style={{ marginTop: 0 }}>Resumo do imóvel rural</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
                gap: 12,
              }}
            >
              <MiniFact label="Registro no CAR" value={report.codigo} />
              <MiniFact label="Município" value={`${report.municipio}/${report.uf}`} />
              <MiniFact label="Data de inscrição" value={report.dataInscricao} />
              <MiniFact label="Última retificação" value={report.ultimaRetificacao} />
              <MiniFact label="Área do imóvel" value={report.area} />
              <MiniFact label="Módulos fiscais" value={report.modulos} />
              <MiniFact label="Latitude" value={report.latitude} />
              <MiniFact label="Longitude" value={report.longitude} />
            </div>
          </section>

          <section style={{ marginTop: 24 }}>
            <h3>Situação do CAR</h3>
            <div
              style={{
                borderLeft: "6px solid var(--color-success-default, #168821)",
                paddingLeft: 16,
              }}
            >
              <strong style={{ color: "var(--color-success-default, #168821)", fontSize: 20 }}>
                {report.status}
              </strong>
              <p style={mutedTextStyle}>
                Em termos simples: esse cadastro tem informações suficientes para consulta
                demonstrativa. Quando houver pendências, elas aparecem abaixo para orientar o
                próximo passo.
              </p>
            </div>
            {record?.pendencias.length ? (
              <div className="br-message warning" role="status" style={{ marginTop: 16 }}>
                <div className="icon">
                  <i className="fas fa-exclamation-triangle" aria-hidden="true" />
                </div>
                <div className="content">
                  <span className="message-title">Pontos de atenção</span>
                  <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                    {record.pendencias.map((pendencia) => (
                      <li key={pendencia}>{pendencia}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
            {municipio && (
              <p style={mutedTextStyle}>
                A localização enviada aponta para {municipio.nome}/{municipio.uf}, código IBGE{" "}
                {municipio.ibge}. O demonstrativo abaixo usa um registro público de exemplo para
                mostrar como o relatório final será apresentado.
              </p>
            )}
          </section>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
            <a href={DEMONSTRATIVO_PDF_URL} download className="br-button primary">
              <i className="fas fa-download" aria-hidden="true" />
              Baixar demonstrativo em PDF
            </a>
            <button type="button" className="br-button secondary" disabled>
              <i className="fas fa-layer-group" aria-hidden="true" />
              Baixar feições em breve
            </button>
          </div>
        </div>
      </div>
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
        <ResultSummaryCard
          source="localização"
          title={`Localização identificada em ${result.municipio_localizacao?.nome}/${result.municipio_localizacao?.uf}`}
          body="Com a localização, encontramos o município, o código IBGE e um demonstrativo público para você entender o tipo de informação que aparece no CAR."
          location={result}
        />
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
        <ResultSummaryCard
          source="número do CAR"
          title={`Encontramos ${record.nome_imovel}`}
          body={`Esse CAR fica em ${record.nome_municipio}/${record.uf}, tem ${record.area_ha} ha e está com status ${formatStatus(record.status)}.`}
          record={record}
        />
      )}
    </div>
  );
}

function MapPanel({ audience }: { audience: "agricultor" | "parceiro" }) {
  return (
    <div className="br-card" style={{ borderRadius: 8, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <strong style={{ display: "block", fontSize: 18 }}>
            {audience === "agricultor" ? "Encontre no mapa" : "Mapa de atendimentos"}
          </strong>
          <p style={{ ...mutedTextStyle, marginBottom: 0 }}>
            Visualização territorial com base satélite e camadas demonstrativas do CAR.
          </p>
        </div>
        {audience === "parceiro" && (
          <span className="br-tag info" style={{ height: "fit-content" }}>
            Serra Talhada/PE
          </span>
        )}
      </div>
      <SatelliteParcelMap />
    </div>
  );
}

function SatelliteParcelMap() {
  const tiles = [
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/13/4282/3222",
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/13/4282/3223",
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/13/4282/3224",
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/13/4283/3222",
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/13/4283/3223",
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/13/4283/3224",
  ];

  return (
    <div
      style={{
        position: "relative",
        height: 420,
        marginTop: 16,
        overflow: "hidden",
        borderRadius: 8,
        border: "1px solid var(--color-secondary-04)",
        background: "#1f2937",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridTemplateRows: "repeat(2, 1fr)",
          width: "100%",
          height: "100%",
          filter: "saturate(1.05) contrast(1.05)",
        }}
      >
        {tiles.map((tile) => (
          <img
            key={tile}
            src={tile}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            loading="lazy"
          />
        ))}
      </div>
      <svg
        viewBox="0 0 900 420"
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        {Array.from({ length: 22 }).map((_, index) => {
          const x = 40 + index * 38;
          const y = index % 2 === 0 ? 40 : 210;
          return (
            <polygon
              key={index}
              points={`${x},${y} ${x + 130},${y + 18} ${x + 112},${y + 152} ${x - 18},${y + 126}`}
              fill="rgba(255, 242, 0, 0.10)"
              stroke={index % 4 === 0 ? "#ff8a00" : "#fff200"}
              strokeWidth="2"
            />
          );
        })}
        <path
          d="M82 318 C190 286 242 340 340 288 S510 246 638 302 S794 304 864 246"
          fill="none"
          stroke="#ff8a00"
          strokeWidth="3"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: 18,
          right: 18,
          display: "grid",
          gap: 8,
        }}
      >
        <button type="button" className="br-button circle small" aria-label="Aproximar mapa">
          <i className="fas fa-plus" aria-hidden="true" />
        </button>
        <button type="button" className="br-button circle small" aria-label="Afastar mapa">
          <i className="fas fa-minus" aria-hidden="true" />
        </button>
        <button type="button" className="br-button circle small" aria-label="Camadas do mapa">
          <i className="fas fa-layer-group" aria-hidden="true" />
        </button>
      </div>
      <button
        type="button"
        className="br-button primary"
        style={{
          position: "absolute",
          left: "35%",
          top: "36%",
          borderRadius: 6,
          boxShadow: "0 8px 20px rgba(0,0,0,0.24)",
        }}
      >
        Ver detalhes do imóvel
      </button>
      <div
        style={{
          position: "absolute",
          left: 14,
          bottom: 14,
          background: "rgba(255,255,255,0.92)",
          borderRadius: 6,
          padding: "8px 10px",
          color: "var(--color-secondary-08)",
          fontWeight: 700,
          fontSize: 13,
        }}
      >
        Lat: -8.17649 Long: -38.34761 · Zoom: 13 · Escala: 38 m
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
  const accountName = institution.includes("EMATER") ? "EMATER — Mato Grosso" : institution;

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
        <section className="br-card" style={{ borderRadius: 8, marginBottom: 24 }}>
          <span className="br-tag success" style={{ fontWeight: 700 }}>
            Conta parceira ativa
          </span>
          <h1
            style={{
              margin: "16px 0 8px",
              fontSize: "var(--font-size-scale-up-06, 2.5rem)",
              lineHeight: 1.12,
              color: "var(--color-secondary-09)",
            }}
          >
            Bem-vindo, {accountName}.
          </h1>
          <p style={{ ...mutedTextStyle, maxWidth: 720 }}>
            Seu perfil institucional está pronto para apoiar produtores no atendimento assistido:
            consultar produtores em contexto autorizado, visualizar áreas no território e instalar o
            widget no site da entidade.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
              gap: 12,
              marginTop: 22,
            }}
          >
            {[
              ["Perfil parceiro", "Atendimento técnico rural habilitado"],
              ["Área de atuação", "Mato Grosso e regiões demonstrativas"],
              ["Canais", "Portal web, widget e WhatsApp"],
            ].map(([label, value]) => (
              <div key={label} className="br-card" style={{ borderRadius: 8, padding: 16 }}>
                <span style={{ color: "var(--color-secondary-07)", fontSize: 13 }}>{label}</span>
                <strong style={{ display: "block", marginTop: 4 }}>{value}</strong>
              </div>
            ))}
          </div>
        </section>
        <div className="br-card" style={{ borderRadius: 8 }}>
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
          <div style={{ marginTop: 22 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <label style={labelStyle}>
                UF
                <select style={inputStyle} defaultValue="PE">
                  <option value="PE">Pernambuco</option>
                  <option value="MT">Mato Grosso</option>
                </select>
              </label>
              <label style={labelStyle}>
                Município
                <input style={inputStyle} value="Serra Talhada" readOnly />
              </label>
              <label style={labelStyle}>
                Número de registro no CAR
                <input
                  style={inputStyle}
                  value="PE-2613909-4B8F858952E8403AA02C95B630239DF7"
                  readOnly
                />
              </label>
            </div>
          </div>
          <MapPanel audience="parceiro" />
        </div>
      </div>
    </main>
  );
}

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

const actionGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
  gap: 24,
  alignItems: "stretch",
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
