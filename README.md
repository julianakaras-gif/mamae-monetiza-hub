# Remix of Prospera App

# PROMPT 1 — FUNDAÇÃO VISUAL E AUTENTICAÇÃO
## Cole este prompt ao criar o projeto no Lovable

---

Crie o projeto **Método Mamãe Monetiza** — uma plataforma SaaS onde alunas acessam agentes de IA especializados para construir seu negócio digital.

## STACK TÉCNICA
- React + TypeScript + Tailwind CSS
- Supabase nativo (conecte agora via painel do Lovable)
- Fontes: Raleway (Google Fonts, todos os pesos) como fonte principal; Georgia serif para títulos e logo

## DESIGN SYSTEM

Adicione estas variáveis CSS globais:
```css
--cinza: #4a5759;
--ciano: #29a6ab;
--rosa: #df437d;
--amarelo: #ebc780;
--amarelo-dark: #c49a30;
--bege: #f9f6f1;
--cinza-light: #6b8082;
--borda: #e4ddd5;
```

Regras globais:
- Background da aplicação: #f9f6f1
- Fonte principal: Raleway em todo o app
- Bordas arredondadas: 12-20px em cards, 40px em botões pill
- Sombras sutis: máximo 0 4px 16px rgba(0,0,0,0.08)
- NUNCA usar travessão longo (--) em nenhum texto da interface
- Animação padrão: fadeIn 0.35s ease para entradas de tela

## LOGO (componente SVG reutilizável)

Crie um componente `<Logo />` com as props `size` e `light`:
- SVG com dois "M" lado a lado: primeiro M em #ebc780, segundo M em #29a6ab
- Entre os dois M: um coração em #df437d formado por duas curvas de bezier
- Abaixo do SVG: "Método" em Georgia bold 13px na cor --cinza
- Abaixo: "MAMÃE MONETIZA" em Raleway 10px uppercase letter-spacing 2px na cor --cinza-light
- Quando `light=true`: textos ficam brancos (para uso em fundos escuros)

## TELA DE LOGIN

Layout duas colunas no desktop, coluna única no mobile:

**Coluna esquerda** (fundo degradê linear de #4a5759 para #1e2829, texto branco):
- Logo grande com `light=true`
- Título: "Sua trilha de transformação começa aqui." com a palavra "transformação" em #ebc780
- Subtítulo em branco com opacity 0.6, fonte 14px
- 3 bullets com ícone check colorido (rosa, ciano, amarelo): "Descubra seu negócio autêntico", "Crie marca, produtos e conteúdo", "Monte sua máquina de vendas automatizada"
- Dois círculos decorativos grandes com opacity baixa (rosa e ciano) posicionados fora da tela como elementos visuais

**Coluna direita** (card bege #f9f6f1, border-radius 24px, sombra forte):
- Título "Bem-vinda de volta!" em Georgia 22px bold
- Subtítulo "Acesse sua trilha de transformação" em --cinza-light
- Campo email com label uppercase e foco com borda --ciano
- Campo senha com label uppercase, link "Esqueceu?" alinhado à direita em --ciano
- Botão "Entrar na plataforma" fundo --ciano, texto branco, com estado de loading (spinner + "Entrando...")
- Rodapé: "Não tem acesso? Conheça o método" com "Conheça o método" em --rosa bold

**Autenticação via Supabase Auth:**
- Ao fazer login com sucesso, verificar se o usuário existe na tabela `profiles` com `subscription_status = 'active'`
- Se inativo: redirecionar para página `/acesso-bloqueado` com mensagem e link externo de compra
- Se ativo: redirecionar para `/home`

## LAYOUT PRINCIPAL (após login)

Sidebar fixa à esquerda (218px, fundo #4a5759) + área de conteúdo principal com overflow auto.

**Sidebar:**
- Logo no topo com `light=true`
- Seção "Menu" com itens: Início (ícone casa), Trilha (ícone mapa), Favoritos (ícone estrela)
- Item ativo: fundo rgba(255,255,255,0.13), texto branco, bolinha ciano à direita
- Hover nos inativos: fundo rgba(255,255,255,0.07)
- Divisor sutil
- Seção "Sempre disponíveis" com atalhos rápidos para Maia e Liora (avatares circulares com iniciais)
- Barra de progresso geral (% de agentes concluídos) com gradiente --ciano para --rosa, porcentagem em branco
- Card do usuário no rodapé: avatar circular com inicial do nome em --rosa, nome, "Aluna ativa"

**Roteamento:**
- `/login` — tela de login
- `/acesso-bloqueado` — tela de acesso negado
- `/home` — dashboard inicial (placeholder por enquanto)
- `/trilha` — trilha de agentes (placeholder por enquanto)
- `/favoritos` — favoritos (placeholder por enquanto)
- `/chat/:agentId` — chat com agente (placeholder por enquanto)

## CHECKLIST ANTES DE AVANÇAR PARA O PROMPT 2
- [ ] Logo renderizando corretamente com as cores certas
- [ ] Tela de login com duas colunas no desktop
- [ ] Login real funcionando via Supabase Auth
- [ ] Sidebar visível após login com as cores e estrutura corretas
- [ ] Fontes Raleway carregando corretamente
- [ ] Nenhum travessão longo (--) em nenhum texto

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://mamae-monetiza-hub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9437f71c-1623-400e-8ad3-22a29e88d760).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
