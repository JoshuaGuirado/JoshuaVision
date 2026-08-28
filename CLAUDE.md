# TJV (TheJoshuaVision)

## Sobre o projeto
App pessoal de gestão financeira (fase 1) que vai evoluir para um sistema de vida
mais amplo (agenda, etc). Usuário único (Joshua). Stack: Vite + React + TypeScript +
Tailwind CSS + Supabase (auth + Postgres), publicado como PWA (instalável via Safari).

Identidade visual: fundo preto, amarelo como cor de destaque. Nada de visual genérico.

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
Supabase URL e anon key ficam em `.env.local` (não commitado). Enquanto o usuário
não fornece as credenciais reais, a camada de dados usa um modo mock local para
já permitir desenvolver a UI.
