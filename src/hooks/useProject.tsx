import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const STORAGE_KEY = "mamae_active_project_id";

interface Project {
  id: string;
  name: string;
  description: string | null;
  niche: string | null;
  target_audience: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

interface ProjectContextType {
  projects: Project[];
  activeProject: Project | null;
  activeProjectId: string | null;
  setProject: (projectId: string) => void;
  createProject: (name: string, description?: string) => Promise<Project | null>;
  loadProjects: () => Promise<void>;
  loading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(
    localStorage.getItem(STORAGE_KEY)
  );
  const [loading, setLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setProjects(data as Project[]);
      // Se o projeto ativo não existe mais, limpa e seleciona o primeiro
      if (activeProjectId && !data.find((p) => p.id === activeProjectId)) {
        localStorage.removeItem(STORAGE_KEY);
        setActiveProjectId(null);
      }
      // Auto-seleciona o primeiro projeto se nenhum estiver ativo
      if (!activeProjectId && data.length > 0) {
        localStorage.setItem(STORAGE_KEY, data[0].id);
        setActiveProjectId(data[0].id);
      }
    }
    setLoading(false);
  }, [user, activeProjectId]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  function setProject(projectId: string) {
    localStorage.setItem(STORAGE_KEY, projectId);
    setActiveProjectId(projectId);
  }

  async function createProject(name: string, description?: string) {
    if (!user) return null;
    const { data } = await supabase
      .from("projects")
      .insert({ user_id: user.id, name, description: description || null })
      .select()
      .single();

    if (data) {
      const project = data as Project;
      setProjects((prev) => [project, ...prev]);
      setProject(project.id);
      return project;
    }
    return null;
  }

  const activeProject = projects.find((p) => p.id === activeProjectId) || null;

  return (
    <ProjectContext.Provider
      value={{ projects, activeProject, activeProjectId, setProject, createProject, loadProjects, loading }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) throw new Error("useProject must be used within ProjectProvider");
  return context;
}
