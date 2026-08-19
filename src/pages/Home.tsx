import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Plus, FolderOpen, ArrowRight, Sparkles, MessageCircle, Map } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProject } from "@/hooks/useProject";
import { useAgentProgress } from "@/hooks/useAgentProgress";
import { PHASES, SERENA } from "@/data/agents";
import { getAgentPhotoUrl } from "@/data/agentPhotos";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TOTAL_AGENTS = PHASES.reduce((sum, p) => sum + p.agents.length, 0) + 1;

const Home = () => {
  const { user, profile } = useAuth();
  const { projects, activeProject, activeProjectId, setProject, createProject, loading: projectsLoading, autoCreatedProjectId, clearAutoCreated } = useProject();
  const { progressPercent, completedAgents, getNextAgent, loading: progressLoading } = useAgentProgress();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [recentAgent, setRecentAgent] = useState<{ agent_id: string; created_at: string } | null>(null);

  // Conta nova: projeto criado automaticamente leva direto para a Sofia
  useEffect(() => {
    if (!autoCreatedProjectId) return;
    clearAutoCreated();
    navigate("/chat/sofia", { replace: true });
  }, [autoCreatedProjectId, clearAutoCreated, navigate]);

  useEffect(() => {
    if (!user || !activeProjectId) return;
    (async () => {
      const { data } = await supabase
        .from("agent_sessions")
        .select("agent_id, started_at")
        .eq("user_id", user.id)
        .eq("project_id", activeProjectId)
        .order("started_at", { ascending: false })
        .limit(1);
      if (data?.[0]) setRecentAgent({ agent_id: data[0].agent_id, created_at: data[0].started_at });
    })();
  }, [user, activeProjectId]);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    const result = await createProject(newName.trim(), newDesc.trim() || undefined);
    if (result) {
      setShowModal(false);
      setNewName("");
      setNewDesc("");
      toast.success("Projeto criado!");
      navigate("/chat/sofia");
    }
    setCreating(false);
  }

  const firstName = (profile?.name || "").split(" ")[0] || "aluna";
  const nextAgent = getNextAgent();
  const recent = recentAgent ? PHASES.flatMap((p) => p.agents).find((a) => a.id === recentAgent.agent_id) || (recentAgent.agent_id === SERENA.id ? SERENA : null) : null;

  if (projectsLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Empty state
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 animate-fade-in">
        <img src="/prospera-logo-claro.png" alt="Prospera" style={{ height: 72 }} className="object-contain" />
        <h1 className="font-display mt-6 text-center" style={{ fontSize: 32, color: "#1C3C2C" }}>
          Bem-vinda ao Prospera, {firstName}!
        </h1>
        <p className="text-center mt-3 leading-relaxed" style={{ fontSize: 16, color: "#3D6B4D", maxWidth: 460 }}>
          Vamos criar o seu primeiro projeto. Cada projeto é uma jornada completa com os {TOTAL_AGENTS} agentes.
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="mt-8 font-semibold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: "#1C3C2C", borderRadius: 40, fontSize: 16, padding: "14px 32px" }}
        >
          Criar meu primeiro projeto
        </button>
        <NewProjectModal open={showModal} onClose={() => setShowModal(false)} name={newName} setName={setNewName} desc={newDesc} setDesc={setNewDesc} creating={creating} onCreate={handleCreate} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-fade-in">
      <Helmet>
        <title>Início | Prospera</title>
        <meta name="description" content="Sua jornada Prospera: continue de onde parou e fale com seus agentes de IA." />
        <link rel="canonical" href="https://prospera-mamaemonetiza.lovable.app/home" />
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* Welcome */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest" style={{ color: "#3D6B4D" }}>Olá novamente</p>
        <h1 className="font-display mt-1" style={{ fontSize: 32, color: "#1C3C2C" }}>
          Oi, {firstName} 🌿
        </h1>
        <p className="mt-1" style={{ fontSize: 15, color: "#3D6B4D" }}>
          Bom te ver de volta. Vamos continuar de onde você parou?
        </p>
      </div>

      {/* Hero: projeto ativo + progresso */}
      {activeProject && (
        <div
          className="p-6 md:p-7 mb-6"
          style={{
            background: "linear-gradient(135deg, #1C3C2C 0%, #2F5A45 100%)",
            borderRadius: 24,
            color: "#fff",
          }}
        >
          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-widest" style={{ color: "#B6D0BE" }}>Projeto ativo</p>
              <h2 className="font-display mt-1 truncate" style={{ fontSize: 24 }}>{activeProject.name}</h2>
              {activeProject.description && (
                <p className="mt-1 line-clamp-2" style={{ fontSize: 14, color: "rgba(255,255,255,0.75)" }}>
                  {activeProject.description}
                </p>
              )}
            </div>
            <button
              onClick={() => navigate("/projetos")}
              className="shrink-0 text-xs px-3 py-1.5 rounded-full transition-colors hover:bg-white/10"
              style={{ border: "1px solid rgba(255,255,255,0.3)", color: "#fff" }}
            >
              Trocar
            </button>
          </div>

          {/* Progress */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-widest" style={{ color: "#B6D0BE" }}>
                Progresso geral
              </span>
              <span className="text-sm font-bold">{progressPercent}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%`, background: "linear-gradient(90deg, #6E9876, #C6A86C)" }}
              />
            </div>
            <p className="text-xs mt-1.5" style={{ color: "#B6D0BE" }}>
              {completedAgents.size} de {TOTAL_AGENTS} agentes concluídos
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/trilha")}
              className="flex items-center justify-center gap-2 font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#C6A86C", color: "#1C3C2C", borderRadius: 40, fontSize: 15, padding: "12px 24px" }}
            >
              <Map size={16} />
              Continuar trilha
            </button>
            {recent && (
              <button
                onClick={() => navigate(`/chat/${recent.id}`)}
                className="flex items-center justify-center gap-2 font-medium transition-colors hover:bg-white/10"
                style={{ border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 40, fontSize: 14, padding: "12px 20px" }}
              >
                <MessageCircle size={15} />
                Retomar conversa com {recent.name}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Próximo agente sugerido */}
      {nextAgent && !progressLoading && (
        <div
          className="p-5 md:p-6 mb-6 bg-white"
          style={{ borderRadius: 20, border: "1px solid #E2D9C8" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} style={{ color: "#C6A86C" }} />
            <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: "#3D6B4D" }}>
              Próximo passo
            </p>
          </div>
          <div className="flex items-center gap-4">
            <img
              src={getAgentPhotoUrl(nextAgent.agent.id) || ""}
              alt={nextAgent.agent.name}
              className="w-16 h-16 rounded-full object-cover shrink-0"
              style={{ backgroundColor: "#B6D0BE" }}
              onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-display" style={{ fontSize: 20, color: "#1C3C2C" }}>
                {nextAgent.agent.name}
              </h3>
              <p style={{ fontSize: 13, color: "#3D6B4D" }} className="line-clamp-2">
                {nextAgent.agent.role}
              </p>
            </div>
            <button
              onClick={() => navigate(`/chat/${nextAgent.agent.id}`)}
              className="shrink-0 flex items-center gap-1.5 font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#1C3C2C", color: "#fff", borderRadius: 40, fontSize: 14, padding: "10px 18px" }}
            >
              Conversar
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Atalhos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate("/projetos")}
          className="text-left p-5 bg-white transition-all hover:-translate-y-0.5"
          style={{ borderRadius: 20, border: "1px solid #E2D9C8" }}
        >
          <FolderOpen size={20} style={{ color: "#6E9876" }} />
          <h3 className="font-display mt-3" style={{ fontSize: 17, color: "#1C3C2C" }}>Meus projetos</h3>
          <p className="mt-1" style={{ fontSize: 13, color: "#3D6B4D" }}>
            {projects.length} projeto{projects.length !== 1 ? "s" : ""} ativo{projects.length !== 1 ? "s" : ""}
          </p>
        </button>

        <button
          onClick={() => setShowModal(true)}
          className="text-left p-5 bg-white transition-all hover:-translate-y-0.5"
          style={{ borderRadius: 20, border: "1px solid #E2D9C8" }}
        >
          <Plus size={20} style={{ color: "#C6A86C" }} />
          <h3 className="font-display mt-3" style={{ fontSize: 17, color: "#1C3C2C" }}>Novo projeto</h3>
          <p className="mt-1" style={{ fontSize: 13, color: "#3D6B4D" }}>
            Comece uma nova jornada com os agentes.
          </p>
        </button>

        <button
          onClick={() => navigate(`/chat/${SERENA.id}`)}
          className="text-left p-5 transition-all hover:-translate-y-0.5"
          style={{ borderRadius: 20, background: "linear-gradient(135deg, #F5F1E9 0%, #E2D9C8 100%)", border: "1px solid #E2D9C8" }}
        >
          <span className="text-xl">🧘‍♀️</span>
          <h3 className="font-display mt-2" style={{ fontSize: 17, color: "#1C3C2C" }}>Falar com a Serena</h3>
          <p className="mt-1" style={{ fontSize: 13, color: "#3D6B4D" }}>
            Apoio emocional sempre disponível.
          </p>
        </button>
      </div>

      <NewProjectModal open={showModal} onClose={() => setShowModal(false)} name={newName} setName={setNewName} desc={newDesc} setDesc={setNewDesc} creating={creating} onCreate={handleCreate} />
    </div>
  );
};

interface NewProjectModalProps {
  open: boolean;
  onClose: () => void;
  name: string;
  setName: (v: string) => void;
  desc: string;
  setDesc: (v: string) => void;
  creating: boolean;
  onCreate: () => void;
}

function NewProjectModal({ open, onClose, name, setName, desc, setDesc, creating, onCreate }: NewProjectModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-white p-8" style={{ borderRadius: 20, maxWidth: 460 }}>
        <DialogHeader>
          <DialogTitle className="font-display" style={{ fontSize: 24, color: "#1C3C2C" }}>
            Novo projeto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <label htmlFor="home-new-project-name" className="block text-sm font-medium mb-1.5" style={{ color: "#1C3C2C" }}>
              Nome do projeto *
            </label>
            <input
              id="home-new-project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Meu curso de meditação"
              className="w-full rounded-xl border px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-ring"
              style={{ fontSize: 15, borderColor: "#E2D9C8" }}
            />
          </div>
          <div>
            <label htmlFor="home-new-project-desc" className="block text-sm font-medium mb-1.5" style={{ color: "#1C3C2C" }}>
              Descrição (opcional)
            </label>
            <textarea
              id="home-new-project-desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Curso para mães que querem meditar em 5 minutos"
              rows={3}
              className="w-full rounded-xl border px-3 py-2.5 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              style={{ fontSize: 15, borderColor: "#E2D9C8" }}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 py-2.5 font-medium transition-all hover:opacity-80" style={{ color: "#3D6B4D", fontSize: 15 }}>
            Cancelar
          </button>
          <button
            onClick={onCreate}
            disabled={!name.trim() || creating}
            className="flex-1 py-2.5 font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "#1C3C2C", borderRadius: 12, fontSize: 15 }}
          >
            {creating ? "Criando..." : "Criar projeto"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default Home;
