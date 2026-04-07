import Logo from "@/components/Logo";
import { ShieldX, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const SALES_URL = import.meta.env.VITE_SALES_PAGE_URL || "https://exemplo.com/metodo";

const AcessoBloqueado = () => {
  const { signOut } = useAuth();

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 animate-fade-in"
      style={{ background: "linear-gradient(160deg, #4a5759 0%, #1e2829 100%)" }}
    >
      <div className="max-w-md w-full text-center bg-card rounded-3xl shadow-card p-10">
        <div className="flex justify-center mb-6">
          <Logo size={56} />
        </div>

        <div className="w-16 h-16 rounded-full bg-rosa/10 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="text-rosa" size={28} />
        </div>

        <h1 className="font-georgia text-xl font-bold text-foreground mb-3">
          Você ainda não tem acesso ao Método
        </h1>

        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          Para acessar os 26 agentes e iniciar sua trilha de transformação, você precisa ser aluna ativa do Método Mamãe Monetiza.
        </p>

        <a
          href={SALES_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block w-full py-3.5 rounded-pill bg-rosa text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity mb-3"
        >
          Quero me tornar aluna
        </a>

        <button
          onClick={signOut}
          className="w-full py-3 rounded-pill border border-borda text-muted-foreground font-medium text-sm hover:bg-muted/50 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut size={14} />
          Já sou aluna, entrar novamente
        </button>
      </div>
    </div>
  );
};

export default AcessoBloqueado;
