# Deployment Runbook PT

Data: 2026-04-24

## Objetivo

Colocar `talaria-brand-radar-public` online como site estatico em Portugues,
usando:

- artefacto publico importado para `public/data/`
- projeto Supabase separado para registos da newsletter
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
- `vercel.json` com rewrites SPA e headers basicos

## Passo 1: Criar o projeto Supabase separado

Criar um projeto novo apenas para captacao publica da newsletter.

Nao reutilizar o projeto de research do Brand Radar.

## Passo 2: Aplicar a migration

No projeto separado, aplicar:

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

## Passo 4: Recolher credenciais publicas do projeto separado

Recolher do projeto separado:

- `project URL`
- `anon` ou `publishable key` para o cliente

Este repo nao precisa de nenhuma credencial do projeto de research.

## Passo 5: Configurar envs do frontend

Criar `.env.local` a partir de `.env.example` com:

- `VITE_PUBLIC_SIGNUP_SUPABASE_URL`
- `VITE_PUBLIC_SIGNUP_SUPABASE_ANON_KEY`
- opcional `VITE_PUBLIC_SIGNUP_FUNCTION_NAME`

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

- Vercel

Configurar no host:

- root do repo `talaria-brand-radar-public`
- build command: `npm run build`
- output directory: `dist`
- variaveis de ambiente publicas do projeto separado

## Passo 9: Smoke test apos deploy

Confirmar em producao:

- `/` carrega
- `/ranking` mostra apenas `publishable + limited`
- nenhuma row `blocked` aparece
- filtros de pais, cidade e relacao com Portugal funcionam
- detalhe inline abre
- `/metodologia` bate certo com o contrato PT
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
- ligacao direta do site ao projeto de research
- paginas individuais por marca
- gating do ranking por email
