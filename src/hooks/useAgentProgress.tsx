import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useProject } from "@/hooks/useProject";
import { useRealtimeProgress } from "@/contexts/AgentProgressContext";
import { TRILHAS, findAgent, type Agent, type TrilhaId, type TrilhaDef } from "@/data/agents";

export type AgentStatus = "locked" | "unlocked" | "completed" | "skipped";

interface TrilhaNode {
  agentIds: string[];
}

/**
 * Agrupa os passos da trilha em "nós" de desbloqueio.
 * Quando o mesmo robô aparece em passos seguidos (ex: Manu 4x na UGC,
 * Bill 2x na Canal Dark), isso é UMA única conversa contínua com aquele
 * robô — não vira vários cards separados. Um passo com `alternativas`
 * (ex: Lira/Noa/Eron) vira um único nó com os 3 agentIds juntos.
 */
function buildTrilhaNodes(trilha: TrilhaDef | undefined): TrilhaNode[] {
  if (!trilha) return [];
  const nodes: TrilhaNode[] = [];
  for (const passo of trilha.passos) {
    const ids = passo.alternativas ? passo.alternativas.map((a) => a.agentId) : [passo.agentId];
    const last = nodes[nodes.length - 1];
    if (last && !passo.alternativas && last.agentIds.length === 1 && last.agentIds[0] === ids[0]) {
      continue; // mesma conversa continuando, não é um novo nó
    }
    nodes.push({ agentIds: ids });
  }
  return nodes;
}

export function useAgentProgress() {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { activeProject, activeProjectId } = useProject();
  const { realtimeCompleted } = useRealtimeProgress();

  const [completedAgents, setCompletedAgents] = useState<Set<string>>(new Set());
  const [skippedAgents, setSkippedAgents] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const trilhaId = (activeProject as any)?.trilha as TrilhaId | undefined;
  const trilha = trilhaId ? TRILHAS[trilhaId] : undefined;
  const nodes = useMemo(() => buildTrilhaNodes(trilha), [trilha]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    let progressQuery = supabase
      .from("user_progress")
      .select("agent_id, completed, skipped")
      .eq("user_id", user.id);

    if (activeProjectId) {
      progressQuery = progressQuery.eq("project_id", activeProjectId);
    }

    const [progressRes, favRes] = await Promise.all([
      progressQuery,
      supabase
        .from("user_favorites")
        .select("agent_id")
        .eq("user_id", user.id),
    ]);

    const rows = progressRes.data ?? [];
    setCompletedAgents(new Set(rows.filter((r) => r.completed).map((r) => r.agent_id)));
    setSkippedAgents(new Set(rows.filter((r) => r.skipped).map((r) => r.agent_id)));
    setFavorites(new Set((favRes.data ?? []).map((r) => r.agent_id)));
    setLoading(false);
  }, [user, activeProjectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Mescla o que veio do banco com atualizações em tempo real
  const allCompleted = useMemo(() => {
    if (realtimeCompleted.size === 0) return completedAgents;
    return new Set([...completedAgents, ...realtimeCompleted]);
  }, [completedAgents, realtimeCompleted]);

  const isDone = useCallback(
    (agentId: string) => allCompleted.has(agentId) || skippedAgents.has(agentId),
    [allCompleted, skippedAgents]
  );

  function getAgentStatus(agentId: string): AgentStatus {
    if (allCompleted.has(agentId)) return "completed";
    if (skippedAgents.has(agentId)) return "skipped";

    const nodeIndex = nodes.findIndex((n) => n.agentIds.includes(agentId));
    if (nodeIndex === -1) return "locked";

    // Admin vê todos os robôs da trilha desbloqueados para facilitar testes
    if (isAdmin) return "unlocked";

    const node = nodes[nodeIndex];
    // Se este agente é uma alternativa (ex: Noa) e outra alternativa do
    // mesmo nó já foi concluída (ex: a aluna já fez com a Lira), este
    // aqui deixa de fazer sentido e fica bloqueado.
    if (node.agentIds.length > 1 && node.agentIds.some((id) => id !== agentId && isDone(id))) {
      return "locked";
    }

    if (nodeIndex === 0) return "unlocked";
    const prevNode = nodes[nodeIndex - 1];
    return prevNode.agentIds.some((id) => isDone(id)) ? "unlocked" : "locked";
  }

  function getTrilhaProgress(): { done: number; total: number } {
    const done = nodes.filter((n) => n.agentIds.some((id) => isDone(id))).length;
    return { done, total: nodes.length };
  }

  function getNextAgent(): Agent | null {
    for (const node of nodes) {
      for (const agentId of node.agentIds) {
        if (getAgentStatus(agentId) === "unlocked") {
          const agent = findAgent(agentId);
          if (agent) return agent;
        }
      }
    }
    return null;
  }

  const { done: doneCount, total: totalAgents } = getTrilhaProgress();
  const progressPercent = totalAgents > 0 ? Math.round((doneCount / totalAgents) * 100) : 0;

  async function toggleFavorite(agentId: string) {
    if (!user) return;
    const isFav = favorites.has(agentId);
    if (isFav) {
      await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("agent_id", agentId);
      setFavorites((prev) => {
        const next = new Set(prev);
        next.delete(agentId);
        return next;
      });
    } else {
      await supabase
        .from("user_favorites")
        .insert({ user_id: user.id, agent_id: agentId });
      setFavorites((prev) => new Set(prev).add(agentId));
    }
  }

  async function skipAgent(agentId: string) {
    if (!user || !activeProjectId) return;
    await supabase.from("user_progress").upsert(
      {
        user_id: user.id,
        project_id: activeProjectId,
        agent_id: agentId,
        skipped: true,
      },
      { onConflict: "user_id,agent_id,project_id" }
    );
    setSkippedAgents((prev) => new Set(prev).add(agentId));
  }

  return {
    loading,
    completedAgents: allCompleted,
    skippedAgents,
    favorites,
    getAgentStatus,
    getTrilhaProgress,
    getNextAgent,
    progressPercent,
    toggleFavorite,
    skipAgent,
    refetch: fetchData,
  };
}
