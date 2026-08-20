import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

interface FirstAgent {
  id: string;
  name: string;
}

export function useOnboarding() {
  const navigate = useNavigate();

  const startTour = useCallback((firstAgent: FirstAgent) => {
    const driverObj = driver({
      animate: true,
      overlayOpacity: 0.75,
      stagePadding: 12,
      allowClose: false,

      disableActiveInteraction: true,
      nextBtnText: "Próximo →",
      prevBtnText: "← Voltar",
      doneBtnText: "Começar! 🌿",
      onDestroyed: async () => {
        await marcarConcluido();
        navigate(`/chat/${firstAgent.id}`);
      },
      steps: [
        {
          element: "#trilha-agentes",
          popover: {
            title: "👋 Bem-vinda ao Prospera!",
            description:
              "Aqui está a sua trilha. Cada especialista cuida de uma parte do seu negócio: marca, conteúdo, vendas, finanças e muito mais.",
            side: "right" as const,
            align: "start" as const,
          },
        },
        {
          element: `#agente-${firstAgent.id}`,
          popover: {
            title: `🌸 Comece pela ${firstAgent.name}`,
            description: `A ${firstAgent.name} é sua porta de entrada nesta trilha. Ela vai te conhecer, entender onde você está agora e abrir o caminho para as próximas especialistas.`,
            side: "right" as const,
            align: "start" as const,
          },
        },
        {
          element: "#sidebar-projetos",
          popover: {
            title: "📁 Seus projetos",
            description:
              "Tudo que você construir fica salvo aqui. Pode ter um projeto para cada negócio ou ideia, e as especialistas lembram de tudo.",
            side: "right" as const,
            align: "start" as const,
          },
        },
        {
          element: `#btn-conversar-${firstAgent.id}`,
          popover: {
            title: "✨ Pronta para começar?",
            description: `Clique em 'Conversar' e inicie sua jornada. A ${firstAgent.name} já sabe como te ajudar, mesmo que você ainda não saiba tudo.`,
            side: "top" as const,
            align: "center" as const,
          },
        },
      ],
    });

    driverObj.drive();
  }, [navigate]);

  return { startTour };
}

async function marcarConcluido() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("profiles")
    .update({ onboarding_completed: true } as any)
    .eq("id", user.id);
}
