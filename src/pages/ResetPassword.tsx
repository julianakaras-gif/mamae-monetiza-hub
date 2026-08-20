import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2, Lock, Check, Eye, EyeOff, Mail } from "lucide-react";
import Logo from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [validSession, setValidSession] = useState<boolean | null>(null);
  const [linkError, setLinkError] = useState<string>("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Resend link state
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [resendError, setResendError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      // 1) Check query string for PKCE code or errors
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const errCode =
        url.searchParams.get("error_code") ||
        new URLSearchParams(window.location.hash.replace(/^#/, "")).get("error_code");
      const errDesc =
        url.searchParams.get("error_description") ||
        new URLSearchParams(window.location.hash.replace(/^#/, "")).get("error_description");

      if (errCode) {
        setLinkError(
          errCode === "otp_expired"
            ? "Este link expirou. Solicite um novo abaixo."
            : decodeURIComponent(errDesc || "Link inválido. Solicite um novo abaixo.")
        );
        setValidSession(false);
        return;
      }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        // Clean the URL so the code can't be reused
        window.history.replaceState({}, "", window.location.pathname);
        if (cancelled) return;
        if (exchangeError) {
          setLinkError("Este link expirou ou já foi usado. Solicite um novo abaixo.");
          setValidSession(false);
          return;
        }
        setValidSession(true);
        return;
      }

      // 2) Implicit flow (hash) — Supabase SDK handles it; just check session
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session) {
        setValidSession(true);
      } else {
        setLinkError("Link inválido ou expirado. Solicite um novo abaixo.");
        setValidSession(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setValidSession(true);
      }
    });

    init();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError("Não foi possível atualizar a senha. Tente novamente.");
      return;
    }

    setSuccess(true);
    setTimeout(() => navigate("/home"), 2000);
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendError("");
    setResendLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(resendEmail, {
      redirectTo: "https://mamae-monetiza-hub.lovable.app/reset-password",
    });
    setResendLoading(false);
    if (err) {
      setResendError("Não foi possível enviar. Verifique o email e tente novamente.");
      return;
    }
    setResendSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 animate-fade-in">
      <Helmet>
        <title>Redefinir senha | Prospera</title>
        <meta name="description" content="Crie uma nova senha para acessar sua conta no Prospera." />
        <link rel="canonical" href="https://prospera-mamaemonetiza.lovable.app/reset-password" />
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="w-full max-w-md bg-card rounded-3xl shadow-card p-8 lg:p-10">
        <div className="flex justify-center mb-6">
          <Logo size={56} />
        </div>

        {validSession === null && (
          <div className="flex justify-center py-8">
            <Loader2 size={28} className="animate-spin text-sage-mid" />
          </div>
        )}

        {validSession === false && (
          <>
            <h1 className="font-display text-[24px] text-foreground mb-2 text-center">
              Link inválido ou expirado
            </h1>
            <p className="text-sm text-muted-foreground text-center mb-6">
              {linkError || "Solicite um novo link para criar sua nova senha."}
            </p>

            {resendSent ? (
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-sage-pale/40 flex items-center justify-center mx-auto mb-4">
                  <Mail size={26} className="text-sage-dark" />
                </div>
                <p className="text-sm text-foreground mb-2">
                  Enviamos um novo link para <strong>{resendEmail}</strong>.
                </p>
                <p className="text-xs text-muted-foreground mb-6">
                  Abra o email <strong>no mesmo navegador</strong> em que solicitou e clique no link em até 1 hora.
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full py-3 rounded-pill bg-sage-dark text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  Voltar para o login
                </button>
              </div>
            ) : (
              <form onSubmit={handleResend} className="space-y-4">
                {resendError && (
                  <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm">{resendError}</div>
                )}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                    Seu email
                  </label>
                  <input
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-sage-mid transition-colors"
                    placeholder="seu@email.com"
                    required
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={resendLoading}
                  className="w-full py-3.5 rounded-pill bg-sage-dark text-white font-semibold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {resendLoading ? (
                    <><Loader2 size={16} className="animate-spin" />Enviando...</>
                  ) : (
                    "Enviar novo link"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="w-full py-3 rounded-pill text-muted-foreground font-medium text-sm hover:text-foreground transition-colors"
                >
                  Voltar para o login
                </button>
              </form>
            )}
          </>
        )}

        {validSession === true && !success && (
          <>
            <div className="w-14 h-14 rounded-full bg-sage-pale/40 flex items-center justify-center mx-auto mb-4">
              <Lock size={26} className="text-sage-dark" />
            </div>
            <h1 className="font-display text-[24px] text-foreground mb-2 text-center">
              Crie sua nova senha
            </h1>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Escolha uma senha segura com no mínimo 6 caracteres.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="reset-password-new" className="block text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                  Nova senha
                </label>
                <div className="relative">
                  <input
                    id="reset-password-new"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-sage-mid transition-colors"
                    placeholder="Mínimo 6 caracteres"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="reset-password-confirm" className="block text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                  Confirme a nova senha
                </label>
                <div className="relative">
                  <input
                    id="reset-password-confirm"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-sage-mid transition-colors"
                    placeholder="Repita a senha"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-pill bg-sage-dark text-white font-semibold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar nova senha"
                )}
              </button>
            </form>
          </>
        )}

        {success && (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-sage-pale/40 flex items-center justify-center mx-auto mb-4">
              <Check size={28} className="text-sage-dark" strokeWidth={3} />
            </div>
            <h2 className="font-display text-[24px] text-foreground mb-2">
              Senha atualizada!
            </h2>
            <p className="text-sm text-muted-foreground">
              Redirecionando para o app...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
