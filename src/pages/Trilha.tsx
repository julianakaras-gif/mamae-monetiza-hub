import { useState, useEffect, memo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ChevronDown, Info, FolderOpen } from "lucide-react";
import { PHASES } from "@/data/agents";
import { useAgentProgress } from "@/hooks/useAgentProgress";
import { useProject } from "@/hooks/useProject";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
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
  const navigate = useNavigate();
  const returnPhase = searchParams.get("phase");
  const [openPhaseId, setOpenPhaseId] = useState<number | null>(
    returnPhase ? Number(returnPhase) : null
  );
  const { getAgentStatus, getPhaseStatus, getPhaseProgress, favorites, toggleFavorite, loading } = useAgentProgress();
  const { activeProject } = useProject();
  const { startTour } = useOnboarding();
  const { user } = useAuth();

  useEffect(() => {
    async function verificarOnboarding() {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      if (!(data as any)?.onboarding_completed) {
        setOpenPhaseId(1); // Open first phase so Clara card is visible
        setTimeout(() => startTour(), 800);
      }
    }
    if (!loading) {
      verificarOnboarding();
    }
  }, [user, loading, startTour]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {activeProject && (
        <div
          className="flex items-center justify-between px-4 md:px-8 py-3"
          style={{ backgroundColor: "#1C3C2C" }}
        >
          <div className="flex items-center gap-2 text-white" style={{ fontSize: 14 }}>
            <FolderOpen size={16} />
            <span>
              Projeto ativo: <strong>{activeProject.name}</strong>
            </span>
          </div>
          <button
            onClick={() => navigate("/home")}
            className="transition-opacity hover:opacity-80"
            style={{ color: "#B6D0BE", fontSize: 13 }}
          >
            Trocar projeto
          </button>
        </div>
      )}

      <div className="p-4 md:p-8 max-w-3xl">
      <h1 className="font-display text-xl md:text-2xl text-foreground mb-1">Trilha</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Sua jornada com os agentes de IA, fase por fase.
      </p>

      <div id="trilha-agentes" className="space-y-3">
        {PHASES.map((phase) => {
          const isOpen = openPhaseId === phase.id;
          const status = getPhaseStatus(phase);
          const { done, total } = getPhaseProgress(phase);
          const statusInfo = phaseStatusLabel[status];
          const isLocked = status === "locked";

          const badgeColor =
            status === "completed"
              ? "#3A5C46"
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
                    <span className="font-display text-sm text-foreground">
                      {phase.name}
                    </span>
                    <Badge
                      className="text-xs px-2 py-0 border-0"
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
    </div>
  );
};

export default Trilha;