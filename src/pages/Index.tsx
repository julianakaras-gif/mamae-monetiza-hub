import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, LockOpen, Check, X, ChevronDown } from "lucide-react";
import Logo from "@/components/Logo";
import { PHASES } from "@/data/agents";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* ─── helpers ─── */
const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

const salesUrl = () => import.meta.env.VITE_SALES_PAGE_URL as string | undefined;

const handleBuy = () => {
  const url = salesUrl();
  if (url) {
    window.open(url, "_blank");
  } else {
    toast("Link de compra em breve");
  }
};

/* ─── intersection observer animation hook ─── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("animate-fade-in");
          el.classList.remove("opacity-0");
          obs.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`opacity-0 ${className}`}>
      {children}
    </div>
  );
}

/* ─── Navbar ─── */
function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? "hsl(186 11% 31%)" : "transparent",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.2)" : "none",
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Logo size={48} light />
        <button
          onClick={() => navigate("/login")}
          className="px-5 py-2 rounded-full border border-white/60 text-white text-sm font-medium hover:bg-white/10 transition-colors"
          aria-label="Ir para login"
        >
          Já sou aluna
        </button>
      </div>
    </nav>
  );
}

/* ─── Section 1: Hero ─── */
function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(160deg, #4a5759 0%, #2a3f41 100%)" }}
    >
      {/* decorative circles */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full" style={{ backgroundColor: "#df437d", opacity: 0.06 }} />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full" style={{ backgroundColor: "#29a6ab", opacity: 0.06 }} />

      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto pt-24 pb-16">
        <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-8" style={{ backgroundColor: "rgba(223,67,125,0.2)", color: "#f4a0bf" }}>
          26 agentes de IA especializados
        </span>

        <h1 className="font-georgia text-[32px] md:text-[48px] font-bold leading-[1.2] text-white mb-6">
          Seu negócio digital. Construído com inteligência. Do jeito de mãe.
        </h1>

        <p className="font-raleway text-lg text-white/70 max-w-[560px] mx-auto mb-10">
          O Método Mamãe Monetiza coloca 26 agentes de IA ao seu lado para te guiar do zero ao negócio digital que funciona de verdade: respeitando seu tempo, sua família e a sua energia.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <button
            onClick={() => scrollTo("precos")}
            className="px-8 py-4 rounded-[40px] text-white font-bold text-base hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#df437d" }}
            aria-label="Ver preços"
          >
            Quero começar agora
          </button>
          <button
            onClick={() => scrollTo("para-quem")}
            className="px-8 py-4 rounded-[40px] border border-white/60 text-white font-medium text-base hover:bg-white/10 transition-colors"
            aria-label="Ver como funciona"
          >
            Ver como funciona
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm" style={{ color: "#29a6ab" }}>
          <LockOpen size={16} />
          <span className="text-white/50">Acesso imediato após a compra</span>
        </div>
      </div>

      <button
        onClick={() => scrollTo("para-quem")}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 animate-bounce"
        aria-label="Rolar para baixo"
      >
        <ChevronDown size={28} />
      </button>
    </section>
  );
}

/* ─── Section 2: Para quem é ─── */
function ParaQuem() {
  const cards = [
    { emoji: "🌀", text: "Já tentou ChatGPT, mas fica rodando em círculos sem saber o que perguntar ou para onde ir", border: "#df437d" },
    { emoji: "⏰", text: "Tem 1 ou 2 horas por dia no máximo e não pode desperdiçar nenhuma delas no negócio errado", border: "#29a6ab" },
    { emoji: "💡", text: "Sabe que tem um talento para oferecer, mas ainda não descobriu como transformar isso em renda real", border: "#ebc780" },
  ];

  return (
    <section id="para-quem" className="py-20 px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <h2 className="font-georgia text-[32px] font-bold text-foreground text-center mb-12">
            Você se reconhece aqui?
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {cards.map((c, i) => (
            <Reveal key={i}>
              <div
                className="bg-white rounded-2xl p-6 shadow-sm"
                style={{ borderTop: `4px solid ${c.border}` }}
              >
                <span className="text-3xl block mb-4">{c.emoji}</span>
                <p className="text-foreground text-sm leading-relaxed">{c.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="text-center text-muted-foreground italic text-sm">
            Se você disse sim para pelo menos um desses, o Método foi criado para você.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Section 3: O que é ─── */
function OQueE() {
  const phaseDisplay = [
    { emoji: "🌱", name: "Descoberta", count: 3 },
    { emoji: "🎯", name: "Estratégia", count: 3 },
    { emoji: "📦", name: "Produto", count: 5 },
    { emoji: "✨", name: "Conteúdo", count: 8 },
    { emoji: "💰", name: "Vendas", count: 6 },
  ];

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-start">
        <Reveal>
          <div>
            <span className="text-xs uppercase tracking-[3px] font-semibold" style={{ color: "hsl(181 56% 41%)" }}>
              O MÉTODO
            </span>
            <h2 className="font-georgia text-[34px] font-bold text-foreground mt-3 mb-6 leading-tight">
              Uma trilha completa com 26 especialistas de IA no seu bolso
            </h2>
            <div className="space-y-5 text-foreground text-base leading-[1.8]">
              <p>
                Cada agente do Método é um especialista dedicado a uma parte do seu negócio. Eles não são chatbots genéricos: são especializados, treinados para o contexto de mães empreendedoras e, o mais importante, eles conversam entre si.
              </p>
              <p>
                Quando você termina com a Clara (que descobre seu negócio ideal), a Aya já sabe o que a Clara entregou. Quando a Talia monta seu ecossistema de produtos, a Alma usa isso para criar seu copywriting. Você não precisa repetir nada. É uma equipe trabalhando para você.
              </p>
            </div>
            <div className="mt-6 px-4 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: "rgba(41,166,171,0.1)", color: "hsl(181 56% 41%)" }}>
              Você não precisa saber de IA. Só precisa conversar.
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="rounded-2xl p-6" style={{ background: "linear-gradient(160deg, #4a5759 0%, #f9f6f1 100%)" }}>
            <p className="text-white text-xs uppercase tracking-[2px] font-semibold mb-5">As fases da trilha</p>
            <div className="space-y-3">
              {phaseDisplay.map((p, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/90 rounded-xl px-4 py-3">
                  <span className="text-xl">{p.emoji}</span>
                  <div className="flex-1">
                    <span className="text-sm font-bold text-foreground">Fase {i + 1}: {p.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{p.count} agentes</span>
                </div>
              ))}
              <div className="flex items-center gap-3 bg-white/90 rounded-xl px-4 py-3">
                <span className="text-xl">💛</span>
                <div className="flex-1">
                  <span className="text-sm font-bold text-foreground">Serena</span>
                </div>
                <span className="text-xs text-muted-foreground">sempre disponível</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Section 4: Agentes em destaque ─── */
function AgentesDestaque() {
  const agents = [
    { name: "Clara", role: "Reveladora de Negócios Autênticos", phrase: "Vamos descobrir o negócio que combina seus dons reais com o que o mercado precisa.", color: "#df437d", initial: "C" },
    { name: "Talia", role: "Arquiteta de Ecossistemas", phrase: "Um único produto não é negócio: é um emprego. Vou criar seu ecossistema completo de 6 produtos.", color: "#29a6ab", initial: "T" },
    { name: "Alma", role: "Especialista em Copywriting Emocional", phrase: "Vou criar os textos que fazem sua cliente sentir: ela está falando de mim.", color: "#c49a30", initial: "A" },
    { name: "Petra", role: "Especialista em Sales Pages", phrase: "Página que converte não é sobre design bonito: é sobre falar a coisa certa para a pessoa certa.", color: "#df437d", initial: "P" },
    { name: "Maia", role: "Arquiteta de Rotinas Estratégicas", phrase: "Produtividade para mãe empreendedora não é fazer mais: é fazer o que importa no tempo que você tem.", color: "#c49a30", initial: "M" },
    { name: "Serena", role: "Desbloqueadora de Potencial", phrase: "Estou aqui para quando a jornada parecer pesada demais. Síndrome do impostor, medo de falhar: traga pra cá.", color: "#df437d", initial: "S" },
  ];

  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <h2 className="font-georgia text-[32px] font-bold text-foreground text-center mb-12">
            Conheça alguns dos seus novos especialistas
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6 mb-8 overflow-x-auto">
          {agents.map((a, i) => (
            <Reveal key={i}>
              <div className="bg-white rounded-2xl p-6 shadow-sm h-full flex flex-col">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4"
                  style={{ backgroundColor: a.color }}
                >
                  {a.initial}
                </div>
                <h3 className="font-bold text-foreground text-base mb-1">{a.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{a.role}</p>
                <p className="text-sm text-foreground leading-relaxed italic flex-1">"{a.phrase}"</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="text-center">
            <button onClick={() => scrollTo("precos")} className="text-sm font-medium hover:underline" style={{ color: "hsl(181 56% 41%)" }}>
              Ver todos os 26 agentes da trilha →
            </button>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Section 5: Depoimentos ─── */
function Depoimentos() {
  const STORAGE_BASE = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/depoimentos`;

  const depoimentos = [
    { arquivo: '2.png', alt: 'Depoimento Dra. Rubia' },
    { arquivo: '5.png', alt: 'Depoimento Lenita' },
    { arquivo: '20.png', alt: 'Depoimento Adriana' },
    { arquivo: '6.png', alt: 'Depoimento Elaine' },
    { arquivo: '7.png', alt: 'Depoimento Fabricia' },
    { arquivo: '26.png', alt: 'Depoimento Gisele' },
    { arquivo: '25.png', alt: 'Depoimento Jamile' },
    { arquivo: '29.png', alt: 'Depoimento Fabricia' },
  ];

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <h2 className="font-georgia text-[32px] font-bold text-foreground text-center mb-2">
            O que as alunas estão dizendo
          </h2>
          <p className="text-center text-muted-foreground text-sm mb-12">
            Prints reais do grupo de alunas. Sem edição.
          </p>
        </Reveal>

        <div style={{ columns: '3 280px', gap: '16px' }}>
          {depoimentos.map((dep, i) => (
            <div
              key={dep.arquivo}
              className="opacity-0"
              ref={(el) => {
                if (!el) return;
                const obs = new IntersectionObserver(
                  ([e]) => {
                    if (e.isIntersecting) {
                      setTimeout(() => {
                        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                        el.style.opacity = '1';
                        el.style.transform = 'translateY(0)';
                      }, i * 80);
                      obs.unobserve(el);
                    }
                  },
                  { threshold: 0.1 }
                );
                el.style.transform = 'translateY(20px)';
                obs.observe(el);
              }}
              style={{
                breakInside: 'avoid',
                marginBottom: '16px',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(74,87,89,0.10)',
                transition: 'transform 0.25s, box-shadow 0.25s',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(74,87,89,0.16)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(74,87,89,0.10)';
              }}
            >
              <img
                src={`${STORAGE_BASE}/${dep.arquivo}`}
                alt={dep.alt}
                style={{ width: '100%', display: 'block' }}
                loading="lazy"
              />
            </div>
          ))}
        </div>

        <p className="text-center text-muted-foreground text-xs italic mt-10">
          Prints reais do grupo privado de alunas. Nomes preservados como apareceram originalmente.
        </p>
      </div>
    </section>
  );
}

/* ─── Section 6: Preços ─── */
function Precos() {
  const beneficios = [
    "Acesso a todos os 26 agentes",
    "Trilha completa de 5 fases",
    "Serena disponível 24h",
    "Contexto automático entre agentes",
    "Cancele quando quiser",
  ];

  return (
    <section id="precos" className="py-20 px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <h2 className="font-georgia text-[36px] font-bold text-foreground text-center mb-2">
            Escolha seu plano
          </h2>
          <p className="text-center text-muted-foreground text-sm mb-8">
            Acesso completo aos 26 agentes. Cancele quando quiser.
          </p>

          <div className="max-w-lg mx-auto mb-10 px-5 py-3 rounded-xl text-center text-sm font-medium" style={{ backgroundColor: "rgba(223,67,125,0.1)", color: "#df437d" }}>
            Plano Fundadora disponível para as primeiras 50 alunas
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {/* Mensal */}
          <Reveal>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
              <h3 className="font-bold text-lg text-foreground mb-1">Mensal</h3>
              <p className="text-3xl font-bold text-foreground">R$ 97<span className="text-sm font-normal text-muted-foreground"> / mês</span></p>
              <p className="text-xs text-muted-foreground mt-1 mb-6">Ideal para quem quer testar antes de se comprometer</p>
              <ul className="space-y-3 mb-6">
                {beneficios.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <Check size={16} className="mt-0.5 shrink-0" style={{ color: "#29a6ab" }} />
                    {b}
                  </li>
                ))}
              </ul>
              <button onClick={handleBuy} className="w-full py-3 rounded-full text-white font-semibold text-sm" style={{ backgroundColor: "#4a5759" }} aria-label="Começar plano mensal">
                Começar agora
              </button>
            </div>
          </Reveal>

          {/* Anual - destaque */}
          <Reveal>
            <div className="bg-white rounded-2xl p-6 shadow-md relative border-2" style={{ borderColor: "#29a6ab" }}>
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-bold" style={{ backgroundColor: "#29a6ab" }}>
                Mais popular
              </span>
              <h3 className="font-bold text-lg text-foreground mb-1 mt-2">Anual</h3>
              <p className="text-3xl font-bold text-foreground">R$ 797<span className="text-sm font-normal text-muted-foreground"> / ano</span></p>
              <p className="text-xs text-muted-foreground mt-1">equivale a R$ 66/mês</p>
              <span className="inline-block mt-2 mb-6 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: "rgba(41,166,171,0.15)", color: "#29a6ab" }}>
                Você economiza R$ 367
              </span>
              <ul className="space-y-3 mb-6">
                {[...beneficios, "Suporte prioritário"].map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <Check size={16} className="mt-0.5 shrink-0" style={{ color: "#29a6ab" }} />
                    {b}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleBuy}
                className="w-full py-3 rounded-full text-white font-semibold text-sm transition-shadow hover:shadow-lg"
                style={{ backgroundColor: "#29a6ab", boxShadow: "0 0 20px rgba(41,166,171,0.3)" }}
                aria-label="Escolher plano anual"
              >
                Quero o anual
              </button>
            </div>
          </Reveal>

          {/* Fundadora */}
          <Reveal>
            <div className="bg-white rounded-2xl p-6 shadow-sm relative border-2" style={{ borderColor: "#df437d" }}>
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-bold" style={{ backgroundColor: "#df437d" }}>
                Oferta de lançamento
              </span>
              <h3 className="font-bold text-lg text-foreground mb-1 mt-2">Fundadora</h3>
              <p className="text-3xl font-bold text-foreground">R$ 497<span className="text-sm font-normal text-muted-foreground"> / ano</span></p>
              <p className="text-xs text-muted-foreground mt-1"><span className="line-through">R$ 797</span></p>
              <span className="inline-block mt-2 mb-6 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: "rgba(223,67,125,0.15)", color: "#df437d" }}>
                37% de desconto no lançamento
              </span>
              <ul className="space-y-3 mb-6">
                {[...beneficios, "Acesso vitalício às atualizações"].map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <Check size={16} className="mt-0.5 shrink-0" style={{ color: "#29a6ab" }} />
                    {b}
                  </li>
                ))}
              </ul>
              <button onClick={handleBuy} className="w-full py-3 rounded-full text-white font-semibold text-sm" style={{ backgroundColor: "#df437d" }} aria-label="Quero ser fundadora">
                Quero ser fundadora
              </button>
            </div>
          </Reveal>
        </div>

        <Reveal>
          <div className="flex items-center justify-center gap-2 mt-8 text-xs text-muted-foreground">
            <Lock size={14} />
            Compra 100% segura via Hotmart. Garantia de 7 dias.
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Section 7: Para quem não é ─── */
function ParaQuemNao() {
  const sim = [
    "Mães que querem construir um negócio digital do zero",
    "Mulheres que já têm um produto mas não sabem como vender",
    "Quem quer usar IA de forma prática, sem virar técnica",
    "Quem tem pouco tempo e precisa de direção clara",
  ];
  const nao = [
    "Quem busca resultados sem nenhum esforço",
    "Quem já tem um negócio estruturado e equipe completa",
    "Quem não está disposta a conversar com os agentes e aplicar",
  ];

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
        <Reveal>
          <div className="rounded-2xl p-6 border" style={{ backgroundColor: "rgba(41,166,171,0.05)", borderColor: "rgba(41,166,171,0.3)" }}>
            <h3 className="font-bold text-lg text-foreground mb-4">Para quem é o Método</h3>
            <ul className="space-y-3">
              {sim.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <Check size={16} className="mt-0.5 shrink-0" style={{ color: "#29a6ab" }} />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal>
          <div className="rounded-2xl p-6 border" style={{ backgroundColor: "rgba(223,67,125,0.04)", borderColor: "rgba(223,67,125,0.2)" }}>
            <h3 className="font-bold text-lg text-foreground mb-4">Para quem não é</h3>
            <ul className="space-y-3">
              {nao.map((n, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <X size={16} className="mt-0.5 shrink-0" style={{ color: "#df437d" }} />
                  {n}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Section 8: FAQ ─── */
function Faq() {
  const questions = [
    { q: "Preciso saber usar inteligência artificial?", a: "Não. Os agentes foram criados para ser tão simples quanto mandar uma mensagem no WhatsApp. Você conversa, eles trabalham." },
    { q: "Quanto tempo preciso dedicar por dia?", a: "De 30 minutos a 1 hora já é suficiente para avançar na trilha. A Maia (agente de rotinas) vai te ajudar a encaixar o método na sua realidade." },
    { q: "O acesso é imediato após a compra?", a: "Sim. Assim que o pagamento for confirmado pelo Hotmart, você recebe o acesso por email e já pode entrar na plataforma." },
    { q: "Posso cancelar quando quiser?", a: "No plano mensal, sim: cancele quando quiser sem multa. Nos planos anuais, o acesso fica ativo por 12 meses completos." },
    { q: "Os agentes realmente conversam entre si?", a: "Sim. Quando você conclui uma etapa com um agente, o sistema salva automaticamente o que foi produzido e injeta esse contexto no próximo agente. Você nunca precisa repetir informações." },
    { q: "Tem suporte se eu tiver dúvidas?", a: "Sim. Além dos agentes, você tem acesso ao grupo de alunas e ao suporte via email. No plano anual, o suporte é prioritário." },
  ];

  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-2xl mx-auto">
        <Reveal>
          <h2 className="font-georgia text-[32px] font-bold text-foreground text-center mb-12">
            Perguntas frequentes
          </h2>
        </Reveal>

        <Reveal>
          <Accordion type="single" collapsible className="space-y-3">
            {questions.map((q, i) => (
              <AccordionItem key={i} value={`q-${i}`} className="bg-white rounded-xl px-5 border-none shadow-sm">
                <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline">
                  {q.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {q.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Section 9: CTA Final ─── */
function CtaFinal() {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-6" style={{ background: "linear-gradient(160deg, #4a5759 0%, #2a3f41 100%)" }}>
      <div className="max-w-2xl mx-auto text-center">
        <Reveal>
          <h2 className="font-georgia text-[36px] md:text-[40px] font-bold text-white mb-4 leading-tight">
            Sua jornada começa com uma conversa.
          </h2>
          <p className="text-white/70 text-base mb-10">
            26 especialistas. Uma trilha. O negócio que você merecia ter construído antes.
          </p>
          <button
            onClick={handleBuy}
            className="px-12 py-4.5 rounded-[40px] text-white font-bold text-base hover:opacity-90 transition-opacity mb-6"
            style={{ backgroundColor: "#df437d" }}
            aria-label="Quero começar agora"
          >
            Quero começar agora
          </button>
          <p className="mt-6 text-white/50 text-sm">
            Já sou aluna:{" "}
            <button onClick={() => navigate("/login")} className="underline text-white/70 hover:text-white">
              entrar na plataforma
            </button>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="py-10 px-6" style={{ backgroundColor: "#2a3f41" }}>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <Logo size={40} light />
        <p className="text-white/50 text-xs text-center">
          Método Mamãe Monetiza © 2026. Todos os direitos reservados.
        </p>
        <div className="flex gap-4 text-xs text-white/40">
          <a href="#" className="hover:text-white/60">Política de Privacidade</a>
          <span>|</span>
          <a href="#" className="hover:text-white/60">Termos de Uso</a>
        </div>
      </div>
    </footer>
  );
}

/* ─── Main Page ─── */
const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <ParaQuem />
      <OQueE />
      <AgentesDestaque />
      <Depoimentos />
      <Precos />
      <ParaQuemNao />
      <Faq />
      <CtaFinal />
      <Footer />
    </div>
  );
};

export default Index;
