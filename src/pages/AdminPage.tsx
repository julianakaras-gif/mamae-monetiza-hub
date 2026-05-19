import { useState, useEffect, useMemo } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { PHASES } from "@/data/agents";
import { ArrowLeft, Search, ChevronUp, ChevronDown, Users, FolderOpen, CheckCircle, Activity, X, UserPlus, Pencil } from "lucide-react";
import CreateAlunaModal from "@/components/CreateAlunaModal";
import EditAlunaModal from "@/components/EditAlunaModal";

const ALL_AGENTS = PHASES.flatMap((p) => p.agents);
const TOTAL_AGENTS = ALL_AGENTS.length;

type SortKey = "name" | "created_at" | "progress";
type SortDir = "asc" | "desc";

interface Aluna {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  instagram_handle: string | null;
  niche: string | null;
  target_audience: string | null;
  subscription_plan: string | null;
  subscription_status: string;
  created_at: string;
  projects: { id: string; name: string; created_at: string | null }[];
  progress: { agent_id: string; completed: boolean }[];
}

const AdminPage = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const [alunas, setAlunas] = useState<Aluna[]>([]);
  const [sessions30d, setSessions30d] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedAluna, setSelectedAluna] = useState<Aluna | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editAluna, setEditAluna] = useState<Aluna | null>(null);

  useEffect(() => {
    if (isAdmin) loadData();
  }, [isAdmin]);

  async function loadData() {
    setLoading(true);

    const { data: profiles } = await (supabase
      .from("profiles")
      .select("id, name, email, phone, instagram_handle, niche, target_audience, subscription_plan, subscription_status, created_at") as any)
      .eq("is_admin", false)
      .order("created_at", { ascending: false });

    const { data: projects } = await supabase
      .from("projects")
      .select("id, name, created_at, user_id");

    const { data: progress } = await supabase
      .from("user_progress")
      .select("user_id, agent_id, completed");

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { data: recentSessions } = await supabase
      .from("agent_sessions")
      .select("user_id")
      .gte("started_at", thirtyDaysAgo.toISOString());

    const activeUsers = new Set((recentSessions || []).map((s) => s.user_id));
    setSessions30d(activeUsers);

    const mapped: Aluna[] = (profiles || []).map((p) => ({
      ...p,
      projects: (projects || []).filter((pr) => pr.user_id === p.id).map(({ id, name, created_at }) => ({ id, name, created_at })),
      progress: (progress || []).filter((pr) => pr.user_id === p.id),
    }));

    setAlunas(mapped);
    setLoading(false);
  }

  const filtered = useMemo(() => {
    let list = alunas;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          (a.name || "").toLowerCase().includes(q) ||
          (a.email || "").toLowerCase().includes(q) ||
          (a.niche || "").toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = (a.name || "").localeCompare(b.name || "");
      else if (sortKey === "created_at") cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      else if (sortKey === "progress") {
        const pa = a.progress.filter((p) => p.completed).length;
        const pb = b.progress.filter((p) => p.completed).length;
        cmp = pa - pb;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [alunas, search, sortKey, sortDir]);

  const totalProjects = alunas.reduce((s, a) => s + a.projects.length, 0);
  const totalDone = alunas.reduce((s, a) => s + a.progress.filter((p) => p.completed).length, 0);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return null;
    return sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  }

  function progressPercent(a: Aluna) {
    return Math.round((a.progress.filter((p) => p.completed).length / TOTAL_AGENTS) * 100);
  }

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F5F1E9" }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#6E9876", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/trilha" replace />;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F1E9" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#1C3C2C" }} className="px-6 py-5 md:px-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display text-white" style={{ fontSize: 28 }}>Painel Admin - Prospera</h1>
            <p style={{ fontSize: 14, color: "#B6D0BE" }}>
              {alunas.length} aluna{alunas.length !== 1 ? "s" : ""} cadastrada{alunas.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#6E9876" }}
            >
              <UserPlus size={16} /> Nova aluna
            </button>
            <button
              onClick={() => navigate("/trilha")}
              className="flex items-center gap-2 text-white font-medium transition-opacity hover:opacity-80"
              style={{ fontSize: 14 }}
            >
              <ArrowLeft size={16} /> Voltar ao app
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total de alunas", value: alunas.length, icon: Users },
            { label: "Projetos criados", value: totalProjects, icon: FolderOpen },
            { label: "Agentes concluídos", value: totalDone, icon: CheckCircle },
            { label: "Ativas (30 dias)", value: sessions30d.size, icon: Activity },
          ].map((c) => (
            <div
              key={c.label}
              className="bg-white rounded-2xl p-5"
              style={{ border: "1px solid #E2D9C8", borderLeft: "4px solid #C6A86C" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <c.icon size={18} style={{ color: "#6E9876" }} />
                <span style={{ fontSize: 12, color: "#6E9876" }} className="uppercase tracking-widest">{c.label}</span>
              </div>
              <p className="font-display" style={{ fontSize: 28, color: "#1C3C2C" }}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#B6D0BE" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail ou nicho..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-ring"
            style={{ fontSize: 15, border: "1px solid #E2D9C8" }}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#6E9876", borderTopColor: "transparent" }} />
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #E2D9C8" }}>
              <table className="w-full text-left" style={{ fontSize: 14 }}>
                <thead>
                  <tr style={{ backgroundColor: "#1C3C2C", color: "#fff" }}>
                    {[
                      { label: "Nome", key: "name" as SortKey },
                      { label: "E-mail", key: null },
                      { label: "Instagram", key: null },
                      { label: "Nicho", key: null },
                      { label: "Plano", key: null },
                      { label: "Projetos", key: null },
                      { label: "Progresso", key: "progress" as SortKey },
                      { label: "Cadastro", key: "created_at" as SortKey },
                    ].map((col) => (
                      <th
                        key={col.label}
                        className={`px-4 py-3 font-medium ${col.key ? "cursor-pointer select-none" : ""}`}
                        onClick={col.key ? () => toggleSort(col.key!) : undefined}
                      >
                        <span className="flex items-center gap-1">
                          {col.label}
                          {col.key && <SortIcon col={col.key} />}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => {
                    const pct = progressPercent(a);
                    return (
                      <tr
                        key={a.id}
                        className="cursor-pointer transition-colors"
                        style={{ borderBottom: "1px solid #E2D9C8" }}
                        onClick={() => setSelectedAluna(a)}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(182,208,190,0.2)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                      >
                        <td className="px-4 py-3 font-medium" style={{ color: "#1C3C2C" }}>{a.name || "-"}</td>
                        <td className="px-4 py-3" style={{ color: "#4a5759" }}>{a.email || "-"}</td>
                        <td className="px-4 py-3">
                          {a.instagram_handle ? (
                            <a
                              href={`https://instagram.com/${a.instagram_handle.replace("@", "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                              style={{ color: "#3A5C46" }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              @{a.instagram_handle.replace("@", "")}
                            </a>
                          ) : "-"}
                        </td>
                        <td className="px-4 py-3" style={{ color: "#4a5759" }}>{a.niche || "-"}</td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: a.subscription_status === "active" ? "#B6D0BE" : "#E2D9C8",
                              color: a.subscription_status === "active" ? "#1C3C2C" : "#7A5535",
                            }}
                          >
                            {a.subscription_plan || "Sem plano"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">{a.projects.length}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(182,208,190,0.3)" }}>
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #6E9876, #C6A86C)" }} />
                            </div>
                            <span className="text-xs font-medium" style={{ color: "#3A5C46", minWidth: 32 }}>{pct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3" style={{ color: "#4a5759" }}>
                          {new Date(a.created_at).toLocaleDateString("pt-BR")}
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} className="text-center py-10" style={{ color: "#B6D0BE" }}>Nenhuma aluna encontrada.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {filtered.map((a) => {
                const pct = progressPercent(a);
                return (
                  <div
                    key={a.id}
                    className="bg-white rounded-2xl p-4 cursor-pointer"
                    style={{ border: "1px solid #E2D9C8" }}
                    onClick={() => setSelectedAluna(a)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium" style={{ color: "#1C3C2C", fontSize: 15 }}>{a.name || "-"}</p>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: a.subscription_status === "active" ? "#B6D0BE" : "#E2D9C8",
                          color: a.subscription_status === "active" ? "#1C3C2C" : "#7A5535",
                        }}
                      >
                        {a.subscription_plan || "Sem plano"}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: "#6E9876" }}>{a.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(182,208,190,0.3)" }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #6E9876, #C6A86C)" }} />
                      </div>
                      <span className="text-xs font-medium" style={{ color: "#3A5C46" }}>{pct}%</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2" style={{ fontSize: 12, color: "#B6D0BE" }}>
                      <span>{a.projects.length} projeto{a.projects.length !== 1 ? "s" : ""}</span>
                      <span>{new Date(a.created_at).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Detail drawer */}
      {selectedAluna && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedAluna(null)} />
          <div
            className="relative w-full max-w-md h-full overflow-y-auto animate-fade-in"
            style={{ backgroundColor: "#F5F1E9" }}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between p-5" style={{ backgroundColor: "#1C3C2C" }}>
              <h2 className="font-display text-white" style={{ fontSize: 20 }}>{selectedAluna.name || "Sem nome"}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditAluna(selectedAluna)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#6E9876" }}
                >
                  <Pencil size={14} /> Editar
                </button>
                <button onClick={() => setSelectedAluna(null)} className="text-white hover:opacity-80"><X size={20} /></button>
              </div>
            </div>
            <div className="p-5 space-y-5">
              {/* Info */}
              <div className="bg-white rounded-2xl p-5 space-y-3" style={{ border: "1px solid #E2D9C8" }}>
                <Info label="E-mail" value={selectedAluna.email} />
                <Info label="Telefone" value={selectedAluna.phone} />
                <Info label="Instagram" value={selectedAluna.instagram_handle ? `@${selectedAluna.instagram_handle.replace("@", "")}` : null} link={selectedAluna.instagram_handle ? `https://instagram.com/${selectedAluna.instagram_handle.replace("@", "")}` : undefined} />
                <Info label="Nicho" value={selectedAluna.niche} />
                <Info label="Público-alvo" value={selectedAluna.target_audience} />
                <Info label="Plano" value={selectedAluna.subscription_plan || "Sem plano"} />
                <Info label="Cadastro" value={new Date(selectedAluna.created_at).toLocaleDateString("pt-BR")} />
              </div>

              {/* Projects */}
              <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E2D9C8" }}>
                <h3 className="font-display mb-3" style={{ fontSize: 16, color: "#1C3C2C" }}>
                  Projetos ({selectedAluna.projects.length})
                </h3>
                {selectedAluna.projects.length === 0 ? (
                  <p style={{ fontSize: 13, color: "#B6D0BE" }}>Nenhum projeto criado.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedAluna.projects.map((pr) => (
                      <div key={pr.id} className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid #E2D9C8" }}>
                        <span style={{ fontSize: 14, color: "#1C3C2C" }}>{pr.name}</span>
                        <span style={{ fontSize: 12, color: "#B6D0BE" }}>
                          {pr.created_at ? new Date(pr.created_at).toLocaleDateString("pt-BR") : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Agent progress */}
              <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E2D9C8" }}>
                <h3 className="font-display mb-3" style={{ fontSize: 16, color: "#1C3C2C" }}>
                  Progresso por agente ({selectedAluna.progress.filter((p) => p.completed).length}/{TOTAL_AGENTS})
                </h3>
                {PHASES.map((phase) => (
                  <div key={phase.id} className="mb-3">
                    <p className="font-medium mb-1" style={{ fontSize: 13, color: "#6E9876" }}>
                      {phase.emoji} {phase.name}
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {phase.agents.map((ag) => {
                        const done = selectedAluna.progress.some((p) => p.agent_id === ag.id && p.completed);
                        const started = selectedAluna.progress.some((p) => p.agent_id === ag.id && !p.completed);
                        return (
                          <div key={ag.id} className="flex items-center gap-1.5 py-0.5" style={{ fontSize: 13 }}>
                            <span>{done ? "✓" : started ? "⏳" : "○"}</span>
                            <span style={{ color: done ? "#3A5C46" : "#B6D0BE" }}>{ag.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <CreateAlunaModal open={modalOpen} onClose={() => setModalOpen(false)} onSuccess={loadData} />
      <EditAlunaModal
        open={!!editAluna}
        aluna={editAluna}
        onClose={() => setEditAluna(null)}
        onSuccess={async () => {
          await loadData();
          if (editAluna) {
            // refresh selected drawer with new data
            const updated = (await (supabase
              .from("profiles")
              .select("id, name, email, phone, instagram_handle, niche, target_audience, subscription_plan, subscription_status, created_at") as any)
              .eq("id", editAluna.id)
              .single()).data;
            if (updated && selectedAluna) {
              setSelectedAluna({ ...selectedAluna, ...updated });
            }
          }
        }}
      />
    </div>
  );
};

function Info({ label, value, link }: { label: string; value: string | null; link?: string }) {
  return (
    <div>
      <span className="text-xs uppercase tracking-widest" style={{ color: "#6E9876" }}>{label}</span>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="block hover:underline" style={{ fontSize: 15, color: "#3A5C46" }}>
          {value}
        </a>
      ) : (
        <p style={{ fontSize: 15, color: value ? "#1C3C2C" : "#B6D0BE" }}>{value || "Não preenchido"}</p>
      )}
    </div>
  );
}

export default AdminPage;
