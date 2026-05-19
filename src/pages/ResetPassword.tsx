import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2, Lock, Check } from "lucide-react";
import Logo from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [validSession, setValidSession] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // When user clicks the recovery email link, Supabase sets a recovery session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setValidSession(true);
      }
    });

    // Also check existing session (the link sets it on load)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setValidSession(!!session);
    });

    return () => subscription.unsubscribe();
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

        {validSession === false && (
          <>
            <h1 className="font-display text-[24px] text-foreground mb-2 text-center">
              Link inválido ou expirado
            </h1>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Este link de recuperação não é mais válido. Solicite um novo link na tela de login.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3.5 rounded-pill bg-sage-dark text-white font-semibold text-[15px] hover:opacity-90 transition-opacity"
            >
              Voltar para o login
            </button>
          </>
        )}

        {validSession === null && (
          <div className="flex justify-center py-8">
            <Loader2 size={28} className="animate-spin text-sage-mid" />
          </div>
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
                <input
                  id="reset-password-new"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-sage-mid transition-colors"
                  placeholder="Mínimo 6 caracteres"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="reset-password-confirm" className="block text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                  Confirme a nova senha
                </label>
                <input
                  id="reset-password-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-sage-mid transition-colors"
                  placeholder="Repita a senha"
                  required
                />
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
