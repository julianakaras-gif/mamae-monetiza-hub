import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, Info } from "lucide-react";
import { PHASES } from "@/data/agents";
import { useAgentProgress } from "@/hooks/useAgentProgress";
import AgentCard from "@/components/AgentCard";
import { Badge } from "@/components/ui/badge";

const phaseStatusLabel: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  locked: { label: "Bloqueada", variant: "outline" },
  in_progress: { label: "Em andamento", variant: "default" },
  completed: { label: "Concluída", variant: "default" },
  free: { label: "Livre", variant: "default" },
  always: { label: "Sempre disponível", variant: "secondary" },
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
    <div className="p-6 md:p-8 max-w-3xl animate-fade-in">
      <h1 className="font-georgia text-2xl font-bold text-foreground mb-1">Trilha</h1>
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
              : status === "always"
              ? "#c49a30"
              : status === "locked"
              ? "hsl(var(--muted-foreground))"
              : phase.color;

          return (
            <div key={phase.id} className="rounded-xl border bg-card overflow-hidden">
              {/* Header */}
              <button
                onClick={() => setOpenPhaseId(isOpen ? null : phase.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
                disabled={false}
              >
                {/* Emoji badge */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
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

                <span className="text-xs text-muted-foreground shrink-0 mr-2">
                  {done}/{total}
                </span>

                <ChevronDown
                  size={18}
                  className={`text-muted-foreground transition-transform duration-200 shrink-0 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Content */}
              {isOpen && (
                <div className="px-4 pb-4 space-y-2">
                  {/* Info messages */}
                  {isLocked && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                      <Info size={14} className="shrink-0 mt-0.5" />
                      <span>
                        {phase.id === 2
                          ? "Complete a Aya (Fase 1) para desbloquear esta fase."
                          : "Complete a Talia (Fase 2) para desbloquear esta fase."}
                      </span>
                    </div>
                  )}
                  {phase.freeAgents && !phase.alwaysOpen && !isLocked && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                      <Info size={14} className="shrink-0 mt-0.5" />
                      <span>Use os agentes desta fase em qualquer ordem, conforme sua necessidade.</span>
                    </div>
                  )}
                  {phase.alwaysOpen && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                      <Info size={14} className="shrink-0 mt-0.5" />
                      <span>Estes agentes estão sempre disponíveis, em qualquer momento da trilha.</span>
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
