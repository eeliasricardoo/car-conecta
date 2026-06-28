import { createFileRoute } from "@tanstack/react-router";
import { DemoPage } from "@/components/car-assistente";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Demo — CAR Proativo" },
      {
        name: "description",
        content:
          "Simulação premium do CAR Proativo em WhatsApp e embed web, com consulta por CPF e localização.",
      },
    ],
  }),
  component: DemoPage,
});
