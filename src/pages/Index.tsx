import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, LockOpen, Check, X, ChevronDown } from "lucide-react";
import Logo from "@/components/Logo";
import { getAgentPhotoUrl } from "@/data/agentPhotos";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

const HOTMART_LINKS = {
  mensal: "https://pay.hotmart.com/G105292559C?off=3v5pivbp",
  fundadora: "https://pay.hotmart.com/G105292559C?off=rt0xc1u6",
};

const openHotmart = (plan: keyof typeof HOTMART_LINKS) => {
  window.open(HOTMART_LINKS[plan], "_blank", "noopener,noreferrer");
};

const agentesDestaque = [
  { id: "clara", nome: "Clara", foto: "CLARA.png", role: "Reveladora de Negócios", frase: "Vamos descobrir o negócio que combina seus dons reais com o que o mercado precisa." },
  { id: "talia", nome: "Talia", foto: "TALIA.png", role: "Arquiteta de Ecossistemas", frase: "Um único produto não é negócio: é um emprego. Vou criar seu ecossistema completo." },
  { id: "alma",  nome: "Alma",  foto: "ALMA.png",  role: "Copywriting Emocional", frase: "Vou criar os textos que fazem sua cliente sentir: ela está falando de mim." },
  { id: "petra", nome: "Petra", foto: "PETRA.png", role: "Sales Pages", frase: "Página que converte não é sobre design bonito: é falar a coisa certa para a pessoa certa." },
  { id: "maia",  nome: "Maia",  foto: "MAIA.png",  role: "Rotinas Estratégicas", frase: "Produtividade para mãe empreendedora não é fazer mais: é fazer o que importa no tempo que você tem." },
  { id: "serena",nome: "Serena",foto: "SERENA.png",role: "Apoio Emocional", frase: "Estou aqui para quando a jornada parecer pesada demais. Traga pra cá." },
];

const outrosAgentes = [
  { id: "aya",   nome: "Aya",   foto: "AYA.png",   role: "Validadora de Mercado" },
  { id: "lucca", nome: "Lucca", foto: "LUCCA.png", role: "Consultor Estratégico" },
  { id: "alice", nome: "Alice", foto: "ALICE.png", role: "Arquiteta de Marcas" },
  { id: "kaia",  nome: "Kaia",  foto: "KAIA.png",  role: "Estrategista de Conteúdo" },
  { id: "lira",  nome: "Lira",  foto: "LIRA1.png", role: "Especialista em Ebooks" },
  { id: "noa",   nome: "Noa",   foto: "NOA.png",   role: "Especialista em Cursos Online" },
  { id: "eron",  nome: "Eron",  foto: "ERON.png",  role: "Mentorias de Alto Valor" },
  { id: "vera",  nome: "Vera",  foto: "VERA.png",  role: "Comunidades Online" },
  { id: "cora",  nome: "Cora",  foto: "CORA.png",  role: "Especialista em Gamificação" },
  { id: "malu",  nome: "Malu",  foto: "MALU.png",  role: "Calendário Editorial" },
  { id: "kaena", nome: "Kaena", foto: "KAENA.png", role: "Roteirista Viral" },
  { id: "lumi",  nome: "Lumi",  foto: "LUMI.png",  role: "Carrosséis Virais" },
  { id: "luli",  nome: "Luli",  foto: "LULI.jpg",  role: "Prompts de Imagem IA" },
  { id: "nara",  nome: "Nara",  foto: "NARA.png",  role: "Stories que Convertem" },
  { id: "alana", nome: "Alana", foto: "ALANA.png", role: "Vendas Humanizadas" },
  { id: "nina",  nome: "Nina",  foto: "NINA.png",  role: "Arquiteta de Relacionamentos" },
  { id: "elisa", nome: "Elisa", foto: "ELISA.png", role: "Quiz Funnels" },
  { id: "luna",  nome: "Luna",  foto: "LUNA.png",  role: "Funis Automáticos" },
  { id: "liora", nome: "Liora", foto: "LIORA.png", role: "Decodificadora de Dados" },
  { id: "bill",  nome: "Bill",  foto: null,        role: "Roteirista de YouTube" },
];

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          obs.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useReveal();
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

function AgentAvatar({
  id,
  name,
  size = 80,
}: {
  id: string;
  name: string;
  size?: number;
}) {
  const [error, setError] = useState(false);
  const src = getAgentPhotoUrl(id);

  if (!src || error) {
    return (
      <div
        className="rounded-full flex items-center justify-center font-display shrink-0"
        style={{
          width: size,
          height: size,
          fontSize: size * 0.36,
          backgroundColor: "#B6D0BE",
          color: "#1C3C2C",
        }}
      >
        {name.charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`Foto da agente ${name}`}
      className="rounded-full object-cover shrink-0"
      style={{ width: size, height: size, backgroundColor: "#B6D0BE" }}
      loading="lazy"
      onError={() => setError(true)}
    />
  );
}

function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? "#1C3C2C" : "transparent",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.2)" : "none",
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Logo size={56} light />
        <button
          onClick={() => navigate("/login")}
          className="px-5 py-2 rounded-[40px] border border-white text-white text-sm font-medium bg-transparent hover:bg-white/10 transition-colors"
        >
          Já sou aluna
        </button>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(160deg, #1C3C2C 0%, #0F2419 100%)" }}
    >
      <div
        className="absolute -top-60 -left-60 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ backgroundColor: "#C6A86C", opacity: 0.06 }}
      />
      <div
        className="absolute -bottom-60 -right-60 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ backgroundColor: "#6E9876", opacity: 0.06 }}
      />

      <div className="relative z-10 text-center px-6 max-w-[640px] mx-auto pt-32 pb-20">
        <span
          className="inline-block px-4 py-1.5 rounded-[40px] text-sm font-semibold mb-8"
          style={{ backgroundColor: "rgba(198,168,108,0.15)", color: "#DEC888" }}
        >
          26 especialistas de IA no seu time
        </span>

        <h1
          className="font-display text-white mb-6"
          style={{ fontSize: "clamp(34px, 5vw, 52px)", lineHeight: 1.15 }}
        >
          Seu negócio digital. Construído com inteligência. Do jeito de mãe.
        </h1>

        <p
          className="mx-auto mb-10"
          style={{ fontSize: 18, color: "rgba(255,255,255,0.72)", lineHeight: 1.7 }}
        >
          O Prospera coloca 26 agentes de IA ao seu lado para te guiar do zero ao negócio que funciona de verdade: respeitando seu tempo, sua família e a sua energia.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <button
            onClick={() => scrollTo("precos")}
            className="rounded-[40px] font-bold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#C6A86C", color: "#1C3C2C", padding: "16px 36px", fontSize: 16 }}
          >
            Quero começar agora
          </button>
          <button
            onClick={() => scrollTo("dor")}
            className="rounded-[40px] text-white font-medium transition-colors hover:bg-white/10"
            style={{ border: "1.5px solid white", padding: "16px 36px", fontSize: 16, backgroundColor: "transparent" }}
          >
            Ver como funciona
          </button>
        </div>

        <div className="flex items-center justify-center gap-2" style={{ color: "rgba(110,152,118,0.6)", fontSize: 13 }}>
          <LockOpen size={14} />
          <span>Acesso imediato após a compra</span>
        </div>
      </div>

      <button
        onClick={() => scrollTo("dor")}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 animate-bounce"
        aria-label="Rolar para baixo"
      >
        <ChevronDown size={28} />
      </button>
    </section>
  );
}

function Dor() {
  const cards = [
    { emoji: "🌀", title: "Já tentou, mas travou", text: "Abriu o ChatGPT, ficou olhando para a tela em branco e fechou sem saber por onde começar.", border: "#7A5535" },
    { emoji: "⏰", title: "Tempo é o que mais falta", text: "Tem no máximo 1 hora por dia. Não pode desperdiçar com tentativa e erro.", border: "#3A5C46" },
    { emoji: "💡", title: "O talento existe. O caminho, não", text: "Sabe que tem algo para oferecer. Só ainda não descobriu como transformar isso em renda real.", border: "#C6A86C" },
  ];

  return (
    <section id="dor" className="py-20 px-6" style={{ backgroundColor: "#F9F6F1" }}>
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <h2 className="font-display text-center mb-12" style={{ fontSize: 34, color: "#1C3C2C" }}>
            Você se reconhece aqui?
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {cards.map((c, i) => (
            <Reveal key={i}>
              <div
                className="bg-white p-7 h-full"
                style={{
                  borderRadius: 20,
                  borderTop: `4px solid ${c.border}`,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                }}
              >
                <span style={{ fontSize: 40 }} className="block mb-4">{c.emoji}</span>
                <h3 className="font-display mb-2" style={{ fontSize: 18, color: "#1C3C2C" }}>{c.title}</h3>
                <p style={{ fontSize: 14, color: "#3A5C46", lineHeight: 1.65 }}>{c.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="text-center italic" style={{ fontSize: 15, color: "#3A5C46" }}>
            Se você disse sim para pelo menos um desses, o Prospera foi criado para você.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function OQueE() {
  const phases = [
    { emoji: "🌱", name: "Descoberta", count: 2 },
    { emoji: "🎯", name: "Estratégia", count: 4 },
    { emoji: "📦", name: "Produto", count: 5 },
    { emoji: "✨", name: "Conteúdo", count: 7 },
    { emoji: "💰", name: "Vendas", count: 5 },
    { emoji: "🚀", name: "Execução", count: 2, suffix: "(sempre disponíveis)" },
  ];

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-start">
        <Reveal>
          <div>
            <span style={{ fontSize: 12, letterSpacing: "2px", color: "#6E9876", textTransform: "uppercase", fontWeight: 600 }}>
              O MÉTODO
            </span>
            <h2 className="font-display mt-3 mb-6" style={{ fontSize: 38, color: "#1C3C2C", lineHeight: 1.2 }}>
              Uma trilha completa com 26 especialistas de IA no seu bolso
            </h2>
            <div className="space-y-5" style={{ fontSize: 16, color: "#3A5C46", lineHeight: 1.85 }}>
              <p>
                Cada agente é especializado em uma parte do seu negócio. Não são chatbots genéricos: são especialistas treinados para a realidade de mães empreendedoras.
              </p>
              <p>
                O que faz o Prospera diferente: eles conversam entre si. Quando você termina com a Clara, a Aya já sabe o que foi descoberto. Quando a Talia monta seu ecossistema de produtos, a Alma usa isso para criar seu copywriting. Você não repete nada.
              </p>
            </div>
            <div
              className="mt-6"
              style={{
                backgroundColor: "#EAF2EC",
                borderLeft: "4px solid #3A5C46",
                padding: "16px 20px",
                borderRadius: 8,
                color: "#1C3C2C",
                fontSize: 15,
              }}
            >
              Você não precisa saber de IA. Só precisa conversar.
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div
            className="p-7"
            style={{
              borderRadius: 20,
              background: "linear-gradient(160deg, #F5F1E9 0%, #FFFFFF 100%)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            }}
          >
            <div className="space-y-0">
              {phases.map((p, i) => (
                <div
                  key={p.name}
                  className="flex items-center gap-4 py-4"
                  style={{ borderBottom: i < phases.length - 1 ? "1px solid #E2D9C8" : "none" }}
                >
                  <span style={{ fontSize: 24 }}>{p.emoji}</span>
                  <div className="flex-1">
                    <div className="font-display" style={{ fontSize: 16, color: "#1C3C2C" }}>
                      Fase {i + 1}: {p.name}
                    </div>
                  </div>
                  <span style={{ fontSize: 13, color: "#6E9876" }}>
                    {p.count} {p.count === 1 ? "agente" : "agentes"} {p.suffix || ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function AgentesDestaque() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="py-20 px-6" style={{ backgroundColor: "#F5F1E9" }}>
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="text-center mb-12">
            <h2 className="font-display mb-3" style={{ fontSize: 40, color: "#1C3C2C" }}>
              Conheça seus 26 especialistas
            </h2>
            <p style={{ fontSize: 16, color: "#3A5C46" }} className="max-w-2xl mx-auto">
              Cada agente é especializado em uma parte do seu negócio. Juntos, eles formam sua equipe completa.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agentesDestaque.map((agent) => (
            <Reveal key={agent.id}>
              <div
                className="bg-white p-6 h-full transition-all duration-300 hover:-translate-y-1"
                style={{
                  borderRadius: 16,
                  border: "1px solid #E2D9C8",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.10)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)"; }}
              >
                <AgentAvatar name={agent.nome} foto={agent.foto} size={80} />
                <h3 className="font-display mt-5 mb-2" style={{ fontSize: 20, color: "#1C3C2C" }}>{agent.nome}</h3>
                <p style={{ fontSize: 12, color: "#6E9876", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 12 }}>
                  {agent.role}
                </p>
                <p style={{ fontSize: 14, color: "#3A5C46", lineHeight: 1.6, fontStyle: "italic" }}>
                  {agent.frase}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="text-center mt-10">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-2 px-6 py-3 transition-colors hover:bg-gold/10"
              style={{ borderRadius: 40, border: "1px solid #C6A86C", color: "#1C3C2C", fontSize: 14, backgroundColor: "transparent" }}
            >
              {expanded ? "Fechar ↑" : "Ver todos os 26 agentes ↓"}
            </button>
          </div>
        </Reveal>

        <div
          className="overflow-hidden transition-all duration-500 ease-in-out"
          style={{ maxHeight: expanded ? "2400px" : "0px" }}
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-8">
            {outrosAgentes.map((agent) => (
              <div
                key={agent.id}
                className="bg-white p-4 flex items-center gap-3"
                style={{ borderRadius: 16, border: "1px solid #E2D9C8", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
              >
                <AgentAvatar name={agent.nome} foto={agent.foto} size={56} />
                <div className="min-w-0">
                  <h3 className="font-display leading-none mb-1" style={{ fontSize: 15, color: "#1C3C2C" }}>{agent.nome}</h3>
                  <p style={{ fontSize: 12, color: "#6E9876", lineHeight: 1.3 }}>{agent.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Depoimentos() {
  const STORAGE_BASE = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/depoimentos`;

  const depoimentos = [
    { arquivo: "2.png", alt: "Depoimento de aluna" },
    { arquivo: "5.png", alt: "Depoimento de aluna" },
    { arquivo: "20.png", alt: "Depoimento de aluna" },
    { arquivo: "6.png", alt: "Depoimento de aluna" },
    { arquivo: "7.png", alt: "Depoimento de aluna" },
    { arquivo: "26.png", alt: "Depoimento de aluna" },
    { arquivo: "25.png", alt: "Depoimento de aluna" },
    { arquivo: "29.png", alt: "Depoimento de aluna" },
  ];

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <h2 className="font-display text-center mb-2" style={{ fontSize: 36, color: "#1C3C2C" }}>
            O que as alunas estão dizendo
          </h2>
          <p className="text-center mb-12 italic" style={{ fontSize: 15, color: "#3A5C46" }}>
            Prints reais do grupo de alunas. Sem edição.
          </p>
        </Reveal>

        <div style={{ columns: "3 280px", columnGap: "16px" }}>
          {depoimentos.map((dep, i) => (
            <div
              key={dep.arquivo}
              ref={(el) => {
                if (!el) return;
                el.style.opacity = "0";
                el.style.transform = "translateY(20px)";
                const obs = new IntersectionObserver(
                  ([e]) => {
                    if (e.isIntersecting) {
                      setTimeout(() => {
                        el.style.transition = "opacity 0.5s ease, transform 0.5s ease, box-shadow 0.25s";
                        el.style.opacity = "1";
                        el.style.transform = "translateY(0)";
                      }, i * 80);
                      obs.unobserve(el);
                    }
                  },
                  { threshold: 0.1 }
                );
                obs.observe(el);
              }}
              style={{
                breakInside: "avoid",
                marginBottom: "16px",
                borderRadius: "20px",
                overflow: "hidden",
                background: "#fff",
                boxShadow: "0 4px 20px rgba(74,87,89,0.10)",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 10px 32px rgba(74,87,89,0.16)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(74,87,89,0.10)";
              }}
            >
              <img
                src={`${STORAGE_BASE}/${dep.arquivo}`}
                alt={dep.alt}
                style={{ width: "100%", display: "block" }}
                loading="lazy"
              />
            </div>
          ))}
        </div>

        <p className="text-center italic mt-10" style={{ fontSize: 13, color: "#6E9876" }}>
          Prints reais do grupo privado de alunas.
        </p>
      </div>
    </section>
  );
}

function Precos() {
  const beneficiosMensal = [
    "Acesso a todos os 26 agentes",
    "Trilha completa em 6 fases",
    "Serena disponível 24 horas",
    "Contexto automático entre agentes",
    "Suporte por email",
  ];

  const beneficiosFundadora = [
    "Tudo do plano mensal",
    "Garantia de preço pelo período completo",
    "Acesso às atualizações do método",
    "Suporte prioritário",
    "Comunidade exclusiva de fundadoras",
  ];

  return (
    <section id="precos" className="py-20 px-6" style={{ backgroundColor: "#F5F1E9" }}>
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <h2 className="font-display text-center mb-2" style={{ fontSize: 40, color: "#1C3C2C" }}>
            Escolha seu plano
          </h2>
          <p className="text-center mb-8" style={{ fontSize: 16, color: "#3A5C46" }}>
            Acesso completo aos 26 agentes e à trilha inteira.
          </p>

          <div
            className="max-w-[480px] mx-auto mb-12 px-6 py-3.5 text-center"
            style={{
              backgroundColor: "#FFF8EC",
              border: "1px solid #C6A86C",
              borderRadius: 12,
            }}
          >
            <div style={{ fontSize: 14, color: "#7A5535", fontWeight: 700 }}>
              ⏳ Plano Fundadora disponível por tempo limitado
            </div>
            <div style={{ fontSize: 12, color: "#7A5535", marginTop: 4 }}>
              Quando as vagas esgotarem, permanece apenas o plano mensal.
            </div>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-6 items-start max-w-3xl mx-auto">
          {/* Card Mensal */}
          <Reveal>
            <div
              className="bg-white"
              style={{
                borderRadius: 20,
                border: "1px solid #E2D9C8",
                padding: 32,
              }}
            >
              <span style={{ fontSize: 12, color: "#6E9876", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 600 }}>
                MENSAL
              </span>
              <div className="mt-3">
                <span className="font-display" style={{ fontSize: 48, color: "#1C3C2C" }}>R$ 87</span>
              </div>
              <p style={{ fontSize: 14, color: "#3A5C46", marginTop: 4 }}>por mês, cobrado mensalmente</p>
              <p style={{ fontSize: 13, color: "#6E9876", marginTop: 2 }}>Cancele quando quiser</p>

              <div style={{ borderTop: "1px solid #E2D9C8", margin: "20px 0" }} />

              <ul className="space-y-3 mb-8">
                {beneficiosMensal.map((b, i) => (
                  <li key={i} className="flex items-start gap-2" style={{ fontSize: 14, color: "#3A5C46" }}>
                    <Check size={16} style={{ color: "#3A5C46", marginTop: 2, flexShrink: 0 }} />
                    {b}
                  </li>
                ))}
              </ul>

              <button
                onClick={goToSales}
                className="w-full font-bold transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#1C3C2C", color: "#FFFFFF", borderRadius: 40, padding: "14px 0", fontSize: 15 }}
              >
                Começar agora
              </button>
            </div>
          </Reveal>

          {/* Card Fundadora */}
          <Reveal>
            <div
              className="relative"
              style={{
                backgroundColor: "#1C3C2C",
                borderRadius: 20,
                padding: 36,
                boxShadow: "0 16px 48px rgba(28,60,44,0.25)",
              }}
            >
              <span
                className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap"
                style={{
                  backgroundColor: "#C6A86C",
                  color: "#1C3C2C",
                  borderRadius: 40,
                  padding: "6px 16px",
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                OFERTA DE LANÇAMENTO
              </span>

              <span style={{ fontSize: 12, color: "rgba(222,200,136,0.7)", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 600 }}>
                FUNDADORA
              </span>

              <div className="mt-3" style={{ fontSize: 18, color: "rgba(255,255,255,0.4)", textDecoration: "line-through" }}>
                R$ 697/ano
              </div>
              <div className="font-display" style={{ fontSize: 56, color: "#C6A86C", lineHeight: 1, marginTop: 4 }}>
                R$ 497
              </div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 8 }}>
                pagamento único, acesso por 12 meses
              </p>
              <p style={{ fontSize: 13, color: "#DEC888", marginTop: 2 }}>
                equivale a R$ 41/mês
              </p>

              <div
                className="inline-block mt-4"
                style={{
                  backgroundColor: "rgba(198,168,108,0.15)",
                  border: "1px solid #C6A86C",
                  borderRadius: 8,
                  padding: "8px 14px",
                  fontSize: 13,
                  color: "#DEC888",
                }}
              >
                Você economiza R$ 547 em relação ao mensal
              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", margin: "20px 0" }} />

              <ul className="space-y-3 mb-8">
                {beneficiosFundadora.map((b, i) => (
                  <li key={i} className="flex items-start gap-2" style={{ fontSize: 14, color: "rgba(255,255,255,0.92)" }}>
                    <Check size={16} style={{ color: "#C6A86C", marginTop: 2, flexShrink: 0 }} />
                    {b}
                  </li>
                ))}
              </ul>

              <button
                onClick={goToSales}
                className="w-full font-bold transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#C6A86C", color: "#1C3C2C", borderRadius: 40, padding: "16px 0", fontSize: 16 }}
              >
                Quero ser fundadora
              </button>
            </div>
          </Reveal>
        </div>

        <Reveal>
          <div className="flex items-center justify-center gap-2 mt-10" style={{ fontSize: 13, color: "#3A5C46" }}>
            <Lock size={14} />
            Compra segura via Hotmart. Garantia incondicional de 7 dias.
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ParaQuem() {
  const sim = [
    "Mães que querem construir um negócio digital do zero",
    "Quem tem um produto mas ainda não sabe como vender",
    "Quem quer usar IA de forma prática, sem virar técnica",
    "Quem tem pouco tempo e precisa de direção clara",
  ];
  const nao = [
    "Quem busca resultado sem nenhum esforço ou dedicação",
    "Quem já tem um negócio estruturado e equipe completa",
    "Quem não está disposta a conversar com os agentes e aplicar o que receber",
  ];

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <h2 className="font-display text-center mb-12" style={{ fontSize: 34, color: "#1C3C2C" }}>
            Este método é para você?
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-6">
          <Reveal>
            <div
              className="p-7 h-full"
              style={{
                backgroundColor: "#F0F7F2",
                border: "1px solid #B6D0BE",
                borderRadius: 20,
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span style={{ fontSize: 28 }}>✅</span>
                <h3 className="font-display" style={{ fontSize: 22, color: "#1C3C2C" }}>Para quem é</h3>
              </div>
              <ul className="space-y-3">
                {sim.map((s, i) => (
                  <li key={i} className="flex items-start gap-2" style={{ fontSize: 15, color: "#3A5C46" }}>
                    <Check size={16} style={{ color: "#3A5C46", marginTop: 3, flexShrink: 0 }} />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal>
            <div
              className="p-7 h-full"
              style={{
                backgroundColor: "#FDF5F5",
                border: "1px solid #E8C4C4",
                borderRadius: 20,
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span style={{ fontSize: 28 }}>❌</span>
                <h3 className="font-display" style={{ fontSize: 22, color: "#7A5535" }}>Para quem não é</h3>
              </div>
              <ul className="space-y-3">
                {nao.map((n, i) => (
                  <li key={i} className="flex items-start gap-2" style={{ fontSize: 15, color: "#3A5C46" }}>
                    <X size={16} style={{ color: "#7A5535", marginTop: 3, flexShrink: 0 }} />
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const questions = [
    { q: "Preciso saber usar inteligência artificial?", a: "Não. Conversar com os agentes é tão simples quanto mandar uma mensagem no WhatsApp. Você faz perguntas, conta sua história, eles trabalham. Sem jargão, sem configuração, sem curva de aprendizado." },
    { q: "Quanto tempo preciso dedicar por dia?", a: "De 30 minutos a 1 hora já é suficiente para avançar. A Maia, nossa agente de rotinas, vai te ajudar a encaixar o método na sua realidade de mãe, respeitando os seus horários e a sua energia." },
    { q: "O acesso é imediato após a compra?", a: "Sim. Assim que o pagamento for confirmado pelo Hotmart, você recebe o acesso por email e entra direto na plataforma, sem esperar." },
    { q: "Posso cancelar quando quiser?", a: "No plano mensal: sim, cancele a qualquer momento sem multa. No plano Fundadora: o acesso fica ativo pelos 12 meses completos, já incluídos no pagamento único." },
    { q: "Os agentes realmente conversam entre si?", a: "Sim. Quando você conclui uma etapa, o sistema salva automaticamente o que foi produzido e injeta esse contexto no agente seguinte. Você nunca precisa repetir o que já contou." },
    { q: "E se eu já tiver uma ideia de negócio?", a: "Ótimo ponto de partida. A Clara vai te perguntar exatamente isso: se você ainda não sabe o que quer fazer, se tem uma ideia solta ou se já tem algo mais definido. O método se adapta ao ponto onde você está." },
    { q: "Tem suporte se eu travar em algum momento?", a: "Além dos próprios agentes, você tem acesso ao grupo de alunas e ao suporte por email. Quem está no plano Fundadora tem suporte prioritário." },
  ];

  return (
    <section className="py-20 px-6" style={{ backgroundColor: "#F5F1E9" }}>
      <div className="max-w-[720px] mx-auto">
        <Reveal>
          <h2 className="font-display text-center mb-12" style={{ fontSize: 36, color: "#1C3C2C" }}>
            Perguntas frequentes
          </h2>
        </Reveal>

        <Reveal>
          <Accordion type="single" collapsible className="space-y-3">
            {questions.map((q, i) => (
              <AccordionItem
                key={i}
                value={`q-${i}`}
                className="bg-white border-none"
                style={{ borderRadius: 12, border: "1px solid #E2D9C8", padding: "4px 24px" }}
              >
                <AccordionTrigger
                  className="hover:no-underline"
                  style={{ fontSize: 16, fontWeight: 700, color: "#1C3C2C" }}
                >
                  {q.q}
                </AccordionTrigger>
                <AccordionContent style={{ fontSize: 15, color: "#3A5C46", lineHeight: 1.7 }}>
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

function CtaFinal() {
  const navigate = useNavigate();

  return (
    <section
      className="relative py-24 px-6 overflow-hidden"
      style={{ background: "linear-gradient(160deg, #1C3C2C 0%, #0F2419 100%)" }}
    >
      <div
        className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ backgroundColor: "#C6A86C", opacity: 0.06 }}
      />
      <div
        className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ backgroundColor: "#6E9876", opacity: 0.06 }}
      />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <Reveal>
          <h2
            className="font-display text-white mb-4"
            style={{ fontSize: "clamp(30px, 4vw, 44px)", lineHeight: 1.2 }}
          >
            Sua jornada começa com uma conversa.
          </h2>
          <p
            className="mx-auto mb-10"
            style={{ fontSize: 18, color: "rgba(255,255,255,0.65)", maxWidth: 520 }}
          >
            26 especialistas. Uma trilha. O negócio que você merecia ter construído antes.
          </p>
          <button
            onClick={goToSales}
            className="font-bold transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "#C6A86C",
              color: "#1C3C2C",
              borderRadius: 40,
              padding: "18px 52px",
              fontSize: 18,
            }}
          >
            Quero começar agora
          </button>
          <p className="mt-8" style={{ fontSize: 14, color: "rgba(255,255,255,0.45)" }}>
            Já sou aluna:{" "}
            <button
              onClick={() => navigate("/login")}
              className="underline hover:text-white"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              entrar no Prospera
            </button>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-10 px-6" style={{ backgroundColor: "#1C3C2C" }}>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <Logo size={52} light />
        <p className="text-center" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
          Prospera, Método Mamãe Monetiza, 2026. Todos os direitos reservados.
        </p>
        <div className="flex gap-4" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
          <a href="#" className="hover:text-white/60">Política de Privacidade</a>
          <span>|</span>
          <a href="#" className="hover:text-white/60">Termos de Uso</a>
        </div>
      </div>
    </footer>
  );
}

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Dor />
      <OQueE />
      <AgentesDestaque />
      <Depoimentos />
      <Precos />
      <ParaQuem />
      <Faq />
      <CtaFinal />
      <Footer />
    </div>
  );
};

export default Index;
