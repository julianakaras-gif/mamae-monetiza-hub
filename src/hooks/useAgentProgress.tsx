import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PHASES, type Agent, type Phase } from "@/data/agents";

export type AgentStatus = "locked" | "unlocked" | "completed";

export interface AgentState {
  agent: Agent;
  phase: Phase;
  status: AgentStatus;
}

export function useAgentProgress() {
  const { user } = useAuth();
  const [completedAgents, setCompletedAgents] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [progressRes, favRes] = await Promise.all([
      supabase
        .from("user_progress")
        .select("agent_id, completed")
        .eq("user_id", user.id)
        .eq("completed", true),
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
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate unlock status for every agent
  function getAgentStatus(agentId: string): AgentStatus {
    if (completedAgents.has(agentId)) return "completed";

    // Phase 6 (alwaysOpen): always unlocked
    const phase6 = PHASES.find((p) => p.alwaysOpen);
    if (phase6?.agents.some((a) => a.id === agentId)) return "unlocked";

    // Phase 1
    const phase1 = PHASES[0];
    if (agentId === "clara") return "unlocked";
    if (agentId === "aya") {
      return completedAgents.has("clara") ? "unlocked" : "locked";
    }

    // Phase 2 unlocks when aya is completed
    const phase2 = PHASES[1];
    const ayaCompleted = completedAgents.has("aya");

    if (phase2.agents.some((a) => a.id === agentId)) {
      if (!ayaCompleted) return "locked";
      // Sequential within phase 2: Lucca => Alice => Kaia => Talia
      const idx = phase2.agents.findIndex((a) => a.id === agentId);
      if (idx === 0) return "unlocked";
      const prev = phase2.agents[idx - 1];
      return completedAgents.has(prev.id) ? "unlocked" : "locked";
    }

    // Phases 3, 4, 5 unlock when Talia is completed
    const taliaCompleted = completedAgents.has("talia");
    const freePhases = PHASES.filter(
      (p) => p.freeAgents && !p.alwaysOpen
    );
    for (const phase of freePhases) {
      if (phase.agents.some((a) => a.id === agentId)) {
        return taliaCompleted ? "unlocked" : "locked";
      }
    }

    return "locked";
  }

  // Get phase status
  function getPhaseStatus(phase: Phase): "locked" | "in_progress" | "completed" | "free" | "always" {
    if (phase.alwaysOpen) return "always";

    const statuses = phase.agents.map((a) => getAgentStatus(a.id));
    const allCompleted = statuses.every((s) => s === "completed");
    const allLocked = statuses.every((s) => s === "locked");
    const hasUnlocked = statuses.some((s) => s === "unlocked");

    if (allCompleted) return "completed";
    if (allLocked) return "locked";
    if (phase.freeAgents && !phase.alwaysOpen && hasUnlocked) return "free";
    return "in_progress";
  }

  // Count completed in phase
  function getPhaseProgress(phase: Phase): { done: number; total: number } {
    const done = phase.agents.filter((a) => completedAgents.has(a.id)).length;
    return { done, total: phase.agents.length };
  }

  // Get next step: first unlocked, non-completed agent
  function getNextAgent(): { agent: Agent; phase: Phase } | null {
    for (const phase of PHASES) {
      if (phase.alwaysOpen) continue;
      for (const agent of phase.agents) {
        if (getAgentStatus(agent.id) === "unlocked") {
          return { agent, phase };
        }
      }
    }
    return null;
  }

  // Overall progress
  const totalAgents = PHASES.reduce((sum, p) => sum + p.agents.length, 0);
  const totalCompleted = completedAgents.size;
  const progressPercent = totalAgents > 0 ? Math.round((totalCompleted / totalAgents) * 100) : 0;

  // Toggle favorite
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
    completedAgents,
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
