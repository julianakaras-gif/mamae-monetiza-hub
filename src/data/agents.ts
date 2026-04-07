export interface Agent {
  id: string;
  name: string;
  role: string;
  desc: string;
  context: string[];
  welcome: string;
}

export interface Phase {
  id: number;
  name: string;
  sub: string;
  emoji: string;
  color: string;
  sequential?: boolean;
  freeAgents?: boolean;
  alwaysOpen?: boolean;
  agents: Agent[];
}

export const PHASES: Phase[] = [
  {
    id: 1,
    name: 'Descoberta',
    sub: 'Encontre seu negócio autêntico',
    emoji: '🌱',
    color: '#df437d',
    sequential: true,
    agents: [
      {
        id: 'clara',
        name: 'Clara',
        role: 'Reveladora de Negócios Autênticos',
        desc: 'Descobre o negócio alinhado aos seus dons genuínos e ao mercado real. Faz perguntas estratégicas e entrega 5 conceitos com análise SWOT e roadmap de 90 dias.',
        context: [],
        welcome: 'Olá! Eu sou a Clara 🌸\n\nMeu trabalho é te ajudar a descobrir o negócio mais autêntico para você: aquele que combina seus dons reais com o que o mercado realmente precisa.\n\nPara começar, me conta: **o que você faz tão naturalmente que às vezes nem percebe que é um talento?**',
      },
      {
        id: 'aya',
        name: 'Aya',
        role: 'Validadora de Mercado',
        desc: 'Avalia a viabilidade real dos conceitos de negócio. Entrega veredicto (validado, pivotar ou abandonar) com 3 insights acionáveis e protocolo de teste de 48h.',
        context: ['clara'],
        welcome: 'Olá! Eu sou a Aya 📊\n\nRecebi os conceitos que você desenvolveu com a Clara. Já estou analisando cada um sob a ótica do mercado real.\n\nMinha função é ser honesta com você, porque começar no negócio certo economiza meses de esforço no negócio errado.\n\n**Qual dos conceitos você sente mais conexão? Isso vai me ajudar a priorizar minha análise.**',
      },
    ],
  },
  {
    id: 2,
    name: 'Estratégia',
    sub: 'Plano, marca e ecossistema de produtos',
    emoji: '🎯',
    color: '#29a6ab',
    sequential: true,
    agents: [
      {
        id: 'lucca',
        name: 'Lucca',
        role: 'Consultor Estratégico',
        desc: 'Cria plano de implementação detalhado com base nos seus recursos reais. Entrega 2 opções de plano estratégico e cronograma semanal de ação.',
        context: ['clara', 'aya'],
        welcome: 'Olá! Eu sou o Lucca 🎯\n\nRecebi os dados de validação da Aya e o perfil do seu negócio. Vou criar um plano de implementação realista com o tempo, orçamento e habilidades que você realmente tem.\n\n**Para calibrar o plano: qual é o seu orçamento mensal disponível para o negócio agora?**',
      },
      {
        id: 'alice',
        name: 'Alice',
        role: 'Arquiteta de Marcas',
        desc: 'Constrói identidade de marca completa de dentro para fora: 3 pilares, paleta visual, tipografia, manual de voz e 5 micro-histórias.',
        context: ['clara', 'lucca'],
        welcome: 'Olá! Eu sou a Alice ✨\n\nJá tenho o perfil do seu negócio e o plano do Lucca. Vou construir a marca que representa quem você realmente é: não uma persona, mas a sua essência potencializada.\n\n**Se sua marca fosse uma pessoa, como ela seria?**',
      },
      {
        id: 'kaia',
        name: 'Kaia',
        role: 'Estrategista de Conteúdo Autêntico',
        desc: 'Constrói posicionamento corajoso e específico. Entrega manifesto da marca, 3 a 5 pilares de conteúdo honestos e 10 posts autênticos.',
        context: ['alice', 'clara'],
        welcome: 'Olá! Eu sou a Kaia 📣\n\nRecebi a identidade de marca que a Alice construiu com você. Agora vou criar um posicionamento de conteúdo corajoso e específico.\n\nConteúdo genérico não constrói negócio. **Qual é a crença que você tem sobre o seu nicho que a maioria ainda não percebeu?**',
      },
      {
        id: 'talia',
        name: 'Talia',
        role: 'Arquiteta de Ecossistemas',
        desc: 'Desenha sistema completo de 6 produtos: isca, tripwire, core, upsell, high ticket e recorrência. Inclui projeções de receita para 3 cenários.',
        context: ['clara', 'aya', 'lucca'],
        welcome: 'Olá! Eu sou a Talia 💎\n\nTenho o perfil completo do negócio, a validação da Aya e a estratégia do Lucca. Agora vou construir o ecossistema de produtos.\n\nUm único produto não é negócio: é um emprego. **Qual é a transformação principal que você entrega para suas clientes?**',
      },
    ],
  },
  {
    id: 3,
    name: 'Produto',
    sub: 'Crie seus produtos digitais e sua comunidade',
    emoji: '📦',
    color: '#4a5759',
    freeAgents: true,
    agents: [
      { id: 'lira', name: 'Lira', role: 'Especialista em Ebooks', desc: 'Cria ebooks e iscas digitais para cada posição do funil com estrutura pedagógica real. Entrega arquitetura completa, roteiro, workbook e checklists.', context: ['talia'], welcome: 'Olá! Eu sou a Lira 📚\n\nA Talia já definiu o ecossistema de produtos. Vou pegar o ebook ou isca digital do seu ecossistema e transformar em estrutura pedagógica real.\n\n**Qual produto do ecossistema você quer criar primeiro como ebook?**' },
      { id: 'noa', name: 'Noa', role: 'Especialista em Cursos Online', desc: 'Cria programas de aprendizagem estruturados com andragogia e microlearning. Inclui workbook, checklists, templates e sistema de certificação.', context: ['talia'], welcome: 'Olá! Eu sou a Noa 🎓\n\nTenho o ecossistema de produtos da Talia. Vou estruturar o seu curso com metodologia real, para que as alunas apliquem e tenham resultado, não apenas assistam.\n\n**Qual é o resultado que sua aluna ideal deve alcançar ao final do curso?**' },
      { id: 'eron', name: 'Eron', role: 'Especialista em Mentorias de Alto Valor', desc: 'Desenha programas premium de mentoria com 6 pilares: metodologia proprietária, estrutura de sessão, roteiros, toolkit e acompanhamento.', context: ['talia', 'lucca'], welcome: 'Olá! Eu sou o Eron 💼\n\nMentoria de alto valor não é uma conversa cara: é uma transformação estruturada com metodologia e resultado garantido. Vou criar o programa que justifica o seu preço premium.\n\n**Qual formato você imagina: individual, grupo, VIP day ou retainer?**' },
      { id: 'vera', name: 'Vera', role: 'Especialista em Comunidades Online', desc: 'Cria infraestrutura completa de comunidade como produto: identidade, estrutura, regras, calendário editorial de 30 dias e fluxo de onboarding.', context: ['talia', 'kaia'], welcome: 'Olá! Eu sou a Vera 🌐\n\nComunidade pode ser um produto de recorrência poderoso no seu ecossistema. Vou criar toda a estrutura para que os membros queiram ficar, participar e indicar.\n\n**Você imagina uma comunidade paga separada ou como bônus de outro produto?**' },
      { id: 'cora', name: 'Cora', role: 'Especialista em Gamificação', desc: 'Cria sistema de engajamento com XP, níveis de progressão, badges, sistema de desafios e recompensas usando 8 princípios de psicologia comportamental.', context: ['vera'], welcome: 'Olá! Eu sou a Cora 🎮\n\nGameficação bem feita transforma participação passiva em engajamento ativo. Vou criar o sistema de pontos, níveis e recompensas que faz suas alunas quererem avançar.\n\n**Qual comportamento principal você quer incentivar nas suas alunas?**' },
    ],
  },
  {
    id: 4,
    name: 'Conteúdo',
    sub: 'Crie conteúdo que atrai, engaja e converte',
    emoji: '✨',
    color: '#c49a30',
    freeAgents: true,
    agents: [
      { id: 'alma', name: 'Alma', role: 'Especialista em Copywriting Emocional', desc: 'Cria copy com framework de 3 camadas emocionais. Entrega 3 versões de texto: reconhecimento, transição e transformação.', context: ['alice', 'talia'], welcome: 'Olá! Eu sou a Alma 💬\n\nTenho a identidade de marca da Alice e o ecossistema da Talia. Vou criar os textos que fazem sua cliente sentir: ela está falando de mim.\n\n**Para qual produto você quer o copy primeiro?**' },
      { id: 'malu', name: 'Malu', role: 'Estrategista de Calendário Editorial', desc: 'Organiza 30 dias de conteúdo com distribuição 40/35/25 de funil, horários de publicação, hashtags por plataforma e guia de produção em lote.', context: ['kaia', 'alma'], welcome: 'Olá! Eu sou a Malu 📅\n\nNão precisa postar todo dia para ter resultado: precisa postar com estratégia. Tenho os pilares de conteúdo da Kaia para montar seu calendário de 30 dias.\n\n**Em quais plataformas você quer publicar conteúdo?**' },
      { id: 'kaena', name: 'Kaena', role: 'Roteirista Viral', desc: 'Cria roteiros para TikTok, Reels e Shorts usando 5 fórmulas psicológicas. Inclui legenda e métricas esperadas.', context: ['alma', 'kaia'], welcome: 'Olá! Eu sou a Kaena 🎬\n\nVídeos curtos que param o scroll seguem fórmulas psicológicas testadas. Vou criar roteiros que você grava em menos de 5 minutos.\n\n**Qual tema de conteúdo você quer gravar primeiro?**' },
      { id: 'bill', name: 'Bill', role: 'Roteirista de YouTube', desc: 'Cria roteiro completo para YouTube com timestamps, especificações técnicas, 5 opções de título, conceitos de thumbnail e estratégias de retenção.', context: ['alma', 'kaia'], welcome: 'Olá! Eu sou o Bill 🎥\n\nYouTube é o maior motor de busca do mundo depois do Google. Vou criar um roteiro completo com o que falar, quando falar e como manter o espectador até o final.\n\n**Qual assunto você quer abordar no primeiro vídeo?**' },
      { id: 'lumi', name: 'Lumi', role: 'Especialista em Carrosséis Virais', desc: 'Cria 3 carrosséis de 10 slides usando efeito Zeigarnik e valor progressivo. Entrega copy e orientação visual slide a slide.', context: ['alma', 'kaia'], welcome: 'Olá! Eu sou a Lumi 🎠\n\nCarrosséis bem feitos geram mais salvamentos e compartilhamentos do que qualquer outro formato. Vou criar 3 carrosséis completos com copy, visual e psicologia em cada slide.\n\n**Qual dos seus pilares de conteúdo você quer explorar primeiro?**' },
      { id: 'luli', name: 'Luli', role: 'Especialista em Prompts de Imagem IA', desc: 'Cria arquitetura de prompt de 10 camadas para Midjourney, DALL-E e Leonardo. Gera imagens com identidade visual consistente da marca.', context: ['alice'], welcome: 'Olá! Eu sou a Luli 🎨\n\nTenho a identidade visual que a Alice criou para você. Vou transformar isso em prompts que geram imagens que parecem ser sempre da mesma fotógrafa.\n\n**Para qual plataforma você precisa de mais imagens agora?**' },
      { id: 'nara', name: 'Nara', role: 'Especialista em Stories que Convertem', desc: 'Cria sequências de 8 a 12 stories com jornada emocional completa, elementos interativos e guia de produção.', context: ['alma', 'kaia'], welcome: 'Olá! Eu sou a Nara 📱\n\nStories são o canal mais íntimo das redes sociais: por isso convertem tão bem quando feitos com intenção. Vou criar sequências que levam sua seguidora de apenas olhando para quero comprar.\n\n**Você quer uma sequência para vender, engajar ou gerar leads?**' },
    ],
  },
  {
    id: 5,
    name: 'Vendas',
    sub: 'Monte sua máquina de vendas',
    emoji: '💰',
    color: '#df437d',
    freeAgents: true,
    agents: [
      { id: 'petra', name: 'Petra', role: 'Especialista em Sales Pages', desc: 'Cria páginas de vendas usando o framework de níveis de consciência de Eugene Schwartz.', context: ['talia', 'alma', 'alice'], welcome: 'Olá! Eu sou a Petra 📝\n\nTenho o ecossistema de produtos, o copy da Alma e a identidade da Alice. Página que converte não é sobre design bonito: é sobre falar a coisa certa para a pessoa certa no momento certo.\n\n**Para qual produto você quer criar a página de vendas primeiro?**' },
      { id: 'alana', name: 'Alana', role: 'Especialista em Vendas Humanizadas', desc: 'Cria infraestrutura completa de vendas: stack de oferta, copy, scripts de WhatsApp, sequências de stories e tratamento de objeções.', context: ['talia', 'alma'], welcome: 'Olá! Eu sou a Alana 🤝\n\nVender não precisa ser chato ou desconfortável. Vou criar toda a infraestrutura de vendas da sua oferta com conexão humana em cada etapa.\n\n**Qual produto você quer estruturar as vendas agora?**' },
      { id: 'nina', name: 'Nina', role: 'Arquiteta de Relacionamentos', desc: 'Constrói sequências de nutrição multicanal (WhatsApp, email e DM) com estratégia completa de 21 dias.', context: ['talia', 'alma'], welcome: 'Olá! Eu sou a Nina 💌\n\nLeads não compram na primeira vez: precisam de relacionamento. Vou criar as sequências automáticas que mantêm sua marca presente na vida da sua cliente até ela estar pronta para comprar.\n\n**Por onde você prefere começar: email, WhatsApp ou DM do Instagram?**' },
      { id: 'elisa', name: 'Elisa', role: 'Especialista em Quiz Funnels', desc: 'Cria sistema de geração de leads via quiz com 5 mecanismos psicológicos e segmentação automática.', context: ['clara', 'talia'], welcome: 'Olá! Eu sou a Elisa 🎯\n\nQuiz é uma das formas mais poderosas de capturar leads e segmentá-los automaticamente. Vou criar o quiz completo: perguntas, resultados personalizados e sequência de email para cada perfil.\n\n**Qual é o tema do quiz?**' },
      { id: 'luna', name: 'Luna', role: 'Arquiteta de Funis Automáticos', desc: 'Cria funis que vendem 24h por dia, adaptados ao nível técnico. Entrega checklist de implementação semana a semana.', context: ['talia', 'alana', 'nina'], welcome: 'Olá! Eu sou a Luna 🌙\n\nFunil automatizado não é coisa de empresa grande: é o jeito mais inteligente de uma pessoa só fazer o trabalho de uma equipe. Vou criar a estrutura que vende enquanto você dorme.\n\n**Você tem alguma ferramenta de email ou página de vendas já configurada?**' },
    ],
  },
  {
    id: 6,
    name: 'Execução',
    sub: 'Rotinas, dados e escala sustentável',
    emoji: '🚀',
    color: '#c49a30',
    alwaysOpen: true,
    freeAgents: true,
    agents: [
      { id: 'maia', name: 'Maia', role: 'Arquiteta de Rotinas Estratégicas', desc: 'Constrói sistema de produtividade consciente de energia. Previne burnout com 4 opções de rotina adaptadas à sua realidade como mãe empreendedora.', context: [], welcome: 'Olá! Eu sou a Maia ⚡\n\nProdutividade para mãe empreendedora não é fazer mais: é fazer o que importa no tempo que você tem. Vou criar sua rotina respeitando sua energia, sua família e sua saúde.\n\n**Quantas horas por dia você tem disponível para o negócio?**' },
    ],
  },
];

export const SERENA = {
  id: 'serena',
  name: 'Serena',
  role: 'Desbloqueadora de Potencial',
  color: '#df437d',
  welcome: 'Olá! Eu sou a Serena 💛\n\nEstou aqui para quando a jornada parecer pesada demais. Síndrome do impostor, medo de falhar, bloqueio criativo, sobrecarga emocional: traga pra cá. Juntas a gente desbloqueia o que está te impedindo de avançar.\n\n**O que você está sentindo agora?**',
};

// Helper to find an agent by ID across all phases
export function findAgent(agentId: string): { agent: Agent; phase: Phase } | null {
  for (const phase of PHASES) {
    const agent = phase.agents.find((a) => a.id === agentId);
    if (agent) return { agent, phase };
  }
  return null;
}

// Get all agent IDs
export function getAllAgentIds(): string[] {
  return PHASES.flatMap((p) => p.agents.map((a) => a.id));
}
