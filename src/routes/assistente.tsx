import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import govBrLogo from "@/assets/govbr-logo.svg";
import { useDiagnostico } from "@/hooks/use-diagnostico";
import type { DiagnosticoResult } from "@/lib/services/diagnostico-engine";
import { fetchSicarByCodigo, type SicarRecord } from "@/lib/services/sicar";

export const Route = createFileRoute("/assistente")({
  head: () => ({
    meta: [
      { title: "CAR Proativo — Gov.br" },
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

const PARTNER_DEMO_SCENARIOS = [
  {
    cpf: "107.282.101-00",
    label: "Documentação pendente",
    hint: "CCIR vencido + comprovante de domínio",
  },
  {
    cpf: "287.016.154-91",
    label: "Sobreposição ambiental",
    hint: "APP + Reserva Legal",
  },
  {
    cpf: "321.654.987-91",
    label: "CAR cancelado",
    hint: "Reativação junto ao órgão estadual",
  },
  {
    cpf: "555.666.777-20",
    label: "Área divergente",
    hint: "Retificação georreferenciada",
  },
  {
    cpf: "111.222.333-96",
    label: "Cadastro regular",
    hint: "Nenhuma ação recomendada",
  },
  {
    cpf: "448.903.217-05",
    label: "Múltiplas pendências",
    hint: "Documentação + visita técnica",
  },
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

const STATUS_PRESENTATION: Record<
  SicarRecord["status"],
  { bg: string; text: string; border: string; label: string; icon: string }
> = {
  regular: {
    bg: "#e8f5e9",
    text: "#168821",
    border: "#a5d6a7",
    label: "REGULAR",
    icon: "fa-check-circle",
  },
  pendente: {
    bg: "#fff8e1",
    text: "#e65100",
    border: "#ffcc80",
    label: "PENDENTE",
    icon: "fa-exclamation-triangle",
  },
  sobreposicao: {
    bg: "#fce4ec",
    text: "#b71c1c",
    border: "#ef9a9a",
    label: "SOBREPOSIÇÃO",
    icon: "fa-exclamation-triangle",
  },
  cancelado: {
    bg: "#eeeeee",
    text: "#616161",
    border: "#bdbdbd",
    label: "CANCELADO",
    icon: "fa-ban",
  },
  nao_encontrado: {
    bg: "#f5f5f5",
    text: "#757575",
    border: "#e0e0e0",
    label: "NÃO ENCONTRADO",
    icon: "fa-search",
  },
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
  const [open, setOpen] = useState(false);
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
            <span style={eyebrowStyle}>CAR Proativo replicável</span>
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

type ResolutionStep = {
  label: string;
  module: string;
  description: string;
  icon: string;
  color: string;
};

function getResolutionSteps(data: DiagnosticoResult): ResolutionStep[] {
  const record = data.sicar;
  if (!record) return [];

  const pendencias = record.pendencias.map((item) => item.toLowerCase());
  const steps: ResolutionStep[] = [];

  if (record.status === "cancelado") {
    steps.push({
      label: "Reativação junto ao órgão estadual",
      module: "Central do SICAR",
      description:
        "O CAR cancelado precisa de solicitação formal de reativação, com documentação de domínio atualizada.",
      icon: "fa-redo",
      color: "#616161",
    });
  }

  if (pendencias.some((item) => /ccir|domínio|documento|comprovante/.test(item))) {
    steps.push({
      label: "Etapa 1 — Documentação",
      module: "Módulo de Cadastro SICAR",
      description:
        "O produtor atualiza dados de domínio e documentação. É uma etapa que pode ser conduzida digitalmente.",
      icon: "fa-file-alt",
      color: "#e65100",
    });
  }

  if (pendencias.some((item) => /área|módulo|polígono|diverge/.test(item))) {
    steps.push({
      label: "Etapa — Retificação geo",
      module: "Módulo de Cadastro SICAR",
      description:
        "Divergências de área ou polígono pedem correção georreferenciada antes de reenviar o arquivo .CAR.",
      icon: "fa-map-marked-alt",
      color: "#1351b4",
    });
  }

  if (pendencias.some((item) => /app|preservação|sobreposição|reserva legal/.test(item))) {
    steps.push({
      label: "Etapa — Análise técnica presencial",
      module: "EMATER / órgão ambiental",
      description:
        "Sobreposição com APP ou Reserva Legal exige análise técnica. A EMATER recebe o diagnóstico preparado.",
      icon: "fa-user-tie",
      color: "#b71c1c",
    });
  }

  if (record.status !== "regular" && steps.length === 0) {
    steps.push({
      label: "Retificação no módulo de cadastro",
      module: "Módulo de Cadastro SICAR",
      description:
        "O produtor corrige os campos pendentes e reenvia o arquivo .CAR para nova análise.",
      icon: "fa-edit",
      color: "#e65100",
    });
  }

  return steps;
}

function PartnerDiagnosticCard({
  data,
  copied,
  notified,
  onCopy,
  onNotify,
}: {
  data: DiagnosticoResult;
  copied: boolean;
  notified: boolean;
  onCopy: (link: string) => void;
  onNotify: () => void;
}) {
  const [reportOpen, setReportOpen] = useState(false);

  if (!data.sicar) {
    return (
      <div className="br-message warning" role="status" style={{ marginTop: 24 }}>
        <div className="icon">
          <i className="fas fa-search" aria-hidden="true" />
        </div>
        <div className="content">
          <span className="message-title">CPF não encontrado na base demonstrativa.</span>
          <span className="message-body">
            Use o seletor de desenvolvimento para carregar um cenário de atendimento.
          </span>
        </div>
      </div>
    );
  }

  const record = data.sicar;
  const status = STATUS_PRESENTATION[record.status] ?? STATUS_PRESENTATION.pendente;
  const steps = getResolutionSteps(data);
  const digitalCount = steps.filter(
    (step) => step.icon !== "fa-user-tie" && step.icon !== "fa-redo",
  ).length;
  const technicalCount = steps.filter((step) => step.icon === "fa-user-tie").length;
  const isIrregular = record.status !== "regular";

  return (
    <div
      className="br-card"
      style={{
        marginTop: 28,
        borderRadius: 8,
        border: `1.5px solid ${status.border}`,
        overflow: "hidden",
      }}
    >
      <div style={{ background: status.bg, padding: "18px 20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <i
              className={`fas ${status.icon}`}
              style={{ color: status.text, fontSize: 22, marginTop: 4 }}
              aria-hidden="true"
            />
            <div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span
                  style={{
                    background: status.text,
                    color: "#fff",
                    borderRadius: 4,
                    padding: "3px 8px",
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                  }}
                >
                  {status.label}
                </span>
                {!record.dado_real && (
                  <span style={{ color: "var(--color-secondary-06)", fontSize: 12 }}>demo</span>
                )}
              </div>
              <h3 style={{ margin: "8px 0 4px", fontSize: 22 }}>{record.nome_imovel}</h3>
              <p style={{ margin: 0, color: "var(--color-secondary-07)" }}>
                {record.nome_municipio} — {record.uf} · {record.area_ha} ha
              </p>
            </div>
          </div>
          <code style={{ color: "var(--color-secondary-06)", fontSize: 12 }}>
            {record.codigo_car}
          </code>
        </div>
      </div>

      <div
        style={{
          padding: 20,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.15fr) minmax(220px, 0.85fr) minmax(220px, 0.7fr)",
          gap: 24,
          alignItems: "start",
        }}
      >
        <section>
          <p style={sectionEyebrowStyle}>Diagnóstico</p>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <i
              className={`fas ${record.status === "regular" ? "fa-check-circle" : "fa-times-circle"}`}
              style={{ color: status.text, marginTop: 4 }}
              aria-hidden="true"
            />
            <strong style={{ color: status.text }}>
              {data.acao_recomendada ?? "Nenhuma ação necessária."}
            </strong>
          </div>

          {record.pendencias.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <p style={sectionEyebrowStyle}>Pendências</p>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
                {record.pendencias.map((pendencia) => (
                  <li
                    key={pendencia}
                    style={{ display: "flex", gap: 8, color: "var(--color-secondary-07)" }}
                  >
                    <i
                      className="fas fa-circle"
                      style={{ color: "#e65100", fontSize: 7, marginTop: 8 }}
                      aria-hidden="true"
                    />
                    {pendencia}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {steps.length > 0 && (
            <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span style={pathBadgeStyle}>{steps.length} caminhos de resolução</span>
                {digitalCount > 0 && (
                  <span style={{ ...pathBadgeStyle, background: "#168821" }}>
                    {digitalCount} resolve pelo celular
                  </span>
                )}
                {technicalCount > 0 && (
                  <span style={{ ...pathBadgeStyle, background: "#b71c1c" }}>
                    {technicalCount} requer visita técnica
                  </span>
                )}
              </div>
              {steps.map((step) => (
                <div
                  key={step.label}
                  style={{
                    border: `1px solid ${step.color}30`,
                    background: `${step.color}09`,
                    borderRadius: 8,
                    padding: 14,
                    display: "flex",
                    gap: 12,
                  }}
                >
                  <i
                    className={`fas ${step.icon}`}
                    style={{ color: step.color, marginTop: 3 }}
                    aria-hidden="true"
                  />
                  <div>
                    <strong
                      style={{
                        display: "block",
                        color: step.color,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        fontSize: 12,
                      }}
                    >
                      {step.label}
                    </strong>
                    <span style={{ color: "var(--color-secondary-06)", fontSize: 12 }}>
                      {step.module}
                    </span>
                    <p style={{ ...mutedTextStyle, marginBottom: 0 }}>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <p style={sectionEyebrowStyle}>Fontes cruzadas</p>
          <div style={{ display: "grid", gap: 9 }}>
            {data.fontes.map((fonte) => (
              <div key={fonte.nome} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <i
                  className={`fas ${
                    fonte.status === "ok"
                      ? "fa-check"
                      : fonte.status === "alerta"
                        ? "fa-exclamation"
                        : "fa-minus"
                  }`}
                  style={{
                    color:
                      fonte.status === "ok"
                        ? "var(--color-success-default, #168821)"
                        : fonte.status === "alerta"
                          ? "#e65100"
                          : "var(--color-secondary-05)",
                    width: 14,
                    textAlign: "center",
                  }}
                  aria-hidden="true"
                />
                <span style={{ color: "var(--color-secondary-07)" }}>
                  {fonte.nome}
                  {!fonte.dado_real && (
                    <span style={{ color: "var(--color-secondary-05)", fontStyle: "italic" }}>
                      {" "}
                      · demo
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p style={sectionEyebrowStyle}>Ação recomendada</p>
          <div style={{ display: "grid", gap: 10 }}>
            <button type="button" className="br-button primary" onClick={() => setReportOpen(true)}>
              Ver demonstrativo completo
            </button>
            {isIrregular && data.link_resolucao && (
              <button
                type="button"
                className="br-button secondary"
                onClick={() => onCopy(data.link_resolucao!)}
              >
                <i className={`fas ${copied ? "fa-check" : "fa-copy"}`} aria-hidden="true" />
                {copied ? "Link copiado" : "Copiar link"}
              </button>
            )}
            {isIrregular && (
              <button
                type="button"
                className="br-button secondary"
                onClick={onNotify}
                disabled={notified}
              >
                <i
                  className={`fas ${notified ? "fa-check" : "fa-paper-plane"}`}
                  aria-hidden="true"
                />
                {notified ? "Notificado" : "Notificar produtor"}
              </button>
            )}
          </div>
        </section>
      </div>

      {reportOpen && <ReportModal record={record} onClose={() => setReportOpen(false)} />}
    </div>
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
        nome: record.nome_imovel,
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
    : { ...DEMO_REPORT, nome: "Imóvel rural demonstrativo" };
  const municipio = location?.municipio_localizacao;
  const status = record
    ? (STATUS_PRESENTATION[record.status] ?? STATUS_PRESENTATION.pendente)
    : {
        ...STATUS_PRESENTATION.regular,
        label: DEMO_REPORT.status.toUpperCase(),
      };
  const steps = record ? getResolutionSteps({ sicar: record } as DiagnosticoResult) : [];

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
              {report.nome}
            </h2>
            <p style={{ ...mutedTextStyle, marginBottom: 0 }}>
              {report.municipio}/{report.uf} · {report.codigo}
            </p>
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
          <div
            className="br-message"
            role="status"
            style={{
              borderLeft: `6px solid ${status.text}`,
              background: status.bg,
            }}
          >
            <div className="icon">
              <i
                className={`fas ${status.icon}`}
                style={{ color: status.text }}
                aria-hidden="true"
              />
            </div>
            <div className="content">
              <span className="message-title">
                Situação do cenário: <strong style={{ color: status.text }}>{status.label}</strong>
              </span>
              <span className="message-body">
                Este demonstrativo acompanha o CPF selecionado na simulação e resume o que o técnico
                deve observar antes de orientar o produtor.
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
            <h3>Leitura operacional</h3>
            <div style={{ borderLeft: `6px solid ${status.text}`, paddingLeft: 16 }}>
              <strong style={{ color: status.text, fontSize: 20 }}>{status.label}</strong>
              <p style={mutedTextStyle}>
                {record?.status === "regular"
                  ? "O cadastro não exige ação corretiva na simulação. O parceiro pode seguir com o atendimento."
                  : record
                    ? "Há pontos de atenção no cadastro. Use as pendências e etapas abaixo para explicar o próximo passo ao produtor."
                    : "Consulta regional demonstrativa. Use o PDF para validar os dados do relatório público."}
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
            {steps.length > 0 && (
              <div style={{ marginTop: 18 }}>
                <p style={sectionEyebrowStyle}>Caminho recomendado</p>
                <div style={{ display: "grid", gap: 10 }}>
                  {steps.map((step) => (
                    <div
                      key={step.label}
                      style={{
                        border: `1px solid ${step.color}30`,
                        background: `${step.color}09`,
                        borderRadius: 8,
                        padding: 14,
                        display: "flex",
                        gap: 12,
                      }}
                    >
                      <i
                        className={`fas ${step.icon}`}
                        style={{ color: step.color, marginTop: 3 }}
                        aria-hidden="true"
                      />
                      <div>
                        <strong
                          style={{
                            display: "block",
                            color: step.color,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            fontSize: 12,
                          }}
                        >
                          {step.label}
                        </strong>
                        <span style={{ color: "var(--color-secondary-06)", fontSize: 12 }}>
                          {step.module}
                        </span>
                        <p style={{ ...mutedTextStyle, marginBottom: 0 }}>{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
    <div
      style={{
        padding: audience === "parceiro" ? 0 : 20,
        background: "#fff",
        borderRadius: audience === "parceiro" ? 0 : 8,
      }}
    >
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
  const [activeTab, setActiveTab] = useState<"atendimento" | "widget">("atendimento");
  const [cpf, setCpf] = useState("107.282.101-00");
  const [submittedCpf, setSubmittedCpf] = useState<string | null>(null);
  const [showDevPicker, setShowDevPicker] = useState(false);
  const [copiedResolution, setCopiedResolution] = useState(false);
  const [notifiedProducer, setNotifiedProducer] = useState(false);
  const [copiedWidget, setCopiedWidget] = useState(false);
  const [widgetName, setWidgetName] = useState("Crédito Rural");
  const [widgetPosition, setWidgetPosition] = useState("bottom-right");
  const { data, isFetching, error } = useDiagnostico(submittedCpf);
  const accountName = institution.includes("EMATER") ? "EMATER MG" : institution;

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowDevPicker(false);
    setCopiedResolution(false);
    setNotifiedProducer(false);
    setSubmittedCpf(cpf);
  }

  const widgetSnippet = useMemo(
    () =>
      `<script src="https://carproativo.gov.br/widget.js"
  data-parceiro="${institution}"
  data-widget-name="${widgetName}"
  data-position="${widgetPosition}">
</script>`,
    [institution, widgetName, widgetPosition],
  );

  function copyWidgetSnippet() {
    void navigator.clipboard?.writeText(widgetSnippet);
    setCopiedWidget(true);
    window.setTimeout(() => setCopiedWidget(false), 1800);
  }

  function chooseDemoScenario(cpfValue: string) {
    setCpf(cpfValue);
    setSubmittedCpf(null);
    setShowDevPicker(false);
    setCopiedResolution(false);
    setNotifiedProducer(false);
  }

  function copyResolutionLink(link: string) {
    void navigator.clipboard?.writeText(link);
    setCopiedResolution(true);
    window.setTimeout(() => setCopiedResolution(false), 1800);
  }

  return (
    <main
      style={{
        padding: "48px 16px 96px",
        background: "linear-gradient(180deg, var(--color-secondary-01, #f8f8f8) 0, #fff 260px)",
      }}
    >
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <section style={{ marginBottom: 40 }}>
          <span className="br-tag success" style={{ fontWeight: 700 }}>
            Conta parceira ativa
          </span>
          <h1
            style={{
              margin: "18px 0 12px",
              fontSize: "clamp(2.25rem, 4.5vw, 4rem)",
              lineHeight: 1.12,
              color: "var(--color-secondary-09)",
              maxWidth: 820,
            }}
          >
            Boas Vindas {accountName}
          </h1>
          <p style={{ ...mutedTextStyle, maxWidth: 720 }}>
            Seu perfil institucional está pronto para apoiar produtores no atendimento assistido:
            consultar produtores em contexto autorizado, visualizar áreas no território e configurar
            o widget do site em uma aba dedicada.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
              gap: 16,
              marginTop: 28,
            }}
          >
            {[
              ["Perfil parceiro", "Atendimento técnico rural habilitado"],
              ["Área de atuação", "Mato Grosso e regiões demonstrativas"],
              ["Operação", "Consultas, mapa territorial e orientação ao produtor"],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  borderTop: "3px solid var(--color-primary-default, #1351b4)",
                  paddingTop: 12,
                }}
              >
                <span style={{ color: "var(--color-secondary-07)", fontSize: 13 }}>{label}</span>
                <strong style={{ display: "block", marginTop: 6, fontSize: 16 }}>{value}</strong>
              </div>
            ))}
          </div>
        </section>

        <div className="br-tab" style={{ marginBottom: 32 }}>
          <nav className="tab-nav" aria-label="Áreas do portal">
            <ul>
              {[
                { id: "atendimento", label: "Atendimento", icon: "fa-headset" },
                { id: "widget", label: "Widget do site", icon: "fa-code" },
              ].map((tab) => {
                const selected = activeTab === tab.id;
                return (
                  <li key={tab.id} className={`tab-item ${selected ? "active" : ""}`}>
                    <button
                      type="button"
                      aria-selected={selected}
                      onClick={() => setActiveTab(tab.id as "atendimento" | "widget")}
                    >
                      <i className={`fas ${tab.icon}`} aria-hidden="true" /> {tab.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {activeTab === "atendimento" && (
          <section style={{ display: "grid", gap: 32 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <i className="fas fa-search" style={{ color: "#1351b4" }} aria-hidden="true" />
                <h2 style={{ margin: 0, fontSize: 24 }}>Buscar produtor</h2>
              </div>
              <p style={{ ...mutedTextStyle, maxWidth: 620 }}>
                Consulte um CPF em contexto autorizado para abrir o demonstrativo e orientar o
                atendimento com dados claros.
              </p>
              <form
                onSubmit={search}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) auto auto",
                  gap: 12,
                  alignItems: "end",
                  marginTop: 24,
                  maxWidth: 760,
                }}
              >
                <div className="br-input">
                  <label htmlFor="partner-cpf">CPF do produtor</label>
                  <input
                    id="partner-cpf"
                    value={cpf}
                    onChange={(event) => setCpf(event.target.value)}
                    placeholder="000.000.000-00"
                  />
                </div>
                <button type="submit" className="br-button primary" style={{ minHeight: 40 }}>
                  {isFetching ? "Buscando..." : "Buscar CPF"}
                </button>
                <div style={{ position: "relative" }}>
                  <button
                    type="button"
                    className="br-button secondary circle"
                    onClick={() => setShowDevPicker((value) => !value)}
                    aria-label="Selecionar cenário de demonstração"
                    title="Selecionar cenário demo"
                  >
                    <i className="fas fa-code" aria-hidden="true" />
                  </button>
                  {showDevPicker && (
                    <div
                      className="br-card"
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "calc(100% + 8px)",
                        width: 330,
                        zIndex: 20,
                        borderRadius: 8,
                        padding: 14,
                        boxShadow: "0 16px 36px rgba(15,23,42,0.18)",
                      }}
                    >
                      <label
                        htmlFor="partner-demo-scenario"
                        style={{
                          display: "block",
                          fontWeight: 800,
                          marginBottom: 8,
                          color: "var(--color-secondary-08)",
                        }}
                      >
                        Cenário de demonstração
                      </label>
                      <select
                        id="partner-demo-scenario"
                        className="br-input"
                        value={cpf}
                        onChange={(event) => chooseDemoScenario(event.target.value)}
                        style={{
                          width: "100%",
                          minHeight: 40,
                          border: "1px solid var(--color-secondary-04)",
                          borderRadius: 6,
                          padding: "8px 10px",
                          background: "#fff",
                        }}
                      >
                        {PARTNER_DEMO_SCENARIOS.map((scenario) => (
                          <option key={scenario.cpf} value={scenario.cpf}>
                            {scenario.label} — {scenario.hint}
                          </option>
                        ))}
                      </select>
                      <p style={{ ...mutedTextStyle, fontSize: 13, marginBottom: 0 }}>
                        O CPF fica oculto na seleção para manter a demonstração limpa.
                      </p>
                    </div>
                  )}
                </div>
              </form>
              {error && (
                <div className="br-message danger" role="status" style={{ marginTop: 20 }}>
                  <div className="icon">
                    <i className="fas fa-times-circle" aria-hidden="true" />
                  </div>
                  <div className="content">
                    <span className="message-title">Não foi possível consultar este CPF.</span>
                    <span className="message-body">
                      Verifique os 11 dígitos ou selecione um cenário pelo botão de desenvolvimento.
                    </span>
                  </div>
                </div>
              )}
              {data && !isFetching && (
                <PartnerDiagnosticCard
                  data={data}
                  copied={copiedResolution}
                  notified={notifiedProducer}
                  onCopy={copyResolutionLink}
                  onNotify={() => setNotifiedProducer(true)}
                />
              )}
            </div>
            <section>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <i
                  className="fas fa-map-marked-alt"
                  style={{ color: "#1351b4" }}
                  aria-hidden="true"
                />
                <h2 style={{ margin: 0, fontSize: 24 }}>Território atendido</h2>
              </div>
              <p style={{ ...mutedTextStyle, maxWidth: 720 }}>
                Filtre por UF, município ou número do CAR para visualizar a região de atendimento e
                abrir detalhes do imóvel.
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
                  gap: 16,
                  margin: "18px 0 20px",
                }}
              >
                <div className="br-input">
                  <label htmlFor="partner-uf">UF</label>
                  <input id="partner-uf" value="Pernambuco" readOnly />
                </div>
                <div className="br-input">
                  <label htmlFor="partner-city">Município</label>
                  <input id="partner-city" value="Serra Talhada" readOnly />
                </div>
                <div className="br-input">
                  <label htmlFor="partner-car">Número de registro no CAR</label>
                  <input
                    id="partner-car"
                    value="PE-2613909-4B8F858952E8403AA02C95B630239DF7"
                    readOnly
                  />
                </div>
              </div>
              <MapPanel audience="parceiro" />
            </section>
          </section>
        )}

        {activeTab === "widget" && (
          <WidgetBuilderTab
            widgetName={widgetName}
            widgetPosition={widgetPosition}
            widgetSnippet={widgetSnippet}
            copied={copiedWidget}
            onNameChange={setWidgetName}
            onPositionChange={setWidgetPosition}
            onCopy={copyWidgetSnippet}
          />
        )}
      </div>
    </main>
  );
}

function WidgetBuilderTab({
  widgetName,
  widgetPosition,
  widgetSnippet,
  copied,
  onNameChange,
  onPositionChange,
  onCopy,
}: {
  widgetName: string;
  widgetPosition: string;
  widgetSnippet: string;
  copied: boolean;
  onNameChange: (value: string) => void;
  onPositionChange: (value: string) => void;
  onCopy: () => void;
}) {
  const widgetIsRight = widgetPosition === "bottom-right";

  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
        gap: 32,
        alignItems: "start",
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <i className="fas fa-code" style={{ color: "#1351b4" }} aria-hidden="true" />
          <h2 style={{ margin: 0, fontSize: 24 }}>Gerar widget do site</h2>
        </div>
        <p style={{ ...mutedTextStyle, maxWidth: 620 }}>
          Configure o acionador do CAR Proativo para instalar no site da instituição. A prévia ao
          lado mostra como o botão aparece para o produtor.
        </p>

        <div style={{ display: "grid", gap: 16, marginTop: 22 }}>
          <div className="br-input">
            <label htmlFor="widget-name">Nome exibido no botão</label>
            <input
              id="widget-name"
              value={widgetName}
              onChange={(event) => onNameChange(event.target.value)}
            />
          </div>
          <div className="br-select">
            <label htmlFor="widget-position">Posição na página</label>
            <select
              id="widget-position"
              value={widgetPosition}
              onChange={(event) => onPositionChange(event.target.value)}
            >
              <option value="bottom-right">Canto inferior direito</option>
              <option value="bottom-left">Canto inferior esquerdo</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 26 }}>
          <div
            style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}
          >
            <h3 style={{ margin: 0, fontSize: 18 }}>Código de instalação</h3>
            <button type="button" className="br-button secondary small" onClick={onCopy}>
              <i className="fas fa-copy" aria-hidden="true" />
              {copied ? "Copiado" : "Copiar código"}
            </button>
          </div>
          <pre style={codeBlockStyle}>{widgetSnippet}</pre>
        </div>
      </div>

      <div>
        <h3 style={{ margin: "0 0 14px", fontSize: 18 }}>Preview</h3>
        <div
          style={{
            minHeight: 720,
            borderRadius: 8,
            border: "1px solid var(--color-secondary-03)",
            background: "#fff",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            justifyContent: widgetIsRight ? "flex-end" : "flex-start",
            alignItems: "center",
            padding: 32,
          }}
        >
          <div
            style={{
              width: "min(100%, 430px)",
              minHeight: 560,
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 18px 48px rgba(15,23,42,0.18)",
              overflow: "hidden",
              border: "1px solid var(--color-secondary-03)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ background: "#00a000", color: "#fff", padding: "18px 20px" }}>
              <strong style={{ display: "block", fontSize: 20 }}>CAR Proativo</strong>
              <span style={{ fontSize: 13 }}>Seu facilitador de crédito rural</span>
            </div>
            <div
              style={{
                padding: 18,
                display: "flex",
                flexDirection: "column",
                gap: 14,
                flex: 1,
              }}
            >
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: 8,
                  padding: 14,
                  color: "#374151",
                  fontSize: 14,
                  lineHeight: 1.45,
                }}
              >
                Olá, posso ajudar com consulta do CAR, localização e dúvidas sobre crédito rural.
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["O que é o CAR?", "Consultar por CPF", "Enviar localização"].map((label) => (
                  <span key={label} style={chipStyle}>
                    {label}
                  </span>
                ))}
              </div>
              <div style={{ marginTop: "auto" }}>
                <div className="br-input">
                  <label htmlFor="widget-preview-input">Digite sua dúvida</label>
                  <input id="widget-preview-input" placeholder="Como o CAR ajuda no crédito?" />
                </div>
              </div>
            </div>
          </div>
          <button
            type="button"
            aria-label={`Abrir widget ${widgetName}`}
            style={{
              position: "absolute",
              bottom: 22,
              [widgetIsRight ? "right" : "left"]: 22,
              width: 86,
              height: 86,
              borderRadius: 26,
              border: 0,
              background: "#34c759",
              color: "#fff",
              boxShadow: "0 16px 36px rgba(22,136,33,0.28)",
              fontWeight: 900,
              lineHeight: 1.05,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              padding: 0,
              textAlign: "center",
            }}
          >
            <i
              className="fas fa-coins"
              aria-hidden="true"
              style={{
                display: "block",
                color: "#ffea00",
                fontSize: 20,
                lineHeight: 1,
              }}
            />
            <span style={{ display: "block", maxWidth: 70 }}>
              {widgetName.split(" ").map((word) => (
                <span key={word} style={{ display: "block" }}>
                  {word}
                </span>
              ))}
            </span>
          </button>
        </div>
      </div>
    </section>
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

const sectionEyebrowStyle = {
  fontWeight: 800,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--color-secondary-07)",
  margin: "0 0 12px",
} as const;

const pathBadgeStyle = {
  fontSize: 12,
  fontWeight: 800,
  background: "#e65100",
  color: "#fff",
  borderRadius: 4,
  padding: "3px 8px",
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
