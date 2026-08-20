import { useEffect, useMemo, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { Info, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { TRILHAS, findAgent, type TrilhaId, type TrilhaDef, type TrilhaAlternativa } from "@/data/agents";
import { useAgentProgress } from "@/hooks/useAgentProgress";
import { useProject } from "@/hooks/useProject";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AgentCard from "@/components/AgentCard";
import { Badge } from "@/components/ui/badge";

type RenderNode =
  | { kind: "agent"; agentId: string; textoAntes?: string; textoDepois?: string; divisoria?: string }
  | { kind: "alternativas"; alternativas: TrilhaAlternativa[]; textoAntes?: string; divisoria?: string };

/**
 * Agrupa os passos da trilha para exibição. Quando o mesmo robô aparece em
 * passos seguidos (ex: Manu 4x na UGC), isso é UMA conversa contínua com
 * aquele robô — vira um único card, não vários.
 */
function buildRenderNodes(trilha: TrilhaDef | undefined): RenderNode[] {
  if (!trilha) return [];
  const nodes: RenderNode[] = [];
  for (const passo of trilha.passos) {
    if (passo.alternativas) {
      nodes.push({
        kind: "alternativas",
        alternativas: passo.alternativas,
        textoAntes: passo.textoAntes,
        divisoria: passo.divisoria,
      });
      continue;
    }
    const last = nodes[nodes.length - 1];
    if (last && last.kind === "agent" && last.agentId === passo.agentId && !passo.divisoria) {
      last.textoDepois = passo.textoDepois ?? last.textoDepois;
      continue;
    }
    nodes.push({
      kind: "agent",
      agentId: passo.agentId,
      textoAntes: passo.textoAntes,
      textoDepois: passo.textoDepois,
      divisoria: passo.divisoria,
    });
  }
  return nodes;
}

const TODAS_TRILHAS: TrilhaId[] = ["af", "ugc", "pp", "dk"];

const Trilha = () => {
  const navigate = useNavigate();
  const [tourStarted, setTourStarted] = useState(false);
  const {
    getAgentStatus,
    getTrilhaProgress,
    favorites,
    toggleFavorite,
    skipAgent,
    loading,
  } = useAgentProgress();
  const { activeProject, activeProjectId, projects, loading: projectsLoading } = useProject();
  const { startTour } = useOnboarding();
  const { user } = useAuth();

  const trilhaId = (activeProject as any)?.trilha as TrilhaId | undefined;
  const trilha = trilhaId ? TRILHAS[trilhaId] : undefined;
  const nodes = useMemo(() => buildRenderNodes(trilha), [trilha]);

  // Guard: never render Trilha without an active project
  useEffect(() => {
    if (projectsLoading) return;
    if (!activeProjectId) {
      if (projects.length === 0) {
        navigate("/home?new=1", { replace: true });
      } else {
        toast("Selecione um projeto para continuar.");
        navigate("/home", { replace: true });
      }
    }
  }, [projectsLoading, activeProjectId, projects.length, navigate]);

  // Projeto ainda sem trilha definida: leva para a Sofia
  useEffect(() => {
    if (projectsLoading || !activeProject) return;
    if (!(activeProject as any).trilha) {
      navigate("/chat/sofia", { replace: true });
    }
  }, [projectsLoading, activeProject, navigate]);

  useEffect(() => {
    async function verificarOnboarding() {
      if (!user || tourStarted || !trilha || nodes.length === 0) return;

      const primeiroNo = nodes[0];
      const primeiroAgentId = primeiroNo.kind === "agent" ? primeiroNo.agentId : primeiroNo.alternativas[0].agentId;
      const primeiroAgent = findAgent(primeiroAgentId);
      if (!primeiroAgent) return;

      const { data } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      if (!(data as any)?.onboarding_completed) {
        setTourStarted(true);
        setTimeout(() => startTour({ id: primeiroAgent.id, name: primeiroAgent.name }), 800);
      }
    }
    if (!loading && activeProjectId) {
      verificarOnboarding();
    }
  }, [user, loading, activeProjectId, startTour, trilha, nodes, tourStarted]);

  if (projectsLoading || loading || !activeProjectId || !trilha) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { done, total } = getTrilhaProgress();

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
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center text-xl md:text-2xl shrink-0"
            style={{ backgroundColor: `${trilha.cor}15` }}
          >
            {trilha.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium mb-0.5" style={{ color: trilha.cor }}>
              Escolhida pela Sofia
            </p>
            <h1 className="font-display text-xl md:text-2xl text-foreground mb-0.5">
              {trilha.nome}
            </h1>
            <p className="text-sm text-muted-foreground">{trilha.objetivo}</p>
          </div>
        </div>

        <p className="text-muted-foreground text-sm mb-6">
          {trilha.descricao}
        </p>

        {/* As 4 trilhas do método: só a escolhida está desbloqueada */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TODAS_TRILHAS.map((id) => {
            const t = TRILHAS[id];
            const isActive = id === trilhaId;
            return (
              <button
                key={id}
                onClick={() => {
                  if (!isActive) {
                    toast("Essa trilha fica disponível se você criar um novo projeto.");
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-opacity ${
                  isActive ? "" : "opacity-40 hover:opacity-60"
                }`}
                style={{
                  backgroundColor: isActive ? `${t.cor}20` : "transparent",
                  border: `1px solid ${isActive ? t.cor : "#E2D9C8"}`,
                  color: isActive ? t.cor : "hsl(var(--muted-foreground))",
                }}
                aria-current={isActive ? "true" : undefined}
              >
                {t.emoji}
                {t.nome}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between mb-6">
          <Badge
            className="text-xs px-2 py-0.5 border-0"
            style={{ backgroundColor: `${trilha.cor}20`, color: trilha.cor }}
          >
            {done}/{total} concluído
          </Badge>
        </div>

        <div id="trilha-agentes" className="space-y-4">
          {nodes.map((node, index) => {
            const key = node.kind === "agent" ? node.agentId : `alt-${index}`;

            return (
              <Fragment key={key}>
                {node.divisoria && (
                  <div className="flex items-center gap-3 my-5">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {node.divisoria}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                )}

                {node.textoAntes && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground mb-2">
                    <Info size={14} className="shrink-0 mt-0.5" />
                    <span>{node.textoAntes}</span>
                  </div>
                )}

                {node.kind === "agent" ? (
                  (() => {
                    const agent = findAgent(node.agentId);
                    if (!agent) return null;
                    const status = getAgentStatus(agent.id);
                    return (
                      <AgentCard
                        agent={agent}
                        color={trilha.cor}
                        status={status}
                        isFavorite={favorites.has(agent.id)}
                        onToggleFavorite={toggleFavorite}
                        onSkip={status === "unlocked" ? skipAgent : undefined}
                      />
                    );
                  })()
                ) : (
                  <div className="space-y-2">
                    {node.alternativas.map((alt) => {
                      const agent = findAgent(alt.agentId);
                      if (!agent) return null;
                      const status = getAgentStatus(agent.id);
                      return (
                        <AgentCard
                          key={alt.agentId}
                          agent={agent}
                          color={trilha.cor}
                          status={status}
                          isFavorite={favorites.has(agent.id)}
                          onToggleFavorite={toggleFavorite}
                          onSkip={status === "unlocked" ? skipAgent : undefined}
                        />
                      );
                    })}
                  </div>
                )}

                {node.kind === "agent" && node.textoDepois && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground mt-2">
                    <Info size={14} className="shrink-0 mt-0.5" />
                    <span>{node.textoDepois}</span>
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Trilha;
