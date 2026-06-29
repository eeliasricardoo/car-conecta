import { createFileRoute } from "@tanstack/react-router";
import { AssistentePage } from "./assistente";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CAR Proativo — Assistente" },
      {
        name: "description",
        content:
          "Escolha seu perfil para acessar o CAR Proativo como agricultor ou parceiro credenciado.",
      },
      { property: "og:title", content: "CAR Proativo — Assistente" },
      {
        property: "og:description",
        content:
          "Experiência replicável para consulta por localização, CPF, número do CAR, widget e atendimento parceiro.",
      },
    ],
  }),
  component: AssistentePage,
});
