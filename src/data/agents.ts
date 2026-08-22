export interface Agent {
  id: string;
  name: string;
  role: string;
  desc: string;
  welcome: string;
}

export type TrilhaId = "af" | "ugc" | "pp" | "dk";

export interface TrilhaAlternativa {
  agentId: string;
  nome: string;
  oque: string;
}

export interface TrilhaStep {
  ordem: number;
  agentId: string;
  oque: string;
  textoAntes?: string;
  textoDepois?: string;
  divisoria?: string;
  alternativas?: TrilhaAlternativa[];
}

export interface TrilhaDef {
  id: TrilhaId;
  nome: string;
  objetivo: string;
  descricao: string;
  cor: string;
  emoji: string;
  passos: TrilhaStep[];
}

export const AGENTS: Record<string, Agent> = {
  clara: {
    id: "clara",
    name: "Clara",
    role: "Reveladora de Negócios",
    desc: "Descobre qual negócio está escondido na sua história e define o primeiro produto que você vai vender.",
    welcome: "Oi, eu sou a Clara. Vou te ajudar a achar ou lapidar o negócio que você vai construir, e fechar o primeiro produto que você consegue vender logo.\n\nExistem três caminhos: você ainda não sabe o que fazer, tem uma ideia vaga, ou já sabe o que quer e só precisa fechar.\n\n**Qual desses é o seu caso agora?**",
  },
  aya: {
    id: "aya",
    name: "Aya",
    role: "Pesquisa de Mercado",
    desc: "Pesquisa o mercado com fontes reais e mostra o que encontrou.",
    welcome: "Oi, eu sou a Aya. Meu trabalho é pesquisar o seu mercado de verdade, com fonte, e te mostrar o que encontrei, sem inventar nada bonito.\n\n**O que você quer vender, em uma frase?**",
  },
  talia: {
    id: "talia",
    name: "Talia",
    role: "Preço e Formato",
    desc: "Define o formato que você cria primeiro e por quanto vende.",
    welcome: "Oi, eu sou a Talia. Vou fechar duas coisas com você: qual formato de produto você cria primeiro, e por quanto vende.\n\n**Qual desses você quer criar: e-book, planner ou planilha, curso online, ou mentoria e consultoria 1 a 1?**",
  },
  alice: {
    id: "alice",
    name: "Alice",
    role: "Identidade de Marca",
    desc: "Suas cores, fontes, jeito de falar, e gera a sua logo.",
    welcome: "Oi, eu sou a Alice. Vou transformar o seu negócio numa identidade que você consegue aplicar essa semana: cores, fontes, jeito de escrever, e a sua logo, que eu mesma gero.\n\n**Quais cores você não suporta ver?**",
  },
  lira: {
    id: "lira",
    name: "Lira",
    role: "E-book, Planner, Template e Planilha",
    desc: "Cria seu produto escrito, do índice à entrega.",
    welcome: "Oi, eu sou a Lira. Vou escrever o seu produto com você, e você sai daqui com o material pronto, não com um plano de escrever.\n\n**Qual formato você vai criar: e-book, planner, template ou planilha?**",
  },
  noa: {
    id: "noa",
    name: "Noa",
    role: "Curso Online",
    desc: "Monta seu curso e escreve os roteiros de teleprompter.",
    welcome: "Oi, eu sou a Noa. Vou montar a arquitetura do seu curso e escrever os roteiros de teleprompter, palavra por palavra, prontos pra você gravar.\n\n**Quantas horas por semana você consegue reservar pra gravar e editar?**",
  },
  eron: {
    id: "eron",
    name: "Eron",
    role: "Mentoria e Consultoria",
    desc: "Estrutura seu programa e os roteiros de cada sessão.",
    welcome: "Oi, eu sou o Eron. Mentoria e consultoria são o único formato que você pode vender antes de produzir qualquer coisa: você vende a vaga e entrega na semana seguinte.\n\n**Quantas horas por semana você consegue reservar pra atender, em horários que você tem certeza que cumpre?**",
  },
  bia: {
    id: "bia",
    name: "Bia",
    role: "Afiliação",
    desc: "Escolhe o produto pra afiliar e monta seu kit de divulgação.",
    welcome: "Oi, eu sou a Bia. Vou te ajudar a escolher um produto pra afiliar e montar sua divulgação, do zero até a primeira comissão.\n\n**Que tipo de produto você teria orgulho de recomendar pra uma amiga: um curso ou material digital, ou produtos físicos do dia a dia, tipo casa, beleza, infantil?**",
  },
  manu: {
    id: "manu",
    name: "Manu",
    role: "UGC pra Marcas",
    desc: "Nicho, preço, lista de marcas, roteiros de portfólio e a proposta.",
    welcome: "Oi, eu sou a Manu. Uma coisa antes de tudo: UGC não é ser influenciadora. Você não precisa de seguidores, e quem paga é a marca. Dá pra fazer sem aparecer de rosto, inclusive.\n\n**Que tipo de produto você já usa e conhece de verdade: casa, cozinha, beleza, infantil, organização, pet?**",
  },
  kaia: {
    id: "kaia",
    name: "Kaia",
    role: "Posicionamento",
    desc: "O que você defende, o que contesta, e 10 temas prontos.",
    welcome: "Oi, eu sou a Kaia. Vou te ajudar a definir o que você defende, o que faz diferente, e te entregar 10 temas prontos pro seu conteúdo.\n\nAntes de tudo: me diz como você quer soar. Suave, você ensina e ajuda sem confrontar ninguém. Firme, você tem opinião e diz o que funciona, sem provocar. Direta, você quebra mito de frente e filtra audiência de propósito.\n\n**Qual é a sua?**",
  },
  lumi: {
    id: "lumi",
    name: "Lumi",
    role: "Carrosséis",
    desc: "Transforma um tema em carrossel, com o texto e as artes.",
    welcome: "Oi, eu sou a Lumi. Vou transformar um tema do seu banco em carrossel, com o texto e as artes prontas.\n\n**Qual dos seus temas você quer transformar em carrossel agora?**",
  },
  nara: {
    id: "nara",
    name: "Nara",
    role: "Stories",
    desc: "Escolhe uma das sequências testadas e adapta ao seu caso.",
    welcome: "Oi, eu sou a Nara. Vou montar uma sequência de stories que leva quem te segue até o seu direct.\n\n**O que você quer que aconteça no fim dessa sequência: as pessoas te chamarem no direct, mandarem pergunta na caixinha, clicarem no seu link, ou vender de verdade agora?**",
  },
  kaena: {
    id: "kaena",
    name: "Kaena",
    role: "Roteiros de Vídeo",
    desc: "Roteiro dos seus Reels, TikToks e Shorts.",
    welcome: "Oi, eu sou a Kaena. Escrevo roteiros de Reels, TikTok e Shorts pra você gravar, do seu jeito.\n\n**Quem vai ver esse vídeo já sabe que tem esse problema, ou nem percebeu ainda?**",
  },
  malu: {
    id: "malu",
    name: "Malu",
    role: "Calendário de Publicação",
    desc: "Organiza o que você já criou num calendário que você consegue cumprir.",
    welcome: "Oi, eu sou a Malu. Eu organizo o que você já criou num calendário que você consegue cumprir de verdade, sem inventar conteúdo novo.\n\n**Quantas publicações por semana você consegue fazer, numa semana ruim?**",
  },
  maia: {
    id: "maia",
    name: "Maia",
    role: "Rotina",
    desc: "Corta o trabalho em pedaços que cabem nos seus tempinhos.",
    welcome: "Oi, eu sou a Maia. Vou te ajudar a encaixar o seu negócio no tempo que você realmente tem, não no tempo que os métodos assumem que você tem.\n\n**Me descreve um dia normal seu, do acordar ao dormir, sem arrumar, do jeito que é.**",
  },
  nina: {
    id: "nina",
    name: "Nina",
    role: "Aquecimento",
    desc: "Aquece quem comentou ou mandou direct até virar conversa de venda.",
    welcome: "Oi, eu sou a Nina. Pego quem já demonstrou algum interesse em você, comentou, respondeu story, mandou direct, e aqueço até a pessoa estar pronta pra ouvir uma oferta.\n\n**Quantas pessoas já interagiram com você de alguma forma? Um número aproximado.**",
  },
  alana: {
    id: "alana",
    name: "Alana",
    role: "Oferta e Venda",
    desc: "Fecha sua oferta e escreve a conversa que vende.",
    welcome: "Oi, eu sou a Alana. Meu trabalho é te levar até a primeira venda: fechar sua oferta e escrever a conversa que vende.\n\nAviso: eu não vou elogiar o que estiver fraco. Se sua oferta não estiver de pé, eu falo.\n\n**O que você precisa agora: montar a oferta e o preço, o script de WhatsApp, ou o texto pra post, story ou anúncio?**",
  },
  petra: {
    id: "petra",
    name: "Petra",
    role: "Página de Vendas",
    desc: "Transforma a oferta que você já vendeu numa página.",
    welcome: "Oi, eu sou a Petra. Transformo a oferta que você já vendeu por conversa numa página.\n\n**Quem vai cair nessa página, em que ponto está: nem sabe que tem esse problema, sente o problema mas não sabe da solução, sabe da solução mas não conhece a sua, já conhece o seu produto, ou já quer comprar e só falta o link?**",
  },
  liora: {
    id: "liora",
    name: "Liora",
    role: "Seus Números",
    desc: "Lê o que você publicou e vendeu, e mostra o que funcionou.",
    welcome: "Oi, eu sou a Liora. Leio os seus números e respondo uma pergunta: o que fez alguém chegar até você, e o que fez alguém comprar.\n\n**Nos últimos 30 dias, quantas publicações você fez?**",
  },
  lucca: {
    id: "lucca",
    name: "Lucca",
    role: "Plano de Crescimento",
    desc: "Mostra onde está seu gargalo e monta o plano de 4 semanas.",
    welcome: "Oi, eu sou o Lucca. Entro depois que você já vendeu, ou pelo menos tentou.\n\n**Você já vendeu? Quantas vezes, e por qual caminho: conversa no WhatsApp, comentário num post, indicação?**",
  },
  luna: {
    id: "luna",
    name: "Luna",
    role: "Automação Simples",
    desc: "Automatiza o que você repete todo dia, pra sobrar tempo.",
    welcome: "Oi, eu sou a Luna. Antes de tudo, uma verdade: automação não faz gente aparecer, ela cuida melhor de quem já apareceu.\n\n**Quantas pessoas te procuraram no último mês?**",
  },
  elisa: {
    id: "elisa",
    name: "Elisa",
    role: "Quiz",
    desc: "Monta o quiz que qualifica quem chega e te devolve as palavras do seu público.",
    welcome: "Oi, eu sou a Elisa. Monto um quiz curto e gratuito que descobre o que a pessoa precisa e te devolve as palavras que o seu público usa de verdade.\n\n**Quantas pessoas te procuram por semana perguntando sobre o que você vende?**",
  },
  vera: {
    id: "vera",
    name: "Vera",
    role: "Comunidade",
    desc: "Monta e mantém o grupo com as pessoas que já compraram de você.",
    welcome: "Oi, eu sou a Vera. Vou te ajudar a montar e manter um grupo com as pessoas que já compraram de você.\n\n**Antes de criar o grupo, uma pergunta honesta: quantos minutos por dia você consegue dedicar a ele, todo dia, pelos próximos três meses?**",
  },
  cora: {
    id: "cora",
    name: "Cora",
    role: "Conclusão",
    desc: "Faz quem comprou terminar, pra virar depoimento e não virar reembolso.",
    welcome: "Oi, eu sou a Cora. Meu trabalho é fazer quem comprou de você terminar o que comprou, porque quem termina vira depoimento e quem não termina pede reembolso.\n\n**Quantas pessoas já compraram esse produto?**",
  },
  luli: {
    id: "luli",
    name: "Luli",
    role: "Imagens",
    desc: "Gera as imagens que você precisa: thumbnail, criativo, capa e imagem de apoio.",
    welcome: "Oi, eu sou a Luli. Eu gero as imagens que você precisa: thumbnail, criativo, capa, imagem de apoio.\n\n**Onde essa imagem vai aparecer: thumbnail de vídeo, post no feed, story, capa de e-book, foto de perfil, ou criativo de anúncio?**",
  },
  bill: {
    id: "bill",
    name: "Bill",
    role: "Canal sem Aparecer",
    desc: "Monta seu canal sem rosto e escreve os roteiros.",
    welcome: "Oi, eu sou o Bill. Monto canais onde você não aparece: sem rosto, sem a sua voz, com vídeo gerado por IA.\n\n**Onde você quer começar: vídeo curto (Shorts, TikTok, Reels) ou vídeo longo (YouTube)?**",
  },
};

export const TRILHAS: Record<TrilhaId, TrilhaDef> = {
  af: {
    id: "af",
    nome: "Afiliação",
    objetivo: "Sua primeira comissão vendendo o produto de outra pessoa.",
    descricao: "Você não cria nada. Escolhe um produto bom, recebe seu link e divulga pra quem tem o problema que aquele produto resolve.",
    cor: "#3A5C46",
    emoji: "🤝",
    passos: [
      { ordem: 1, agentId: "bia", oque: "Escolhe o produto, guia o cadastro, entrega o link e monta seu kit de divulgação" },
      { ordem: 2, agentId: "alice", oque: "A cara da sua marca: cores, fontes e a logo, que ela mesma gera" },
      { ordem: 3, agentId: "kaia", oque: "O que você defende, o que contesta, e 10 temas prontos pros próximos robôs" },
      { ordem: 4, agentId: "lumi", oque: "Transforma um tema do seu banco em carrossel, com as artes" },
      { ordem: 5, agentId: "nara", oque: "Sequências de stories que levam a pessoa até o seu direct" },
      { ordem: 6, agentId: "kaena", oque: "Roteiros de Reels, TikTok e Shorts pra você gravar" },
      { ordem: 7, agentId: "maia", oque: "Corta o trabalho em pedaços que cabem nos seus tempinhos" },
      { ordem: 8, agentId: "malu", oque: "Calendário de 30 dias com o que você já criou" },
      { ordem: 9, agentId: "nina", oque: "Aquece quem comentou ou mandou direct, até virar conversa de venda" },
      { ordem: 10, agentId: "alana", oque: "Sua oferta, os scripts de venda, as objeções e a retomada" },
      { ordem: 11, agentId: "liora", oque: "O que está funcionando e o que parar de fazer" },
      { ordem: 12, agentId: "petra", oque: "Página que apresenta o produto com a sua cara" },
      { ordem: 13, agentId: "luna", oque: "Automatiza o que você repete todo dia" },
      { ordem: 14, agentId: "lucca", oque: "Onde está seu gargalo e o plano das próximas 4 semanas" },
      { ordem: 15, agentId: "vera", oque: "Grupo com quem já comprou pelo seu link" },
      { ordem: 16, agentId: "luli", oque: "Gera as imagens que você precisa: capa, criativo e imagem de apoio" },
    ],
  },
  ugc: {
    id: "ugc",
    nome: "UGC",
    objetivo: "Seu primeiro trabalho pago gravando vídeos caseiros pra marcas.",
    descricao: "Você grava vídeos curtos de produto com o celular, em casa. Não precisa de seguidores, não precisa mostrar o rosto se não quiser. Quem paga é a marca, não o público.",
    cor: "#C6A86C",
    emoji: "🎥",
    passos: [
      { ordem: 1, agentId: "manu", oque: "Define seu nicho de produtos e sua tabela de preços" },
      { ordem: 2, agentId: "manu", oque: "Monta sua lista de 20 marcas e o briefing dos 3 vídeos", textoAntes: "Você mapeia as marcas ANTES de ligar a câmera. Vídeo feito no vácuo não abre porta, porque cada marca quer ver o tipo de produto DELA sendo filmado." },
      { ordem: 3, agentId: "manu", oque: "Escreve os roteiros dos 3 vídeos de portfólio, mirados nas marcas da sua lista" },
      { ordem: 4, agentId: "manu", oque: "Mensagem de proposta, retomada e quando parar de insistir" },
      { ordem: 5, agentId: "maia", oque: "Organiza gravação, edição e envio dentro da sua semana" },
      { ordem: 6, agentId: "alice", oque: "Sua identidade como criadora: cores, fontes e logo" },
      { ordem: 7, agentId: "luli", oque: "Gera as imagens da sua apresentação e do portfólio" },
      { ordem: 8, agentId: "petra", oque: "Página de portfólio pra mandar junto com a proposta" },
      { ordem: 9, agentId: "kaia", oque: "Seu posicionamento e os temas que fazem marcas te acharem" },
      { ordem: 10, agentId: "lumi", oque: "Transforma um tema do seu banco em carrossel, com as artes" },
      { ordem: 11, agentId: "nara", oque: "Sequências de stories" },
      { ordem: 12, agentId: "malu", oque: "Calendário de publicação" },
      { ordem: 13, agentId: "liora", oque: "O que está funcionando" },
      { ordem: 14, agentId: "lucca", oque: "Onde está seu gargalo e o plano das próximas 4 semanas" },
    ],
  },
  pp: {
    id: "pp",
    nome: "Produto Próprio",
    objetivo: "Sua primeira venda de um produto criado por você.",
    descricao: "Você transforma o que já sabe em e-book, curso, planner ou consultoria. É a trilha que dá mais trabalho no começo e mais liberdade depois.",
    cor: "#1C3C2C",
    emoji: "📦",
    passos: [
      { ordem: 1, agentId: "clara", oque: "Descobre qual negócio está escondido na sua história e nos seus talentos", textoAntes: "Já sabe o que quer vender? Pula a Clara e vai direto pra Aya." },
      { ordem: 2, agentId: "aya", oque: "Pesquisa o mercado com fonte e link, e mostra o que encontrou" },
      { ordem: 3, agentId: "talia", oque: "Define o formato que você cria primeiro e por quanto vende" },
      { ordem: 4, agentId: "alice", oque: "Suas cores, suas fontes, seu jeito de falar, e ela GERA a sua logo" },
      {
        ordem: 5,
        agentId: "escolha-formato",
        oque: "Abra só o robô que a Talia indicou.",
        textoAntes: "A Talia já definiu o seu formato. Abra só o robô que ela indicou.",
        alternativas: [
          { agentId: "lira", nome: "Lira", oque: "Cria e-book, planner, planilha ou template, do índice à entrega" },
          { agentId: "noa", nome: "Noa", oque: "Estrutura seu curso em módulos e aulas, com roteiro de gravação" },
          { agentId: "eron", nome: "Eron", oque: "Monta sua mentoria ou consultoria: formato, sessões e entrega" },
        ],
      },
      { ordem: 6, agentId: "kaia", oque: "O que você defende, o que contesta, e 10 temas prontos pros próximos robôs" },
      { ordem: 7, agentId: "lumi", oque: "Transforma um tema do seu banco em carrossel, com as artes" },
      { ordem: 8, agentId: "nara", oque: "Sequências de stories que levam a pessoa até o seu direct" },
      { ordem: 9, agentId: "kaena", oque: "Roteiros de Reels, TikTok e Shorts pra você gravar" },
      { ordem: 10, agentId: "maia", oque: "Corta o trabalho em pedaços que cabem nos seus tempinhos" },
      { ordem: 11, agentId: "malu", oque: "Calendário de 30 dias com o que você já criou" },
      { ordem: 12, agentId: "nina", oque: "Aquece quem comentou ou mandou direct, até virar conversa de venda" },
      { ordem: 13, agentId: "alana", oque: "Sua oferta, os scripts de venda, as objeções e a retomada", divisoria: "Daqui pra baixo é crescimento. A primeira venda já é possível com o que você tem." },
      { ordem: 14, agentId: "lucca", oque: "Onde está seu gargalo e o plano das próximas 4 semanas", textoDepois: "Você não precisa de página de vendas pra fazer a primeira venda. WhatsApp com link de checkout resolve. A Petra te espera quando fizer sentido." },
      { ordem: 15, agentId: "petra", oque: "Sua página de vendas" },
      { ordem: 16, agentId: "liora", oque: "O que está funcionando e o que parar de fazer" },
      { ordem: 17, agentId: "luna", oque: "Automatiza o que você repete todo dia" },
      { ordem: 18, agentId: "vera", oque: "Grupo com as pessoas que já compraram de você" },
      { ordem: 19, agentId: "cora", oque: "Faz quem comprou terminar, pra virar depoimento e não virar reembolso" },
    ],
  },
  dk: {
    id: "dk",
    nome: "Canal Dark",
    objetivo: "Sua primeira monetização de um canal sem aparecer.",
    descricao: "Canal sem rosto e sem voz sua, com vídeos gerados por IA. Pode ser YouTube, Shorts, TikTok ou Reels. O dinheiro começa por comissão de afiliada dentro dos vídeos, porque o programa da plataforma leva meses e depende de requisitos que não estão na sua mão.",
    cor: "#4a5759",
    emoji: "🌙",
    passos: [
      { ordem: 1, agentId: "bill", oque: "Monta o canal: escolhe a plataforma, o nicho, o nome e a identidade", textoAntes: "Escolha UMA plataforma. Canal em dois lugares ao mesmo tempo, no começo, não dá conta." },
      { ordem: 2, agentId: "bill", oque: "Roteiro do vídeo e os prompts de vídeo IA no formato da ferramenta que você usa" },
      { ordem: 3, agentId: "luli", oque: "Gera a thumbnail e a capa do canal" },
      { ordem: 4, agentId: "bia", oque: "Produtos de afiliada pra colocar na descrição e dentro do vídeo" },
      { ordem: 5, agentId: "maia", oque: "Esteira de produção pra publicar com constância" },
      { ordem: 6, agentId: "malu", oque: "Calendário do canal" },
      { ordem: 7, agentId: "liora", oque: "O que está funcionando no canal" },
      { ordem: 8, agentId: "luna", oque: "Automatiza o que você repete todo dia" },
      { ordem: 9, agentId: "lucca", oque: "Onde está seu gargalo e o plano das próximas 4 semanas" },
    ],
  },
};

export const SERENA = {
  id: "serena",
  name: "Serena",
  role: "Desbloqueadora de Potencial",
  color: "#6E9876",
  welcome: "Olá! Eu sou a Serena 💛\n\nEstou aqui para quando a jornada parecer pesada demais. Síndrome do impostor, medo de falhar, bloqueio criativo, sobrecarga emocional: traga pra cá. Juntas a gente desbloqueia o que está te impedindo de avançar.\n\n**O que você está sentindo agora?**",
};

export function findAgent(agentId: string): Agent | null {
  return AGENTS[agentId] ?? null;
}

export function findTrilhaStep(trilhaId: TrilhaId, agentId: string): TrilhaStep | null {
  const trilha = TRILHAS[trilhaId];
  if (!trilha) return null;
  return trilha.passos.find((p) => p.agentId === agentId || p.alternativas?.some((a) => a.agentId === agentId)) ?? null;
}

export function getTrilhaSteps(trilhaId: TrilhaId): TrilhaStep[] {
  return TRILHAS[trilhaId]?.passos ?? [];
}

export function getAllAgentIds(): string[] {
  return Object.keys(AGENTS);
}

/**
 * Agrupa os passos de uma trilha em "nós" de progresso: passos seguidos com
 * o mesmo robô (ex: Manu 4x) viram um nó só, e um passo com `alternativas`
 * (ex: Lira/Noa/Eron) vira um nó com os agentIds das 3 opções juntos.
 * Mesma lógica usada em useAgentProgress.tsx, mas exposta aqui pra quem
 * precisa calcular o total de etapas de uma trilha sem estar "dentro" dela
 * (ex: a listagem de Meus Projetos, que mostra várias trilhas ao mesmo tempo).
 */
export function getTrilhaNodes(trilhaId: TrilhaId): string[][] {
  const trilha = TRILHAS[trilhaId];
  if (!trilha) return [];

  const nodes: string[][] = [];
  for (const passo of trilha.passos) {
    const ids = passo.alternativas ? passo.alternativas.map((a) => a.agentId) : [passo.agentId];
    const last = nodes[nodes.length - 1];
    if (last && !passo.alternativas && last.length === 1 && last[0] === ids[0]) {
      continue;
    }
    nodes.push(ids);
  }
  return nodes;
}
