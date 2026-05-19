import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FolderOpen, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { findAgent, getAllAgentIds } from "@/data/agents";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  agentCount: number;
  totalAgents: number;
}

const Projetos = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const totalAgents = getAllAgentIds().length;

  useEffect(() => {
    if (!user) return;
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("projects")
      .select("id, name, description, created_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (data) {
      const enriched = await Promise.all(
        data.map(async (p) => {
          const { data: sessions } = await supabase
            .from("agent_sessions")
            .select("agent_id")
            .eq("project_id", p.id)
            .eq("status", "completed");
          const uniqueAgents = new Set(sessions?.map((s) => s.agent_id) || []);
          return { ...p, agentCount: uniqueAgents.size, totalAgents };
        })
      );
      setProjects(enriched);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!newName.trim() || !user) return;
    setCreating(true);
    const { error } = await supabase
      .from("projects")
      .insert({ user_id: user.id, name: newName.trim() });

    if (error) {
      toast.error("Erro ao criar projeto");
    } else {
      setNewName("");
      loadProjects();
    }
    setCreating(false);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl text-foreground">Meus Projetos</h1>
      </div>

      <div className="flex gap-2 mb-8">
        <label htmlFor="projetos-novo-nome" className="sr-only">Nome do novo projeto</label>
        <input
          id="projetos-novo-nome"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="Nome do novo projeto..."
          className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={handleCreate}
          disabled={!newName.trim() || creating}
          className="px-4 py-2.5 rounded-xl bg-sage-dark text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
        >
          <Plus size={16} />
          Novo Projeto
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground text-sm">Nenhum projeto ainda. Crie o primeiro acima!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {projects.map((p) => {
            const pct = p.totalAgents > 0 ? Math.round((p.agentCount / p.totalAgents) * 100) : 0;
            return (
              <button
                key={p.id}
                onClick={() => navigate(`/projetos/${p.id}`)}
                className="text-left bg-card rounded-2xl p-5 border border-border hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h2 className="font-bold text-foreground">{p.name}</h2>
                  <ChevronRight size={16} className="text-muted-foreground mt-1" />
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Criado em {new Date(p.created_at).toLocaleDateString("pt-BR")} · {p.agentCount} agentes consultados
                </p>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: "linear-gradient(90deg, #6E9876, #C6A86C)",
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{pct}% da trilha</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Projetos;