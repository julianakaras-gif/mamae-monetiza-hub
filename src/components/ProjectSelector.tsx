import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Project {
  id: string;
  name: string;
  created_at: string;
  session_count?: number;
}

interface ProjectSelectorProps {
  open: boolean;
  onSelect: (projectId: string | null) => void;
  onClose: () => void;
}

const ProjectSelector = ({ open, onSelect, onClose }: ProjectSelectorProps) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !user) return;
    loadProjects();
  }, [open, user]);

  const loadProjects = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("projects")
      .select("id, name, created_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (data) {
      // Get session counts
      const projectIds = data.map((p) => p.id);
      const counts: Record<string, number> = {};
      if (projectIds.length > 0) {
        const { data: sessions } = await supabase
          .from("agent_sessions")
          .select("project_id")
          .in("project_id", projectIds);
        sessions?.forEach((s) => {
          if (s.project_id) counts[s.project_id] = (counts[s.project_id] || 0) + 1;
        });
      }
      setProjects(data.map((p) => ({ ...p, session_count: counts[p.id] || 0 })));
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!newName.trim() || !user) return;
    setCreating(true);
    const { data, error } = await supabase
      .from("projects")
      .insert({ user_id: user.id, name: newName.trim() })
      .select("id")
      .single();

    if (data && !error) {
      onSelect(data.id);
    }
    setCreating(false);
    setNewName("");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-georgia">Para qual projeto é essa conversa?</DialogTitle>
          <DialogDescription>
            Assim suas conversas ficam organizadas e salvas por negócio.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => onSelect(p.id)}
                className="w-full text-left p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors"
              >
                <p className="font-semibold text-sm text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(p.created_at).toLocaleDateString("pt-BR")} · {p.session_count || 0} conversas
                </p>
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="Nome do seu negócio ou ideia..."
            className="flex-1 rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={handleCreate}
            disabled={!newName.trim() || creating}
            className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
          >
            <Plus size={16} />
          </button>
        </div>

        <button
          onClick={() => onSelect(null)}
          className="text-xs text-muted-foreground hover:text-foreground text-center w-full"
        >
          Continuar sem projeto
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectSelector;
