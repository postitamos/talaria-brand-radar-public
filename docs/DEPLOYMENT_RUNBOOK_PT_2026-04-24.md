# Deployment Runbook PT

Data: 2026-04-24

## Objetivo

Colocar `talaria-brand-radar-public` online como site estatico em Portugues,
usando:

- artefacto publico importado para `public/data/`
- um limite Supabase isolado para registos da newsletter
- funcao Edge publica `newsletter-signup`

Este repo nao pode ler tabelas de research do Brand Radar em runtime.

## Estado Atual

Ja existe neste repo:

- site React + TypeScript + Vite
- import manual do artefacto publico de rankings
- pagina de ranking, metodologia, registo e arquivo placeholder
- migration da tabela `newsletter_signups`
- funcao Edge `newsletter-signup`
- `supabase/config.toml` com `verify_jwt = false` para a funcao publica
- workflow de GitHub Pages em `.github/workflows/deploy-pages.yml`
- fallback SPA para GitHub Pages em `public/404.html` e `index.html`
- `vercel.json` como fallback de host estatico

Estado validado em 2026-04-24:

- o fallback v1 com o projeto Brand Radar foi aceite e usado
- `public.newsletter_signups` ja existe em `qukapngihsutopsycwec`
- a funcao publica `newsletter-signup` ja esta deployada nesse projeto
- o smoke test local passou com:
  - submissao valida -> `200`
  - submissao repetida -> `200`
  - payload invalido -> `400`
- a dedupe por `email_normalized` foi confirmada com 1 linha persistida

## Passo 1: Escolher o limite Supabase de signup
Modelo preferido:

- projeto Supabase separado apenas para captacao publica da newsletter

Fallback v1 aceite:

- reutilizar o projeto Supabase do Brand Radar
- manter o site apenas sobre artefactos importados
- expor publicamente apenas a funcao Edge `newsletter-signup`
- nao ligar o frontend a tabelas de research em runtime

Escolha atual desta tranche:

- usar o fallback v1 no proprio projeto Brand Radar `qukapngihsutopsycwec`

## Passo 2: Aplicar a migration

No projeto escolhido, aplicar:

- `supabase/migrations/20260423234500_create_newsletter_signups.sql`

Resultado esperado:

- tabela `public.newsletter_signups`
- indice unico em `email_normalized`
- RLS ativado

## Passo 3: Fazer deploy da funcao Edge

Fazer deploy da funcao:

- `supabase/functions/newsletter-signup/index.ts`

Usar a configuracao do repo:

- `supabase/config.toml`

Contrato esperado:

- a funcao e publica
- `verify_jwt = false`
- valida payload Lean B2B
- normaliza email
- faz dedupe por `email_normalized`
- guarda `source`, `source_page` e `locale`
- responde `ok: true` tambem nos duplicados

## Passo 4: Recolher credenciais publicas do projeto escolhido
Recolher do projeto escolhido:

- `project URL`
- `anon` ou `publishable key` para o cliente

Se o fallback v1 usar o proprio projeto Brand Radar, o frontend continua a usar
apenas a URL publica do projeto e a anon/publishable key para chamar a funcao
`newsletter-signup`. O site nao pode ler tabelas de research em runtime.

## Passo 5: Configurar envs do frontend

Criar `.env.local` a partir de `.env.example` com:

- `VITE_PUBLIC_SIGNUP_SUPABASE_URL`
- `VITE_PUBLIC_SIGNUP_SUPABASE_ANON_KEY`
- opcional `VITE_PUBLIC_SIGNUP_FUNCTION_NAME`
- opcional `VITE_PUBLIC_BASE_PATH`
- opcional `VITE_PUBLIC_SUPPORT_EMAIL`

Valor default da funcao:

- `newsletter-signup`

## Passo 6: Importar o artefacto publico aprovado

Sempre antes de publicar uma nova versao do site:

```powershell
npm run import:rankings
npm run verify:artifact
```

O site consome apenas:

- `public/data/public_brand_rankings.latest.json`

## Passo 7: Verificar localmente

```powershell
npm run verify
```

Confirmar:

- build passa
- testes passam
- artefacto publico nao contem rows `blocked`
- signup continua publico e nao bloqueia o ranking

## Passo 8: Deploy estatico

Hosting default recomendado:

- GitHub Pages

Setup esperado:

- repo `talaria-brand-radar-public`
- workflow `.github/workflows/deploy-pages.yml`
- GitHub Pages configurado para usar GitHub Actions
- secrets do repo:
  - `VITE_PUBLIC_SIGNUP_SUPABASE_URL`
  - `VITE_PUBLIC_SIGNUP_SUPABASE_ANON_KEY`
  - opcional `VITE_PUBLIC_SIGNUP_FUNCTION_NAME`
  - opcional `VITE_PUBLIC_SUPPORT_EMAIL`

Build base:

- `VITE_PUBLIC_BASE_PATH=/${repo_name}/`

Nota operacional:

- a decisao desta tranche e manter o GitHub Free
- por isso, o caminho de lancamento em GitHub Pages assume:
  - repo `talaria-brand-radar-public` tornado publico no momento do go-live
  - GitHub Pages configurado via GitHub Actions nesse repo publico
- o repo pode continuar privado durante staging local, mas o passo imediatamente
  anterior ao deploy publico e mudar a visibilidade do repo

Fallback host:

- Vercel continua aceitavel se GitHub Pages nao puder ser usado

## Passo 9: Smoke test apos deploy

Confirmar em producao:

- `/` carrega
- `/ranking` mostra apenas `publishable + limited`
- nenhuma row `blocked` aparece
- filtros de pais, cidade e relacao com Portugal funcionam
- detalhe inline abre
- `/metodologia` bate certo com o contrato PT
- `/privacidade` mostra o boundary publico/privado e, idealmente, um contacto de suporte
- `/registo` aceita submissao valida
- submissao repetida devolve sucesso generico
- `/arquivo` mostra placeholder

## Regras de publicacao

- site publico pode mostrar `publishable + limited`
- `blocked` fica invisivel no site
- newsletter continua `publishable` por default
- qualquer uso de `limited` na newsletter exige override editorial explicito fora deste repo

## O que fica de fora nesta fase

- envio publico da newsletter
- automacao de campanhas
- ligacao direta do site a tabelas de research
- paginas individuais por marca
- gating do ranking por email
