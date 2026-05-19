import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, FolderOpen, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProject } from "@/hooks/useProject";
import { PHASES } from "@/data/agents";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProjectWithProgress {
  id: string;
  name: string;
  description: string | null;
  created_at: string | null;
  completedCount: number;
}

const TOTAL_AGENTS = PHASES.reduce((sum, p) => sum + p.agents.length, 0) + 1; // +1 for Serena

const LogoIcon = ({ size = 80 }: { size?: number }) => (
  <img src="/prospera-logo-claro.png" alt="Prospera" style={{ height: size, width: "auto" }} className="object-contain" />
);

const Home = () => {
  const { user } = useAuth();
  const { projects, activeProjectId, setProject, createProject, loadProjects, loading: projectsLoading } = useProject();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [projectProgress, setProjectProgress] = useState<Record<string, number>>({});
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Auto-open create modal when redirected with ?new=1 (e.g., from Trilha with no projects)
  useEffect(() => {
    if (projectsLoading) return;
    if (searchParams.get("new") === "1") {
      setShowModal(true);
      const next = new URLSearchParams(searchParams);
      next.delete("new");
      setSearchParams(next, { replace: true });
    }
  }, [projectsLoading, searchParams, setSearchParams]);

  useEffect(() => {
    if (!user || projects.length === 0) return;
    loadProgress();
  }, [user, projects]);

  async function loadProgress() {
    if (!user) return;
    const { data } = await supabase
      .from("user_progress")
      .select("agent_id, project_id")
      .eq("user_id", user.id)
      .eq("completed", true);

    const counts: Record<string, number> = {};
    data?.forEach((r) => {
      const pid = r.project_id || "__none__";
      counts[pid] = (counts[pid] || 0) + 1;
    });
    setProjectProgress(counts);
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    const result = await createProject(newName.trim(), newDesc.trim() || undefined);
    if (result) {
      setShowModal(false);
      setNewName("");
      setNewDesc("");
      navigate("/trilha");
    }
    setCreating(false);
  }

  function handleOpenProject(projectId: string) {
    setProject(projectId);
    navigate("/trilha");
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from("projects").delete().eq("id", deleteTarget.id);
    if (error) {
      toast.error("Erro ao deletar projeto");
      setDeleting(false);
      return;
    }
    if (activeProjectId === deleteTarget.id) {
      localStorage.removeItem("mamae_active_project_id");
    }
    toast.success("Projeto deletado");
    setDeleteTarget(null);
    setDeleting(false);
    await loadProjects();
    await loadProgress();
  }

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
        <LogoIcon size={72} />
        <h1
          className="font-display mt-6 text-center"
          style={{ fontSize: 34, color: "#1C3C2C" }}
        >
          Bem-vinda ao Prospera!
        </h1>
        <p
          className="text-center mt-3 leading-relaxed"
          style={{ fontSize: 16, color: "#6E9876", maxWidth: 420 }}
        >
          Vamos criar o seu primeiro projeto. Cada projeto é uma jornada completa com os {TOTAL_AGENTS} agentes.
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="mt-8 font-semibold text-white transition-all hover:opacity-90"
          style={{
            backgroundColor: "#1C3C2C",
            borderRadius: 40,
            fontSize: 16,
            padding: "14px 32px",
          }}
        >
          Criar meu primeiro projeto
        </button>

        <NewProjectModal
          open={showModal}
          onClose={() => setShowModal(false)}
          name={newName}
          setName={setNewName}
          desc={newDesc}
          setDesc={setNewDesc}
          creating={creating}
          onCreate={handleCreate}
        />
      </div>
    );
  }

  // Projects list
  return (
    <div className="p-4 md:p-8 max-w-3xl animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display" style={{ fontSize: 34, color: "#1C3C2C" }}>
          Meus projetos
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 font-semibold transition-all hover:opacity-90"
          style={{
            backgroundColor: "#C6A86C",
            color: "#1C3C2C",
            borderRadius: 40,
            fontSize: 15,
            padding: "10px 20px",
          }}
        >
          <Plus size={16} />
          Novo projeto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {projects.map((p) => {
          const done = projectProgress[p.id] || 0;
          const pct = TOTAL_AGENTS > 0 ? (done / TOTAL_AGENTS) * 100 : 0;
          const isActive = p.id === activeProjectId;

          return (
            <div
              key={p.id}
              className="group relative bg-white p-6 transition-all duration-200 hover:-translate-y-[3px]"
              style={{
                borderRadius: 20,
                border: "1px solid #E2D9C8",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTarget({ id: p.id, name: p.name });
                }}
                aria-label="Deletar projeto"
                className="absolute top-3 right-3 p-1.5 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-red-50"
                style={{ color: "#B85450" }}
              >
                <Trash2 size={16} />
              </button>

              {isActive && (
                <span
                  className="absolute top-4 font-medium"
                  style={{
                    right: 44,
                    backgroundColor: "#B6D0BE",
                    color: "#1C3C2C",
                    borderRadius: 20,
                    fontSize: 12,
                    padding: "2px 10px",
                  }}
                >
                  Ativo
                </span>
              )}

              <h2 className="font-display pr-16" style={{ fontSize: 22, color: "#1C3C2C" }}>
                {p.name}
              </h2>

              {p.description && (
                <p
                  className="mt-1 line-clamp-2"
                  style={{ fontSize: 14, color: "#6E9876" }}
                >
                  {p.description}
                </p>
              )}

              {/* Progress bar */}
              <div className="mt-4">
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: "#E2D9C8" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: "linear-gradient(90deg, #6E9876, #C6A86C)",
                    }}
                  />
                </div>
                <p className="mt-1.5" style={{ fontSize: 13, color: "#6E9876" }}>
                  {done} de {TOTAL_AGENTS} agentes concluídos
                </p>
              </div>

              <p className="mt-2" style={{ fontSize: 12, color: "#B6D0BE" }}>
                Criado em{" "}
                {p.created_at
                  ? new Date(p.created_at).toLocaleDateString("pt-BR")
                  : "-"}
              </p>

              <button
                onClick={() => handleOpenProject(p.id)}
                className="mt-4 w-full font-medium text-white transition-all hover:opacity-90"
                style={{
                  backgroundColor: "#1C3C2C",
                  borderRadius: 12,
                  fontSize: 14,
                  padding: "10px 0",
                }}
              >
                Abrir projeto
              </button>
            </div>
          );
        })}
      </div>

      <NewProjectModal
        open={showModal}
        onClose={() => setShowModal(false)}
        name={newName}
        setName={setNewName}
        desc={newDesc}
        setDesc={setNewDesc}
        creating={creating}
        onCreate={handleCreate}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && !deleting && setDeleteTarget(null)}>
        <DialogContent
          className="bg-white p-8"
          style={{ borderRadius: 20, maxWidth: 420 }}
        >
          <DialogHeader>
            <DialogTitle className="font-display" style={{ fontSize: 22, color: "#1C3C2C" }}>
              Deletar projeto
            </DialogTitle>
          </DialogHeader>
          <p className="mt-2" style={{ fontSize: 15, color: "#6E9876", lineHeight: 1.5 }}>
            Tem certeza? Isso apagará todas as conversas e o progresso deste projeto. Essa ação não pode ser desfeita.
          </p>
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
              className="flex-1 py-2.5 font-medium transition-all hover:opacity-80 disabled:opacity-50"
              style={{ color: "#6E9876", fontSize: 15 }}
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="flex-1 py-2.5 font-medium transition-all hover:opacity-90 disabled:opacity-50"
              style={{
                backgroundColor: "#FCE8E6",
                color: "#B85450",
                borderRadius: 12,
                fontSize: 15,
              }}
            >
              {deleting ? "Deletando..." : "Deletar projeto"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
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
      <DialogContent
        className="bg-white p-8"
        style={{ borderRadius: 20, maxWidth: 460 }}
      >
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
          <button
            onClick={onClose}
            className="flex-1 py-2.5 font-medium transition-all hover:opacity-80"
            style={{ color: "#6E9876", fontSize: 15 }}
          >
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
