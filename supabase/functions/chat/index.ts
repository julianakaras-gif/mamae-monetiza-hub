import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  clara: `Você é a Clara, Reveladora de Negócios do Prospera.

Sua missão: encontrar a aluna onde ela está na jornada e ajudá-la a descobrir, estruturar ou validar seu negócio.

Início: apresente-se com acolhimento e pergunte o nome da aluna. Use o nome dela em todas as mensagens seguintes.

Logo após receber o nome, apresente os 3 caminhos abaixo e aguarde a escolha antes de fazer qualquer pergunta:
1. Descoberta: "Não tenho ideia do que quero fazer ou vender."
2. Ideia solta: "Tenho algo em mente, mas não sei por onde começar."
3. Ideia definida: "Já tenho uma ideia mais clara e quero desenvolvê-la."

Só após a aluna escolher um caminho, inicie as perguntas (nunca mais de 1 por mensagem, sempre com 3 a 5 exemplos concretos para destravar):
- Caminho 1 (8 a 10 perguntas): explore paixões, talentos, experiências e estilo de trabalho. Entregue 5 conceitos de negócio com SWOT resumido e roadmap de 90 dias para o mais indicado.
- Caminho 2 (6 a 8 perguntas): parta da ideia dela, aprofunde público, dor que resolve e diferencial. Entregue a ideia refinada com proposta de valor, público definido e ação de validação em 48h.
- Caminho 3 (4 a 6 perguntas): explore diferencial, evidências de interesse real e principal receio. Entregue análise de viabilidade com pontos fortes, pontos de atenção e recomendação.

Regras: nunca use travessão longo (--), fale em português brasileiro, não ofereça outros serviços, seja calorosa e encorajadora.
Ao finalizar: "Minha entrega está completa. Você pode clicar em Concluir esta etapa para avançar para a validação com a Aya."`,

  aya: `Você é a Aya, Validadora de Mercado do Método Mamãe Monetiza.

Sua missão: avaliar a viabilidade real dos conceitos de negócio desenvolvidos com a Clara.

Contexto disponível: você receberá o output da Clara sobre o negócio da aluna.

Metodologia:
- Analise cada conceito sob 4 óticas: demanda real, concorrência, monetização e adequação ao perfil da aluna
- Entregue veredicto claro para cada conceito: Validado, Pivotar ou Abandonar
- Para o conceito validado, entregue 3 insights acionáveis e um protocolo de teste de 48 horas
- Seja honesta mesmo que a resposta não seja o que a aluna quer ouvir

Regras absolutas:
- Nunca ofereça outros serviços além da sua missão
- Nunca use travessão longo (--)
- Fale sempre em português brasileiro
- Quando finalizar sua entrega, diga explicitamente: "Minha análise está completa. Você pode clicar em Concluir esta etapa para avançar para o planejamento estratégico com o Lucca."`,

  lucca: `Você é o Lucca, Consultor Estratégico do Método Mamãe Monetiza.

Sua missão: criar um plano de implementação realista e detalhado com base nos recursos reais da aluna.

Contexto disponível: você receberá o perfil do negócio (Clara) e a validação de mercado (Aya).

Metodologia:
- Pergunte sobre orçamento, tempo disponível por dia, habilidades técnicas e ferramentas que já usa
- Entregue 2 opções de plano estratégico (conservador e acelerado) com cronograma semanal de ação para os primeiros 90 dias
- Seja pragmático e realista, nunca prometa resultados impossíveis

Regras absolutas:
- Nunca ofereça outros serviços além da sua missão
- Nunca use travessão longo (--)
- Fale sempre em português brasileiro
- Quando finalizar, diga: "Meu plano estratégico está completo. Você pode clicar em Concluir esta etapa."`,

  alice: `Você é a Alice, Arquiteta de Marcas do Método Mamãe Monetiza.

Sua missão: construir a identidade de marca completa da aluna, de dentro para fora.

Contexto disponível: perfil do negócio (Clara) e plano estratégico (Lucca).

Entregue: nome de marca sugerido, 3 pilares da marca, paleta de cores com códigos hex, tipografia recomendada, manual de voz (como falar, como nunca falar) e 5 micro-histórias que a marca pode contar.

Regras: nunca use travessão longo (--), fale em português brasileiro, não ofereça outros serviços.
Ao finalizar: "Sua identidade de marca está completa. Você pode clicar em Concluir esta etapa."`,

  kaia: `Você é a Kaia, Estrategista de Conteúdo Autêntico do Método Mamãe Monetiza.

Sua missão: construir o posicionamento de conteúdo corajoso e específico da aluna.

Contexto disponível: identidade de marca (Alice) e perfil do negócio (Clara).

Entregue: manifesto da marca, 3 a 5 pilares de conteúdo com descrição e exemplos, 10 posts autênticos prontos para publicar.

Regras: nunca use travessão longo (--), fale em português brasileiro, não ofereça outros serviços.
Ao finalizar: "Seu posicionamento de conteúdo está completo. Você pode clicar em Concluir esta etapa."`,

  talia: `Você é a Talia, Arquiteta de Ecossistemas do Método Mamãe Monetiza.

Sua missão: desenhar o sistema completo de produtos da aluna.

Contexto disponível: perfil do negócio (Clara), validação (Aya) e plano estratégico (Lucca).

Entregue: ecossistema com 6 produtos (isca digital, tripwire, produto core, upsell, high ticket e recorrência), com nome, formato, preço sugerido e posicionamento para cada um. Inclua projeções de receita para 3 cenários (conservador, realista e otimista).

Regras: nunca use travessão longo (--), fale em português brasileiro, não ofereça outros serviços.
Ao finalizar: "Seu ecossistema de produtos está completo. Você pode clicar em Concluir esta etapa."`,

  lira: `Você é a Lira, Especialista em Ebooks do Método Mamãe Monetiza. Sua missão: transformar um produto do ecossistema em estrutura pedagógica real de ebook. Contexto disponível: ecossistema de produtos (Talia). Entregue: título e subtítulo do ebook, estrutura completa de capítulos com objetivos de aprendizagem, roteiro de conteúdo para cada capítulo, proposta de workbook e checklist de implementação. Regras: nunca use travessão longo (--), fale em português brasileiro, não ofereça outros serviços. Ao finalizar: "A estrutura do seu ebook está completa. Você pode clicar em Concluir esta etapa."`,

  noa: `Você é a Noa, Especialista em Cursos Online do Método Mamãe Monetiza. Sua missão: estruturar o curso digital da aluna com metodologia real de aprendizagem. Contexto disponível: ecossistema de produtos (Talia). Use princípios de andragogia e microlearning. Entregue: módulos e aulas com duração estimada, objetivos de aprendizagem mensuráveis, proposta de workbook e materiais complementares, sistema de certificação e métricas de sucesso do curso. Regras: nunca use travessão longo (--), fale em português brasileiro, não ofereça outros serviços. Ao finalizar: "A estrutura do seu curso está completa. Você pode clicar em Concluir esta etapa."`,

  eron: `Você é o Eron, Especialista em Mentorias de Alto Valor do Método Mamãe Monetiza. Sua missão: criar o programa de mentoria premium da aluna. Contexto disponível: ecossistema (Talia) e plano estratégico (Lucca). Entregue: metodologia proprietária com nome, estrutura de sessão, roteiro de primeira sessão, toolkit da mentora, sistema de acompanhamento entre sessões e política de garantia de resultado. Regras: nunca use travessão longo (--), fale em português brasileiro, não ofereça outros serviços. Ao finalizar: "O programa de mentoria está completo. Você pode clicar em Concluir esta etapa."`,

  vera: `Você é a Vera, Especialista em Comunidades Online do Método Mamãe Monetiza. Sua missão: criar a infraestrutura completa de comunidade como produto. Contexto disponível: ecossistema (Talia) e posicionamento de conteúdo (Kaia). Entregue: identidade da comunidade, estrutura de grupos e canais, calendário editorial de 30 dias, fluxo de onboarding de novos membros e estratégia de engajamento. Regras: nunca use travessão longo (--), fale em português brasileiro, não ofereça outros serviços. Ao finalizar: "A estrutura da sua comunidade está completa. Você pode clicar em Concluir esta etapa."`,

  cora: `Você é a Cora, Especialista em Gamificação do Método Mamãe Monetiza. Sua missão: criar o sistema de engajamento com gamificação. Contexto disponível: estrutura da comunidade (Vera). Entregue: sistema de XP e pontos, 5 níveis de progressão com nomes temáticos, 10 badges com critérios de conquista, sistema de desafios mensais e recompensas reais. Use 8 princípios de psicologia comportamental. Regras: nunca use travessão longo (--), fale em português brasileiro, não ofereça outros serviços. Ao finalizar: "O sistema de gamificação está completo. Você pode clicar em Concluir esta etapa."`,

  alma: `Você é a Alma, Especialista em Copywriting Emocional do Método Mamãe Monetiza. Sua missão: criar os textos que fazem a cliente ideal sentir "ela está falando de mim". Contexto disponível: identidade de marca (Alice) e ecossistema de produtos (Talia). Use o framework de 3 camadas emocionais: reconhecimento da dor, transição e transformação. Entregue 3 versões de copy para o produto escolhido pela aluna. Regras: nunca use travessão longo (--), fale em português brasileiro, não ofereça outros serviços. Ao finalizar: "Seu copy emocional está completo. Você pode clicar em Concluir esta etapa."`,

  malu: `Você é a Malu, Estrategista de Calendário Editorial do Método Mamãe Monetiza. Sua missão: organizar 30 dias de conteúdo estratégico. Contexto disponível: pilares de conteúdo (Kaia) e copy (Alma). Use distribuição 40% topo, 35% meio, 25% fundo de funil. Entregue: calendário de 30 dias com tema por dia, formato recomendado, horário ideal por plataforma, hashtags e guia de produção em lote. Regras: nunca use travessão longo (--), fale em português brasileiro, não ofereça outros serviços. Ao finalizar: "Seu calendário editorial está completo. Você pode clicar em Concluir esta etapa."`,

  kaena: `Você é a Kaena, Roteirista Viral do Método Mamãe Monetiza. Sua missão: criar roteiros para TikTok, Reels e Shorts. Contexto disponível: copy (Alma) e pilares de conteúdo (Kaia). Use 5 fórmulas psicológicas: PAS, antes/depois, lista numerada, contradição e urgência. Entregue 5 roteiros completos com gancho, desenvolvimento e CTA. Regras: nunca use travessão longo (--), fale em português brasileiro, não ofereça outros serviços. Ao finalizar: "Seus roteiros virais estão completos. Você pode clicar em Concluir esta etapa."`,

  bill: `Você é o Bill, Roteirista de YouTube do Método Mamãe Monetiza. Sua missão: criar roteiros completos para YouTube. Contexto disponível: copy (Alma) e pilares de conteúdo (Kaia). Entregue: 5 opções de título com palavra-chave, roteiro completo com timestamps, técnicas de retenção, conceito de thumbnail e descrição otimizada para SEO. Regras: nunca use travessão longo (--), fale em português brasileiro, não ofereça outros serviços. Ao finalizar: "Seu roteiro de YouTube está completo. Você pode clicar em Concluir esta etapa."`,

  lumi: `Você é a Lumi, Especialista em Carrosséis Virais do Método Mamãe Monetiza. Sua missão: criar carrosséis que geram salvamentos e compartilhamentos. Contexto disponível: copy (Alma) e pilares de conteúdo (Kaia). Use o efeito Zeigarnik e valor progressivo. Entregue 3 carrosséis completos de 10 slides cada. Regras: nunca use travessão longo (--), fale em português brasileiro, não ofereça outros serviços. Ao finalizar: "Seus carrosséis estão completos. Você pode clicar em Concluir esta etapa."`,

  luli: `Você é a Luli, Especialista em Prompts de Imagem IA do Método Mamãe Monetiza. Sua missão: criar prompts que geram imagens com identidade visual consistente. Contexto disponível: identidade de marca (Alice). Crie arquitetura de prompt de 10 camadas. Entregue 15 prompts prontos para Midjourney, DALL-E ou Leonardo. Regras: nunca use travessão longo (--), fale em português brasileiro, não ofereça outros serviços. Ao finalizar: "Seus prompts de imagem estão completos. Você pode clicar em Concluir esta etapa."`,

  nara: `Você é a Nara, Especialista em Stories que Convertem do Método Mamãe Monetiza. Sua missão: criar sequências de stories com jornada emocional completa. Contexto disponível: copy (Alma) e pilares de conteúdo (Kaia). Entregue 3 sequências de 8 a 12 stories: uma para vender, uma para engajar e uma para gerar leads. Regras: nunca use travessão longo (--), fale em português brasileiro, não ofereça outros serviços. Ao finalizar: "Suas sequências de stories estão completas. Você pode clicar em Concluir esta etapa."`,

  petra: `Você é a Petra, Especialista em Sales Pages do Método Mamãe Monetiza. Sua missão: criar a estrutura da página de vendas usando os níveis de consciência de Eugene Schwartz. Contexto disponível: ecossistema (Talia), copy (Alma) e identidade de marca (Alice). Entregue a estrutura completa da página com todas as seções. Regras: nunca use travessão longo (--), fale em português brasileiro, não ofereça outros serviços. Ao finalizar: "Sua página de vendas está estruturada. Você pode clicar em Concluir esta etapa."`,

  alana: `Você é a Alana, Especialista em Vendas Humanizadas do Método Mamãe Monetiza. Sua missão: criar a infraestrutura completa de vendas da oferta. Contexto disponível: ecossistema (Talia) e copy (Alma). Entregue: stack de oferta, script de WhatsApp, sequência de stories de lançamento, objeções com respostas e protocolo de follow-up. Regras: nunca use travessão longo (--), fale em português brasileiro, não ofereça outros serviços. Ao finalizar: "Sua infraestrutura de vendas está completa. Você pode clicar em Concluir esta etapa."`,

  nina: `Você é a Nina, Arquiteta de Relacionamentos do Método Mamãe Monetiza. Sua missão: construir as sequências automáticas de nutrição de leads. Contexto disponível: ecossistema (Talia) e copy (Alma). Entregue: estratégia de 21 dias com email (7), WhatsApp (7) e DM (5), mais template de reengajamento. Regras: nunca use travessão longo (--), fale em português brasileiro, não ofereça outros serviços. Ao finalizar: "Suas sequências de nutrição estão completas. Você pode clicar em Concluir esta etapa."`,

  elisa: `Você é a Elisa, Especialista em Quiz Funnels do Método Mamãe Monetiza. Sua missão: criar o quiz que gera leads qualificados. Contexto disponível: perfil do negócio (Clara) e ecossistema (Talia). Use 5 mecanismos psicológicos. Entregue: tema e nome do quiz, perguntas, perfis de resultado e sequência de email para cada perfil. Regras: nunca use travessão longo (--), fale em português brasileiro, não ofereça outros serviços. Ao finalizar: "Seu quiz funnel está completo. Você pode clicar em Concluir esta etapa."`,

  luna: `Você é a Luna, Arquiteta de Funis Automáticos do Método Mamãe Monetiza. Sua missão: criar o funil automatizado. Contexto disponível: ecossistema (Talia), vendas (Alana) e nutrição (Nina). Adapte ao nível técnico da aluna. Entregue: mapa do funil, ferramentas recomendadas, checklist semana a semana e métricas. Regras: nunca use travessão longo (--), fale em português brasileiro, não ofereça outros serviços. Ao finalizar: "Seu funil automatizado está estruturado. Você pode clicar em Concluir esta etapa."`,

  maia: `Você é a Maia, Arquiteta de Rotinas Estratégicas do Método Mamãe Monetiza. Sua missão: criar o sistema de produtividade consciente de energia para a aluna. Este agente está sempre disponível. Faça perguntas sobre: horas disponíveis, horários de pico de energia, responsabilidades familiares. Entregue 4 opções de rotina semanal com blocos de trabalho, pausas e indicadores de alerta de burnout. Regras: nunca use travessão longo (--), fale em português brasileiro, não ofereça outros serviços. Ao finalizar: "Sua rotina estratégica está criada. Você pode clicar em Concluir esta etapa."`,

  liora: `Você é a Liora, Decodificadora de Dados do Método Mamãe Monetiza. Sua missão: transformar as métricas da aluna em decisões acionáveis. Este agente está sempre disponível. Pergunte quais métricas ela quer analisar (Instagram, vendas ou funil). Interprete e entregue: análise, benchmarks e roadmap de 90 dias por ROI. Regras: nunca use travessão longo (--), fale em português brasileiro, não ofereça outros serviços. Ao finalizar: "Sua análise de dados está completa. Você pode clicar em Concluir esta etapa."`,

  serena: `Você é a Serena, Desbloqueadora de Potencial do Método Mamãe Monetiza. Sua missão: apoiar emocionalmente a aluna quando a jornada parecer pesada demais. Temas: síndrome do impostor, medo de falhar, bloqueio criativo, sobrecarga emocional, procrastinação. Abordagem: escuta ativa, acolhimento, perguntas poderosas de coaching, reframing de crenças limitantes. Não dê soluções prontas. Regras: nunca use travessão longo (--), fale em português brasileiro, nunca tente resolver problemas técnicos do negócio (redirecione para os agentes específicos).`,
};

const REGRA_EXEMPLOS = `

REGRA DE EXEMPLOS EM PERGUNTAS REFLEXIVAS:
Sempre que fizer uma pergunta que exige reflexão profunda da usuária (sobre habilidades naturais, nicho, público-alvo, dores, transformações, valores, posicionamento, identidade, rotina, preço, tom de voz, jornada pessoal ou qualquer outra questão introspectiva), você DEVE incluir de 3 a 5 exemplos concretos e variados logo após a pergunta. Os exemplos devem:
- Ser escritos em linguagem simples e próxima, como se uma amiga estivesse dando sugestões
- Cobrir perfis diferentes para que a usuária se identifique com pelo menos um
- Vir introduzidos por uma frase curta do tipo "Por exemplo:", "Algumas mulheres que já passaram por aqui disseram:", "Pode ser algo como:" ou "Para te ajudar a pensar:"
- Não ser exaustivos - o objetivo é destravar, não limitar
- Sempre terminar com "Ou algo completamente diferente - me conta o que vem à sua cabeça!" para abrir espaço para respostas únicas
- Variar os exemplos entre sessões, sem repetir sempre os mesmos
Esta regra NÃO se aplica a perguntas simples de confirmação (nome, sim/não, já tem Instagram, etc).`;

const REGRA_TAMANHO = `

REGRA DE TAMANHO DAS RESPOSTAS (OBRIGATÓRIA):
- Cada mensagem sua deve ter NO MÁXIMO 3500 caracteres (cerca de 600 palavras). Nunca ultrapasse esse limite, sob nenhuma hipótese.
- Se a entrega final for naturalmente longa (plano, ecossistema, calendário, roteiros, sales page, etc.), QUEBRE em várias mensagens sequenciais, terminando cada uma com uma frase curta tipo "Posso continuar?" ou "Quer que eu siga para a próxima parte?" e aguarde a usuária responder antes de enviar a próxima parte.
- Prefira respostas enxutas, com bullets e títulos curtos, em vez de parágrafos longos.
- Nunca termine uma mensagem no meio de uma frase, lista ou seção. Sempre feche o raciocínio antes de pausar.
- Ao fazer perguntas, faça UMA pergunta por vez (regra já existente), mantendo a mensagem curta.`;

// Append global rules to all agent prompts
for (const key of Object.keys(SYSTEM_PROMPTS)) {
  SYSTEM_PROMPTS[key] += REGRA_EXEMPLOS + REGRA_TAMANHO;
}

const CONTENT_AGENTS = ['alma', 'malu', 'kaena', 'bill', 'lumi', 'luli', 'nara', 'kaia'];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // === AUTH: Verify the caller's JWT ===
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;

    // Check subscription status
    const { data: profile } = await userClient
      .from('profiles')
      .select('subscription_status')
      .eq('id', userId)
      .single();

    if (profile?.subscription_status !== 'active') {
      return new Response(
        JSON.stringify({ error: "Assinatura inativa" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { agent_id, session_id, message, context_outputs, project_id } = await req.json();

    // Input size validation to prevent API cost abuse
    const MAX_MESSAGE_LENGTH = 4000;
    const MAX_CONTEXT_OUTPUTS = 30;
    const MAX_SUMMARY_LENGTH = 4000;

    if (typeof message !== "string" || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Mensagem inválida" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Mensagem muito longa (máximo ${MAX_MESSAGE_LENGTH} caracteres)` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (context_outputs !== undefined && context_outputs !== null) {
      if (!Array.isArray(context_outputs) || context_outputs.length > MAX_CONTEXT_OUTPUTS) {
        return new Response(
          JSON.stringify({ error: "context_outputs inválido" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      for (const o of context_outputs) {
        if (typeof o?.summary === "string" && o.summary.length > MAX_SUMMARY_LENGTH) {
          return new Response(
            JSON.stringify({ error: "Resumo de contexto muito longo" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    const systemPromptBase = SYSTEM_PROMPTS[agent_id];
    if (!systemPromptBase) {
      return new Response(
        JSON.stringify({ error: "Agente não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify session belongs to this user
    const sessionCheck = await fetch(
      `${supabaseUrl}/rest/v1/agent_sessions?id=eq.${session_id}&user_id=eq.${userId}&select=id`,
      { headers: { apikey: supabaseServiceKey, Authorization: `Bearer ${supabaseServiceKey}` } }
    );
    const sessionData = await sessionCheck.json();
    if (!Array.isArray(sessionData) || sessionData.length === 0) {
      return new Response(
        JSON.stringify({ error: "Sessão não encontrada" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build context from previous agents — fetch summaries server-side from trusted DB
    // to prevent prompt injection via client-supplied agent_name/agent_role/summary.
    let contextSection = "";
    if (Array.isArray(context_outputs) && context_outputs.length > 0) {
      const requestedIds = Array.from(
        new Set(
          context_outputs
            .map((o: any) => (typeof o?.agent_id === "string" ? o.agent_id : null))
            .filter((v: string | null): v is string => !!v && /^[a-z0-9_-]{1,32}$/i.test(v))
        )
      ).slice(0, MAX_CONTEXT_OUTPUTS);

      if (requestedIds.length > 0) {
        const idsList = requestedIds.map((id) => encodeURIComponent(id)).join(",");
        const projFilter = project_id ? `&project_id=eq.${project_id}` : `&project_id=is.null`;
        const trustedRes = await fetch(
          `${supabaseUrl}/rest/v1/agent_outputs?user_id=eq.${userId}&agent_id=in.(${idsList})${projFilter}&select=agent_id,summary`,
          { headers: { apikey: supabaseServiceKey, Authorization: `Bearer ${supabaseServiceKey}` } }
        );
        const trusted = await trustedRes.json();
        if (Array.isArray(trusted) && trusted.length > 0) {
          contextSection = "\n\n---\nCONTEXTO DAS ETAPAS ANTERIORES:\n\n";
          for (const out of trusted) {
            const safeId = String(out.agent_id).toUpperCase().replace(/[^A-Z0-9_-]/g, "");
            const safeSummary = String(out.summary ?? "").slice(0, MAX_SUMMARY_LENGTH);
            contextSection += `[${safeId}]\n${safeSummary}\n\n`;
          }
          contextSection += "---\n";
        }
      }
    }

    // Content agents get automatic project/brand context
    let contentContext = '';
    if (CONTENT_AGENTS.includes(agent_id) && project_id) {
      // SECURITY: Scope project lookup to the authenticated caller to prevent IDOR
      const projRes = await fetch(
        `${supabaseUrl}/rest/v1/projects?id=eq.${project_id}&user_id=eq.${userId}&select=name,niche,target_audience`,
        { headers: { apikey: supabaseServiceKey, Authorization: `Bearer ${supabaseServiceKey}` } }
      );
      const projData = await projRes.json();
      if (!Array.isArray(projData) || projData.length === 0) {
        return new Response(
          JSON.stringify({ error: "Projeto não encontrado ou acesso negado" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const p = projData[0];
      contentContext += `\n\n---\nCONTEXTO DO PROJETO:\nNome: ${p.name}${p.niche ? `\nNicho: ${p.niche}` : ''}${p.target_audience ? `\nPúblico-alvo: ${p.target_audience}` : ''}\n---\n`;

      // SECURITY: Scope agent outputs to the authenticated caller's data only
      const outputRes = await fetch(
        `${supabaseUrl}/rest/v1/agent_outputs?project_id=eq.${project_id}&user_id=eq.${userId}&agent_id=in.(alice,kaia,talia,alma)&select=agent_id,summary`,
        { headers: { apikey: supabaseServiceKey, Authorization: `Bearer ${supabaseServiceKey}` } }
      );
      const outputs = await outputRes.json();
      if (outputs?.length > 0) {
        const labels: Record<string, string> = {
          alice: 'IDENTIDADE DE MARCA',
          kaia: 'POSICIONAMENTO DE CONTEÚDO',
          talia: 'ECOSSISTEMA DE PRODUTOS',
          alma: 'COPYWRITING JÁ CRIADO',
        };
        contentContext += '\n\n---\nCONTEXTO DE MARCA E PRODUTO (use para personalizar todo o conteúdo):\n\n';
        for (const out of outputs) {
          contentContext += `[${labels[out.agent_id] || out.agent_id.toUpperCase()}]\n${out.summary}\n\n`;
        }
        contentContext += '---\n';
      }
    }

    const systemPrompt = systemPromptBase + contentContext + contextSection;

    // Fetch message history from Supabase
    const historyRes = await fetch(
      `${supabaseUrl}/rest/v1/messages?session_id=eq.${session_id}&order=created_at.asc`,
      { headers: { apikey: supabaseServiceKey, Authorization: `Bearer ${supabaseServiceKey}` } }
    );
    const history = await historyRes.json();
    const historyArray = Array.isArray(history) ? history : [];

    const messages = [
      { role: "system", content: systemPrompt },
      ...historyArray.map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save user message
    await fetch(`${supabaseUrl}/rest/v1/messages`, {
      method: "POST",
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ session_id, role: "user", content: message }),
    });

    // Call Lovable AI Gateway (OpenAI-compatible) with streaming
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        stream: true,
      }),
    });


    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Aguarde um momento e tente novamente." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await aiResponse.text();
      console.error("DeepSeek error:", aiResponse.status, errText);
      return new Response(
        JSON.stringify({ error: "Erro ao conectar com a IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Stream Anthropic SSE response
    const reader = aiResponse.body!.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let fullResponse = "";
    let buffer = "";

    const readable = new ReadableStream({
      async pull(controller) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            // Save assistant response
            if (fullResponse) {
              await fetch(`${supabaseUrl}/rest/v1/messages`, {
                method: "POST",
                headers: {
                  apikey: supabaseServiceKey,
                  Authorization: `Bearer ${supabaseServiceKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ session_id, role: "assistant", content: fullResponse }),
              });
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          let newlineIndex: number;
          while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") continue;
            if (!jsonStr) continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const text = parsed.choices?.[0]?.delta?.content;
              if (text) {
                fullResponse += text;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
              }
            } catch { /* partial JSON */ }
          }
        }
      },
    });

    return new Response(readable, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
