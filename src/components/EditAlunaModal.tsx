import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AlunaData {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  instagram_handle: string | null;
  niche: string | null;
  target_audience: string | null;
  subscription_plan: string | null;
  subscription_status: string;
}

interface Props {
  open: boolean;
  aluna: AlunaData | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditAlunaModal({ open, aluna, onClose, onSuccess }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [niche, setNiche] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [plan, setPlan] = useState("mensal");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (aluna) {
      setName(aluna.name || "");
      setPhone(aluna.phone || "");
      setInstagram(aluna.instagram_handle || "");
      setNiche(aluna.niche || "");
      setTargetAudience(aluna.target_audience || "");
      setPlan(aluna.subscription_plan || "mensal");
      setStatus(aluna.subscription_status || "active");
    }
  }, [aluna]);

  if (!open || !aluna) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!aluna) return;
    setLoading(true);

    const { error } = await (supabase as any)
      .from("profiles")
      .update({
        name: name.trim() || null,
        phone: phone.trim() || null,
        instagram_handle: instagram.trim().replace(/^@/, "") || null,
        niche: niche.trim() || null,
        target_audience: targetAudience.trim() || null,
        subscription_plan: plan,
        subscription_status: status,
      })
      .eq("id", aluna.id);

    setLoading(false);

    if (error) {
      toast.error("Erro ao salvar: " + error.message);
      return;
    }

    toast.success("Dados atualizados!");
    onClose();
    onSuccess();
  }

  const inputStyle = "w-full px-3 py-2.5 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ring";
  const borderStyle = { border: "1px solid #E2D9C8" };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl animate-fade-in"
        style={{ backgroundColor: "#F5F1E9" }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 rounded-t-2xl" style={{ backgroundColor: "#1C3C2C" }}>
          <h2 className="font-display text-white" style={{ fontSize: 20 }}>Editar aluna</h2>
          <button onClick={onClose} className="text-white hover:opacity-80"><X size={20} /></button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: "#3D6B4D" }}>E-mail (não editável)</label>
            <input value={aluna.email || ""} disabled className={inputStyle + " opacity-60"} style={borderStyle} />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: "#3D6B4D" }}>Nome completo</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputStyle} style={borderStyle} />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: "#3D6B4D" }}>Telefone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputStyle} style={borderStyle} placeholder="(11) 99999-9999" />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: "#3D6B4D" }}>Instagram</label>
            <input value={instagram} onChange={(e) => setInstagram(e.target.value)} className={inputStyle} style={borderStyle} placeholder="@handle" />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: "#3D6B4D" }}>Nicho</label>
            <input value={niche} onChange={(e) => setNiche(e.target.value)} className={inputStyle} style={borderStyle} />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: "#3D6B4D" }}>Público-alvo</label>
            <textarea value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} rows={2} className={inputStyle + " resize-none"} style={borderStyle} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: "#3D6B4D" }}>Plano</label>
              <select value={plan} onChange={(e) => setPlan(e.target.value)} className={inputStyle} style={borderStyle}>
                <option value="mensal">Mensal</option>
                <option value="anual">Anual</option>
                <option value="cortesia">Cortesia</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: "#3D6B4D" }}>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputStyle} style={borderStyle}>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ border: "1px solid #E2D9C8", color: "#4a5759" }}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ backgroundColor: "#1C3C2C" }}
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Salvando...</> : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
