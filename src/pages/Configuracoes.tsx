import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Plus } from "lucide-react";
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

const TOTAL_AGENTS = PHASES.reduce((sum, p) => sum + p.agents.length, 0);

const Configuracoes = () => {
  const { user, profile, signOut } = useAuth();
  const { projects, activeProjectId, createProject } = useProject();
  const navigate = useNavigate();

  // Section 1
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [savingPersonal, setSavingPersonal] = useState(false);

  // Section 2
  const [companyName, setCompanyName] = useState("");
  const [niche, setNiche] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [savingBusiness, setSavingBusiness] = useState(false);

  // Section 3
  const [projectProgress, setProjectProgress] = useState<Record<string, number>>({});
  const [showNewProject, setShowNewProject] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);

  // Section 4
  const [showCancel, setShowCancel] = useState(false);

  // Section 5
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhone((profile as any).phone || "");
      setInstagram((profile as any).instagram_handle || "");
      setCompanyName((profile as any).company_name || "");
      setNiche((profile as any).niche || "");
      setTargetAudience((profile as any).target_audience || "");
    }
  }, [profile]);

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

  async function savePersonal() {
    if (!user || !name.trim()) return;
    setSavingPersonal(true);
    await supabase.from("profiles").update({
      name: name.trim(),
      phone: phone.trim() || null,
      instagram_handle: instagram.trim() || null,
    }).eq("id", user.id);
    toast.success("Dados salvos com sucesso.");
    setSavingPersonal(false);
  }

  async function saveBusiness() {
    if (!user) return;
    setSavingBusiness(true);
    await supabase.from("profiles").update({
      company_name: companyName.trim() || null,
      niche: niche.trim() || null,
      target_audience: targetAudience.trim() || null,
    }).eq("id", user.id);
    toast.success("Dados do negócio salvos.");
    setSavingBusiness(false);
  }

  async function handleChangePassword() {
    setPasswordError("");
    if (newPassword.length < 8) {
      setPasswordError("A senha deve ter no mínimo 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não coincidem.");
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordError("Erro ao alterar senha. Tente novamente.");
    } else {
      toast.success("Senha alterada com sucesso.");
      setNewPassword("");
      setConfirmPassword("");
    }
    setSavingPassword(false);
  }

  async function handleCreateProject() {
    if (!newName.trim()) return;
    setCreating(true);
    const result = await createProject(newName.trim(), newDesc.trim() || undefined);
    if (result) {
      setShowNewProject(false);
      setNewName("");
      setNewDesc("");
    }
    setCreating(false);
  }

  async function handleLogout() {
    await signOut();
    navigate("/login");
  }

  function handleCancelPlan() {
    const url = import.meta.env.VITE_HOTMART_CANCEL_URL;
    if (url) window.open(url, "_blank");
    setShowCancel(false);
  }

  const planLabel = (profile as any)?.subscription_plan || "Mensal";
  const isActive = profile?.subscription_status === "active";

  const cardStyle = "bg-white rounded-2xl p-7 mb-5";
  const cardBorder = { border: "1px solid #E2D9C8" };
  const labelStyle = "block text-xs uppercase tracking-widest mb-1.5";
  const inputStyle = "w-full rounded-xl border px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto animate-fade-in" style={{ backgroundColor: "#F5F1E9", minHeight: "100vh" }}>
      <h1 className="font-display" style={{ fontSize: 32, color: "#1C3C2C" }}>Configurações</h1>
      <p className="mb-8" style={{ fontSize: 15, color: "#6E9876" }}>
        Gerencie sua conta, seus dados e seu plano.
      </p>

      {/* SEÇÃO 1 - Dados pessoais */}
      <div className={cardStyle} style={cardBorder}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display" style={{ fontSize: 20, color: "#1C3C2C" }}>Dados pessoais</h2>
          <button
            onClick={savePersonal}
            disabled={savingPersonal}
            className="font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "#1C3C2C", borderRadius: 12, fontSize: 14, padding: "8px 18px" }}
          >
            {savingPersonal ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className={labelStyle} style={{ color: "#6E9876", fontSize: 12 }}>Nome completo *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputStyle} style={{ fontSize: 15, borderColor: "#E2D9C8" }} />
          </div>
          <div>
            <label className={labelStyle} style={{ color: "#6E9876", fontSize: 12 }}>Email</label>
            <input value={profile?.email || ""} readOnly className={inputStyle} style={{ fontSize: 15, borderColor: "#E2D9C8", color: "#B6D0BE" }} />
          </div>
          <div>
            <label className={labelStyle} style={{ color: "#6E9876", fontSize: 12 }}>Telefone / WhatsApp</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputStyle} style={{ fontSize: 15, borderColor: "#E2D9C8" }} />
          </div>
          <div>
            <label className={labelStyle} style={{ color: "#6E9876", fontSize: 12 }}>Instagram</label>
            <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@seuperfil" className={inputStyle} style={{ fontSize: 15, borderColor: "#E2D9C8" }} />
          </div>
        </div>
      </div>

      {/* SEÇÃO 2 - Dados do negócio */}
      <div className={cardStyle} style={cardBorder}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display" style={{ fontSize: 20, color: "#1C3C2C" }}>Dados do negócio</h2>
          <button
            onClick={saveBusiness}
            disabled={savingBusiness}
            className="font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "#1C3C2C", borderRadius: 12, fontSize: 14, padding: "8px 18px" }}
          >
            {savingBusiness ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
        <div className="rounded-lg p-3 mb-5" style={{ backgroundColor: "rgba(182,208,190,0.25)", borderRadius: 8 }}>
          <p style={{ fontSize: 13, color: "#3A5C46" }}>
            Essas informações são usadas pelos agentes de conteúdo para personalizar os resultados sem você precisar repetir.
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <label className={labelStyle} style={{ color: "#6E9876", fontSize: 12 }}>Nome da empresa / marca</label>
            <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputStyle} style={{ fontSize: 15, borderColor: "#E2D9C8" }} />
          </div>
          <div>
            <label className={labelStyle} style={{ color: "#6E9876", fontSize: 12 }}>Nicho principal</label>
            <input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="Ex: coaching, artesanato, educação infantil" className={inputStyle} style={{ fontSize: 15, borderColor: "#E2D9C8" }} />
          </div>
          <div>
            <label className={labelStyle} style={{ color: "#6E9876", fontSize: 12 }}>Público-alvo</label>
            <textarea
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="Descreva sua cliente ideal em 1 ou 2 frases"
              rows={3}
              className={`${inputStyle} resize-none`}
              style={{ fontSize: 15, borderColor: "#E2D9C8" }}
            />
          </div>
        </div>
      </div>

      {/* SEÇÃO 3 - Meus projetos */}
      <div className={cardStyle} style={cardBorder}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display" style={{ fontSize: 20, color: "#1C3C2C" }}>Meus projetos</h2>
          <button
            onClick={() => navigate("/home")}
            className="font-medium transition-all hover:opacity-80"
            style={{ border: "1px solid #E2D9C8", borderRadius: 12, fontSize: 14, padding: "8px 18px", color: "#1C3C2C", backgroundColor: "transparent" }}
          >
            Ir para projetos
          </button>
        </div>
        <div className="space-y-0">
          {projects.map((project, idx) => (
            <div key={project.id}>
              <div className="py-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold" style={{ fontSize: 15, color: "#1C3C2C" }}>{project.name}</span>
                  {project.id === activeProjectId && (
                    <span className="px-2 py-0.5 font-medium" style={{ backgroundColor: "#B6D0BE", color: "#1C3C2C", borderRadius: 20, fontSize: 11 }}>
                      Ativo
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 13, color: "#6E9876" }}>
                  {projectProgress[project.id] || 0} de {TOTAL_AGENTS} agentes concluídos
                </p>
                <p style={{ fontSize: 12, color: "#B6D0BE" }}>
                  Criado em {project.created_at ? new Date(project.created_at).toLocaleDateString("pt-BR") : "..."}
                </p>
              </div>
              {idx < projects.length - 1 && <div style={{ borderTop: "1px solid #E2D9C8" }} />}
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowNewProject(true)}
          className="flex items-center gap-2 mt-4 font-medium transition-all hover:opacity-80"
          style={{ color: "#3A5C46", fontSize: 14 }}
        >
          <Plus size={16} /> Criar novo projeto
        </button>
      </div>

      {/* SEÇÃO 4 - Meu plano */}
      <div className={cardStyle} style={cardBorder}>
        <h2 className="font-display mb-4" style={{ fontSize: 20, color: "#1C3C2C" }}>Meu plano</h2>
        <div className="flex items-center gap-3 mb-4">
          <span className="font-display" style={{ fontSize: 24, color: "#1C3C2C" }}>{planLabel}</span>
          {isActive && (
            <span className="px-2 py-0.5 font-medium" style={{ backgroundColor: "#B6D0BE", color: "#1C3C2C", borderRadius: 20, fontSize: 11 }}>
              Ativo
            </span>
          )}
        </div>
        <p className="mb-4" style={{ fontSize: 13, color: "#6E9876" }}>
          Cadastrado em {profile ? new Date((profile as any).created_at).toLocaleDateString("pt-BR") : "..."}
        </p>
        <ul className="space-y-2 mb-6">
          {[
            "Acesso a todos os 26 agentes",
            "Trilha completa de 6 fases",
            "Histórico de conversas salvo por projeto",
            "Serena disponível a qualquer momento",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2" style={{ fontSize: 15, color: "#1C3C2C" }}>
              <Check size={16} style={{ color: "#6E9876" }} /> {item}
            </li>
          ))}
        </ul>
        <button
          onClick={() => setShowCancel(true)}
          className="font-medium transition-all hover:opacity-80"
          style={{ border: "1px solid #E2D9C8", borderRadius: 12, fontSize: 14, padding: "10px 20px", color: "#7A5535", backgroundColor: "transparent" }}
        >
          Cancelar meu plano
        </button>
      </div>

      {/* SEÇÃO 5 - Segurança */}
      <div className={cardStyle} style={cardBorder}>
        <h2 className="font-display mb-4" style={{ fontSize: 20, color: "#1C3C2C" }}>Segurança</h2>
        <p className="mb-3 font-medium" style={{ fontSize: 15, color: "#1C3C2C" }}>Alterar senha</p>
        <div className="space-y-3 max-w-sm">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nova senha"
            className={inputStyle}
            style={{ fontSize: 15, borderColor: "#E2D9C8" }}
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirmar nova senha"
            className={inputStyle}
            style={{ fontSize: 15, borderColor: "#E2D9C8" }}
          />
          {passwordError && <p style={{ fontSize: 13, color: "#7A5535" }}>{passwordError}</p>}
          <button
            onClick={handleChangePassword}
            disabled={savingPassword}
            className="font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "#3A5C46", borderRadius: 12, fontSize: 14, padding: "8px 18px" }}
          >
            {savingPassword ? "Alterando..." : "Alterar senha"}
          </button>
        </div>
      </div>

      {/* RODAPÉ */}
      <div className="mt-4 mb-10">
        <button
          onClick={handleLogout}
          className="font-medium transition-all hover:opacity-80"
          style={{ border: "1px solid #E2D9C8", borderRadius: 12, fontSize: 15, padding: "10px 24px", color: "#3A5C46", backgroundColor: "transparent" }}
        >
          Sair da conta
        </button>
      </div>

      {/* Modal novo projeto */}
      <Dialog open={showNewProject} onOpenChange={(v) => !v && setShowNewProject(false)}>
        <DialogContent className="bg-white p-8" style={{ borderRadius: 20, maxWidth: 460 }}>
          <DialogHeader>
            <DialogTitle className="font-display" style={{ fontSize: 24, color: "#1C3C2C" }}>Novo projeto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#1C3C2C" }}>Nome do projeto *</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Meu curso de meditação" className={inputStyle} style={{ fontSize: 15, borderColor: "#E2D9C8" }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#1C3C2C" }}>Descrição (opcional)</label>
              <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Curso para mães que querem meditar" rows={3} className={`${inputStyle} resize-none`} style={{ fontSize: 15, borderColor: "#E2D9C8" }} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowNewProject(false)} className="flex-1 py-2.5 font-medium" style={{ color: "#6E9876", fontSize: 15 }}>Cancelar</button>
            <button onClick={handleCreateProject} disabled={!newName.trim() || creating} className="flex-1 py-2.5 font-medium text-white disabled:opacity-50" style={{ backgroundColor: "#1C3C2C", borderRadius: 12, fontSize: 15 }}>
              {creating ? "Criando..." : "Criar projeto"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal cancelamento */}
      <Dialog open={showCancel} onOpenChange={(v) => !v && setShowCancel(false)}>
        <DialogContent className="bg-white" style={{ borderRadius: 20, padding: 32, maxWidth: 460 }}>
          <DialogHeader>
            <DialogTitle className="font-display" style={{ fontSize: 22, color: "#1C3C2C" }}>Tem certeza?</DialogTitle>
          </DialogHeader>
          <p className="mt-2" style={{ fontSize: 15, color: "#1C3C2C" }}>
            Ao cancelar, você perde acesso no final do período pago. Seu progresso e histórico ficam salvos.
          </p>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowCancel(false)} className="flex-1 py-2.5 font-medium text-white" style={{ backgroundColor: "#1C3C2C", borderRadius: 12, fontSize: 15 }}>
              Manter meu plano
            </button>
            <button onClick={handleCancelPlan} className="flex-1 py-2.5 font-medium text-white" style={{ backgroundColor: "#7A5535", borderRadius: 12, fontSize: 15 }}>
              Quero cancelar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Configuracoes;
