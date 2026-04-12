import { useState } from "react";
import { X, Eye, EyeOff, RefreshCw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function gerarSenha() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function CreateAlunaModal({ open, onClose, onSuccess }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [niche, setNiche] = useState("");
  const [instagram, setInstagram] = useState("");
  const [plan, setPlan] = useState("mensal");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (!open) return null;

  function validate() {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = "Nome é obrigatório";
    else if (fullName.trim().split(/\s+/).length < 2) errs.fullName = "Informe nome e sobrenome";
    if (!email.trim()) errs.email = "E-mail é obrigatório";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "E-mail inválido";
    if (!password) errs.password = "Senha é obrigatória";
    else if (password.length < 8) errs.password = "Mínimo 8 caracteres";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);

    const { data: { session } } = await supabase.auth.getSession();

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          niche: niche.trim() || null,
          instagram_handle: instagram.trim().replace(/^@/, "") || null,
          subscription_plan: plan,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      const msg = result.error || "Erro ao criar usuária";
      if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("existe") || msg.toLowerCase().includes("registered")) {
        setFieldErrors((p) => ({ ...p, email: "Este e-mail já está cadastrado na plataforma." }));
      } else {
        setError(msg);
      }
      setLoading(false);
      return;
    }

    toast.success("Aluna criada com sucesso!");
    resetForm();
    onClose();
    onSuccess();
    setLoading(false);
  }

  function resetForm() {
    setFullName(""); setEmail(""); setPassword(""); setPhone("");
    setNiche(""); setInstagram(""); setPlan("mensal");
    setShowPassword(false); setError(null); setFieldErrors({});
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  const inputStyle = "w-full px-3 py-2.5 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ring";
  const borderStyle = { border: "1px solid #E2D9C8" };
  const errorBorder = { border: "1px solid #ef4444" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl animate-fade-in"
        style={{ backgroundColor: "#F5F1E9" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 rounded-t-2xl" style={{ backgroundColor: "#1C3C2C" }}>
          <h2 className="font-display text-white" style={{ fontSize: 20 }}>Nova aluna</h2>
          <button onClick={handleClose} className="text-white hover:opacity-80"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
              {error}
            </div>
          )}

          {/* Nome */}
          <div>
            <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: "#6E9876" }}>Nome completo *</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputStyle} style={fieldErrors.fullName ? errorBorder : borderStyle} placeholder="Maria da Silva" />
            {fieldErrors.fullName && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{fieldErrors.fullName}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: "#6E9876" }}>E-mail *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputStyle} style={fieldErrors.email ? errorBorder : borderStyle} placeholder="aluna@email.com" />
            {fieldErrors.email && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{fieldErrors.email}</p>}
          </div>

          {/* Senha */}
          <div>
            <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: "#6E9876" }}>Senha temporária *</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputStyle + " pr-10"}
                  style={fieldErrors.password ? errorBorder : borderStyle}
                  placeholder="Mínimo 8 caracteres"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#B6D0BE" }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button
                type="button"
                onClick={() => { setPassword(gerarSenha()); setShowPassword(true); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap"
                style={{ backgroundColor: "#B6D0BE", color: "#1C3C2C" }}
              >
                <RefreshCw size={14} /> Gerar
              </button>
            </div>
            {fieldErrors.password && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{fieldErrors.password}</p>}
            <p className="text-xs mt-1.5" style={{ color: "#B6D0BE" }}>
              A aluna poderá trocar a senha ao entrar pela primeira vez em Configurações &gt; Segurança.
            </p>
          </div>

          {/* Telefone */}
          <div>
            <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: "#6E9876" }}>Telefone (WhatsApp)</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputStyle} style={borderStyle} placeholder="(11) 99999-9999" />
          </div>

          {/* Nicho */}
          <div>
            <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: "#6E9876" }}>Nicho</label>
            <input value={niche} onChange={(e) => setNiche(e.target.value)} className={inputStyle} style={borderStyle} placeholder="Ex: maternidade, finanças, artesanato..." />
          </div>

          {/* Instagram */}
          <div>
            <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: "#6E9876" }}>Instagram</label>
            <input value={instagram} onChange={(e) => setInstagram(e.target.value)} className={inputStyle} style={borderStyle} placeholder="@handle" />
          </div>

          {/* Plano */}
          <div>
            <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: "#6E9876" }}>Plano *</label>
            <select value={plan} onChange={(e) => setPlan(e.target.value)} className={inputStyle} style={borderStyle}>
              <option value="mensal">Mensal</option>
              <option value="anual">Anual</option>
              <option value="cortesia">Cortesia</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ border: "1px solid #E2D9C8", color: "#4a5759" }}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ backgroundColor: "#1C3C2C" }}
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Criando...</> : "Criar conta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
