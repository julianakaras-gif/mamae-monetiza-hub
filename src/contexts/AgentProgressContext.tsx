import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProject } from "@/hooks/useProject";
import { useAuth } from "@/hooks/useAuth";

interface RealtimeProgressContextType {
  realtimeCompleted: Set<string>;
}

const RealtimeProgressContext = createContext<RealtimeProgressContextType>({
  realtimeCompleted: new Set(),
});

export function AgentProgressProvider({ children }: { children: React.ReactNode }) {
  const { activeProjectId } = useProject();
  const { user } = useAuth();
  const [realtimeCompleted, setRealtimeCompleted] = useState<Set<string>>(new Set());
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    if (!activeProjectId || !user) return;

    const handlePayload = (payload: any) => {
      if (payload.new?.completed && payload.new?.agent_id) {
        setRealtimeCompleted((prev) => new Set([...prev, payload.new.agent_id]));
      }
    };

    const channel = supabase
      .channel(`agent-progress-${activeProjectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_progress",
          filter: `project_id=eq.${activeProjectId}`,
        },
        handlePayload
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "user_progress",
          filter: `project_id=eq.${activeProjectId}`,
        },
        handlePayload
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [activeProjectId, user]);

  return (
    <RealtimeProgressContext.Provider value={{ realtimeCompleted }}>
      {children}
    </RealtimeProgressContext.Provider>
  );
}

export function useRealtimeProgress() {
  return useContext(RealtimeProgressContext);
}
