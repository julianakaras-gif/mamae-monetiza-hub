import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { findAgent } from "@/data/agents";

interface Session {
  id: string;
  agent_id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
}

const ProjetoDetalhe = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !projectId) return;
    loadData();
  }, [user, projectId]);

  const loadData = async () => {
    setLoading(true);
    const { data: project } = await supabase
      .from("projects")
      .select("name")
      .eq("id", projectId!)
      .single();

    if (project) setProjectName(project.name);

    const { data: sessionsData } = await supabase
      .from("agent_sessions")
      .select("id, agent_id, status, started_at, completed_at")
      .eq("project_id", projectId!)
      .order("started_at", { ascending: false });

    if (sessionsData) setSessions(sessionsData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto animate-fade-in">
      <button onClick={() => navigate("/projetos")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft size={16} />
        Voltar para projetos
      </button>

      <h1 className="font-display text-2xl text-foreground mb-6">{projectName}</h1>

      {sessions.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-12">Nenhuma conversa neste projeto ainda.</p>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const info = findAgent(s.agent_id);
            const agentName = info?.name || s.agent_id;
            const agentRole = info?.role || "";
            const color = undefined || "#1C3C2C";

            return (
              <button
                key={s.id}
                onClick={() => navigate(`/chat/${s.agent_id}?project=${projectId}`)}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:shadow-sm transition-shadow text-left"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ backgroundColor: `${color}15`, color }}
                >
                  {agentName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">{agentName}</p>
                  <p className="text-xs text-muted-foreground truncate">{agentRole}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === "completed" ? "bg-sage-pale/30 text-sage-mid" : "bg-muted text-muted-foreground"}`}>
                    {s.status === "completed" ? "Concluído" : "Em andamento"}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(s.started_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjetoDetalhe;