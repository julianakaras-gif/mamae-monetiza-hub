import Logo from "@/components/Logo";
import { ShieldX } from "lucide-react";

const AcessoBloqueado = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 animate-fade-in">
      <div className="max-w-md w-full text-center bg-card rounded-3xl shadow-card p-10">
        <div className="flex justify-center mb-6">
          <Logo size={56} />
        </div>

        <div className="w-16 h-16 rounded-full bg-rosa/10 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="text-rosa" size={28} />
        </div>

        <h1 className="font-georgia text-xl font-bold text-foreground mb-3">
          Acesso não disponível
        </h1>

        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          Sua assinatura não está ativa no momento. Para acessar a plataforma e todos os agentes de IA, adquira o Método Mamãe Monetiza.
        </p>

        <a
          href="https://exemplo.com/comprar"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block w-full py-3.5 rounded-pill bg-rosa text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Quero adquirir o método
        </a>
      </div>
    </div>
  );
};

export default AcessoBloqueado;
