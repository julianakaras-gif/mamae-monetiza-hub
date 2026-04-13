import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

export function useOnboarding() {
  const navigate = useNavigate();

  const startTour = useCallback(() => {
    const driverObj = driver({
      animate: true,
      overlayOpacity: 0.75,
      stagePadding: 12,
      allowClose: false,
      overlayClickNext: false,
      disableActiveInteraction: true,
      nextBtnText: "Próximo →",
      prevBtnText: "← Voltar",
      doneBtnText: "Começar! 🌿",
      onDestroyed: async () => {
        await marcarConcluido();
        navigate("/chat/clara");
      },
      steps: [
        {
          element: "#trilha-agentes",
          popover: {
            title: "👋 Bem-vinda ao Prospera!",
            description:
              "Aqui estão suas 26 especialistas. Cada uma cuida de uma parte do seu negócio — marca, conteúdo, vendas, finanças e muito mais.",
            side: "right" as const,
            align: "start" as const,
          },
        },
        {
          element: "#agente-clara",
          popover: {
            title: "🌸 Comece pela Clara",
            description:
              "A Clara é sua porta de entrada. Ela vai te conhecer, entender onde você está agora e abrir o caminho para as próximas especialistas.",
            side: "right" as const,
            align: "start" as const,
          },
        },
        {
          element: "#sidebar-projetos",
          popover: {
            title: "📁 Seus projetos",
            description:
              "Tudo que você construir fica salvo aqui. Pode ter um projeto para cada negócio ou ideia — as especialistas lembram de tudo.",
            side: "right" as const,
            align: "start" as const,
          },
        },
        {
          element: "#btn-conversar-clara",
          popover: {
            title: "✨ Pronta para começar?",
            description:
              "Clique em 'Conversar' e inicie sua jornada. A Clara já sabe como te ajudar — mesmo que você ainda não saiba o que quer vender.",
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
