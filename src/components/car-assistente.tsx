import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import govBrLogo from "@/assets/govbr-logo.svg";
import { useDiagnostico } from "@/hooks/use-diagnostico";
import type { DiagnosticoResult } from "@/lib/services/diagnostico-engine";
import { fetchSicarByCodigo } from "@/lib/services/sicar";

type Mode = "whatsapp" | "embed";
type Message = {
  id: string;
  from: "bot" | "user";
  text: string;
  video?: string;
  actions?: Array<{ label: string; action: ChatAction }>;
};
type ChatAction = "car" | "pronaf" | "regular" | "location" | "cpf" | "codigoCar" | "create";
type ConsoleLog = {
  id: string;
  method: string;
  title: string;
  detail: string;
  payload?: unknown;
  response?: unknown;
};

const VIDEO_URL = "/demo/giz_car_nacional_LEGENDA_ALTA.mp4";
const DEMO_COORDS = { latitude: -16.0672, longitude: -57.6814 };
const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome",
    from: "bot",
    text: "Olá, eu sou o CAR Proativo. Posso te ajudar a entender o CAR, preparar crédito rural e consultar sinais públicos da sua região.",
    actions: [
      { label: "O que é o CAR?", action: "car" },
      { label: "Como conseguir o crédito do PRONAF?", action: "pronaf" },
      { label: "Meu CAR está regular?", action: "regular" },
    ],
  },
];

export function DemoPage() {
  const [mode, setMode] = useState<Mode>("whatsapp");
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const [plusOpen, setPlusOpen] = useState(false);
  const [cpfInputOpen, setCpfInputOpen] = useState(false);
  const [carInputOpen, setCarInputOpen] = useState(false);
  const [cpfDraft, setCpfDraft] = useState("107.282.101-00");
  const [carDraft, setCarDraft] = useState("MT-5102504-A4B2C1D8E3F5");
  const [cpfToCheck, setCpfToCheck] = useState<string | null>(null);
  const [checkingCar, setCheckingCar] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const handledCpfRef = useRef<string | null>(null);
  const {
    data: diagnostico,
    isFetching: checkingCpf,
    error: cpfError,
  } = useDiagnostico(cpfToCheck);

  const appendMessage = useCallback((message: Omit<Message, "id">) => {
    setMessages((current) => [...current, { ...message, id: crypto.randomUUID() }]);
  }, []);

  const appendBot = useCallback(
    (message: string | Omit<Message, "id" | "from">) => {
      if (typeof message === "string") {
        appendMessage({ from: "bot", text: message });
        return;
      }
      appendMessage({ from: "bot", ...message });
    },
    [appendMessage],
  );

  const appendUser = useCallback(
    (text: string) => {
      appendMessage({ from: "user", text });
    },
    [appendMessage],
  );

  const appendLog = useCallback((log: Omit<ConsoleLog, "id">) => {
    setLogs((current) => [{ ...log, id: crypto.randomUUID() }, ...current].slice(0, 8));
  }, []);

  useEffect(() => {
    if (!cpfToCheck || checkingCpf || handledCpfRef.current === cpfToCheck) return;
    if (diagnostico) {
      handledCpfRef.current = cpfToCheck;
      appendLog({
        method: "GET",
        title: "Server function consultarDiagnostico",
        detail: `Consulta por CPF ${cpfToCheck}`,
        payload: { cpf: cpfToCheck },
        response: diagnostico,
      });
      appendBot(cpfResultMessage(diagnostico));
    }
  }, [appendBot, appendLog, checkingCpf, cpfToCheck, diagnostico]);

  useEffect(() => {
    if (!cpfToCheck || checkingCpf || !cpfError || handledCpfRef.current === cpfToCheck) return;
    handledCpfRef.current = cpfToCheck;
    appendLog({
      method: "GET",
      title: "Server function consultarDiagnostico",
      detail: "Falha na validação ou consulta por CPF.",
      payload: { cpf: cpfToCheck },
      response: { error: cpfError instanceof Error ? cpfError.message : "Erro desconhecido" },
    });
    appendBot(
      "Não consegui validar esse CPF. Confira os 11 dígitos ou use a localização para uma consulta regional.",
    );
  }, [appendBot, appendLog, checkingCpf, cpfError, cpfToCheck]);

  function resetDemo() {
    setMessages(INITIAL_MESSAGES);
    setLogs([]);
    setPlusOpen(false);
    setCpfInputOpen(false);
    setCarInputOpen(false);
    setCpfToCheck(null);
    setCarDraft("MT-5102504-A4B2C1D8E3F5");
    handledCpfRef.current = null;
  }

  async function handleAction(action: ChatAction) {
    if (action === "car") {
      appendUser("O que é o CAR?");
      appendBot({
        text: "O CAR é o Cadastro Ambiental Rural. Ele reúne dados do imóvel rural, como área, reserva legal e áreas de preservação. É a base para regularização ambiental e acesso a políticas públicas.",
        video: VIDEO_URL,
        actions: [{ label: "Meu CAR está regular?", action: "regular" }],
      });
      return;
    }

    if (action === "pronaf") {
      appendUser("Como conseguir o crédito do PRONAF?");
      appendBot(
        "Para buscar crédito do PRONAF: 1) mantenha CPF e documentação do imóvel em dia; 2) confira se o CAR não tem pendências; 3) procure sua cooperativa, banco ou assistência técnica; 4) leve DAP/CAF, orçamento do projeto e documentos da propriedade; 5) acompanhe a análise até a liberação.",
      );
      return;
    }

    if (action === "regular") {
      appendUser("Meu CAR está regular?");
      appendBot({
        text: "Posso consultar de duas formas: você digita um CPF para buscar CARs demonstrativos no seu nome, ou compartilha uma localização para eu consultar dados públicos da região.",
        actions: [
          { label: "Digitar CPF", action: "cpf" },
          { label: "Digitar Número do CAR", action: "codigoCar" },
          { label: "Enviar localização", action: "location" },
          { label: "Criar/registrar CAR", action: "create" },
        ],
      });
      return;
    }

    if (action === "codigoCar") {
      appendUser("Digitar Número do CAR");
      setCarInputOpen(true);
      return;
    }

    if (action === "cpf") {
      appendUser("Digitar CPF");
      setCpfInputOpen(true);
      return;
    }

    if (action === "location") {
      appendUser(mode === "whatsapp" ? "Enviar localização" : "Usar localização do navegador");
      if (mode === "whatsapp") {
        setPlusOpen(true);
        appendBot(
          "No WhatsApp, toque em Mais e depois em Localização. Abri o menu para simular esse passo.",
        );
        return;
      }
      await requestBrowserLocation();
      return;
    }

    appendUser("Criar/registrar CAR");
    window.open("https://www.car.gov.br/#/", "_blank", "noopener,noreferrer");
    appendBot(
      "Abri o atalho oficial do CAR em uma nova aba. Se o navegador bloquear pop-up, acesse car.gov.br e procure a opção de inscrição/cadastro.",
    );
  }

  async function submitCpf(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    appendUser(`CPF ${cpfDraft}`);
    appendBot(
      "Vou consultar os CARs demonstrativos vinculados a esse CPF e verificar o status ambiental.",
    );
    setCpfInputOpen(false);
    handledCpfRef.current = null;
    setCpfToCheck(cpfDraft);
  }

  async function submitCarCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const codigo = carDraft.trim().toUpperCase();
    appendUser(`CAR ${codigo}`);
    appendBot("Vou procurar esse número de CAR nos registros demonstrativos e trazer o status.");
    setCarInputOpen(false);
    setCheckingCar(true);

    appendLog({
      method: "GET",
      title: "fetchSicarByCodigo",
      detail: `Consulta demonstrativa por código CAR ${codigo}`,
      payload: { codigo_car: codigo },
    });

    try {
      const record = await fetchSicarByCodigo(codigo);
      appendLog({
        method: "GET",
        title: "fetchSicarByCodigo",
        detail: record ? "CAR encontrado nos registros demonstrativos." : "CAR não encontrado.",
        payload: { codigo_car: codigo },
        response: record,
      });
      appendBot(
        record
          ? `Encontrei ${record.nome_imovel}. Status: ${record.status}. Município: ${record.nome_municipio}/${record.uf}. ${
              record.pendencias.length
                ? `Pendências: ${record.pendencias.join("; ")}.`
                : "Nenhuma pendência registrada na demo."
            }`
          : "Não encontrei esse número nos registros demonstrativos. Você pode digitar um CPF, enviar localização ou iniciar um novo cadastro.",
      );
    } finally {
      setCheckingCar(false);
    }
  }

  async function callLocationApi(payload: unknown, title: string) {
    setLoadingLocation(true);
    appendLog({
      method: "POST",
      title,
      detail: "Enviando latitude/longitude para /api/localizacao/car",
      payload,
    });

    try {
      const response = await fetch("/api/localizacao/car", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as unknown;
      appendLog({
        method: "POST",
        title,
        detail: `Resposta HTTP ${response.status}`,
        payload,
        response: data,
      });
      appendBot(locationResultMessage(data));
    } catch (error) {
      appendLog({
        method: "POST",
        title,
        detail: "Falha na chamada da API de localização.",
        payload,
        response: { error: error instanceof Error ? error.message : "Erro desconhecido" },
      });
      appendBot("Não consegui consultar a localização agora. Tente novamente em alguns instantes.");
    } finally {
      setLoadingLocation(false);
      setPlusOpen(false);
    }
  }

  async function useWhatsappLocation() {
    appendUser("Localização compartilhada");
    await callLocationApi(
      {
        entry: [
          {
            changes: [
              {
                value: {
                  messages: [
                    {
                      type: "location",
                      location: {
                        ...DEMO_COORDS,
                        name: "Localização compartilhada",
                        address: "Cáceres - MT",
                      },
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
      "Webhook WhatsApp Location",
    );
  }

  async function requestBrowserLocation() {
    if (!navigator.geolocation) {
      appendBot("Seu navegador não oferece geolocalização. Use o modo WhatsApp ou digite um CPF.");
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        void callLocationApi(
          {
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              name: "Localização do navegador",
            },
          },
          "Browser Geolocation API",
        );
      },
      () => {
        setLoadingLocation(false);
        appendBot(
          "Não recebi autorização do navegador. Para a demo, você também pode usar o modo WhatsApp com localização simulada.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f7f9fb", color: "#1f2937" }}>
      <DemoNav />
      <main>
        <section
          style={{ padding: "40px 0 28px", background: "#fff", borderBottom: "1px solid #e5e7eb" }}
        >
          <div className="container-lg">
            <div className="row align-items-center">
              <div className="col-lg-7">
                <span style={eyebrowStyle}>CAR Proativo · Demo</span>
                <h1
                  style={{
                    margin: "12px 0 16px",
                    fontSize: "clamp(2.2rem, 5vw, 4.1rem)",
                    lineHeight: 1.04,
                    color: "#111827",
                    fontWeight: 900,
                  }}
                >
                  Atendimento rural em conversa, consulta e ação.
                </h1>
                <p
                  style={{ color: "#4b5563", lineHeight: 1.75, fontSize: "1.05rem", maxWidth: 680 }}
                >
                  Simule o CAR Proativo em WhatsApp ou widget web. A experiência mostra perguntas
                  prontas, vídeo educativo, consulta por CPF, localização e bastidores técnicos em
                  tempo real.
                </p>
              </div>
              <div className="col-lg-5 mt-4 mt-lg-0">
                <div
                  style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}
                >
                  <button
                    type="button"
                    onClick={() => setMode("whatsapp")}
                    style={modeButtonStyle(mode === "whatsapp")}
                  >
                    <i className="fab fa-whatsapp" aria-hidden="true" />
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("embed")}
                    style={modeButtonStyle(mode === "embed")}
                  >
                    <i className="fas fa-window-restore" aria-hidden="true" />
                    Embed Web
                  </button>
                  <button
                    type="button"
                    onClick={() => setConsoleOpen((open) => !open)}
                    style={secondaryButtonStyle}
                  >
                    <i className="fas fa-terminal" aria-hidden="true" />
                    Bastidores
                  </button>
                  <button type="button" onClick={resetDemo} style={secondaryButtonStyle}>
                    <i className="fas fa-redo-alt" aria-hidden="true" />
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: "34px 0 56px" }}>
          <div className="container-lg">
            <div className="row align-items-start">
              <div className={consoleOpen ? "col-xl-7" : "col-xl-12"}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  {mode === "whatsapp" ? (
                    <IphoneMockup>
                      <WhatsappExperience
                        messages={messages}
                        plusOpen={plusOpen}
                        loadingLocation={loadingLocation}
                        cpfInputOpen={cpfInputOpen}
                        carInputOpen={carInputOpen}
                        cpfDraft={cpfDraft}
                        carDraft={carDraft}
                        checkingCpf={checkingCpf}
                        checkingCar={checkingCar}
                        onAction={handleAction}
                        onLocation={useWhatsappLocation}
                        onCpfChange={setCpfDraft}
                        onCarChange={setCarDraft}
                        onCpfSubmit={submitCpf}
                        onCarSubmit={submitCarCode}
                      />
                    </IphoneMockup>
                  ) : (
                    <EmbedExperience
                      messages={messages}
                      loadingLocation={loadingLocation}
                      cpfInputOpen={cpfInputOpen}
                      carInputOpen={carInputOpen}
                      cpfDraft={cpfDraft}
                      carDraft={carDraft}
                      checkingCpf={checkingCpf}
                      checkingCar={checkingCar}
                      onAction={handleAction}
                      onCpfChange={setCpfDraft}
                      onCarChange={setCarDraft}
                      onCpfSubmit={submitCpf}
                      onCarSubmit={submitCarCode}
                    />
                  )}
                </div>
              </div>
              {consoleOpen && (
                <div className="col-xl-5 mt-4 mt-xl-0">
                  <ConsolePanel logs={logs} />
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function DemoNav() {
  return (
    <header
      style={{
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        position: "sticky",
        top: 0,
        zIndex: 20,
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
            <span style={{ height: 24, borderLeft: "1px solid #d1d5db", margin: "0 12px" }} />
            <strong style={{ color: "#111827" }}>CAR</strong>
            <strong style={{ color: "#168821", fontStyle: "italic", marginLeft: 4 }}>
              Proativo
            </strong>
          </Link>
          <nav style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link to="/localizacao" style={linkButtonStyle}>
              API Localização
            </Link>
            <Link to="/wiki" style={linkButtonStyle}>
              Wiki
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

function IphoneMockup({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: "min(100%, 414px)",
        padding: 12,
        borderRadius: 54,
        background: "#0b0f19",
        boxShadow: "0 36px 80px rgba(15,23,42,0.25)",
      }}
    >
      <div
        style={{
          borderRadius: 44,
          background: "#fff",
          padding: "12px 10px 10px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 10,
            left: "50%",
            transform: "translateX(-50%)",
            width: 118,
            height: 26,
            borderRadius: 999,
            background: "#0b0f19",
            zIndex: 3,
          }}
        />
        {children}
      </div>
    </div>
  );
}

function WhatsappExperience(props: {
  messages: Message[];
  plusOpen: boolean;
  loadingLocation: boolean;
  cpfInputOpen: boolean;
  carInputOpen: boolean;
  cpfDraft: string;
  carDraft: string;
  checkingCpf: boolean;
  checkingCar: boolean;
  onAction: (action: ChatAction) => void;
  onLocation: () => void;
  onCpfChange: (cpf: string) => void;
  onCarChange: (codigo: string) => void;
  onCpfSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCarSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div
      style={{
        height: "min(780px, calc(100vh - 120px))",
        minHeight: 620,
        borderRadius: 36,
        overflow: "hidden",
        background: "#efe7dd",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PhoneStatus />
      <div
        style={{
          height: 64,
          background: "#f7f1ea",
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
          gap: 10,
          padding: "10px 14px",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "#168821",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
          }}
        >
          CA
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <strong style={{ color: "#111827", display: "block" }}>CAR Proativo</strong>
          <span style={{ color: "#168821", fontSize: 12 }}>online agora</span>
        </div>
        <i className="fas fa-video" style={{ color: "#374151" }} aria-hidden="true" />
        <i className="fas fa-phone-alt" style={{ color: "#374151" }} aria-hidden="true" />
      </div>
      <ChatBody messages={props.messages} onAction={props.onAction} />
      {props.cpfInputOpen && (
        <CpfComposer
          cpfDraft={props.cpfDraft}
          checkingCpf={props.checkingCpf}
          onCpfChange={props.onCpfChange}
          onCpfSubmit={props.onCpfSubmit}
        />
      )}
      {props.carInputOpen && (
        <CarComposer
          carDraft={props.carDraft}
          checkingCar={props.checkingCar}
          onCarChange={props.onCarChange}
          onCarSubmit={props.onCarSubmit}
        />
      )}
      <WhatsappComposer onPlus={() => props.onAction("location")} />
      {props.plusOpen && (
        <WhatsappMoreSheet loading={props.loadingLocation} onLocation={props.onLocation} />
      )}
    </div>
  );
}

function EmbedExperience(props: {
  messages: Message[];
  loadingLocation: boolean;
  cpfInputOpen: boolean;
  carInputOpen: boolean;
  cpfDraft: string;
  carDraft: string;
  checkingCpf: boolean;
  checkingCar: boolean;
  onAction: (action: ChatAction) => void;
  onCpfChange: (cpf: string) => void;
  onCarChange: (codigo: string) => void;
  onCpfSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCarSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const [widgetOpen, setWidgetOpen] = useState(true);

  return (
    <div
      style={{
        width: "min(100%, 620px)",
        minHeight: 720,
        background: "#fbf5e6",
        borderRadius: 28,
        boxShadow: "0 28px 80px rgba(15,23,42,0.12)",
        border: "1px solid rgba(15,23,42,0.06)",
        position: "relative",
        overflow: "hidden",
        padding: 28,
      }}
    >
      {widgetOpen && (
        <div
          style={{
            width: "min(100%, 430px)",
            background: "#fff",
            borderRadius: 14,
            boxShadow: "0 18px 46px rgba(15,23,42,0.16)",
            overflow: "hidden",
            border: "1px solid #e5e7eb",
          }}
        >
          <div style={{ background: "#00a000", color: "#fff", padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong style={{ display: "block", fontSize: 20 }}>CAR Proativo</strong>
                <span style={{ fontSize: 13 }}>Seu facilitador de crédito Rural</span>
              </div>
              <button
                type="button"
                aria-label="Fechar widget"
                onClick={() => setWidgetOpen(false)}
                style={{
                  border: 0,
                  background: "rgba(255,255,255,0.18)",
                  color: "#fff",
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                }}
              >
                ×
              </button>
            </div>
          </div>
          <div
            style={{ height: 600, display: "flex", flexDirection: "column", background: "#fff" }}
          >
            <ChatBody messages={props.messages} onAction={props.onAction} compact />
            {props.cpfInputOpen && (
              <CpfComposer
                cpfDraft={props.cpfDraft}
                checkingCpf={props.checkingCpf}
                onCpfChange={props.onCpfChange}
                onCpfSubmit={props.onCpfSubmit}
              />
            )}
            {props.carInputOpen && (
              <CarComposer
                carDraft={props.carDraft}
                checkingCar={props.checkingCar}
                onCarChange={props.onCarChange}
                onCarSubmit={props.onCarSubmit}
              />
            )}
            <div style={{ padding: 14, borderTop: "1px solid #edf0f3", background: "#fff" }}>
              <button
                type="button"
                onClick={() => props.onAction("location")}
                disabled={props.loadingLocation}
                style={{ ...chatActionButtonStyle, width: "100%", justifyContent: "center" }}
              >
                <i
                  className={`fas ${
                    props.loadingLocation ? "fa-spinner fa-spin" : "fa-location-arrow"
                  }`}
                  aria-hidden="true"
                />
                Usar localização do navegador
              </button>
            </div>
          </div>
        </div>
      )}
      <WidgetLauncher onClick={() => setWidgetOpen(true)} />
    </div>
  );
}

function WidgetLauncher({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Abrir widget Crédito Rural"
      style={{
        position: "absolute",
        right: 38,
        bottom: 34,
        width: 78,
        height: 78,
        border: 0,
        borderRadius: 20,
        background: "#34C759",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        boxShadow: "0 16px 36px rgba(22, 136, 33, 0.26)",
        cursor: "pointer",
      }}
    >
      <WidgetCoinIcon />
      <strong style={{ fontSize: 13, lineHeight: 1 }}>Crédito</strong>
      <strong style={{ fontSize: 13, lineHeight: 1 }}>Rural</strong>
    </button>
  );
}

function WidgetCoinIcon() {
  return (
    <svg width="24" height="18" viewBox="0 0 38 28" fill="none" aria-hidden="true">
      <ellipse cx="19" cy="8" rx="13" ry="6" fill="#FFEA00" />
      <path d="M6 8v5c0 3.31 5.82 6 13 6s13-2.69 13-6V8" stroke="#FFEA00" strokeWidth="5" />
      <ellipse cx="19" cy="8" rx="9" ry="3.5" fill="#34C759" opacity="0.55" />
      <ellipse cx="19" cy="8" rx="13" ry="6" stroke="#FFEA00" strokeWidth="3" />
    </svg>
  );
}

function ChatBody({
  messages,
  onAction,
  compact = false,
}: {
  messages: Message[];
  onAction: (action: ChatAction) => void;
  compact?: boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollTop = scroller.scrollHeight;
  }, [messages.length]);

  return (
    <div
      ref={scrollerRef}
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        overscrollBehavior: "contain",
        padding: compact ? 18 : "18px 14px",
        background: compact ? "#fff" : "linear-gradient(180deg,#efe7dd,#f6efe8)",
      }}
    >
      {messages.map((message) => (
        <div
          key={message.id}
          style={{
            display: "flex",
            justifyContent: message.from === "user" ? "flex-end" : "flex-start",
            marginBottom: 12,
          }}
        >
          <div style={{ maxWidth: "84%" }}>
            <div style={bubbleStyle(message.from)}>
              <p style={{ margin: 0, lineHeight: 1.45, fontSize: 14 }}>{message.text}</p>
              {message.video && (
                <video
                  controls
                  preload="metadata"
                  src={message.video}
                  style={{
                    width: "100%",
                    marginTop: 10,
                    borderRadius: 10,
                    display: "block",
                    background: "#111827",
                  }}
                />
              )}
            </div>
            {message.actions && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 7,
                  marginTop: 8,
                }}
              >
                {message.actions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => onAction(action.action)}
                    style={quickReplyStyle}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function PhoneStatus() {
  return (
    <div
      style={{
        height: 42,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 22px",
        background: "#f7f1ea",
        color: "#111827",
        fontWeight: 800,
      }}
    >
      <span>13:22</span>
      <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <i className="fas fa-signal" aria-hidden="true" />
        <i className="fas fa-wifi" aria-hidden="true" />
        <span
          style={{
            background: "#111827",
            color: "#fff",
            borderRadius: 7,
            padding: "1px 6px",
            fontSize: 12,
          }}
        >
          69
        </span>
      </span>
    </div>
  );
}

function WhatsappComposer({ onPlus }: { onPlus: () => void }) {
  return (
    <div
      style={{
        padding: "10px 12px 14px",
        background: "#f7f1ea",
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
        gap: 8,
      }}
    >
      <button type="button" onClick={onPlus} style={roundIconButtonStyle} aria-label="Mais">
        <i className="fas fa-plus" aria-hidden="true" />
      </button>
      <div
        style={{
          flex: 1,
          height: 42,
          background: "#fff",
          borderRadius: 999,
          border: "1px solid #d1d5db",
          display: "flex",
          alignItems: "center",
          padding: "0 14px",
          color: "#9ca3af",
        }}
      >
        Mensagem
      </div>
      <button type="button" style={roundIconButtonStyle} aria-label="Áudio">
        <i className="fas fa-microphone" aria-hidden="true" />
      </button>
    </div>
  );
}

function WhatsappMoreSheet({ loading, onLocation }: { loading: boolean; onLocation: () => void }) {
  const items = [
    ["fa-images", "Fotos", "#1683ff"],
    ["fa-camera", "Câmera", "#374151"],
    ["fa-map-marker-alt", "Localização", "#13c7a5"],
    ["fa-user-circle", "Contato", "#6b7280"],
    ["fa-file", "Documento", "#008bd2"],
    ["fa-poll", "Enquete", "#f6b73c"],
    ["fa-calendar-alt", "Evento", "#e40046"],
    ["fa-money-bill-wave", "Pix", "#00a79d"],
  ];
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        background: "#e5e7eb",
        borderRadius: "28px 28px 0 0",
        padding: "22px 18px 28px",
        boxShadow: "0 -16px 40px rgba(15,23,42,0.2)",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px 14px" }}>
        {items.map(([icon, label, color]) => (
          <button
            key={label}
            type="button"
            disabled={loading}
            onClick={label === "Localização" ? onLocation : undefined}
            style={{
              border: 0,
              background: "transparent",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              color: "#111827",
            }}
          >
            <span
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <i
                className={`fas ${loading && label === "Localização" ? "fa-spinner fa-spin" : icon}`}
                style={{ color, fontSize: 24 }}
                aria-hidden="true"
              />
            </span>
            <span style={{ fontSize: 13 }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function CpfComposer(props: {
  cpfDraft: string;
  checkingCpf: boolean;
  onCpfChange: (cpf: string) => void;
  onCpfSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      onSubmit={props.onCpfSubmit}
      style={{
        padding: "12px 14px",
        borderTop: "1px solid #edf0f3",
        background: "#fff",
        display: "flex",
        flexShrink: 0,
        gap: 8,
      }}
    >
      <input
        value={props.cpfDraft}
        onChange={(event) => props.onCpfChange(event.target.value)}
        placeholder="Digite seu CPF"
        style={{
          flex: 1,
          minWidth: 0,
          border: "1px solid #d1d5db",
          borderRadius: 999,
          height: 40,
          padding: "0 14px",
          fontSize: 14,
        }}
      />
      <button
        type="submit"
        disabled={props.checkingCpf}
        style={{ ...chatActionButtonStyle, height: 40 }}
      >
        <i
          className={`fas ${props.checkingCpf ? "fa-spinner fa-spin" : "fa-paper-plane"}`}
          aria-hidden="true"
        />
      </button>
    </form>
  );
}

function CarComposer(props: {
  carDraft: string;
  checkingCar: boolean;
  onCarChange: (codigo: string) => void;
  onCarSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      onSubmit={props.onCarSubmit}
      style={{
        padding: "12px 14px",
        borderTop: "1px solid #edf0f3",
        background: "#fff",
        display: "flex",
        flexShrink: 0,
        gap: 8,
      }}
    >
      <input
        value={props.carDraft}
        onChange={(event) => props.onCarChange(event.target.value)}
        placeholder="Digite o número do CAR"
        style={{
          flex: 1,
          minWidth: 0,
          border: "1px solid #d1d5db",
          borderRadius: 999,
          height: 40,
          padding: "0 14px",
          fontSize: 13,
        }}
      />
      <button
        type="submit"
        disabled={props.checkingCar}
        style={{ ...chatActionButtonStyle, height: 40 }}
      >
        <i
          className={`fas ${props.checkingCar ? "fa-spinner fa-spin" : "fa-paper-plane"}`}
          aria-hidden="true"
        />
      </button>
    </form>
  );
}

function ConsolePanel({ logs }: { logs: ConsoleLog[] }) {
  return (
    <aside
      style={{
        background: "#0f172a",
        color: "#dbeafe",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 24px 70px rgba(15,23,42,0.22)",
        position: "sticky",
        top: 94,
      }}
    >
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <i className="fas fa-terminal" style={{ color: "#93c5fd" }} aria-hidden="true" />
        <strong>Console de bastidores</strong>
      </div>
      <div style={{ maxHeight: 720, overflow: "auto", padding: 14 }}>
        {logs.length === 0 ? (
          <p style={{ color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>
            Clique em localização ou consulte CPF para ver requisições, payloads e respostas.
          </p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              style={{
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12,
                padding: 12,
                marginBottom: 12,
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <strong style={{ color: "#fff" }}>{log.title}</strong>
                <code style={{ color: "#86efac" }}>{log.method}</code>
              </div>
              <p style={{ color: "#cbd5e1", margin: "6px 0 10px", fontSize: 13 }}>{log.detail}</p>
              <pre style={consolePreStyle}>
                {JSON.stringify({ payload: log.payload, response: log.response }, null, 2)}
              </pre>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

function cpfResultMessage(d: DiagnosticoResult) {
  if (!d.encontrado || !d.sicar) {
    return {
      text: "Não encontrei CAR demonstrativo para esse CPF. Você pode tentar outro CPF de teste ou iniciar um novo cadastro.",
      actions: [{ label: "Criar/registrar CAR", action: "create" as const }],
    };
  }

  const pendencias = d.sicar.pendencias.length
    ? ` Pendências: ${d.sicar.pendencias.join("; ")}.`
    : "";
  return {
    text: `Encontrei ${d.sicar.nome_imovel}, CAR ${d.sicar.codigo_car}. Status: ${d.sicar.status}. Risco: ${d.nivel_risco}.${pendencias}`,
    actions: [{ label: "Criar/registrar CAR", action: "create" as const }],
  };
}

function locationResultMessage(data: unknown) {
  if (!isObject(data)) return "Recebi uma resposta inesperada da API de localização.";
  const municipio = isObject(data.municipio_localizacao) ? data.municipio_localizacao : null;
  const sicar = isObject(data.consulta_publica_sicar) ? data.consulta_publica_sicar : null;
  const nome = typeof municipio?.nome === "string" ? municipio.nome : "região identificada";
  const uf = typeof municipio?.uf === "string" ? municipio.uf : "";
  const moduloFiscal = typeof sicar?.moduloFiscal === "number" ? sicar.moduloFiscal : null;
  return moduloFiscal
    ? `Localização recebida. Identifiquei ${nome}/${uf} e consultei o SICAR público: módulo fiscal ${moduloFiscal}.`
    : `Localização recebida. Identifiquei ${nome}/${uf}, mas a consulta pública do SICAR não retornou módulo fiscal.`;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

const eyebrowStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  color: "#168821",
  background: "#e8f5e9",
  borderRadius: 999,
  padding: "6px 12px",
  fontSize: 13,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
} as const;

function modeButtonStyle(active: boolean) {
  return {
    border: active ? "1px solid #168821" : "1px solid #d1d5db",
    background: active ? "#168821" : "#fff",
    color: active ? "#fff" : "#374151",
    borderRadius: 999,
    padding: "10px 14px",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontWeight: 800,
  } as const;
}

const secondaryButtonStyle = {
  border: "1px solid #d1d5db",
  background: "#fff",
  color: "#374151",
  borderRadius: 999,
  padding: "10px 14px",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 800,
} as const;

const linkButtonStyle = {
  textDecoration: "none",
  border: "1px solid #d1d5db",
  background: "#fff",
  color: "#374151",
  borderRadius: 999,
  padding: "8px 12px",
  fontWeight: 800,
  fontSize: 13,
} as const;

function bubbleStyle(from: Message["from"]) {
  return {
    background: from === "user" ? "#d9fdd3" : "#fff",
    color: "#111827",
    borderRadius: from === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
    padding: "10px 12px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
  } as const;
}

const quickReplyStyle = {
  border: "1px solid #cfe3ff",
  background: "#fff",
  color: "#0b57d0",
  borderRadius: 999,
  padding: "8px 12px",
  fontSize: 13,
  fontWeight: 700,
  textAlign: "left",
} as const;

const chatActionButtonStyle = {
  border: 0,
  background: "#168821",
  color: "#fff",
  borderRadius: 999,
  padding: "9px 13px",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 800,
} as const;

const roundIconButtonStyle = {
  width: 40,
  height: 40,
  borderRadius: "50%",
  border: 0,
  background: "#fff",
  color: "#374151",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 16,
} as const;

const consolePreStyle = {
  margin: 0,
  background: "rgba(0,0,0,0.24)",
  color: "#bfdbfe",
  borderRadius: 10,
  padding: 10,
  fontSize: 11,
  lineHeight: 1.5,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  maxHeight: 260,
  overflow: "auto",
} as const;
