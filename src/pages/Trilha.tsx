import { useState, memo } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, Info } from "lucide-react";
import { PHASES } from "@/data/agents";
import { useAgentProgress } from "@/hooks/useAgentProgress";
import AgentCard from "@/components/AgentCard";
import { Badge } from "@/components/ui/badge";

const phaseStatusLabel: Record<string, { label: string }> = {
  locked: { label: "Bloqueada" },
  in_progress: { label: "Em andamento" },
  completed: { label: "Concluída" },
  free: { label: "Livre" },
};

const Trilha = () => {
  const [searchParams] = useSearchParams();
  const returnPhase = searchParams.get("phase");
  const [openPhaseId, setOpenPhaseId] = useState<number | null>(
    returnPhase ? Number(returnPhase) : null
  );
  const { getAgentStatus, getPhaseStatus, getPhaseProgress, favorites, toggleFavorite, loading } = useAgentProgress();

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl animate-fade-in">
      <h1 className="font-georgia text-xl md:text-2xl font-bold text-foreground mb-1">Trilha</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Sua jornada com os agentes de IA, fase por fase.
      </p>

      <div className="space-y-3">
        {PHASES.map((phase) => {
          const isOpen = openPhaseId === phase.id;
          const status = getPhaseStatus(phase);
          const { done, total } = getPhaseProgress(phase);
          const statusInfo = phaseStatusLabel[status];
          const isLocked = status === "locked";

          const badgeColor =
            status === "completed"
              ? "hsl(var(--ciano))"
              : status === "locked"
              ? "hsl(var(--muted-foreground))"
              : phase.color;

          return (
            <div key={phase.id} className="rounded-xl border bg-card overflow-hidden">
              <button
                onClick={() => setOpenPhaseId(isOpen ? null : phase.id)}
                className="w-full flex items-center gap-2 md:gap-3 p-3 md:p-4 text-left hover:bg-muted/30 transition-colors"
                aria-expanded={isOpen}
                aria-label={`Fase ${phase.name}: ${statusInfo.label}`}
              >
                <div
                  className="w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-base md:text-lg shrink-0"
                  style={{ backgroundColor: `${phase.color}15` }}
                >
                  {phase.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-georgia font-bold text-sm text-foreground">
                      {phase.name}
                    </span>
                    <Badge
                      className="text-[10px] px-2 py-0 border-0"
                      style={{ backgroundColor: `${badgeColor}20`, color: badgeColor }}
                    >
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{phase.sub}</p>
                </div>

                <span className="text-xs text-muted-foreground shrink-0 mr-1 md:mr-2">
                  {done}/{total}
                </span>

                <ChevronDown
                  size={18}
                  className={`text-muted-foreground transition-transform duration-200 shrink-0 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-3 md:px-4 pb-3 md:pb-4 space-y-2">
                  {isLocked && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                      <Info size={14} className="shrink-0 mt-0.5" />
                      <span>
                        Complete as fases anteriores para desbloquear esta fase.
                      </span>
                    </div>
                  )}
                  {phase.freeAgents && !isLocked && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                      <Info size={14} className="shrink-0 mt-0.5" />
                      <span>Use os agentes desta fase em qualquer ordem, conforme sua necessidade.</span>
                    </div>
                  )}

                  {phase.agents.map((agent) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      phaseColor={phase.color}
                      status={getAgentStatus(agent.id)}
                      isFavorite={favorites.has(agent.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Trilha;
