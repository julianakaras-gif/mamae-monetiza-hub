import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAgentProgress } from "@/hooks/useAgentProgress";
import { PHASES } from "@/data/agents";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

const Home = () => {
  const { profile } = useAuth();
  const { getNextAgent, getPhaseProgress, getPhaseStatus, progressPercent, loading, completedAgents } = useAgentProgress();
  const navigate = useNavigate();
  const name = profile?.name?.split(" ")[0] || "Aluna";
  const next = getNextAgent();
  const isFirstVisit = completedAgents.size === 0;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl animate-fade-in">
      {/* Welcome */}
      <h1 className="font-display text-xl md:text-2xl text-foreground mb-1">
        {getGreeting()}, {name}! 👋
      </h1>
      <p className="text-muted-foreground text-sm mb-6 md:mb-8">
        Bem-vinda à sua plataforma de transformação digital.
      </p>

      {/* First visit card */}
      {isFirstVisit && (
        <Card className="mb-6 border-0 shadow-md overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(182,208,190,0.15), rgba(198,168,108,0.15))" }}>
          <CardContent className="p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(198,168,108,0.15)" }}>
              <Sparkles size={22} className="text-gold" />
            </div>
            <div>
              <p className="font-display text-sm text-foreground mb-1">
                Bem-vinda ao Prospera! 🎉
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Sua jornada começa com a Clara, que vai te ajudar a descobrir o negócio perfeito para você. Cada agente desbloqueará o próximo passo da sua trilha.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next step */}
      {next && (
        <Card className="mb-6 border-0 shadow-md overflow-hidden">
          <CardContent className="p-4 md:p-5 flex items-center gap-3 md:gap-4">
            <div
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-base md:text-lg font-bold shrink-0"
              style={{
                backgroundColor: `${next.phase.color}15`,
                color: next.phase.color,
              }}
            >
              {next.agent.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">Próximo passo</p>
              <p className="font-display text-sm text-foreground">
                {next.agent.name}: {next.agent.role}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 hidden sm:block">{next.agent.desc}</p>
            </div>
            <button
              onClick={() => navigate(`/chat/${next.agent.id}`)}
              className="px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-semibold text-white shrink-0 transition-all bg-sage-mid"
              style={{
                boxShadow: "0 0 20px rgba(58,92,70,0.4)",
              }}
              aria-label={`Começar conversa com ${next.agent.name}`}
            >
              Começar
            </button>
          </CardContent>
        </Card>
      )}

      {/* Phase progress grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {PHASES.map((phase) => {
          const { done, total } = getPhaseProgress(phase);
          return (
            <button
              key={phase.id}
              onClick={() => navigate(`/trilha?phase=${phase.id}`)}
              className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 rounded-xl border bg-card hover:shadow-sm transition-all text-left"
              aria-label={`Fase ${phase.name}: ${done} de ${total} agentes completos`}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                style={{ backgroundColor: `${phase.color}15` }}
              >
                {phase.emoji}
              </div>
              <div className="min-w-0">
                <p className="font-display text-xs text-foreground">{phase.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {done}/{total} agentes
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Home;