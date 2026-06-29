import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useLayoutEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div
      className="d-flex align-items-center justify-content-center px-4"
      style={{ minHeight: "100vh" }}
    >
      <div className="text-center" style={{ maxWidth: 28 + "rem" }}>
        <h1
          style={{
            fontSize: "4.5rem",
            fontWeight: "bold",
            color: "var(--color-primary-default)",
            lineHeight: 1,
          }}
        >
          404
        </h1>
        <h2 className="mt-3" style={{ color: "var(--color-secondary-09)" }}>
          Página não encontrada
        </h2>
        <p className="mt-2" style={{ color: "var(--color-secondary-07)" }}>
          A página que você procura não existe ou foi movida.
        </p>
        <div className="mt-4">
          <Link to="/" className="br-button primary">
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div
      className="d-flex align-items-center justify-content-center px-4"
      style={{ minHeight: "100vh" }}
    >
      <div className="text-center" style={{ maxWidth: 28 + "rem" }}>
        <h1 style={{ color: "var(--color-secondary-09)" }}>
          Não foi possível carregar esta página
        </h1>
        <p className="mt-2" style={{ color: "var(--color-secondary-07)" }}>
          Algo deu errado do nosso lado. Tente atualizar ou volte ao início.
        </p>
        <div className="mt-4 d-flex flex-wrap justify-content-center" style={{ gap: 8 }}>
          <button
            type="button"
            className="br-button primary"
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Tentar novamente
          </button>
          <a href="/" className="br-button secondary">
            Voltar ao início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CAR Proativo — Cadastro Ambiental Rural" },
      {
        name: "description",
        content:
          "CAR Proativo: diagnóstico e regularização do Cadastro Ambiental Rural de forma simples e acessível.",
      },
      { name: "author", content: "Governo Federal" },
      { name: "theme-color", content: "#1351b4" },
      {
        property: "og:title",
        content: "CAR Proativo — Cadastro Ambiental Rural",
      },
      {
        property: "og:description",
        content:
          "Diagnóstico e regularização do Cadastro Ambiental Rural de forma simples e acessível.",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "stylesheet",
        href: "https://cdngovbr-ds.estaleiro.serpro.gov.br/design-system/fonts/rawline/css/rawline.css",
      },
      {
        rel: "stylesheet",
        href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    import("@govbr-ds/core/dist/core-init.min.js").catch(() => {});

    // VLibras — widget de acessibilidade em Libras (padrão gov.br)
    if (!document.querySelector("[vw]")) {
      const widget = document.createElement("div");
      widget.setAttribute("vw", "");
      widget.className = "enabled";
      widget.innerHTML =
        '<div vw-access-button class="active"></div>' +
        '<div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
      document.body.appendChild(widget);

      const script = document.createElement("script");
      script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
      script.async = true;
      script.onload = () => {
        // @ts-expect-error — global injetado pelo plugin VLibras
        if (window.VLibras) new window.VLibras.Widget("https://vlibras.gov.br/app");
      };
      document.body.appendChild(script);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
