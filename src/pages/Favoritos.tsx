import { PHASES } from "@/data/agents";
import { useAgentProgress } from "@/hooks/useAgentProgress";
import AgentCard from "@/components/AgentCard";
import { Star } from "lucide-react";

const Favoritos = () => {
  const { favorites, getAgentStatus, toggleFavorite, loading } = useAgentProgress();

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const grouped = PHASES.map((phase) => ({
    phase,
    agents: phase.agents.filter((a) => favorites.has(a.id)),
  })).filter((g) => g.agents.length > 0);

  return (
    <div className="p-4 md:p-8 max-w-3xl animate-fade-in">
      <h1 className="font-georgia text-xl md:text-2xl font-bold text-foreground mb-1">Favoritos</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Seus agentes favoritos, agrupados por fase.
      </p>

      {grouped.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-secondary/15 flex items-center justify-center mx-auto mb-4">
            <Star size={28} className="text-secondary" />
          </div>
          <p className="font-georgia font-bold text-sm text-foreground mb-2">
            Você ainda não tem favoritos
          </p>
          <p className="text-muted-foreground text-xs max-w-xs mx-auto">
            Explore a trilha e marque os agentes que mais usa com a estrela para acessá-los rapidamente aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ phase, agents }) => (
            <div key={phase.id}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">{phase.emoji}</span>
                <span className="font-georgia font-bold text-sm text-foreground">
                  {phase.name}
                </span>
              </div>
              <div className="space-y-2">
                {agents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    phaseColor={phase.color}
                    status={getAgentStatus(agent.id)}
                    isFavorite={true}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favoritos;
