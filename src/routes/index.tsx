import { createFileRoute } from "@tanstack/react-router";
import heroProducer from "@/assets/hero-producer.jpg";
import aerialMosaic from "@/assets/aerial-mosaic.jpg";

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
      { name: "twitter:image", content: heroProducer },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <Problem />
      <Insight />
      <HowItWorks />
      <Partners />
      <Flow />
      <Objections />
      <Pilot />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-sm bg-forest text-cream">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M4 20c0-8 6-14 16-16-2 10-8 16-16 16Z" />
              <path d="M4 20c4-4 8-6 12-7" />
            </svg>
          </span>
          <span className="font-display text-lg tracking-tight text-forest-deep">
            CAR <span className="italic text-ember">Proativo</span>
          </span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#problema" className="hover:text-forest-deep">Problema</a>
          <a href="#funciona" className="hover:text-forest-deep">Como funciona</a>
          <a href="#parceiros" className="hover:text-forest-deep">Parceiros</a>
          <a href="#piloto" className="hover:text-forest-deep">Piloto</a>
        </nav>
        <a
          href="#piloto"
          className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-sm font-medium text-cream transition hover:bg-forest-deep"
        >
          Apresentar piloto
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 pt-16 pb-24 md:grid-cols-12 md:pt-24 md:pb-32">
        <div className="md:col-span-7 md:pr-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-forest/20 bg-forest/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-forest-deep">
            <span className="h-1.5 w-1.5 rounded-full bg-ember" />
            Inovação aberta · SICAR
          </div>
          <h1 className="mt-6 font-display text-5xl leading-[1.02] tracking-tight text-forest-deep md:text-7xl">
            O CAR que vai
            <br />
            <span className="italic text-ember">até você.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Mais de 7 milhões de cadastros. Centenas de milhares irregulares. A maioria dos produtores
            <span className="text-forest-deep"> não sabe que tem um problema</span> — até perder crédito,
            ser bloqueado numa cadeia produtiva ou receber uma autuação.
          </p>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
            O CAR Proativo entrega o diagnóstico certo, para a pessoa certa, no canal certo, na hora certa.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href="#funciona"
              className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-medium text-cream transition hover:bg-forest-deep"
            >
              Ver como funciona
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M6 13l6 6 6-6" />
              </svg>
            </a>
            <a
              href="#problema"
              className="inline-flex items-center gap-2 rounded-full border border-forest/25 px-6 py-3 text-sm font-medium text-forest-deep transition hover:bg-forest/5"
            >
              Entender o problema
            </a>
          </div>

          <dl className="mt-14 grid grid-cols-3 gap-6 border-t border-border pt-8 text-left">
            {[
              { k: "7M+", v: "cadastros no SICAR" },
              { k: "0", v: "novo canal exigido do produtor" },
              { k: "5", v: "telas até a regularização" },
            ].map((s) => (
              <div key={s.k}>
                <dt className="font-display text-4xl text-forest-deep">{s.k}</dt>
                <dd className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative md:col-span-5">
          <div className="relative overflow-hidden rounded-2xl border border-forest/10 shadow-2xl shadow-forest/20">
            <img
              src={heroProducer}
              alt="Produtor rural conferindo o celular ao pôr do sol"
              width={1600}
              height={1200}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-deep/85 via-forest-deep/30 to-transparent p-6">
              <div className="rounded-xl bg-cream/95 p-4 shadow-lg backdrop-blur">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                  <span className="grid h-4 w-4 place-items-center rounded-sm bg-[#25D366] text-white">
                    <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="currentColor"><path d="M20 4A10 10 0 003 17l-1 5 5-1A10 10 0 1020 4Z"/></svg>
                  </span>
                  Cooperativa Vale Verde · agora
                </div>
                <p className="mt-2 text-sm leading-snug text-ink">
                  Olá, Sr. José. O CAR do <span className="font-medium">Sítio Boa Esperança</span> está com
                  documento de posse desatualizado.{" "}
                  <span className="text-ember">Corrija em 5 passos →</span>
                </p>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 hidden h-24 w-24 rounded-2xl bg-ember/90 md:block" />
          <div className="absolute -right-4 -top-4 hidden h-16 w-16 rounded-full border-2 border-forest md:block" />
        </div>
      </div>
    </section>
  );
}

function Problem() {
  return (
    <section id="problema" className="border-y border-border bg-forest-deep text-cream">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="text-xs uppercase tracking-[0.22em] text-sage">O problema que ninguém vê</p>
            <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
              O governo construiu o sistema para <span className="italic text-ember">receber</span> dados.
              Ninguém construiu o sistema para <span className="italic text-ember">devolver</span>.
            </h2>
          </div>
          <div className="space-y-6 md:col-span-7 md:pl-12">
            <p className="text-lg leading-relaxed text-cream/85">
              O produtor rural não vive no SICAR. Ele vive no WhatsApp da cooperativa,
              no aplicativo do banco, na conversa com o técnico agrícola. Esses canais
              já chegam até ele todo mês — e já têm interesse direto em que o CAR esteja regular.
            </p>
            <p className="border-l-2 border-ember pl-6 font-display text-2xl italic text-cream md:text-3xl">
              A solução não é um canal novo. É carregar os canais que já existem com a informação certa.
            </p>
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
      t: "Diagnóstico individual",
      d: "Um motor cruza SICAR, INCRA, MapBiomas e Receita para classificar cada imóvel: regular, pendente, sobreposição, dados desatualizados, cancelado.",
    },
    {
      n: "02",
      t: "API credenciada",
      d: "Bancos, cooperativas, tradings e EMATER consultam por CPF/CNPJ e recebem só o status e a ação recomendada. Sem dados sensíveis trafegando.",
    },
    {
      n: "03",
      t: "Notificação no canal certo",
      d: "O parceiro dispara a mensagem no canal que o produtor já usa — WhatsApp, app do banco, e-mail. Sem novo aplicativo, sem novo login.",
    },
    {
      n: "04",
      t: "Resolução em 5 telas",
      d: "Fluxo guiado mobile-first com OCR de documentos e confirmação de polígono pré-carregado. Casos complexos vão direto para a EMATER.",
    },
  ];
  return (
    <section id="funciona" className="mx-auto max-w-7xl px-6 py-24">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.22em] text-ember">Como funciona</p>
        <h2 className="mt-4 font-display text-4xl leading-tight text-forest-deep md:text-6xl">
          Uma camada de inteligência sobre o SICAR. Não uma base paralela.
        </h2>
      </div>
      <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2">
        {points.map((p) => (
          <div key={p.n} className="bg-card p-8 md:p-10">
            <div className="flex items-baseline gap-4">
              <span className="font-display text-3xl text-sage">{p.n}</span>
              <h3 className="font-display text-2xl text-forest-deep">{p.t}</h3>
            </div>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">{p.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-secondary">
      <img
        src={aerialMosaic}
        alt="Vista aérea de mosaico de propriedades rurais"
        width={1600}
        height={1000}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-secondary via-secondary/85 to-secondary" />
      <div className="relative mx-auto max-w-7xl px-6 py-24">
        <p className="text-xs uppercase tracking-[0.22em] text-forest-deep">Arquitetura do fluxo</p>
        <h2 className="mt-4 max-w-3xl font-display text-4xl leading-tight text-forest-deep md:text-5xl">
          Do dado parado no SICAR à ação concluída no celular do produtor.
        </h2>

        <ol className="mt-16 space-y-4">
          {[
            { k: "SICAR", v: "Base oficial existente, com 7M+ cadastros." },
            { k: "Motor de diagnóstico", v: "Classifica situação por imóvel e gera ação recomendada em linguagem simples." },
            { k: "API de diagnóstico", v: "REST pública, credenciada via convênio com o MMA. Retorna status + ação por CPF/CNPJ." },
            { k: "Parceiros", v: "Bancos, cooperativas, tradings, EMATER, secretarias estaduais." },
            { k: "Canal do produtor", v: "WhatsApp, app do banco, e-mail — nenhum app novo para instalar." },
            { k: "Fluxo de resolução", v: "5 telas, OCR de documento, confirmação de polígono." },
            { k: "Retorno ao SICAR", v: "Dados corrigidos voltam direto via módulo oficial de retificação." },
          ].map((row, i, arr) => (
            <li
              key={row.k}
              className="group relative grid grid-cols-12 items-center gap-4 rounded-xl border border-forest/10 bg-cream/80 px-6 py-5 backdrop-blur transition hover:border-forest/30 hover:bg-cream"
            >
              <span className="col-span-1 font-display text-xl text-sage">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="col-span-4 font-display text-lg text-forest-deep md:col-span-3">
                {row.k}
              </span>
              <span className="col-span-7 text-sm text-muted-foreground md:col-span-8">
                {row.v}
              </span>
              {i < arr.length - 1 && (
                <span className="absolute -bottom-3 left-10 hidden h-3 w-px bg-forest/25 md:block" />
              )}
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
      t: "Bancos e cooperativas",
      ex: "BB · Sicredi · Sicoob · Cresol",
      why: "CAR regular é pré-requisito para Pronaf e crédito rural. Se o cliente está irregular, o crédito não sai. Interesse direto em regularizar.",
    },
    {
      tag: "Cadeia produtiva",
      t: "Tradings e frigoríficos",
      ex: "Cargill · JBS · Marfrig · SLC",
      why: "Compromissos ESG e rastreabilidade exigem CAR regular do fornecedor. Já constroem isso internamente — a API entrega pronto.",
    },
    {
      tag: "Extensão rural",
      t: "EMATER e estados",
      ex: "EMATER · secretarias estaduais",
      why: "Já visitam o produtor e já são o elo de confiança no campo. A API entrega uma lista de quem precisa de ajuda antes da visita.",
    },
    {
      tag: "Backlog",
      t: "Secretarias de meio ambiente",
      ex: "Análise estadual do CAR",
      why: "Quanto mais CARs chegam completos e corretos, menor o backlog. Interesse direto na qualidade do dado de entrada.",
    },
  ];
  return (
    <section id="parceiros" className="mx-auto max-w-7xl px-6 py-24">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="text-xs uppercase tracking-[0.22em] text-ember">Parceiros</p>
          <h2 className="mt-4 font-display text-4xl leading-tight text-forest-deep md:text-5xl">
            Quem distribui o diagnóstico — e por que topa.
          </h2>
          <p className="mt-6 text-muted-foreground">
            O governo não precisa disparar 7 milhões de mensagens. Cada parceiro absorve o volume do
            próprio relacionamento. A carga é distribuída naturalmente, a custo marginal próximo de zero.
          </p>
        </div>
        <div className="grid gap-4 md:col-span-7 md:grid-cols-2">
          {cards.map((c) => (
            <article
              key={c.t}
              className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition hover:border-forest/40 hover:shadow-lg hover:shadow-forest/5"
            >
              <span className="text-[10px] uppercase tracking-[0.22em] text-ember">{c.tag}</span>
              <h3 className="mt-3 font-display text-xl text-forest-deep">{c.t}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{c.ex}</p>
              <p className="mt-4 text-sm leading-relaxed text-foreground/80">{c.why}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Flow() {
  const screens = [
    { n: 1, t: "Diagnóstico", d: "Seu CAR do Sítio Boa Esperança está com o documento de posse desatualizado. Vamos corrigir?" },
    { n: 2, t: "Foto do documento", d: "O produtor tira foto pelo celular. OCR pré-preenche os dados automaticamente." },
    { n: 3, t: "Confirmação", d: "Revisão dos dados extraídos. Um toque para confirmar." },
    { n: 4, t: "Polígono no mapa", d: "Limite do imóvel pré-carregado do INCRA. Confirmar ou arrastar um ponto." },
    { n: 5, t: "Pronto", d: "CAR atualizado. Confirmação oficial em até 48 horas." },
  ];
  return (
    <section className="bg-forest-deep py-24 text-cream">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between gap-8">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-sage">Fluxo de resolução</p>
            <h2 className="mt-4 max-w-2xl font-display text-4xl leading-tight md:text-5xl">
              5 telas. Uma ação por tela. Funciona no celular, sem instalar nada.
            </h2>
          </div>
          <span className="hidden font-display text-sm italic text-sage md:block">→ deslize</span>
        </div>

        <div className="mt-12 flex gap-5 overflow-x-auto pb-6 [scrollbar-color:theme(colors.sage)_transparent]">
          {screens.map((s) => (
            <div
              key={s.n}
              className="flex w-72 shrink-0 flex-col rounded-2xl border border-cream/15 bg-cream/[0.04] p-6 backdrop-blur"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-4xl text-sage">0{s.n}</span>
                <span className="h-2 w-2 rounded-full bg-ember" />
              </div>
              <h3 className="mt-8 font-display text-xl text-cream">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cream/75">{s.d}</p>
            </div>
          ))}
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
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="text-xs uppercase tracking-[0.22em] text-ember">As perguntas difíceis</p>
          <h2 className="mt-4 font-display text-4xl leading-tight text-forest-deep md:text-5xl">
            As que o júri sempre faz.
          </h2>
          <p className="mt-6 text-muted-foreground">Respostas curtas, prontas para defesa.</p>
        </div>
        <div className="md:col-span-8">
          <ul className="divide-y divide-border border-y border-border">
            {qa.map((item) => (
              <li key={item.q} className="group grid gap-3 py-6 md:grid-cols-12 md:gap-8">
                <p className="font-display text-lg text-forest-deep md:col-span-5">{item.q}</p>
                <p className="text-sm leading-relaxed text-muted-foreground md:col-span-7">{item.a}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Pilot() {
  return (
    <section id="piloto" className="px-6 pb-24">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-ember text-cream">
        <div className="grid gap-10 p-10 md:grid-cols-12 md:p-16">
          <div className="md:col-span-7">
            <p className="text-xs uppercase tracking-[0.22em] text-cream/80">Piloto sugerido</p>
            <h2 className="mt-4 font-display text-4xl leading-tight md:text-6xl">
              Mato Grosso. 1 cooperativa. 100 produtores. 30 dias.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/90">
              Maior volume de CARs do país, rede densa de cooperativas e tradings. Mede-se abertura,
              conclusão do fluxo e CARs atualizados. O resultado vira o argumento de escala.
            </p>
          </div>
          <div className="md:col-span-5">
            <div className="grid grid-cols-3 gap-4 text-cream/95">
              {[
                { k: "100", v: "produtores" },
                { k: "30d", v: "para medir impacto" },
                { k: "1", v: "cooperativa parceira" },
              ].map((s) => (
                <div key={s.k} className="rounded-2xl border border-cream/20 p-4">
                  <div className="font-display text-3xl">{s.k}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-widest text-cream/70">{s.v}</div>
                </div>
              ))}
            </div>
            <a
              href="mailto:contato@carproativo.gov.br"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-cream px-6 py-3 text-sm font-medium text-ember transition hover:bg-cream/90"
            >
              Conversar sobre o piloto
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-display text-xl text-forest-deep">
            CAR <span className="italic text-ember">Proativo</span>
          </div>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            O CAR que vai até você
          </p>
        </div>
        <p className="max-w-md text-sm text-muted-foreground">
          Proposta de bem público digital. Camada sobre o SICAR — não substitui, amplifica.
        </p>
      </div>
    </footer>
  );
}
