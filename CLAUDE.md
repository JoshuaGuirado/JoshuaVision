# THE JOSHUA VISION

## Sobre o projeto
"Life OS" pessoal do Joshua — painel central que organiza toda a vida em módulos
(Agenda, Finanças, Tarefas, Metas, Hábitos, Projetos, Estudos, Saúde, Diário,
Notas, Visão). Usuário único. Stack: Vite + React + TypeScript + Tailwind CSS v4 +
Supabase (auth + Postgres), publicado como PWA (instalável via Safari).

Identidade visual: fundo preto, amarelo como cor de destaque, tipografia com
tracking largo no branding. Premium, minimalista, nada genérico.

## Arquitetura
- `src/lib/nav.ts` é a fonte única de verdade dos módulos (rota, ícone, label,
  descrição, se já está implementado). Sidebar, menu mobile e os cards da Home
  leem daqui — adicionar um módulo novo começa por esse arquivo.
- Módulos ainda não implementados usam o componente genérico `ComingSoon`.
- Cada módulo implementado ganha sua própria pasta em `src/pages/<modulo>/`,
  com um `<Modulo>Layout.tsx` se precisar de sub-navegação própria (ver
  `src/pages/finance/` como referência: FinanceLayout + FinanceHome +
  FinanceTransactions + FinanceCategories + FinanceBudget).
- `src/components/Layout.tsx` é a casca do app inteiro (Sidebar desktop +
  MobileNav) e fica fora do que cada módulo controla.

## Módulos
- **Finanças**: único módulo com funcionalidade real hoje (Supabase). Dashboard,
  lançamentos (receita/despesa, categoria, recorrência), categorias
  (ícone/cor/orçamento mensal) e orçamento (gasto vs. limite por categoria).
- Demais módulos: apenas placeholder ("Em desenvolvimento"), a implementar um
  por vez conforme o usuário pedir.

Fases futuras (não implementar ainda, só ter em mente na arquitetura):
- Assistente de IA dentro do app, com nome/personalidade próprios, que edita dados
  via chat (criar lançamento, editar categoria, etc).
- Projeto separado, local, de controle do PC por gestos de mão via webcam
  (mouse, cliques, atalhos) — não faz parte deste repositório/app.

## Preferência de commits (confirmada pelo usuário em 2026-08-28)
O usuário pediu commit + push automáticos a cada mudança feita neste repositório,
sem precisar confirmar cada push individualmente. Sempre que arquivos forem
criados/editados aqui, faça `git add`, `git commit` com uma mensagem descritiva
e `git push` para o remoto `origin` sem pedir confirmação adicional.

## Backend
Supabase URL e anon key ficam em `.env.local` (não commitado). O login pede
só senha (sem campo de e-mail) — usa um e-mail fixo (`APP_EMAIL` em
`src/lib/supabase.ts`) por baixo dos panos, autenticado via Supabase Auth.
