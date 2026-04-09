import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import Logo from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const { error } = await signIn(email, password);

    if (error) {
      setError("E-mail ou senha incorretos. Tente novamente.");
      setIsLoading(false);
      return;
    }

    navigate("/home");
  };

  const bullets = [
    { text: "Descubra seu negócio autêntico", color: "#C6A86C" },
    { text: "Crie marca, produtos e conteúdo", color: "#6E9876" },
    { text: "Monte sua máquina de vendas automatizada", color: "#B6D0BE" },
  ];

  return (
    <div className="min-h-screen flex animate-fade-in">
      {/* Left column */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #1C3C2C 0%, #0F2419 100%)",
        }}
      >
        {/* Decorative circles */}
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
            <Logo size={48} light />
          </div>

          <h1 className="font-display text-[42px] leading-tight mb-4 text-white">
            Seu <span style={{ color: "#C6A86C" }}>crescimento</span> começa aqui.
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
            <Logo size={48} />
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
                <button type="button" className="text-xs text-sage-mid hover:underline font-medium">
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
    </div>
  );
};

export default Login;