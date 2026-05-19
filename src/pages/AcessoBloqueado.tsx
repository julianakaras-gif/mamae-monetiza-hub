import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import { ShieldX, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AcessoBloqueado = () => {
  const navigate = useNavigate();

  const handleJaSouAluna = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 animate-fade-in"
      style={{ background: "linear-gradient(160deg, #1C3C2C 0%, #0F2419 100%)" }}
    >
      <div className="max-w-md w-full text-center bg-card rounded-3xl shadow-card p-10">
        <div className="flex justify-center mb-6">
          <Logo size={48} />
        </div>

        <div className="w-16 h-16 rounded-full bg-warm-brown/10 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="text-warm-brown" size={28} />
        </div>

        <h1 className="font-display text-xl text-foreground mb-3">
          Você ainda não tem acesso ao Prospera
        </h1>

        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          Sua conta ainda não foi liberada. Entre em contato com a equipe do Método Mamãe Monetiza para liberar seu acesso aos 26 agentes.
        </p>

        <button
          onClick={handleJaSouAluna}
          className="w-full py-3 rounded-pill border border-border text-muted-foreground font-medium text-sm hover:bg-muted/50 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut size={14} />
          Já sou aluna, entrar novamente
        </button>
      </div>
    </div>
  );
};

export default AcessoBloqueado;