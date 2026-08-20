import { AGENTS } from "@/data/agents";
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

  const favAgents = Object.values(AGENTS).filter((a) => favorites.has(a.id));

  return (
    <div className="p-4 md:p-8 max-w-3xl animate-fade-in">
      <h1 className="font-display text-xl md:text-2xl text-foreground mb-1">Favoritos</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Os agentes que você marcou com a estrela.
      </p>

      {favAgents.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-gold/15 flex items-center justify-center mx-auto mb-4">
            <Star size={28} className="text-gold" />
          </div>
          <p className="font-display text-sm text-foreground mb-2">
            Você ainda não tem favoritos
          </p>
          <p className="text-muted-foreground text-xs max-w-xs mx-auto">
            Explore a trilha e marque os agentes que mais usa com a estrela para acessá-los rapidamente aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {favAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              color="#3A5C46"
              status={getAgentStatus(agent.id)}
              isFavorite={true}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favoritos;
