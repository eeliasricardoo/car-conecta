import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { consultarCarPorLocalizacaoWhatsapp } from "./lib/services/localizacao-car";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

const API_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "content-type,authorization",
  "content-type": "application/json; charset=utf-8",
};

function jsonResponse(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data, null, 2), {
    ...init,
    headers: {
      ...API_HEADERS,
      ...init?.headers,
    },
  });
}

function isLocationApiPath(pathname: string) {
  return pathname === "/api/localizacao/car" || pathname === "/api/whatsapp/localizacao";
}

async function handleLocationApi(request: Request) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: API_HEADERS });
  }

  const url = new URL(request.url);
  let payload: unknown;

  if (request.method === "GET") {
    payload = {
      latitude: url.searchParams.get("latitude") ?? url.searchParams.get("lat"),
      longitude: url.searchParams.get("longitude") ?? url.searchParams.get("lng"),
      name: url.searchParams.get("name") ?? undefined,
      address: url.searchParams.get("address") ?? undefined,
    };
  } else if (request.method === "POST") {
    try {
      payload = await request.json();
    } catch {
      return jsonResponse(
        {
          ok: false,
          mensagem: "Corpo da requisição deve ser JSON válido.",
        },
        { status: 400 },
      );
    }
  } else {
    return jsonResponse(
      {
        ok: false,
        mensagem: "Método não suportado. Use GET para teste ou POST para payload do WhatsApp.",
      },
      { status: 405 },
    );
  }

  try {
    const result = await consultarCarPorLocalizacaoWhatsapp(payload);
    return jsonResponse(result, { status: result.ok ? 200 : 422 });
  } catch (error) {
    console.error(error);
    return jsonResponse(
      {
        ok: false,
        mensagem: "Falha ao consultar a região da localização enviada.",
      },
      { status: 502 },
    );
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (isLocationApiPath(url.pathname)) {
        return await handleLocationApi(request);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
