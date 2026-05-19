import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Check, Loader2, X, Mail } from "lucide-react";
import Logo from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Forgot password modal state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState("");

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // "Manter-me conectada": when unchecked, clear session on tab close
    try {
      if (!rememberMe) {
        sessionStorage.setItem("prospera_no_persist", "1");
      } else {
        sessionStorage.removeItem("prospera_no_persist");
      }
    } catch {}

    const { error } = await signIn(email, password);

    if (error) {
      setError("E-mail ou senha incorretos. Tente novamente.");
      setIsLoading(false);
      return;
    }

    navigate("/home");
  };

  const openForgot = () => {
    setForgotEmail(email);
    setForgotError("");
    setForgotSuccess(false);
    setForgotOpen(true);
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError("");

    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setForgotLoading(false);

    if (error) {
      setForgotError("Não foi possível enviar o email. Verifique o endereço e tente novamente.");
      return;
    }

    setForgotSuccess(true);
  };

  const bullets = [
    { text: "Descubra seu negócio autêntico", color: "#C6A86C" },
    { text: "Crie marca, produtos e conteúdo", color: "#6E9876" },
    { text: "Monte sua máquina de vendas automatizada", color: "#B6D0BE" },
  ];

  return (
    <div className="min-h-screen flex animate-fade-in">
      <Helmet>
        <title>Entrar | Prospera</title>
        <meta name="description" content="Acesse sua conta Prospera e continue sua trilha com os 26 agentes de IA do Método Mamãe Monetiza." />
        <link rel="canonical" href="https://prospera-mamaemonetiza.lovable.app/login" />
        <meta property="og:title" content="Entrar | Prospera" />
        <meta property="og:description" content="Acesse sua conta Prospera e continue sua trilha com os 26 agentes de IA do Método Mamãe Monetiza." />
        <meta property="og:url" content="https://prospera-mamaemonetiza.lovable.app/login" />
      </Helmet>
      {/* Left column */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #1C3C2C 0%, #0F2419 100%)",
        }}
      >
        <div
          className="absolute -top-24 -left-24 w-72 h-72 rounded-full"
          style={{ backgroundColor: "#C6A86C", opacity: 0.07 }}
        />
        <div
          className="absolute -bottom-32 -right-16 w-96 h-96 rounded-full"
          style={{ backgroundColor: "#6E9876", opacity: 0.07 }}
        />

        <div className="relative z-10 max-w-md text-center">
          <div className="mb-10">
            <Logo size={60} light />
          </div>

          <h1 className="font-display text-[42px] leading-tight mb-4 text-white">
            Seu <span className="text-4xl text-secondary">crescimento</span> começa aqui.
          </h1>

          <p className="text-[15px] mb-10 max-w-[380px] mx-auto" style={{ color: "rgba(255,255,255,0.65)" }}>
            O app do Método Mamãe Monetiza. 26 agentes de IA para te guiar do zero ao negócio que funciona de verdade.
          </p>

          <div className="space-y-4 text-left">
            {bullets.map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ color: b.color }}>
                  <Check size={14} />
                </div>
                <span className="text-white text-sm">{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md bg-card rounded-3xl shadow-card p-8 lg:p-10 animate-fade-in">
          <div className="lg:hidden flex justify-center mb-8">
            <Logo size={56} />
          </div>

          <h2 className="font-display text-[26px] text-foreground mb-1">
            Bem-vinda de volta!
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            Acesse sua trilha de transformação
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-sage-mid transition-colors"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={openForgot}
                  className="text-xs text-sage-mid hover:underline font-medium"
                >
                  Esqueceu?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-sage-mid transition-colors"
                placeholder="Sua senha"
                required
              />
            </div>

            {/* Manter-me conectada */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="peer sr-only"
              />
              <span
                className="w-[18px] h-[18px] rounded-md border-2 border-border bg-background flex items-center justify-center transition-colors peer-checked:bg-sage-dark peer-checked:border-sage-dark"
              >
                {rememberMe && <Check size={12} className="text-white" strokeWidth={3} />}
              </span>
              <span className="text-sm text-foreground">Manter-me conectada</span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-pill bg-sage-dark text-white font-semibold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar no Prospera"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Não tem acesso?{" "}
            <a href="/" className="text-warm-brown font-bold hover:underline">
              Conheça o método
            </a>
          </p>
        </div>
      </div>

      {/* Forgot password modal */}
      {forgotOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
          onClick={() => !forgotLoading && setForgotOpen(false)}
        >
          <div
            className="w-full max-w-md bg-card rounded-3xl shadow-card p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => !forgotLoading && setForgotOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Fechar"
            >
              <X size={18} className="text-muted-foreground" />
            </button>

            {forgotSuccess ? (
              <div className="text-center py-2">
                <div className="w-14 h-14 rounded-full bg-sage-pale/40 flex items-center justify-center mx-auto mb-4">
                  <Mail size={26} className="text-sage-dark" />
                </div>
                <h3 className="font-display text-[22px] text-foreground mb-2">
                  Email enviado!
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Enviamos um link para <strong className="text-foreground">{forgotEmail}</strong>.
                  Clique no link recebido para criar uma nova senha.
                </p>
                <p className="text-xs text-muted-foreground mb-6">
                  Não encontrou? Verifique sua caixa de spam ou promoções.
                </p>
                <button
                  type="button"
                  onClick={() => setForgotOpen(false)}
                  className="w-full py-3 rounded-pill bg-sage-dark text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  Entendi
                </button>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-sage-pale/40 flex items-center justify-center mb-4">
                  <Mail size={26} className="text-sage-dark" />
                </div>
                <h3 className="font-display text-[22px] text-foreground mb-2">
                  Esqueceu sua senha?
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Confirme seu email abaixo e enviaremos um link para você criar uma nova senha.
                </p>

                {forgotError && (
                  <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
                    {forgotError}
                  </div>
                )}

                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                      E-mail cadastrado
                    </label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-sage-mid transition-colors"
                      placeholder="seu@email.com"
                      required
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3.5 rounded-pill bg-sage-dark text-white font-semibold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {forgotLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar link de recuperação"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setForgotOpen(false)}
                    disabled={forgotLoading}
                    className="w-full py-3 rounded-pill text-muted-foreground font-medium text-sm hover:text-foreground transition-colors"
                  >
                    Cancelar
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
