import { useAuth } from "@/hooks/useAuth";
import { useAgentProgress } from "@/hooks/useAgentProgress";
import { PHASES } from "@/data/agents";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

const Home = () => {
  const { profile } = useAuth();
  const { getNextAgent, getPhaseProgress, getPhaseStatus, progressPercent, loading } = useAgentProgress();
  const navigate = useNavigate();
  const name = profile?.name?.split(" ")[0] || "Aluna";
  const next = getNextAgent();

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl animate-fade-in">
      {/* Welcome */}
      <h1 className="font-georgia text-2xl font-bold text-foreground mb-1">
        {getGreeting()}, {name}! 👋
      </h1>
      <p className="text-muted-foreground text-sm mb-8">
        Bem-vinda à sua plataforma de transformação digital.
      </p>

      {/* Next step */}
      {next && (
        <Card className="mb-6 border-0 shadow-md overflow-hidden">
          <CardContent className="p-5 flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0"
              style={{
                backgroundColor: `${next.phase.color}15`,
                color: next.phase.color,
              }}
            >
              {next.agent.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">Próximo passo</p>
              <p className="font-georgia font-bold text-sm text-foreground">
                {next.agent.name} — {next.agent.role}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{next.agent.desc}</p>
            </div>
            <button
              onClick={() => navigate(`/chat/${next.agent.id}`)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-accent-foreground shrink-0 transition-all animate-pulse"
              style={{
                background: "hsl(var(--rosa))",
                boxShadow: "0 0 20px hsl(var(--rosa) / 0.4)",
              }}
            >
              Começar agora
            </button>
          </CardContent>
        </Card>
      )}

      {/* Phase progress grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {PHASES.map((phase) => {
          const { done, total } = getPhaseProgress(phase);
          const status = getPhaseStatus(phase);
          return (
            <button
              key={phase.id}
              onClick={() => navigate(`/trilha?phase=${phase.id}`)}
              className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:shadow-sm transition-all text-left"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                style={{ backgroundColor: `${phase.color}15` }}
              >
                {phase.emoji}
              </div>
              <div className="min-w-0">
                <p className="font-georgia font-bold text-xs text-foreground">{phase.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {done}/{total} agentes
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick access */}
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-medium">
        Sempre disponíveis
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => navigate("/chat/maia")}
          className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:shadow-sm transition-all text-left"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: "#c49a3015", color: "#c49a30" }}>
            <Zap size={18} />
          </div>
          <div className="min-w-0">
            <p className="font-georgia font-bold text-sm text-foreground">Maia</p>
            <p className="text-xs text-muted-foreground">Rotinas Estratégicas</p>
          </div>
          <ArrowRight size={16} className="text-muted-foreground ml-auto shrink-0" />
        </button>
        <button
          onClick={() => navigate("/chat/liora")}
          className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:shadow-sm transition-all text-left"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: "#c49a3015", color: "#c49a30" }}>
            <BarChart3 size={18} />
          </div>
          <div className="min-w-0">
            <p className="font-georgia font-bold text-sm text-foreground">Liora</p>
            <p className="text-xs text-muted-foreground">Decodificadora de Dados</p>
          </div>
          <ArrowRight size={16} className="text-muted-foreground ml-auto shrink-0" />
        </button>
      </div>
    </div>
  );
};

export default Home;
