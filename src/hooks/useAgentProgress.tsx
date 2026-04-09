import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProject } from "@/hooks/useProject";
import { useRealtimeProgress } from "@/contexts/AgentProgressContext";
import { PHASES, type Agent, type Phase } from "@/data/agents";

export type AgentStatus = "locked" | "unlocked" | "completed";

export interface AgentState {
  agent: Agent;
  phase: Phase;
  status: AgentStatus;
}

export function useAgentProgress() {
  const { user } = useAuth();
  const { activeProjectId } = useProject();
  const { realtimeCompleted } = useRealtimeProgress();

  const [completedAgents, setCompletedAgents] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    let progressQuery = supabase
      .from("user_progress")
      .select("agent_id, completed")
      .eq("user_id", user.id)
      .eq("completed", true);

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

    setCompletedAgents(
      new Set((progressRes.data ?? []).map((r) => r.agent_id))
    );
    setFavorites(new Set((favRes.data ?? []).map((r) => r.agent_id)));
    setLoading(false);
  }, [user, activeProjectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Merge fetched + realtime completed agents
  const allCompleted = useMemo(() => {
    if (realtimeCompleted.size === 0) return completedAgents;
    return new Set([...completedAgents, ...realtimeCompleted]);
  }, [completedAgents, realtimeCompleted]);

  function getAgentStatus(agentId: string): AgentStatus {
    if (allCompleted.has(agentId)) return "completed";

    const phase1 = PHASES[0];
    if (phase1.agents.some((a) => a.id === agentId)) {
      if (agentId === "clara") return "unlocked";
      const idx = phase1.agents.findIndex((a) => a.id === agentId);
      if (idx > 0) {
        const prev = phase1.agents[idx - 1];
        return allCompleted.has(prev.id) ? "unlocked" : "locked";
      }
    }

    const phase2 = PHASES[1];
    const taliaCompleted = allCompleted.has("talia");
    if (phase2.agents.some((a) => a.id === agentId)) {
      if (!taliaCompleted) return "locked";
      const idx = phase2.agents.findIndex((a) => a.id === agentId);
      if (idx === 0) return "unlocked";
      const prev = phase2.agents[idx - 1];
      return allCompleted.has(prev.id) ? "unlocked" : "locked";
    }

    const aliceCompleted = allCompleted.has("alice");
    const freePhases = PHASES.filter((p) => p.freeAgents);
    for (const phase of freePhases) {
      if (phase.agents.some((a) => a.id === agentId)) {
        return aliceCompleted ? "unlocked" : "locked";
      }
    }

    return "locked";
  }

  function getPhaseStatus(phase: Phase): "locked" | "in_progress" | "completed" | "free" {
    const statuses = phase.agents.map((a) => getAgentStatus(a.id));
    const allDone = statuses.every((s) => s === "completed");
    const allLocked = statuses.every((s) => s === "locked");
    const hasUnlocked = statuses.some((s) => s === "unlocked");

    if (allDone) return "completed";
    if (allLocked) return "locked";
    if (phase.freeAgents && hasUnlocked) return "free";
    return "in_progress";
  }

  function getPhaseProgress(phase: Phase): { done: number; total: number } {
    const done = phase.agents.filter((a) => allCompleted.has(a.id)).length;
    return { done, total: phase.agents.length };
  }

  function getNextAgent(): { agent: Agent; phase: Phase } | null {
    for (const phase of PHASES) {
      for (const agent of phase.agents) {
        if (getAgentStatus(agent.id) === "unlocked") {
          return { agent, phase };
        }
      }
    }
    return null;
  }

  const totalAgents = useMemo(() => PHASES.reduce((sum, p) => sum + p.agents.length, 0), []);
  const progressPercent = totalAgents > 0 ? Math.round((allCompleted.size / totalAgents) * 100) : 0;

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

  return {
    loading,
    completedAgents: allCompleted,
    favorites,
    getAgentStatus,
    getPhaseStatus,
    getPhaseProgress,
    getNextAgent,
    progressPercent,
    toggleFavorite,
    refetch: fetchData,
  };
}
