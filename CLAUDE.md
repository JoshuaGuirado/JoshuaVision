# THE JOSHUA VISION

## Sobre o projeto
"Life OS" pessoal do Joshua — painel central que organiza toda a vida em módulos.
Usuário único. Stack: Vite + React 19 + TypeScript + Tailwind CSS v4 + Supabase
(auth + Postgres), publicado como PWA instalável e hospedado na Vercel em
https://joshuavision.vercel.app

**Fale português do Brasil com o usuário.** Ele não é programador — explique em
termos simples, sem jargão, e diga o que ele precisa fazer com passo a passo.

## Identidade visual: tema Marvel
Fundo azul-marinho profundo, vermelho do escudo do Capitão América nas ações,
prata nos detalhes. A logo é o escudo (anéis vermelho/branco, campo azul,
estrela central). Animações sutis por toda parte — o usuário gosta de vida na
interface. Ver `src/index.css` (paleta + keyframes) e `src/components/Logo.tsx`.

## Arquitetura
- `src/lib/nav.ts` é a **fonte única de verdade** dos módulos (rota, ícone, cor,
  descrição). Home, cabeçalho e rotas leem daqui. São 12 de propósito: fecham a
  grade 4x3 sem sobra — se adicionar ou remover um, ajuste para manter múltiplo
  de 4, senão a última linha fica com buraco (já foi reclamado uma vez).
- A **Home fica fora do `Layout`** (ver `src/App.tsx`): nela o usuário quer só os
  quadradinhos, sem navegação lateral. As telas internas usam `Layout`, que traz
  só um cabeçalho com voltar. Não reintroduza sidebar na Home.
- `src/lib/useCollection.ts` é o CRUD genérico do Supabase que quase todos os
  módulos usam. Módulo novo normalmente é: tabela no SQL + página usando esse hook.
- `src/components/ui.tsx` tem as primitivas visuais (PageHeader, Card, Field,
  EmptyState...). Use-as para os módulos ficarem consistentes.

## Módulos (todos implementados)
Hoje (resumo), Agenda, Finanças, Tarefas, Metas, Hábitos, Projetos, Estudos,
Saúde, Notas, Assistente, Configurações.

Finanças tem sub-navegação própria em `src/pages/finance/`: quatro abas
(Resumo, Lançamentos, Investir, Mais) — quatro de propósito, porque cinco já
ficam apertadas no celular; Contas, Metas, Categorias e Orçamento moram dentro
de "Mais". Todas as telas leem de `src/lib/financas.tsx`, que guarda o mês
selecionado e faz as contas num lugar só. Os demais módulos são páginas únicas
em `src/pages/modules/`.

O usuário **removeu Visão e Diário** de propósito — não recrie.

## Assistente de IA
Bolha fixa no canto (`src/components/AssistantWidget.tsx`), presente em todas as
telas, mais uma tela cheia em `src/pages/assistant/`. Ambas usam `src/lib/useChat.ts`.

Os modelos têm codinomes de heróis, ordenados por capacidade (`src/lib/models.ts`):
Capitão América (Opus) > Thor (Sonnet) > Hulk (Gemini Pro) > Homem de Ferro
(Haiku) > Homem-Aranha (Gemini Flash). Cada um tem avatar animado próprio em
`src/components/HeroAvatar.tsx` — insígnias **originais** (escudo, martelo, punho,
reator, teia), não réplicas de personagens: o site é público e arte da Marvel é
protegida por direitos autorais.

`api/chat.ts` é uma função edge da Vercel que guarda as chaves dos provedores no
servidor e **exige um token válido do Supabase**. As chaves nunca podem ir para o
frontend — o site é público e qualquer um leria e gastaria os créditos.

## Backend
Supabase URL e anon key ficam em `.env.local` (ignorado pelo git) e nas
Environment Variables da Vercel. Login pede só senha; o e-mail fixo está em
`APP_EMAIL` (`src/lib/supabase.ts`).

Schemas: `supabase/schema.sql` (finanças), `supabase/schema-financas-v2.sql`
(contas, investimentos e metas financeiras) e `supabase/schema-modules.sql`
(demais). Rodar no SQL Editor do Supabase quando criar tabela nova.

## Preferência de commits (confirmada em 2026-08-28)
Commit + push automáticos a cada mudança, sem pedir confirmação. Remoto:
https://github.com/JoshuaGuirado/JoshuaVision

## Verificação
O usuário não consegue avaliar código — **teste de verdade antes de dizer que
funciona**. Rode `npx tsc -b --noEmit`, use o preview do navegador para conferir
a tela, e valide chamadas ao Supabase/API com curl quando fizer sentido. Já houve
caso de modelo de IA descontinuado que só apareceu porque foi testado de fato.
