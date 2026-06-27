# CAR Conecta — haCARthon 2026

Aplicação web desenvolvida para o **haCARthon** (hackathon do Cadastro Ambiental Rural), demonstrando o conceito de **CAR Proativo**: um motor de diagnóstico que cruza fontes de dados públicas para identificar pendências no CAR de produtores rurais e guiá-los na regularização.

---

## Sumário

- [Visão geral da solução](#visão-geral-da-solução)
- [Como rodar](#como-rodar)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Arquitetura técnica](#arquitetura-técnica)
- [Camada de serviços e integração de APIs](#camada-de-serviços-e-integração-de-apis)
- [Motor de diagnóstico](#motor-de-diagnóstico)
- [Página de demonstração (`/piloto`)](#página-de-demonstração-piloto)
- [Design system](#design-system)
- [Ambiente de testes SICAR](#ambiente-de-testes-sicar)
- [Próximos passos](#próximos-passos)

---

## Visão geral da solução

O CAR Proativo resolve um problema crítico: **produtores rurais que possuem pendências no CAR não recebem orientação proativa sobre como regularizá-las**. O resultado é que irregularidades permanecem anos sem resolução, bloqueando acesso a crédito rural, seguros e mercados exportadores.

A solução funciona em três etapas:

```
CPF do produtor
      │
      ▼
┌─────────────────────────┐
│  Motor de Diagnóstico   │  ← validação CPF + consulta SICAR + enriquecimento município
└────────────┬────────────┘
             │ DiagnosticoResult
             ▼
┌─────────────────────────┐
│   Cruzamento de Fontes  │  ← SICAR · INCRA/SIGEF · MapBiomas · Receita Federal
└────────────┬────────────┘
             │ nível de risco + ação recomendada
             ▼
┌─────────────────────────┐
│   Fluxo de Resolução    │  ← notificação WhatsApp/app + passo a passo guiado
└─────────────────────────┘
```

---

## Como rodar

**Requisito:** Node.js 20.19+ ou 22.12+. O projeto usa Vite 8 que não suporta versões anteriores.

```bash
# Usar nvm para garantir versão correta
nvm use 22

# Instalar dependências
npm install

# Servidor de desenvolvimento
npm run dev
# → http://localhost:8080  (ou 8081 se a porta estiver ocupada)

# Build de produção
npm run build

# Preview do build
npm run preview
```

---

## Estrutura do projeto

```
src/
├── routes/                     # Roteamento file-based (TanStack Router)
│   ├── __root.tsx              # Shell global (QueryClientProvider, meta tags)
│   ├── index.tsx               # Página principal — pitch da solução
│   └── piloto.tsx              # Demonstração interativa — /piloto
│
├── lib/
│   └── services/
│       ├── sicar.ts            # Integração SICAR (públicos + dados demo)
│       ├── ibge.ts             # Integração IBGE API (municípios)
│       ├── diagnostico-engine.ts   # Motor de diagnóstico — lógica pura
│       └── diagnostico-server.ts   # createServerFn — expõe o motor ao browser
│
├── hooks/
│   └── use-diagnostico.ts      # Hook React Query para consultar o motor
│
├── styles.css                  # Design system govbr-ds + classes customizadas
└── assets/                     # Imagens e logos
```

---

## Arquitetura técnica

### Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | [TanStack Start](https://tanstack.com/start) — SSR com Vite |
| Roteamento | [TanStack Router](https://tanstack.com/router) — file-based |
| Data fetching | [TanStack Query](https://tanstack.com/query) (React Query v5) |
| Design system | [@govbr-ds/core](https://www.npmjs.com/package/@govbr-ds/core) — padrão Gov.br |
| Linguagem | TypeScript 5 |
| Build | Vite 8 |

### Padrão `createServerFn`

O motor de diagnóstico roda **no servidor** via `createServerFn` do TanStack Start. Isso garante que:

- Credenciais de APIs parceiras nunca chegam ao browser
- O CPF é validado no servidor antes de qualquer consulta
- A resposta é tipada de ponta a ponta (TypeScript)

```typescript
// src/lib/services/diagnostico-server.ts
export const consultarDiagnostico = createServerFn({ method: "GET" })
  .validator((cpf: string) => { /* valida CPF */ return digits; })
  .handler(async ({ data: cpf }) => gerarDiagnostico(cpf));
```

O hook no browser chama a server function como se fosse uma função local:

```typescript
// src/hooks/use-diagnostico.ts
export function useDiagnostico(cpf: string | null) {
  return useQuery<DiagnosticoResult>({
    queryKey: ["diagnostico", cpf],
    enabled: !!cpf && cpf.replace(/\D/g, "").length === 11,
    queryFn: () => consultarDiagnostico({ data: cpf! }),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
```

### Roteamento

O TanStack Router usa convenção de arquivos. **Não usar** padrões Next.js (`pages/`, `app/layout.tsx`):

| Arquivo | Rota |
|---------|------|
| `src/routes/index.tsx` | `/` |
| `src/routes/piloto.tsx` | `/piloto` |
| `src/routes/__root.tsx` | layout global (wraps tudo) |

`src/routeTree.gen.ts` é gerado automaticamente — não editar.

---

## Camada de serviços e integração de APIs

### `src/lib/services/sicar.ts`

Gerencia todas as interações com o ecossistema SICAR.

**Endpoints públicos (sem autenticação) — ambiente de testes `car-sus.dataprev.gov.br`:**

| Endpoint | Descrição | Status |
|----------|-----------|--------|
| `GET /estados/all` | Lista todos os 27 estados com código IBGE e área | ✅ Live |
| `GET /municipios/byCodigoIbge/{codigoIbge}` | Dados do município por código IBGE | ✅ Live |

**Endpoints autenticados (requerem sessão Gov.br OAuth):**

| Endpoint | Descrição | Status |
|----------|-----------|--------|
| `GET /imovel/{codigo}/{completo}` | Dados do imóvel por código CAR | 🔒 Requer auth |
| `POST /imovel/byFiltros` | Busca de imóveis por CPF/município | 🔒 Requer auth |
| `GET /municipios/{codigoUF}` | Municípios de uma UF | 🔒 Requer auth |

**Autenticação:** O SICAR usa OAuth via Gov.br — não há login direto por usuário/senha na API. Para integração server-side autenticada, é necessário obter o `SICARCOOKIE_SESSION` via fluxo OAuth ou convênio institucional.

**Tipos principais:**

```typescript
type SicarStatus = "regular" | "pendente" | "sobreposicao" | "cancelado" | "nao_encontrado";

type SicarRecord = {
  codigo_car: string;           // ex: "MT-5107925-D5F9B3C2A7E1"
  status: SicarStatus;
  nome_imovel: string;
  area_ha: number;
  codigo_ibge_municipio: string;
  nome_municipio: string;
  uf: string;
  data_inscricao: string;       // ISO date
  data_ultima_atualizacao: string;
  pendencias: string[];
  codigos_sncr: string[];       // códigos no Sistema Nacional de Cadastro Rural
  dado_real: boolean;           // false = dado de demonstração
};
```

**CPFs do ambiente de testes haCARthon:**

| CPF | Data de nascimento | Imóveis (SNCR) | Status demo |
|-----|--------------------|----------------|-------------|
| `107.282.101-00` | 12/12/2002 | `9130730239223`, `9130730254613` | pendente |
| `287.016.154-91` | 01/01/1980 | `2420200634280`, `2480450028362`, `9500339031245`, `9500339031326`, `9501737335390` | sobreposição |

Senha para acesso ao módulo pré-preenchido: `!Carteira6`  
URL: `https://car-sus.dataprev.gov.br/#/baixar`

**Para plugar autenticação real:**

```typescript
// sicar.ts — descomente e preencha a variável de ambiente
const session = process.env.SICAR_SESSION_COOKIE;
if (session) {
  const res = await fetch(`${SICAR_TEST_BASE}/imovel/byFiltros?cpf=${digits}`, {
    headers: { Cookie: `SICARCOOKIE_SESSION=${session}` },
  });
  // ...
}
```

---

### `src/lib/services/ibge.ts`

Integração com APIs públicas de localidade.

**Funções:**

```typescript
// Busca município por código IBGE — via API IBGE pública
getMunicipioByIbge(codigoIbge: string): Promise<MunicipioInfo | null>

// Lista municípios de uma UF — via BrasilAPI
getMunicipiosByUF(uf: string): Promise<{ nome: string; codigo_ibge: string }[]>

// Busca por nome com normalização de acentos
searchMunicipio(query: string, uf?: string): Promise<MunicipioInfo[]>
```

> **Nota:** O enriquecimento de município no motor de diagnóstico usa o endpoint público do SICAR (`/municipios/byCodigoIbge/{id}`) por ser mais específico ao domínio CAR. O `ibge.ts` fica disponível para uso direto quando necessário.

---

### `src/lib/services/diagnostico-engine.ts`

Motor de diagnóstico puro (sem dependências de framework). Pode ser testado isoladamente.

**Fluxo de execução de `gerarDiagnostico(cpf)`:**

```
1. fetchSicarByCpf(cpf)
   └── retorna SicarRecord | null

2. fetchMunicipioByCodigo(sicar.codigo_ibge_municipio)
   └── chama GET /municipios/byCodigoIbge/{id} no SICAR (público)
   └── retorna SicarMunicipio | null

3. calcularRisco(sicar)
   └── regular → "nenhum"
   └── pendente → "medio"
   └── sobreposicao | cancelado → "alto"

4. acaoRecomendada(sicar)
   └── mapeia status → string de ação

5. buildFontes(sicar)
   └── monta array FonteCruzada[] com flag dado_real por fonte

6. retorna DiagnosticoResult
```

**Tipo de retorno completo:**

```typescript
type DiagnosticoResult = {
  cpf: string;
  encontrado: boolean;
  sicar: SicarRecord | null;
  municipio: MunicipioInfo | null;
  fontes: FonteCruzada[];        // SICAR · INCRA/SIGEF · MapBiomas · Receita · SICAR Municípios
  nivel_risco: RiskLevel;        // "nenhum" | "baixo" | "medio" | "alto"
  acao_recomendada: string | null;
  link_resolucao: string | null;
  gerado_em: string;             // ISO datetime
};
```

**Validação de CPF:**

O motor implementa o algoritmo oficial brasileiro de dois dígitos verificadores:

```typescript
export function validarCPF(cpf: string): boolean {
  // 1. Remove formatação, verifica 11 dígitos, rejeita sequências iguais (111...111)
  // 2. Calcula 1º dígito: soma ponderada dos 9 primeiros × (10..2), mod 11
  // 3. Calcula 2º dígito: soma ponderada dos 10 primeiros × (11..2), mod 11
  // 4. Compara com os dígitos informados
}
```

---

## Página de demonstração (`/piloto`)

Acessada via botão **"Apresentar piloto"** na navegação principal. Contém três abas:

### Aba 01 · Motor de Diagnóstico

Campo de CPF com busca em tempo real. O resultado mostra:
- Status do imóvel no SICAR (regular / pendente / sobreposição / cancelado)
- Pendências específicas
- Município e UF enriquecidos via API pública
- Fontes cruzadas com indicador `· real` ou `· demo` por fonte
- Nível de risco calculado
- Ação recomendada

**CPFs de demonstração disponíveis na UI** (botões de atalho):
- `107.282.101-00` — status pendente (CPF real do ambiente haCARthon)
- `287.016.154-91` — status sobreposição (CPF real do ambiente haCARthon)
- `111.222.333-96` — status regular (dados exemplo)

### Aba 02 · API de Diagnóstico

Mostra a chamada e resposta JSON do motor, ilustrando como a API seria consumida por sistemas externos (bancos, cooperativas, extensão rural).

### Aba 03 · Fluxo de Resolução

Mockup interativo de 5 telas simulando o aplicativo mobile que guia o produtor na resolução das pendências identificadas.

---

## Design system

O projeto usa `@govbr-ds/core` — padrão visual Gov.br. Classes de seção definidas em `src/styles.css`:

| Classe | Uso | Cor de fundo |
|--------|-----|--------------|
| `.section-dark` | Hero, headers de seção | `--color-primary-darken-02` (azul escuro) |
| `.section-light` | Seções de conteúdo alternado | `--color-primary-pastel-02` (azul muito claro) |
| `.section-accent` | CTAs, destaques | `--warning` / `#ffcd07` (amarelo Gov.br) |

**Classes utilitárias customizadas:**

| Classe | Uso |
|--------|-----|
| `.section-label` | Eyebrow label acima de títulos (texto pequeno uppercase) |
| `.pilot-stat` / `.pilot-stat-num` / `.pilot-stat-label` | Cards de estatística |
| `.flow-card` | Cards do fluxo de resolução |
| `.flow-scroll` | Container de scroll horizontal do fluxo |
| `.br-card` | Card padrão govbr-ds |

**Variáveis CSS relevantes:**

```css
--color-primary-default       /* azul Gov.br */
--color-primary-darken-02     /* azul escuro (usado em .section-dark) */
--color-primary-pastel-02     /* azul claríssimo (usado em .section-light) */
--warning                     /* amarelo #ffcd07 */
--pure-0                      /* branco */
```

**Ícones:** Font Awesome 5 Free (carregado via CDN em `__root.tsx`).

---

## Ambiente de testes SICAR

O ambiente de testes do SICAR (`car-sus.dataprev.gov.br`) fica disponível de **26/06/2026 a 28/06/2026** para o haCARthon.

### Módulo de Cadastro Pré-Preenchido

URL: `https://car-sus.dataprev.gov.br/#/baixar`

| CPF | Senha | Data de nascimento |
|-----|-------|--------------------|
| `10728210100` | `!Carteira6` | 12/12/2002 |
| `28701615491` | `!Carteira6` | 01/01/1980 |

### Módulo Offline — Códigos SNCR necessários

Para o módulo de cadastro offline, informar pelo menos um código SNCR:

**CPF 10728210100:**
- `9130730239223`
- `9130730254613`

**CPF 28701615491:**
- `2420200634280`
- `2480450028362`
- `9500339031245`
- `9500339031326`
- `9501737335390`

Envio: `https://car-sus.dataprev.gov.br/#/enviar` (usar apenas o ambiente de testes, nunca produção)

### Central do Proprietário/Possuidor

URL: `https://car-sus.dataprev.gov.br/#/central/acesso`

### APIs públicas confirmadas (sem autenticação)

Testadas e funcionando durante o haCARthon:

```bash
# Estados
curl https://car-sus.dataprev.gov.br/estados/all

# Município por código IBGE
curl https://car-sus.dataprev.gov.br/municipios/byCodigoIbge/5107925
# Retorna: { dados: { id, nome, estado: { id, nome }, moduloFiscal, area } }
```

---

## Próximos passos

### Integrações pendentes de credencial

| Fonte | O que desbloqueia | Como obter |
|-------|------------------|------------|
| **SICAR (imóveis por CPF)** | Consulta real de imóveis do produtor | Autenticação Gov.br OAuth ou convênio MMA |
| **INCRA / SIGEF** | Cruzamento de polígono fundiário via WFS | Credencial INCRA |
| **MapBiomas** | Análise de uso do solo e desmatamento | Token de API MapBiomas |
| **Receita Federal** | Consulta de titularidade por CPF | Convênio RFB |

### Evolução do produto

- Integração com WhatsApp Business API para notificações proativas
- Módulo de assinatura digital de documentos (Gov.br Login)
- Dashboard para órgãos estaduais (OEMAs) acompanharem regularizações
- API REST pública para integração com sistemas de crédito rural (Banco do Brasil, BNDES)
- Suporte a CNPJ para pessoas jurídicas rurais
